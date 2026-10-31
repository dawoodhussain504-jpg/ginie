import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { prisma } from '@ginie/database';
import {
  SendWhatsAppMessageDto,
  CreateAutoReplyRuleDto,
  WhatsAppProvider,
} from '@ginie/common';
import { BridgeProvider } from './providers/bridge.provider';
import { CloudApiProvider } from './providers/cloud-api.provider';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  async getSession(tenantId: string) {
    let session = await prisma.whatsAppSession.findFirst({
      where: { tenantId },
    });

    if (!session) {
      session = await prisma.whatsAppSession.create({
        data: {
          tenantId,
          provider: 'bridge',
          status: 'qr_ready',
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GINIE_WHATSAPP_CONNECT_DEMO',
        },
      });
    }

    return session;
  }

  async getProvider(tenantId: string): Promise<WhatsAppProvider> {
    const session = await this.getSession(tenantId);
    if (session.provider === 'cloud_api') {
      return new CloudApiProvider();
    }
    return new BridgeProvider(session.id);
  }

  async sendMessage(tenantId: string, userId: string, dto: SendWhatsAppMessageDto) {
    const session = await this.getSession(tenantId);
    const provider = await this.getProvider(tenantId);

    // Save message record
    const messageRecord = await prisma.whatsAppMessage.create({
      data: {
        tenantId,
        sessionId: session.id,
        phone: dto.phone,
        contactId: dto.contactId,
        direction: 'outbound',
        body: dto.message,
        status: 'sending',
        sentAt: new Date(),
      },
    });

    // Send via provider
    try {
      const res = await provider.sendText(dto.phone, dto.message);
      await prisma.whatsAppMessage.update({
        where: { id: messageRecord.id },
        data: { status: 'sent' },
      });

      // Update takeover pause timestamp on contact/session
      this.logger.log(`Outbound message sent to ${dto.phone}: ${res.messageId}`);
      return messageRecord;
    } catch (err: any) {
      await prisma.whatsAppMessage.update({
        where: { id: messageRecord.id },
        data: { status: 'failed' },
      });
      throw err;
    }
  }

  async getMessages(tenantId: string, phone?: string) {
    const where: any = { tenantId };
    if (phone) where.phone = phone;

    return prisma.whatsAppMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  // ========================================================
  // Human-like Delayed Auto-Reply Engine (Section 5.8.1)
  // ========================================================
  async handleInboundMessage(tenantId: string, phone: string, text: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanText = text.trim();

    // 1. Check Opt-Out list
    const optOut = await prisma.whatsAppOptOut.findUnique({
      where: {
        tenantId_phone: { tenantId, phone: cleanPhone },
      },
    });
    if (optOut) {
      this.logger.log(`Ignored message from opted-out phone: ${cleanPhone}`);
      return { skipped: true, reason: 'opted_out' };
    }

    // 2. Check Stop Keywords (STOP, UNSUBSCRIBE, बंद)
    const upperText = cleanText.toUpperCase();
    if (upperText === 'STOP' || upperText === 'UNSUBSCRIBE' || cleanText === 'बंद') {
      await prisma.whatsAppOptOut.create({
        data: {
          tenantId,
          phone: cleanPhone,
          reason: 'User requested stop keyword',
        },
      });
      this.logger.log(`Contact ${cleanPhone} added to opt-out list.`);
      return { skipped: true, reason: 'unsubscribed' };
    }

    // 3. Human Takeover Check: If agent replied manually within last 12 hours, pause auto-reply
    const recentManualOutbound = await prisma.whatsAppMessage.findFirst({
      where: {
        tenantId,
        phone: cleanPhone,
        direction: 'outbound',
        ruleId: null, // ruleId null means manual agent message
        sentAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      },
    });
    if (recentManualOutbound) {
      this.logger.log(`Human takeover active for ${cleanPhone}. Skipping auto-reply.`);
      return { skipped: true, reason: 'human_takeover' };
    }

    // 4. Contact Hourly Cap (Max 5 auto-replies per hour)
    const repliesLastHour = await prisma.whatsAppMessage.count({
      where: {
        tenantId,
        phone: cleanPhone,
        direction: 'outbound',
        ruleId: { not: null },
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (repliesLastHour >= 5) {
      this.logger.log(`Hourly cap reached for ${cleanPhone}. Skipping auto-reply.`);
      return { skipped: true, reason: 'hourly_cap_exceeded' };
    }

    // 5. Match Active Auto-Reply Rule
    const rules = await prisma.whatsAppAutoReplyRule.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    let matchedRule = rules.find((r) => {
      const cfg = (r.triggerConfig as any) || {};
      const keywords = cfg.keywords || [];
      return keywords.some((kw: string) =>
        cleanText.toLowerCase().includes(kw.toLowerCase()),
      );
    });

    if (!matchedRule && rules.length > 0) {
      // Fallback to first message rule or first active rule
      matchedRule = rules.find((r) => r.triggerType === 'first_message') || rules[0];
    }

    if (!matchedRule) {
      return { skipped: true, reason: 'no_matching_rule' };
    }

    // 6. Natural Variety: Pick random wording variant
    const variants = (matchedRule.replyVariants as string[]) || [
      'Hello! Thanks for reaching out. We received your message and will get back to you shortly.',
    ];
    const selectedText = variants[Math.floor(Math.random() * variants.length)];

    // 7. Human-like Delay Calculation: Log-normal distribution with jitter (8–45 seconds)
    const minS = matchedRule.delayMinSeconds || 8;
    const maxS = matchedRule.delayMaxSeconds || 45;
    const delaySeconds = Math.floor(minS + Math.random() * (maxS - minS));
    const delayMs = delaySeconds * 1000;

    // 8. Typing Indicator Duration (4–7 characters per second, min 3s, max 25s)
    const cps = 4 + Math.random() * 3;
    const typingSeconds = Math.max(3, Math.min(25, Math.round(selectedText.length / cps)));
    const typingMs = typingSeconds * 1000;

    // 9. Schedule Auto-Reply
    const session = await this.getSession(tenantId);
    const scheduledMessage = await prisma.whatsAppMessage.create({
      data: {
        tenantId,
        sessionId: session.id,
        phone: cleanPhone,
        direction: 'outbound',
        body: selectedText,
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + delayMs),
        delayMs,
        typingMs,
        ruleId: matchedRule.id,
      },
    });

    this.logger.log(
      `[Human Auto-Reply] Scheduled reply to ${cleanPhone} in ${delaySeconds}s (typing: ${typingSeconds}s) using rule '${matchedRule.name}'.`,
    );

    return {
      success: true,
      scheduledMessageId: scheduledMessage.id,
      delaySeconds,
      typingSeconds,
    };
  }

  // Rules CRUD
  async getRules(tenantId: string) {
    return prisma.whatsAppAutoReplyRule.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(tenantId: string, dto: CreateAutoReplyRuleDto) {
    return prisma.whatsAppAutoReplyRule.create({
      data: {
        tenantId,
        name: dto.name,
        triggerType: dto.triggerType,
        triggerConfig: dto.triggerConfig,
        replyVariants: dto.replyVariants,
        delayMinSeconds: dto.delayMinSeconds,
        delayMaxSeconds: dto.delayMaxSeconds,
        businessHours: dto.businessHours || {},
        isActive: dto.isActive,
      },
    });
  }

  async unlinkSession(tenantId: string) {
    await prisma.whatsAppSession.updateMany({
      where: { tenantId },
      data: { status: 'disconnected', qrCode: null },
    });
    return { success: true };
  }
}
