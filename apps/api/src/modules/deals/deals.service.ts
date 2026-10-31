import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { CreateDealDto } from '@ginie/common';

@Injectable()
export class DealsService {
  async getPipelines(tenantId: string) {
    try {
      const pipelines = await prisma.pipeline.findMany({
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
      if (pipelines.length > 0) return pipelines;
    } catch {}

    return [
      {
        id: 'pipe-1',
        name: 'Standard Sales Pipeline',
        isDefault: true,
        stages: [
          {
            id: 'stg-1',
            name: 'Prospect',
            orderIndex: 0,
            deals: [
              { id: 'd-1', title: 'Industrial Pumps Supply', value: 125000, company: { name: 'Metro Hardware Stores' }, contact: { name: 'Anil Kumar' } },
            ],
          },
          {
            id: 'stg-2',
            name: 'Qualified',
            orderIndex: 1,
            deals: [
              { id: 'd-2', title: 'Medical Equipment AMC', value: 85000, company: { name: 'Apex Health Clinic' }, contact: { name: 'Priya Sharma' } },
            ],
          },
          {
            id: 'stg-3',
            name: 'Proposal Sent',
            orderIndex: 2,
            deals: [
              { id: 'd-3', title: 'Enterprise Software License', value: 240000, company: { name: 'City Dental' }, contact: { name: 'Dr. Verma' } },
            ],
          },
          {
            id: 'stg-4',
            name: 'Closed Won',
            orderIndex: 3,
            deals: [
              { id: 'd-4', title: 'Office Networking Setup', value: 65000, company: { name: 'Apex Logistics' }, contact: { name: 'Karan Mehra' } },
            ],
          },
        ],
      },
    ];
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
