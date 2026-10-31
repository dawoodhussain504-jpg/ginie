import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';

@Injectable()
export class SettingsService {
  async getCompany(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });
    if (!tenant) throw new NotFoundException('Company not found.');
    return tenant;
  }

  async updateCompany(tenantId: string, data: { name?: string; brandColor?: string }) {
    return prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }

  async getTeam(tenantId: string) {
    return prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      include: { role: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getRoles(tenantId: string) {
    return prisma.role.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
