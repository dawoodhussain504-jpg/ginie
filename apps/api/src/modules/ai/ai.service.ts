import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { FallbackAiProvider } from './providers/fallback-ai.provider';
import {
  DraftMessageDto,
  SummarizeCallDto,
  CustomerScoreResult,
  DraftMessageResult,
  SummarizeCallResult,
} from '@ginie/common';

@Injectable()
export class AiService {
  constructor(private readonly fallbackAi: FallbackAiProvider) {}

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

    const result = await this.fallbackAi.scoreCustomer(lead, activities);

    // Persist score and plain explanation to Lead table
    await prisma.lead.update({
      where: { id: customerId },
      data: {
        score: result.score,
        aiScoreCategory: result.category.toLowerCase(),
        aiScoreReason: result.reason,
      },
    });

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

    return this.fallbackAi.draftMessage({
      customerName: lead.name,
      companyName: lead.companyName || undefined,
      recentNotes: lastActivity?.content || undefined,
      channel: dto.channel,
      tone: dto.tone,
      goal: dto.goal,
      additionalNotes: dto.additionalNotes,
    });
  }

  async summarizeCall(tenantId: string, dto: SummarizeCallDto): Promise<SummarizeCallResult> {
    let customerName: string | undefined;

    if (dto.customerId) {
      const lead = await prisma.lead.findFirst({
        where: { id: dto.customerId, tenantId },
        select: { name: true },
      });
      customerName = lead?.name;
    }

    const result = await this.fallbackAi.summarizeCall(dto.rawNotes, customerName);

    // If customerId is provided, also attach activity note with AI summary
    if (dto.customerId) {
      await prisma.activity.create({
        data: {
          tenantId,
          entityType: 'lead',
          entityId: dto.customerId,
          type: 'call',
          content: `Phone Call Summary: ${result.summary}\n\nRecommended next step: ${result.nextRecommendedAction}`,
        },
      });

      await prisma.lead.update({
        where: { id: dto.customerId },
        data: {
          aiSummary: result.summary,
        },
      });
    }

    return result;
  }
}
