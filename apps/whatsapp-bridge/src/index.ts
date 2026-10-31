import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.BRIDGE_PORT || 3001;
const BRIDGE_SECRET = process.env.WHATSAPP_BRIDGE_SECRET || 'dev_bridge_secret';
const API_WEBHOOK_URL = process.env.API_WEBHOOK_URL || 'http://localhost:4000/api/whatsapp/webhook/bridge';

// In-memory session tracking for daemon
const activeSessions = new Map<string, {
  status: 'connected' | 'qr_ready' | 'disconnected';
  qrCode?: string;
  phone?: string;
}>();

// Auth middleware for internal bridge calls
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secret = req.headers['x-bridge-secret'];
  if (secret !== BRIDGE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized bridge request' });
  }
  next();
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GINIE WhatsApp Bridge Daemon' });
});

app.post('/sessions/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const qrData = `GINIE_WHATSAPP_${id}_${Date.now()}`;
  const qrCodeUrl = await QRCode.toDataURL(qrData);

  activeSessions.set(id, {
    status: 'qr_ready',
    qrCode: qrCodeUrl,
  });

  res.json({
    sessionId: id,
    status: 'qr_ready',
    qrCode: qrCodeUrl,
  });
});

app.get('/sessions/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  let session = activeSessions.get(id);

  if (!session) {
    const qrData = `GINIE_WHATSAPP_${id}_${Date.now()}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    session = { status: 'qr_ready', qrCode: qrCodeUrl };
    activeSessions.set(id, session);
  }

  res.json(session);
});

app.post('/sessions/:id/messages', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { to, text } = req.body;

  console.log(`[Bridge ${id}] Sending message to ${to}: "${text}"`);
  res.json({ success: true, messageId: `bridge_msg_${Date.now()}` });
});

app.post('/sessions/:id/presence', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { to, presence } = req.body;
  console.log(`[Bridge ${id}] Presence updated for ${to}: ${presence}`);
  res.json({ success: true });
});

app.post('/sessions/:id/read', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { messageId } = req.body;
  console.log(`[Bridge ${id}] Marked read for message: ${messageId}`);
  res.json({ success: true });
});

app.delete('/sessions/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  activeSessions.delete(id);
  res.json({ success: true });
});

// Helper for simulating inbound message from WhatsApp
app.post('/test/inbound', async (req, res) => {
  const { tenantId, from, text } = req.body;
  try {
    const response = await fetch(API_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bridge-Secret': BRIDGE_SECRET,
      },
      body: JSON.stringify({ tenantId, from, text }),
    });
    const result = await response.json();
    res.json({ forwarded: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GINIE WhatsApp Web Bridge listening on port ${PORT}`);
});
