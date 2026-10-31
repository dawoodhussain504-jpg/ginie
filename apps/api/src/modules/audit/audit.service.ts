import { Injectable } from '@nestjs/common';
import { prisma } from '@ginie/database';

@Injectable()
export class AuditService {
  async recordLog(data: {
    tenantId: string;
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    before?: any;
    after?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      return await prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId || null,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId || null,
          before: data.before || null,
          after: data.after || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      });
    } catch (err) {
      console.error('Failed to write audit log entry:', err);
      return null;
    }
  }

  async listLogs(tenantId: string, limit = 50) {
    const logs = await prisma.auditLog.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      tenantId: log.tenantId,
      userId: log.userId,
      userName: log.user?.name || 'System Auto',
      userEmail: log.user?.email || null,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      before: log.before,
      after: log.after,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    }));
  }
}
