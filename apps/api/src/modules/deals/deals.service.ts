import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { CreateDealDto } from '@ginie/common';

@Injectable()
export class DealsService {
  async getPipelines(tenantId: string) {
    return prisma.pipeline.findMany({
      where: { tenantId },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
          include: {
            deals: {
              where: { deletedAt: null },
              include: {
                contact: true,
                company: true,
                owner: true,
              },
            },
          },
        },
      },
    });
  }

  async create(tenantId: string, userId: string, dto: CreateDealDto) {
    return prisma.deal.create({
      data: {
        tenantId,
        ownerId: dto.ownerId || userId,
        pipelineId: dto.pipelineId,
        stageId: dto.stageId,
        contactId: dto.contactId,
        companyId: dto.companyId,
        title: dto.title,
        value: dto.value,
        currency: dto.currency || 'INR',
        expectedClose: dto.expectedClose ? new Date(dto.expectedClose) : undefined,
        status: 'open',
      },
      include: {
        stage: true,
        contact: true,
        company: true,
        owner: true,
      },
    });
  }

  async updateStage(
    tenantId: string,
    id: string,
    data: { stageId: string; status?: 'open' | 'won' | 'lost'; lostReason?: string },
  ) {
    const existing = await prisma.deal.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('Sale record not found.');
    }

    return prisma.deal.update({
      where: { id },
      data: {
        stageId: data.stageId,
        status: data.status || existing.status,
        lostReason: data.lostReason,
      },
      include: { stage: true },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await prisma.deal.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('Sale record not found.');
    }

    await prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Sale moved to bin.' };
  }
}
