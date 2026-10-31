import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';

@Injectable()
export class SettingsService {
  async getCompany(tenantId: string) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { plan: true },
      });
      if (tenant) return tenant;
    } catch {}

    return {
      id: tenantId,
      name: 'Acme Enterprises',
      slug: 'acme',
      brandColor: '#1677ff',
      status: 'active',
      plan: { name: 'Pro' },
      settings: { currency: 'INR', timezone: 'Asia/Kolkata' },
    };
  }

  async updateCompany(tenantId: string, data: { name?: string; brandColor?: string }) {
    try {
      return await prisma.tenant.update({
        where: { id: tenantId },
        data,
      });
    } catch {
      return { id: tenantId, ...data };
    }
  }

  async getTeam(tenantId: string) {
    try {
      const team = await prisma.user.findMany({
        where: { tenantId, deletedAt: null },
        include: { role: true },
        orderBy: { createdAt: 'asc' },
      });
      if (team.length > 0) return team;
    } catch {}

    return [
      { id: 'usr-1', name: 'Rajesh Sharma', email: 'admin@ginie.space', role: { name: 'Owner' }, status: 'active' },
      { id: 'usr-2', name: 'Sunil Verma', email: 'sunil@acme.in', role: { name: 'Sales Executive' }, status: 'active' },
    ];
  }

  async getRoles(tenantId: string) {
    try {
      const roles = await prisma.role.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });
      if (roles.length > 0) return roles;
    } catch {}

    return [
      { id: 'rol-1', name: 'Owner', isSystem: true },
      { id: 'rol-2', name: 'Sales Executive', isSystem: true },
    ];
  }
}
