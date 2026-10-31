import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ginie/database';

@Injectable()
export class AdminService {
  async getMetrics() {
    const [tenantsCount, usersCount, leadsCount, discoveryCount, payments] = await Promise.all([
      prisma.tenant.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.lead.count({ where: { deletedAt: null } }),
      prisma.discoverySearch.count(),
      prisma.paymentRecord.findMany({
        where: { status: 'succeeded' },
        select: { amount: true },
      }),
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    return {
      totalTenants: tenantsCount,
      totalUsers: usersCount,
      totalLeads: leadsCount,
      totalSearches: discoveryCount,
      totalRevenueINR: totalRevenue,
    };
  }

  async listTenants() {
    const tenants = await prisma.tenant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
        _count: {
          select: {
            users: true,
            leads: true,
            deals: true,
          },
        },
      },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      status: t.status,
      planName: t.plan?.name || 'Free',
      brandColor: t.brandColor,
      createdAt: t.createdAt,
      userCount: t._count.users,
      leadCount: t._count.leads,
      dealCount: t._count.deals,
    }));
  }

  async updateTenantStatus(tenantId: string, status: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Company not found.');
    }

    return prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });
  }

  async updateTenantPlan(tenantId: string, planName: string) {
    const plan = await prisma.plan.findFirst({ where: { name: planName } });
    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }

    return prisma.tenant.update({
      where: { id: tenantId },
      data: { planId: plan.id },
      include: { plan: true },
    });
  }
}
