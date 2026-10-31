import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { CreateTaskDto } from '@ginie/common';

@Injectable()
export class TasksService {
  async findAll(tenantId: string, query: { assigneeId?: string; status?: string }) {
    const where: any = { tenantId };
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.status) where.status = query.status;

    return prisma.task.findMany({
      where,
      orderBy: { dueAt: 'asc' },
      include: { assignee: true },
    });
  }

  async create(tenantId: string, userId: string, dto: CreateTaskDto) {
    return prisma.task.create({
      data: {
        tenantId,
        assigneeId: dto.assigneeId || userId,
        title: dto.title,
        description: dto.description,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        priority: dto.priority || 'medium',
        status: 'pending',
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
      include: { assignee: true },
    });
  }

  async update(tenantId: string, id: string, data: Partial<CreateTaskDto & { status: string }>) {
    const existing = await prisma.task.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found.');
    }

    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      },
      include: { assignee: true },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await prisma.task.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found.');
    }

    await prisma.task.delete({ where: { id } });
    return { success: true };
  }
}
