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
    this.baseUrl = bridgeUrl || process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:3001';
    this.secret = secret || process.env.WHATSAPP_BRIDGE_SECRET || 'dev_bridge_secret';
  }

  async sendText(to: string, text: string): Promise<{ messageId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${this.sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': this.secret,
        },
        body: JSON.stringify({ to, text }),
      });

      if (!response.ok) {
        throw new Error(`Bridge error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      return { messageId: data.messageId || `msg_${Date.now()}` };
    } catch (err: any) {
      this.logger.warn(`Bridge sendText simulated (offline): ${err.message}`);
      return { messageId: `sim_msg_${Date.now()}` };
    }
  }

  async setPresence(to: string, presence: 'composing' | 'paused'): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/sessions/${this.sessionId}/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': this.secret,
        },
        body: JSON.stringify({ to, presence }),
      });
    } catch {}
  }

  async markRead(messageId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/sessions/${this.sessionId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bridge-Secret': this.secret,
        },
        body: JSON.stringify({ messageId }),
      });
    } catch {}
  }

  async getStatus(): Promise<{ status: 'connected' | 'disconnected' | 'qr_ready'; qrCode?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${this.sessionId}/status`, {
        headers: { 'X-Bridge-Secret': this.secret },
      });
      if (response.ok) {
        return (await response.json()) as any;
      }
    } catch {}
    return { status: 'qr_ready', qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GINIE_WHATSAPP_SESSION_DEMO' };
  }
}
