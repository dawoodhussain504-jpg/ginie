import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { FallbackAiProvider } from './providers/fallback-ai.provider';
import { GeminiAiProvider } from './providers/gemini-ai.provider';
import {
  DraftMessageDto,
  SummarizeCallDto,
  CustomerScoreResult,
  DraftMessageResult,
  SummarizeCallResult,
} from '@ginie/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly fallbackAi: FallbackAiProvider,
    private readonly geminiAi: GeminiAiProvider,
  ) {}

  async scoreCustomer(tenantId: string, customerId: string): Promise<CustomerScoreResult> {
    const lead = await prisma.lead.findFirst({
      where: { id: customerId, tenantId },
    });

    if (!lead) {
      throw new NotFoundException('Customer record not found.');
    }

    const activities = await prisma.activity.findMany({
      where: { entityType: 'lead', entityId: customerId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    let result: CustomerScoreResult;
    try {
      if (this.geminiAi.isAvailable()) {
        result = await this.geminiAi.scoreCustomer(lead, activities);
      } else {
        result = await this.fallbackAi.scoreCustomer(lead, activities);
      }
    } catch (e) {
      this.logger.warn('Gemini scoring failed, using heuristic engine:', e);
      result = await this.fallbackAi.scoreCustomer(lead, activities);
    }

    // Persist score and plain explanation to Lead table
    try {
      await prisma.lead.update({
        where: { id: customerId },
        data: {
          score: result.score,
          aiScoreCategory: result.category.toLowerCase(),
          aiScoreReason: result.reason,
        },
      });
    } catch {}

    return result;
  }

  async draftMessage(tenantId: string, dto: DraftMessageDto): Promise<DraftMessageResult> {
    const lead = await prisma.lead.findFirst({
      where: { id: dto.customerId, tenantId },
    });

    if (!lead) {
      throw new NotFoundException('Customer record not found.');
    }

    const lastActivity = await prisma.activity.findFirst({
      where: { entityType: 'lead', entityId: dto.customerId, tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const context = {
      customerName: lead.name,
      companyName: lead.companyName || undefined,
      recentNotes: lastActivity?.content || undefined,
      channel: dto.channel || 'whatsapp',
      tone: dto.tone || 'friendly',
      goal: dto.goal,
      additionalNotes: dto.additionalNotes,
    };

    try {
      if (this.geminiAi.isAvailable()) {
        return await this.geminiAi.draftMessage(context);
      }
      return await this.fallbackAi.draftMessage(context);
    } catch (e) {
      this.logger.warn('Gemini draft failed, using template engine:', e);
      return this.fallbackAi.draftMessage(context);
    }
  }

  async summarizeCall(tenantId: string, dto: SummarizeCallDto): Promise<SummarizeCallResult> {
    let customerName = 'Customer';
    if (dto.customerId) {
      const lead = await prisma.lead.findFirst({
        where: { id: dto.customerId, tenantId },
      });
      if (lead) customerName = lead.name;
    }

    let result: SummarizeCallResult;
    try {
      if (this.geminiAi.isAvailable()) {
        result = await this.geminiAi.summarizeCall(dto.rawNotes, customerName);
      } else {
        result = await this.fallbackAi.summarizeCall(dto.rawNotes, customerName);
      }
    } catch (e) {
      this.logger.warn('Gemini summarize failed, using fallback:', e);
      result = await this.fallbackAi.summarizeCall(dto.rawNotes, customerName);
    }

    // Save as activity if customerId provided
    if (dto.customerId) {
      try {
        await prisma.activity.create({
          data: {
            tenantId,
            entityType: 'lead',
            entityId: dto.customerId,
            type: 'call',
            content: `Call Summary: ${result.summary}\nSentiment: ${result.sentiment}\nNext Action: ${result.nextRecommendedAction}`,
            meta: {
              sentiment: result.sentiment,
              keyTakeaways: result.keyTakeaways,
              nextRecommendedAction: result.nextRecommendedAction,
            },
          },
        });
      } catch {}
    }

    return result;
  }
}
