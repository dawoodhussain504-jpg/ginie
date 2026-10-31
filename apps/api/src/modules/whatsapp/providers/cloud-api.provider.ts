import { WhatsAppProvider } from '@ginie/common';
import { Logger } from '@nestjs/common';

export class CloudApiProvider implements WhatsAppProvider {
  private readonly logger = new Logger(CloudApiProvider.name);

  constructor(
    private readonly phoneNumberId?: string,
    private readonly accessToken?: string,
  ) {
    this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
  }

  async sendText(to: string, text: string): Promise<{ messageId: string }> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('Meta WhatsApp Cloud API credentials not set. Simulated send.');
      return { messageId: `cloud_sim_${Date.now()}` };
    }

    const cleanTo = to.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'text',
          text: { body: text },
        }),
      });

      const data = (await response.json()) as any;
      if (!response.ok) {
        throw new Error(data.error?.message || 'Meta Cloud API error');
      }

      return { messageId: data.messages?.[0]?.id || `cloud_msg_${Date.now()}` };
    } catch (err: any) {
      this.logger.error('Meta Cloud API send failed:', err.message);
      return { messageId: `failed_${Date.now()}` };
    }
  }

  async setPresence(to: string, presence: 'composing' | 'paused'): Promise<void> {
    // Cloud API presence is handled by Meta
  }

  async markRead(messageId: string): Promise<void> {
    if (!this.phoneNumberId || !this.accessToken) return;
    const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
    } catch {}
  }

  async getStatus(): Promise<{ status: 'connected' | 'disconnected' | 'qr_ready' }> {
    const isConfigured = !!(this.phoneNumberId && this.accessToken);
    return { status: isConfigured ? 'connected' : 'disconnected' };
  }
}
