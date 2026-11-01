import { WhatsAppProvider } from '@ginie/common';
import { Logger } from '@nestjs/common';

export class BridgeProvider implements WhatsAppProvider {
  private readonly logger = new Logger(BridgeProvider.name);
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor(
    private readonly sessionId: string,
    bridgeUrl?: string,
    secret?: string,
  ) {
    this.baseUrl = (
      bridgeUrl ||
      process.env.WHATSAPP_BRIDGE_URL ||
      'https://ginie-whatsapp-bridge.onrender.com'
    ).replace(/\/$/, '');
    this.secret = secret || process.env.WHATSAPP_BRIDGE_SECRET || 'dev_bridge_secret';
  }

  async sendText(to: string, text: string): Promise<{ messageId: string }> {
    try {
      const cleanNumber = to.replace(/\D/g, '');
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': this.secret,
        },
        body: JSON.stringify({ number: cleanNumber, text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bridge HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as any;
      if (data.error) {
        throw new Error(data.error);
      }

      return { messageId: data.messageId || `msg_${Date.now()}` };
    } catch (err: any) {
      this.logger.error(`Bridge sendText failed: ${err.message}`);
      throw err;
    }
  }

  async setPresence(to: string, presence: 'composing' | 'paused'): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': this.secret,
        },
        body: JSON.stringify({ number: to, presence }),
      });
    } catch {
      // presence is non-critical
    }
  }

  async markRead(messageId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': this.secret,
        },
        body: JSON.stringify({ messageId }),
      });
    } catch {
      // non-critical
    }
  }

  async getStatus(): Promise<{
    status: 'connected' | 'disconnected' | 'qr_ready';
    qrCode?: string;
    phone?: string;
    pushName?: string;
  }> {
    try {
      // 1. Try querying /qr first to see if QR or connected status is available
      const qrRes = await fetch(`${this.baseUrl}/qr`, {
        headers: { 'X-Bridge-Secret': this.secret },
      });

      if (qrRes.ok) {
        const data = (await qrRes.json()) as any;
        if (data.status === 'connected') {
          return {
            status: 'connected',
            phone: data.phone,
            pushName: data.pushName,
          };
        }
        if (data.qr) {
          return {
            status: 'qr_ready',
            qrCode: data.qr,
          };
        }
      }

      // 2. Fallback check /status
      const statusRes = await fetch(`${this.baseUrl}/status`, {
        headers: { 'X-Bridge-Secret': this.secret },
      });

      if (statusRes.ok) {
        const statusData = (await statusRes.json()) as any;
        if (statusData.connected) {
          return {
            status: 'connected',
            phone: statusData.phone,
            pushName: statusData.pushName,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(`Bridge getStatus unreachable: ${err.message}`);
    }

    return {
      status: 'qr_ready',
    };
  }

  async disconnect(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': this.secret,
        },
      });
      this.logger.log('WhatsApp bridge disconnect signaled.');
    } catch (err: any) {
      this.logger.warn(`Bridge disconnect call failed: ${err.message}`);
    }
  }
}
