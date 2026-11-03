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

      const newPipe = await prisma.pipeline.create({
        data: {
          tenantId,
          name: 'Standard Sales Pipeline',
          isDefault: true,
          stages: {
            create: [
              { tenantId, name: 'Prospect', orderIndex: 0 },
              { tenantId, name: 'Qualified', orderIndex: 1 },
              { tenantId, name: 'Proposal Sent', orderIndex: 2 },
              { tenantId, name: 'Negotiation', orderIndex: 3 },
              { tenantId, name: 'Closed Won', orderIndex: 4 },
              { tenantId, name: 'Closed Lost', orderIndex: 5 },
            ],
          },
        },
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
      return [newPipe];
    } catch (err) {
      console.error('Failed to query pipelines from database:', err);
      return [];
    }
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

  // Field Sales GPS Check-ins
  async createCheckIn(tenantId: string, userId: string, data: any) {
    return (prisma as any).fieldSalesCheckIn.create({
      data: {
        tenantId,
        userId,
        clientName: data.clientName || 'Store Visit',
        clientPhone: data.clientPhone,
        lat: Number(data.lat || 0),
        lng: Number(data.lng || 0),
        address: data.address,
        battery: data.battery ? Number(data.battery) : null,
        notes: data.notes,
        photoUrl: data.photoUrl,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }

  async getCheckIns(tenantId: string) {
    return (prisma as any).fieldSalesCheckIn.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }
}
