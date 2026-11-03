import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  WASocket,
  ConnectionState,
} from '@whiskeysockets/baileys';
import pino from 'pino';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || process.env.BRIDGE_PORT || 3001;
const BRIDGE_SECRET = process.env.WHATSAPP_BRIDGE_SECRET || 'dev_bridge_secret';
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || process.env.WHATSAPP_BRIDGE_URL || `http://localhost:${PORT}`;

// Storage for sessions
const SESSIONS_DIR = path.join(process.cwd(), 'data', 'bridge-sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

interface SessionState {
  id: string;
  sock?: WASocket;
  status: 'connected' | 'qr_ready' | 'disconnected';
  qrCode?: string | null;
  phone?: string | null;
  pushName?: string | null;
}

const sessions = new Map<string, SessionState>();
const reconnecting = new Set<string>();

// Auth middleware
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secret = req.headers['x-bridge-secret'] || req.query.secret;
  if (secret !== BRIDGE_SECRET && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized bridge request' });
  }
  next();
};

async function getOrCreateSession(id: string): Promise<SessionState> {
  let existing = sessions.get(id);
  if (existing && existing.sock && existing.status === 'connected') {
    return existing;
  }

  const sessionPath = path.join(SESSIONS_DIR, id);
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  let version = [2, 3000, 1015901307];
  try {
    const ver = await fetchLatestBaileysVersion();
    version = ver.version;
  } catch {}

  const sock = makeWASocket({
    version: version as any,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['GINIE CRM Bridge', 'Chrome', '1.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
  });

  const sessionObj: SessionState = {
    id,
    sock,
    status: 'qr_ready',
    qrCode: null,
  };
  sessions.set(id, sessionObj);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
        sessionObj.status = 'qr_ready';
        sessionObj.qrCode = qrUrl;
        console.log(`[Bridge ${id}] Generated QR Code.`);
      } catch (err: any) {
        console.error(`[Bridge ${id}] QR generation error: ${err.message}`);
      }
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[Bridge ${id}] Connection closed (${statusCode}). Should reconnect: ${shouldReconnect}`);

      if (shouldReconnect) {
        if (!reconnecting.has(id)) {
          reconnecting.add(id);
          setTimeout(() => {
            reconnecting.delete(id);
            getOrCreateSession(id).catch(console.error);
          }, 4000);
        }
      } else {
        sessionObj.status = 'disconnected';
        sessionObj.qrCode = null;
        sessionObj.phone = null;
        try {
          fs.rmSync(sessionPath, { recursive: true, force: true });
        } catch {}
      }
    } else if (connection === 'open') {
      const raw = sock.user?.id || '';
      const phone = raw.split(':')[0]?.split('@')[0]?.replace(/\D/g, '') || 'Connected';
      sessionObj.status = 'connected';
      sessionObj.phone = `+${phone}`;
      sessionObj.pushName = sock.user?.name || 'GINIE Device';
      sessionObj.qrCode = null;
      console.log(`[Bridge ${id}] WhatsApp connected: +${phone}`);
    }
  });

  return sessionObj;
}

// Routes
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'GINIE WhatsApp Baileys Bridge Daemon',
    activeSessions: sessions.size,
    timestamp: new Date().toISOString(),
  });
});

// Single default session status
app.get('/status', authMiddleware, async (req, res) => {
  const sessionId = (req.query.sessionId as string) || 'default';
  const sess = await getOrCreateSession(sessionId);
  res.json({
    connected: sess.status === 'connected',
    status: sess.status,
    phone: sess.phone,
    pushName: sess.pushName,
  });
});

// QR Code endpoint
app.get('/qr', authMiddleware, async (req, res) => {
  const sessionId = (req.query.sessionId as string) || 'default';
  const sess = await getOrCreateSession(sessionId);
  res.json({
    status: sess.status,
    qr: sess.qrCode,
    phone: sess.phone,
  });
});

// Send message (direct /send endpoint)
app.post('/send', authMiddleware, async (req, res) => {
  try {
    const { number, text, sessionId } = req.body;
    if (!number || !text) {
      return res.status(400).json({ error: 'Number and text are required.' });
    }

    const targetSessionId = sessionId || 'default';
    const sess = await getOrCreateSession(targetSessionId);

    if (sess.status !== 'connected' || !sess.sock) {
      return res.status(400).json({
        error: 'WhatsApp session is not connected. Please scan QR code first.',
      });
    }

    const clean = number.replace(/\D/g, '');
    const standardNumber = clean.length === 10 ? `91${clean}` : clean;
    const jid = `${standardNumber}@s.whatsapp.net`;

    const sent = await sess.sock.sendMessage(jid, { text });
    res.json({
      success: true,
      messageId: sent?.key?.id || `msg_${Date.now()}`,
    });
  } catch (err: any) {
    console.error('Error sending message:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Multi-tenant session routes
app.post('/sessions/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const sess = await getOrCreateSession(id);
  res.json({
    sessionId: id,
    status: sess.status,
    qrCode: sess.qrCode,
    phone: sess.phone,
  });
});

app.get('/sessions/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const sess = await getOrCreateSession(id);
  res.json({
    sessionId: id,
    status: sess.status,
    qrCode: sess.qrCode,
    phone: sess.phone,
    pushName: sess.pushName,
  });
});

app.post('/sessions/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { to, text } = req.body;
    const sess = await getOrCreateSession(id);

    if (sess.status !== 'connected' || !sess.sock) {
      return res.status(400).json({ error: 'Session not connected' });
    }

    const clean = to.replace(/\D/g, '');
    const standardNumber = clean.length === 10 ? `91${clean}` : clean;
    const jid = `${standardNumber}@s.whatsapp.net`;

    const sent = await sess.sock.sendMessage(jid, { text });
    res.json({ success: true, messageId: sent?.key?.id || `msg_${Date.now()}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/sessions/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const sess = sessions.get(id);
  if (sess?.sock) {
    try {
      await sess.sock.logout();
    } catch {}
    sessions.delete(id);
  }
  const sessionPath = path.join(SESSIONS_DIR, id);
  try {
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }
  } catch {}
  res.json({ success: true });
});

// Anti-Sleep Heartbeat KeepAlive for Bridge
setInterval(() => {
  const pingUrl = `${PUBLIC_URL.replace(/\/$/, '')}/health`;
  fetch(pingUrl)
    .then((r) => console.log(`[Bridge KeepAlive] Self ping HTTP ${r.status}`))
    .catch((e) => console.log(`[Bridge KeepAlive] Self ping note: ${e.message}`));
}, 8 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`GINIE WhatsApp Web Baileys Bridge listening on port ${PORT}`);
  // Initialize default session
  getOrCreateSession('default').catch(console.error);
});
