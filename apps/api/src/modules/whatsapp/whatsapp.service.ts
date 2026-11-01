import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
          qrCode: null,
          warmupStartedAt: new Date(),
          dailyCap: 50,
          sentToday: 0,
        },
      });
    }

    // Sync live session & QR code with Baileys Bridge
    if (session.provider === 'bridge') {
      try {
        const bridge = new BridgeProvider(session.id);
        const liveStatus = await bridge.getStatus();
        if (liveStatus.status === 'connected') {
          session = await prisma.whatsAppSession.update({
            where: { id: session.id },
            data: {
              status: 'connected',
              phone: liveStatus.phone || session.phone,
              qrCode: null,
              lastActiveAt: new Date(),
            },
          });
        } else if (liveStatus.qrCode && liveStatus.qrCode !== session.qrCode) {
          session = await prisma.whatsAppSession.update({
            where: { id: session.id },
            data: {
              status: 'qr_ready',
              qrCode: liveStatus.qrCode,
            },
          });
        }
      } catch (err: any) {
        this.logger.warn(`Could not sync live session with bridge: ${err.message}`);
      }
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

  // ========================================================
  // Anti-Ban Status & Warm-up Metrics (Spec 2.2)
  // ========================================================
  async getAntiBanStatus(tenantId: string) {
    const session = await this.getSession(tenantId);
    const warmupStart = session.warmupStartedAt || session.createdAt || new Date();
    const daysActive = Math.max(1, Math.floor((Date.now() - warmupStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    let warmupStage = 'Stage 1: Initial Warm-up (Max 20 msgs/day)';
    let suggestedCap = 20;

    if (daysActive > 14) {
      warmupStage = 'Stage 4: Fully Warmed-up (Max 250+ msgs/day)';
      suggestedCap = 300;
    } else if (daysActive > 7) {
      warmupStage = 'Stage 3: Moderate Volume (Max 100 msgs/day)';
      suggestedCap = 100;
    } else if (daysActive > 3) {
      warmupStage = 'Stage 2: Gradual Acceleration (Max 50 msgs/day)';
      suggestedCap = 50;
    }

    let healthStatus: 'safe' | 'warning' | 'limit_reached' = 'safe';
    if (session.sentToday >= session.dailyCap) {
      healthStatus = 'limit_reached';
    } else if (session.sentToday >= session.dailyCap * 0.8) {
      healthStatus = 'warning';
    }

    return {
      daysActive,
      warmupStage,
      dailyCap: session.dailyCap || suggestedCap,
      sentToday: session.sentToday || 0,
      healthStatus,
      minDelaySeconds: 8,
      maxDelaySeconds: 30,
      typingSimulation: true,
      humanTakeoverHours: 12,
      hourlyCapPerContact: 5,
    };
  }

  // ========================================================
  // Working Hours Verification (Spec 2.2)
  // ========================================================
  async isWithinWorkingHours(tenantId: string): Promise<{ isAllowed: boolean; message?: string }> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { workingHours: true },
      });

      const wh = (tenant?.workingHours as any) || {
        start: '09:00',
        end: '20:00',
        days: [1, 2, 3, 4, 5, 6],
      };

      // Current IST Time (UTC + 5:30)
      const nowUtc = Date.now();
      const istTime = new Date(nowUtc + 5.5 * 60 * 60 * 1000);
      const currentDay = istTime.getUTCDay(); // 0 = Sun, 1 = Mon ...
      const currentHour = istTime.getUTCHours();
      const currentMin = istTime.getUTCMinutes();
      const currentMinutesFromMidnight = currentHour * 60 + currentMin;

      const allowedDays = wh.days || [1, 2, 3, 4, 5, 6];
      if (!allowedDays.includes(currentDay)) {
        return {
          isAllowed: false,
          message: `Outside working days (Office closed on today). Working hours: ${wh.start} to ${wh.end}.`,
        };
      }

      const [startH, startM] = (wh.start || '09:00').split(':').map(Number);
      const [endH, endM] = (wh.end || '20:00').split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (currentMinutesFromMidnight < startMinutes || currentMinutesFromMidnight > endMinutes) {
        return {
          isAllowed: false,
          message: `Outside working hours (${wh.start} - ${wh.end} IST). Automated messages are paused to protect customer experience.`,
        };
      }

      return { isAllowed: true };
    } catch {
      return { isAllowed: true };
    }
  }

  // ========================================================
  // Unified Conversations & Chat Inbox (Spec 2.2)
  // ========================================================
  async getConversations(tenantId: string) {
    const messages = await prisma.whatsAppMessage.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const cleanPhoneDigits = (p: string | null | undefined): string => {
      if (!p) return '';
      const d = p.replace(/\D/g, '');
      return d.length > 10 ? d.slice(-10) : d;
    };

    // Pre-fetch contacts and leads to auto-link conversations
    const [contacts, leads] = await Promise.all([
      prisma.contact.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true, phone: true },
      }),
      prisma.lead.findMany({
        where: { tenantId, deletedAt: null },
        select: { id: true, name: true, phone: true },
      }),
    ]);

    const contactMap = new Map<string, { id: string; name: string; type: string }>();
    for (const c of contacts) {
      const p = cleanPhoneDigits(c.phone);
      if (p) contactMap.set(p, { id: c.id, name: c.name, type: 'Contact' });
    }
    for (const l of leads) {
      const p = cleanPhoneDigits(l.phone);
      if (p && !contactMap.has(p)) {
        contactMap.set(p, { id: l.id, name: l.name, type: 'Lead' });
      }
    }

    const optOuts = await prisma.whatsAppOptOut.findMany({
      where: { tenantId },
      select: { phone: true },
    });
    const optOutSet = new Set(optOuts.map((o) => cleanPhoneDigits(o.phone)));

    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const digits = cleanPhoneDigits(msg.phone);
      if (!conversationMap.has(digits)) {
        const customer = contactMap.get(digits);
        conversationMap.set(digits, {
          phone: msg.phone,
          cleanPhone: digits,
          customerName: customer?.name || msg.phone,
          customerType: customer?.type || 'New Lead',
          customerId: customer?.id || null,
          isOptedOut: optOutSet.has(digits),
          unreadCount: msg.direction === 'inbound' && msg.status !== 'read' ? 1 : 0,
          lastMessage: {
            id: msg.id,
            body: msg.body,
            direction: msg.direction,
            status: msg.status,
            createdAt: msg.createdAt,
            isAutoReply: !!msg.ruleId,
          },
        });
      } else {
        const conv = conversationMap.get(digits);
        if (msg.direction === 'inbound' && msg.status !== 'read') {
          conv.unreadCount += 1;
        }
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime(),
    );
  }

  async getConversationThread(tenantId: string, phone: string) {
    const digits = phone.replace(/\D/g, '').slice(-10);

    const messages = await prisma.whatsAppMessage.findMany({
      where: {
        tenantId,
        phone: { contains: digits },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark inbound as read
    await prisma.whatsAppMessage.updateMany({
      where: {
        tenantId,
        phone: { contains: digits },
        direction: 'inbound',
        status: { not: 'read' },
      },
      data: { status: 'read' },
    });

    // Lookup customer info
    const contact = await prisma.contact.findFirst({
      where: { tenantId, phone: { contains: digits }, deletedAt: null },
      include: { company: true },
    });

    const lead = !contact
      ? await prisma.lead.findFirst({
          where: { tenantId, phone: { contains: digits }, deletedAt: null },
        })
      : null;

    const optOut = await prisma.whatsAppOptOut.findFirst({
      where: { tenantId, phone: { contains: digits } },
    });

    return {
      phone,
      cleanPhone: digits,
      customer: contact || lead || null,
      customerType: contact ? 'Contact' : lead ? 'Lead' : 'Visitor',
      isOptedOut: !!optOut,
      messages,
    };
  }

  async sendMessage(tenantId: string, userId: string, dto: SendWhatsAppMessageDto) {
    const session = await this.getSession(tenantId);
    const provider = await this.getProvider(tenantId);

    // Anti-ban daily cap check
    if (session.dailyCap && session.sentToday >= session.dailyCap) {
      throw new BadRequestException(
        `Anti-Ban Protection: Daily message cap of ${session.dailyCap} messages reached. This prevents WhatsApp number flagging. Resets at midnight IST.`,
      );
    }

    // Check opt-out
    const cleanDigits = dto.phone.replace(/\D/g, '').slice(-10);
    const optOut = await prisma.whatsAppOptOut.findFirst({
      where: { tenantId, phone: { contains: cleanDigits } },
    });
    if (optOut) {
      throw new BadRequestException(
        `Cannot send message. This customer has opted out (STOP) of automated WhatsApp messages.`,
      );
    }

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

    // Update sentToday counter
    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: {
        sentToday: { increment: 1 },
        lastActiveAt: new Date(),
      },
    });

    // Send via provider
    try {
      const res = await provider.sendText(dto.phone, dto.message);
      await prisma.whatsAppMessage.update({
        where: { id: messageRecord.id },
        data: { status: 'sent' },
      });

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
    if (phone) {
      const digits = phone.replace(/\D/g, '').slice(-10);
      where.phone = { contains: digits };
    }

    return prisma.whatsAppMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 150,
    });
  }

  // ========================================================
  // Inbound Message Handler & Bilingual STOP Support (Spec 2.2)
  // ========================================================
  async handleInboundMessage(tenantId: string, phone: string, text: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanText = text.trim();
    const cleanDigits = cleanPhone.slice(-10);

    // Save inbound message
    await prisma.whatsAppMessage.create({
      data: {
        tenantId,
        phone: cleanPhone,
        direction: 'inbound',
        body: cleanText,
        status: 'delivered',
      },
    });

    // Auto-link or create Contact if not exists
    const existingContact = await prisma.contact.findFirst({
      where: { tenantId, phone: { contains: cleanDigits }, deletedAt: null },
    });
    const existingLead = await prisma.lead.findFirst({
      where: { tenantId, phone: { contains: cleanDigits }, deletedAt: null },
    });

    if (!existingContact && !existingLead) {
      try {
        await prisma.lead.create({
          data: {
            tenantId,
            name: `WhatsApp Lead (${cleanPhone.slice(-4)})`,
            phone: cleanPhone,
            source: 'WhatsApp Inbound',
            statusId: (await prisma.leadStatus.findFirst({ where: { tenantId, isDefault: true } }))?.id || undefined,
          },
        });
      } catch (e) {
        this.logger.warn('Could not auto-create lead for incoming WhatsApp message:', e);
      }
    }

    // 1. Check Opt-In Keyword (START, शुरू)
    const upperText = cleanText.toUpperCase();
    if (upperText === 'START' || cleanText === 'शुरू') {
      await prisma.whatsAppOptOut.deleteMany({
        where: { tenantId, phone: { contains: cleanDigits } },
      });
      return { status: 'opted_in', message: 'Aapko dobara WhatsApp updates ke liye subscribe kar liya gaya hai.' };
    }

    // 2. Check Stop Keywords (STOP, UNSUBSCRIBE, बंद, रोको, मत भेजो, band karo)
    const stopKeywords = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END', 'OPTOUT', 'बंद', 'रोको', 'मत भेजो', 'BAND KARO', 'MAT BHEJO', 'ROKO'];
    const isStopRequested = stopKeywords.some((kw) => upperText === kw || cleanText.toLowerCase().includes(kw.toLowerCase()));

    if (isStopRequested) {
      await prisma.whatsAppOptOut.upsert({
        where: { tenantId_phone: { tenantId, phone: cleanPhone } },
        update: { reason: `User keyword: ${cleanText}` },
        create: {
          tenantId,
          phone: cleanPhone,
          reason: `User keyword: ${cleanText}`,
        },
      });
      this.logger.log(`Contact ${cleanPhone} added to opt-out list via keyword '${cleanText}'.`);
      return { skipped: true, reason: 'unsubscribed' };
    }

    // 3. Check Opt-Out list
    const optOut = await prisma.whatsAppOptOut.findFirst({
      where: { tenantId, phone: { contains: cleanDigits } },
    });
    if (optOut) {
      this.logger.log(`Ignored message from opted-out phone: ${cleanPhone}`);
      return { skipped: true, reason: 'opted_out' };
    }

    // 4. Working Hours Gating
    const workingHoursCheck = await this.isWithinWorkingHours(tenantId);
    if (!workingHoursCheck.isAllowed) {
      this.logger.log(`Outside business hours for ${tenantId}. Checking outside-hours rule.`);
      const outsideRule = await prisma.whatsAppAutoReplyRule.findFirst({
        where: { tenantId, triggerType: 'outside_hours', isActive: true },
      });

      const replyText = outsideRule
        ? (outsideRule.replyVariants as string[])[0]
        : 'Namaste! Hamara office abhi band hai. Hamari team office khulte hi aapse sampark karegi. Dhanyawaad!';

      // Schedule delayed out-of-office reply
      const session = await this.getSession(tenantId);
      await prisma.whatsAppMessage.create({
        data: {
          tenantId,
          sessionId: session.id,
          phone: cleanPhone,
          direction: 'outbound',
          body: replyText,
          status: 'scheduled',
          scheduledAt: new Date(Date.now() + 15000), // 15s natural delay
          delayMs: 15000,
          typingMs: 4000,
        },
      });
      return { outsideHours: true, replyScheduled: true };
    }

    // 5. Human Takeover Check: If agent replied manually within last 12 hours, pause auto-reply
    const recentManualOutbound = await prisma.whatsAppMessage.findFirst({
      where: {
        tenantId,
        phone: { contains: cleanDigits },
        direction: 'outbound',
        ruleId: null,
        sentAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      },
    });
    if (recentManualOutbound) {
      this.logger.log(`Human takeover active for ${cleanPhone}. Skipping auto-reply.`);
      return { skipped: true, reason: 'human_takeover' };
    }

    // 6. Contact Hourly Cap (Max 5 auto-replies per hour)
    const repliesLastHour = await prisma.whatsAppMessage.count({
      where: {
        tenantId,
        phone: { contains: cleanDigits },
        direction: 'outbound',
        ruleId: { not: null },
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (repliesLastHour >= 5) {
      this.logger.log(`Hourly cap reached for ${cleanPhone}. Skipping auto-reply.`);
      return { skipped: true, reason: 'hourly_cap_exceeded' };
    }

    // 7. Match Active Auto-Reply Rule
    const rules = await prisma.whatsAppAutoReplyRule.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    let matchedRule = rules.find((r) => {
      const cfg = (r.triggerConfig as any) || {};
      const keywords = cfg.keywords || [];
      return keywords.some((kw: string) => cleanText.toLowerCase().includes(kw.toLowerCase()));
    });

    if (!matchedRule && rules.length > 0) {
      matchedRule = rules.find((r) => r.triggerType === 'first_message') || rules[0];
    }

    if (!matchedRule) {
      return { skipped: true, reason: 'no_matching_rule' };
    }

    // 8. Natural Variety: Pick random wording variant
    const variants = (matchedRule.replyVariants as string[]) || [
      'Hello! Thanks for reaching out. We received your message and will get back to you shortly.',
    ];
    const selectedText = variants[Math.floor(Math.random() * variants.length)];

    // 9. Human-like Delay Calculation (8–45 seconds)
    const minS = matchedRule.delayMinSeconds || 8;
    const maxS = matchedRule.delayMaxSeconds || 45;
    const delaySeconds = Math.floor(minS + Math.random() * (maxS - minS));
    const delayMs = delaySeconds * 1000;

    // 10. Typing Indicator Duration (4–7 cps)
    const cps = 4 + Math.random() * 3;
    const typingSeconds = Math.max(3, Math.min(25, Math.round(selectedText.length / cps)));
    const typingMs = typingSeconds * 1000;

    // 11. Schedule Auto-Reply
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

    return {
      success: true,
      scheduledMessageId: scheduledMessage.id,
      delaySeconds,
      typingSeconds,
    };
  }

  // ========================================================
  // Auto Follow-up Task Generator (Spec 2.2)
  // ========================================================
  async createFollowUpTasks(tenantId: string, daysInactive: number = 2) {
    const thresholdDate = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);

    const conversations = await this.getConversations(tenantId);
    let createdTasksCount = 0;

    for (const conv of conversations) {
      // If the last message was OUTBOUND and sent before the threshold date
      if (
        conv.lastMessage?.direction === 'outbound' &&
        new Date(conv.lastMessage.createdAt) < thresholdDate
      ) {
        // Check if an open task already exists
        const existingTask = await prisma.task.findFirst({
          where: {
            tenantId,
            status: { in: ['pending', 'in_progress'] },
            title: { contains: conv.phone },
          },
        });

        if (!existingTask) {
          const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await prisma.task.create({
            data: {
              tenantId,
              title: `WhatsApp Follow-up: ${conv.customerName} (${conv.phone})`,
              description: `Customer has not replied to WhatsApp message sent on ${new Date(conv.lastMessage.createdAt).toLocaleDateString('en-IN')}. Please follow up by call or message.`,
              priority: 'high',
              status: 'pending',
              dueAt: tomorrow,
              entityType: conv.customerId ? conv.customerType.toLowerCase() : undefined,
              entityId: conv.customerId || undefined,
            },
          });
          createdTasksCount++;
        }
      }
    }

    return {
      createdTasksCount,
      message: `Generated ${createdTasksCount} follow-up task(s) for unresponsive contacts.`,
    };
  }

  // ========================================================
  // Message Templates (Spec 2.2)
  // ========================================================
  async getTemplates(tenantId: string) {
    let templates = await prisma.messageTemplate.findMany({
      where: { tenantId, channel: 'whatsapp', status: 'active' },
      orderBy: { createdAt: 'asc' },
    });

    if (templates.length === 0) {
      // Seed default quick-reply templates
      const defaultTemplates = [
        {
          name: 'Welcome & Introduction',
          body: 'Namaste {{name}}! Thank you for connecting with us. How can we help your business today?',
        },
        {
          name: 'Quote Follow-up',
          body: 'Hello {{name}}, following up on the quotation we shared. Let us know if you need any adjustments or discounts.',
        },
        {
          name: 'Special Promotion Offer',
          body: 'Exclusive Offer for {{name}}! Get up to 15% off on your order this week. Reply YES to claim.',
        },
        {
          name: 'Payment Due Notice',
          body: 'Dear {{name}}, this is a friendly reminder regarding your pending invoice. Thank you for your prompt payment!',
        },
      ];

      for (const t of defaultTemplates) {
        await prisma.messageTemplate.create({
          data: {
            tenantId,
            channel: 'whatsapp',
            name: t.name,
            body: t.body,
            status: 'active',
          },
        });
      }

      templates = await prisma.messageTemplate.findMany({
        where: { tenantId, channel: 'whatsapp' },
        orderBy: { createdAt: 'asc' },
      });
    }

    return templates;
  }

  async createTemplate(tenantId: string, data: { name: string; body: string }) {
    return prisma.messageTemplate.create({
      data: {
        tenantId,
        channel: 'whatsapp',
        name: data.name,
        body: data.body,
        status: 'active',
      },
    });
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

  async handleBridgeWebhook(dto: { from?: string; phone?: string; message?: string; text?: string; tenantId?: string }) {
    const from = dto.from || dto.phone || '';
    const text = dto.message || dto.text || '';
    if (!from || !text) {
      return { status: 'ignored', reason: 'empty_from_or_text' };
    }

    let tenantId = dto.tenantId;
    if (!tenantId) {
      const activeSession = await prisma.whatsAppSession.findFirst({
        where: { provider: 'bridge' },
        select: { tenantId: true },
      });
      tenantId = activeSession?.tenantId;
    }

    if (!tenantId) {
      const defaultTenant = await prisma.tenant.findFirst({ select: { id: true } });
      tenantId = defaultTenant?.id;
    }

    if (!tenantId) {
      return { status: 'ignored', reason: 'no_tenant_found' };
    }

    return this.handleInboundMessage(tenantId, from, text);
  }

  async unlinkSession(tenantId: string) {
    const session = await prisma.whatsAppSession.findFirst({ where: { tenantId } });
    if (session && session.provider === 'bridge') {
      const bridge = new BridgeProvider(session.id);
      await bridge.disconnect();
    }
    await prisma.whatsAppSession.updateMany({
      where: { tenantId },
      data: { status: 'disconnected', qrCode: null, sentToday: 0, phone: null },
    });
    return { success: true };
  }
}
