import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@ginie/database';

export interface LeadAlertPayload {
  name: string;
  phone?: string;
  email?: string;
  companyName?: string;
  source?: string;
  score?: number;
  notes?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /**
   * Dispatches instant alert to Master Admin across configured channels (Telegram & WhatsApp)
   */
  async sendLeadAlert(tenantId: string, lead: LeadAlertPayload): Promise<void> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      });

      const settings: any = tenant?.settings || {};
      const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
      const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;
      const adminPhone = settings.adminWhatsAppPhone || process.env.ADMIN_WHATSAPP_PHONE;

      const messageText = 
        `🚨 *GINIE Alert: Naya Lead / Inquiry Aaya Hai!*\n\n` +
        `👤 *Name:* ${lead.name}\n` +
        `🏢 *Company:* ${lead.companyName || 'Individual'}\n` +
        `📞 *Phone:* ${lead.phone || 'Not provided'}\n` +
        `📧 *Email:* ${lead.email || 'Not provided'}\n` +
        `📍 *Source:* ${lead.source || 'Direct'}\n` +
        (lead.score !== undefined ? `🎯 *Score:* ${lead.score}/100\n` : '') +
        (lead.notes ? `📝 *Note:* ${lead.notes}\n` : '') +
        `\n⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

      // 1. Send via Telegram Bot API if configured
      if (botToken && chatId) {
        this.sendTelegramMessage(botToken, chatId, messageText).catch((err) =>
          this.logger.warn(`Telegram alert dispatch error: ${err.message}`),
        );
      }

      // 2. Send via WhatsApp Bridge daemon if configured
      if (adminPhone) {
        this.sendWhatsAppAlert(adminPhone, messageText).catch((err) =>
          this.logger.warn(`WhatsApp alert dispatch error: ${err.message}`),
        );
      }
    } catch (err: any) {
      this.logger.warn(`Failed to process lead notification: ${err.message}`);
    }
  }

  /**
   * Send test alert ping to verify credentials
   */
  async sendTestAlert(
    channel: 'telegram' | 'whatsapp',
    config: { botToken?: string; chatId?: string; phone?: string },
  ): Promise<{ success: boolean; message: string }> {
    const testMessage =
      `✅ *GINIE Alert System Connected Successfully!*\n\n` +
      `Aapke personal alert notifications ab active hain. Har naye customer ya web form lead ka instant alert aapko yahan milega.\n\n` +
      `⏰ *Verified At:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    if (channel === 'telegram') {
      const botToken = config.botToken || process.env.TELEGRAM_BOT_TOKEN;
      const chatId = config.chatId || process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
        return {
          success: false,
          message: 'Telegram Bot Token and Chat ID are required.',
        };
      }

      const res = await this.sendTelegramMessage(botToken, chatId, testMessage);
      if (res.ok) {
        return { success: true, message: 'Test message sent to Telegram successfully!' };
      } else {
        return {
          success: false,
          message: res.description || 'Telegram API returned an error.',
        };
      }
    }

    if (channel === 'whatsapp') {
      const phone = config.phone || process.env.ADMIN_WHATSAPP_PHONE;
      if (!phone) {
        return { success: false, message: 'Admin WhatsApp phone number is required.' };
      }
      const res = await this.sendWhatsAppAlert(phone, testMessage);
      return {
        success: res,
        message: res
          ? 'Test WhatsApp message dispatched via bridge!'
          : 'WhatsApp Bridge not reachable or not paired. Message queued.',
      };
    }

    return { success: false, message: 'Unknown alert channel.' };
  }

  private async sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<any> {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    return res.json();
  }

  private async sendWhatsAppAlert(phone: string, text: string): Promise<boolean> {
    const bridgeUrl = process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:4001';
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      const res = await fetch(`${bridgeUrl}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          message: text,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
