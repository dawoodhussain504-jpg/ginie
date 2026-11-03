import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '@ginie/database';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  WASocket,
  ConnectionState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import * as QRCodeLib from 'qrcode';
const QRCode = (QRCodeLib as any).default || QRCodeLib;
import * as path from 'path';
import * as fs from 'fs';

export interface BaileysLiveStatus {
  status: 'connected' | 'qr_ready' | 'disconnected';
  qrCode?: string | null;
  phone?: string | null;
  pushName?: string | null;
}

@Injectable()
export class BaileysService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BaileysService.name);
  private sockets = new Map<string, WASocket>();
  private statusMap = new Map<string, BaileysLiveStatus>();
  private reconnecting = new Set<string>();
  private baseStorageDir: string;

  constructor() {
    this.baseStorageDir = path.join(process.cwd(), 'data', 'baileys-sessions');
    if (!fs.existsSync(this.baseStorageDir)) {
      try {
        fs.mkdirSync(this.baseStorageDir, { recursive: true });
      } catch (err: any) {
        this.logger.warn(`Could not create base session dir: ${err.message}`);
      }
    }
  }

  async onModuleInit() {
    this.logger.log('Baileys WhatsApp Web Engine initializing...');
    // Auto-restore any previously connected sessions from database on boot
    try {
      const activeSessions = await prisma.whatsAppSession.findMany({
        where: {
          provider: 'bridge',
          status: 'connected',
        },
      });

      for (const session of activeSessions) {
        this.logger.log(`Restoring WhatsApp session for tenant ${session.tenantId} (session ${session.id})...`);
        this.initSession(session.id).catch((err) => {
          this.logger.warn(`Failed auto-restoring session ${session.id}: ${err.message}`);
        });
      }
    } catch (err: any) {
      this.logger.warn(`Database session scan error during boot: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    for (const [id, sock] of this.sockets.entries()) {
      try {
        sock.end(undefined);
      } catch {}
    }
    this.sockets.clear();
  }

  private getSessionDir(sessionId: string): string {
    const dir = path.join(this.baseStorageDir, sessionId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  private async restoreCredsFromDb(sessionId: string, sessionDir: string) {
    try {
      const session = await prisma.whatsAppSession.findUnique({
        where: { id: sessionId },
        select: { credentialsEncrypted: true },
      });

      if (session?.credentialsEncrypted) {
        const parsed = JSON.parse(session.credentialsEncrypted);
        if (typeof parsed === 'object' && parsed !== null && (parsed['creds.json'] || parsed.creds)) {
          for (const [fileName, content] of Object.entries(parsed)) {
            if (typeof content === 'string') {
              fs.writeFileSync(path.join(sessionDir, fileName), content, 'utf8');
            }
          }
          this.logger.log(`[Session ${sessionId}] Restored full auth state (${Object.keys(parsed).length} files) from DB.`);
        } else {
          const credsFile = path.join(sessionDir, 'creds.json');
          fs.writeFileSync(credsFile, JSON.stringify(parsed, null, 2), 'utf8');
          this.logger.log(`[Session ${sessionId}] Restored legacy creds.json from DB.`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`[Session ${sessionId}] restoreCredsFromDb warning: ${err.message}`);
    }
  }

  private async backupCredsToDb(sessionId: string, sessionDir: string) {
    try {
      if (!fs.existsSync(sessionDir)) return;
      const files = fs.readdirSync(sessionDir);
      const bundle: Record<string, string> = {};
      for (const file of files) {
        if (file.endsWith('.json')) {
          bundle[file] = fs.readFileSync(path.join(sessionDir, file), 'utf8');
        }
      }
      if (Object.keys(bundle).length > 0) {
        await prisma.whatsAppSession.update({
          where: { id: sessionId },
          data: { credentialsEncrypted: JSON.stringify(bundle) },
        });
      }
    } catch (err: any) {
      this.logger.warn(`[Session ${sessionId}] backupCredsToDb warning: ${err.message}`);
    }
  }

  async waitForQrCode(sessionId: string, maxWaitMs = 5000): Promise<BaileysLiveStatus> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const status = this.statusMap.get(sessionId);
      if (status) {
        if (status.status === 'connected') return status;
        if (status.status === 'qr_ready' && status.qrCode) return status;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    return this.statusMap.get(sessionId) || { status: 'qr_ready', qrCode: null };
  }

  async initSession(sessionId: string): Promise<BaileysLiveStatus> {
    if (this.sockets.has(sessionId)) {
      const current = this.statusMap.get(sessionId);
      if (current && (current.status === 'connected' || current.qrCode)) {
        return current;
      }
      return this.waitForQrCode(sessionId, 5000);
    }

    const sessionDir = this.getSessionDir(sessionId);
    await this.restoreCredsFromDb(sessionId, sessionDir);

    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      let version = [2, 3000, 1015901307];
      try {
        const verInfo = await fetchLatestBaileysVersion();
        version = verInfo.version;
      } catch {}

      const sock = makeWASocket({
        version: version as any,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['GINIE CRM', 'Chrome', '1.0.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
      });

      this.sockets.set(sessionId, sock);
      this.statusMap.set(sessionId, {
        status: 'qr_ready',
        qrCode: null,
      });

      sock.ev.on('creds.update', async () => {
        try {
          await saveCreds();
          await this.backupCredsToDb(sessionId, sessionDir);
        } catch (err: any) {
          this.logger.warn(`[Session ${sessionId}] creds.update error: ${err.message}`);
        }
      });

      sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
            this.statusMap.set(sessionId, {
              status: 'qr_ready',
              qrCode: qrDataUrl,
            });

            await prisma.whatsAppSession.update({
              where: { id: sessionId },
              data: {
                status: 'qr_ready',
                qrCode: qrDataUrl,
              },
            }).catch(() => {});
            this.logger.log(`[Session ${sessionId}] New Pairing QR Code generated.`);
          } catch (qrErr: any) {
            this.logger.error(`[Session ${sessionId}] QR generation failed: ${qrErr.message}`);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          this.logger.warn(
            `[Session ${sessionId}] Connection closed (code: ${statusCode}, reason: ${lastDisconnect?.error?.message || 'unknown'}). Should reconnect: ${shouldReconnect}`,
          );

          this.sockets.delete(sessionId);

          if (shouldReconnect) {
            if (!this.reconnecting.has(sessionId)) {
              this.reconnecting.add(sessionId);
              setTimeout(() => {
                this.reconnecting.delete(sessionId);
                this.initSession(sessionId).catch((err) => {
                  this.logger.warn(`[Session ${sessionId}] Auto-reconnect failed: ${err.message}`);
                });
              }, 4000);
            }
          } else {
            // User logged out from WhatsApp Mobile app
            this.statusMap.set(sessionId, {
              status: 'disconnected',
              qrCode: null,
              phone: null,
            });

            try {
              if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
              }
            } catch {}

            await prisma.whatsAppSession.update({
              where: { id: sessionId },
              data: {
                status: 'disconnected',
                qrCode: null,
                phone: null,
                credentialsEncrypted: null,
              },
            }).catch(() => {});
          }
        } else if (connection === 'open') {
          const rawId = sock.user?.id || '';
          const phone = rawId.split(':')[0]?.split('@')[0]?.replace(/\D/g, '') || 'Connected Device';
          const pushName = sock.user?.name || 'GINIE WhatsApp Device';

          this.statusMap.set(sessionId, {
            status: 'connected',
            phone,
            pushName,
            qrCode: null,
          });

          await prisma.whatsAppSession.update({
            where: { id: sessionId },
            data: {
              status: 'connected',
              phone: `+${phone}`,
              qrCode: null,
              lastActiveAt: new Date(),
            },
          }).catch(() => {});

          await this.backupCredsToDb(sessionId, sessionDir);
          this.logger.log(`[Session ${sessionId}] WhatsApp CONNECTED successfully for phone: +${phone}`);
        }
      });

      // Await live QR code handshake before returning (up to 5s)
      return this.waitForQrCode(sessionId, 5000);
    } catch (err: any) {
      this.logger.error(`[Session ${sessionId}] initSession error: ${err.message}`);
      return { status: 'disconnected' };
    }
  }

  async getStatus(sessionId: string): Promise<BaileysLiveStatus> {
    const existing = this.statusMap.get(sessionId);
    if (existing && existing.status === 'connected') {
      return existing;
    }
    if (existing && existing.status === 'qr_ready' && existing.qrCode) {
      return existing;
    }
    await this.initSession(sessionId);
    return this.waitForQrCode(sessionId, 5000);
  }

  async refreshSession(sessionId: string): Promise<BaileysLiveStatus> {
    const sock = this.sockets.get(sessionId);
    if (sock) {
      try {
        sock.end(undefined);
      } catch {}
      this.sockets.delete(sessionId);
    }
    this.statusMap.set(sessionId, { status: 'qr_ready', qrCode: null });
    return this.initSession(sessionId);
  }

  async sendText(sessionId: string, to: string, text: string): Promise<{ messageId: string }> {
    let sock = this.sockets.get(sessionId);
    if (!sock) {
      await this.initSession(sessionId);
      sock = this.sockets.get(sessionId);
    }

    const currentStatus = this.statusMap.get(sessionId);
    if (!sock || currentStatus?.status !== 'connected') {
      throw new Error(
        'WhatsApp session is not connected. Please scan the QR code in WhatsApp settings to pair your device.',
      );
    }

    const cleanNumber = to.replace(/\D/g, '');
    const standardNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const jid = `${standardNumber}@s.whatsapp.net`;

    try {
      const result = await sock.sendMessage(jid, { text });
      const msgId = result?.key?.id || `baileys_${Date.now()}`;
      this.logger.log(`[Session ${sessionId}] Message sent to ${jid} (ID: ${msgId})`);
      return { messageId: msgId };
    } catch (err: any) {
      this.logger.error(`[Session ${sessionId}] sendMessage failed: ${err.message}`);
      throw err;
    }
  }

  async unlinkSession(sessionId: string): Promise<void> {
    const sock = this.sockets.get(sessionId);
    if (sock) {
      try {
        await sock.logout();
      } catch {}
      this.sockets.delete(sessionId);
    }

    this.statusMap.delete(sessionId);
    const sessionDir = this.getSessionDir(sessionId);
    try {
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }
    } catch {}

    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: {
        status: 'disconnected',
        qrCode: null,
        phone: null,
        credentialsEncrypted: null,
      },
    }).catch(() => {});

    this.logger.log(`[Session ${sessionId}] Session unlinked and cleared.`);
  }

  // Find any active session or master session for sending system notifications/OTPs
  async findMasterSession(): Promise<{ id: string; phone: string | null } | null> {
    // 1. Check in-memory connected sessions first
    for (const [id, status] of this.statusMap.entries()) {
      if (status.status === 'connected') {
        return { id, phone: status.phone || null };
      }
    }

    // 2. Check database for any connected session
    const session = await prisma.whatsAppSession.findFirst({
      where: {
        provider: 'bridge',
        status: 'connected',
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (session) {
      return { id: session.id, phone: session.phone };
    }

    return null;
  }
}
