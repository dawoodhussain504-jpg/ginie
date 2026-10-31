import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { UpgradePlanDto } from '@ginie/common';

@Injectable()
export class SubscriptionsService {
  async listPlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });
  }

  async getCurrentSubscription(tenantId: string) {
    let companyName = 'Ginie Space';
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });
      if (tenant?.name) {
        companyName = tenant.name;
      }
    } catch {}

    // Usage statistics
    let leadsCount = 0;
    let usersCount = 1;
    let discoveryCount = 0;

    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [leads, users, discovery] = await Promise.all([
        prisma.lead.count({ where: { tenantId, deletedAt: null } }),
        prisma.user.count({ where: { tenantId, deletedAt: null } }),
        prisma.usageCounter.findFirst({
          where: {
            tenantId,
            metric: 'discovery_searches',
            periodStart: { gte: startOfMonth },
          },
        }),
      ]);
      leadsCount = leads;
      usersCount = users || 1;
      discoveryCount = discovery?.counter || 0;
    } catch {}

    const unlimitedLimits = {
      maxUsers: 999999,
      maxLeads: 999999,
      monthlyDiscoverySearches: 999999,
    };

    return {
      companyName,
      isMasterAdmin: true,
      plan: {
        name: 'Master Admin (Sovereign Unlimited)',
        monthlyPrice: 0,
        limits: unlimitedLimits,
      },
      usage: {
        leadsUsed: leadsCount,
        leadsLimit: 999999,
        usersUsed: usersCount,
        usersLimit: 999999,
        discoveryUsed: discoveryCount,
        discoveryLimit: 999999,
      },
      subscription: {
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    };
  }

  async upgradePlan(tenantId: string, dto: UpgradePlanDto) {
    return {
      status: 'success',
      message: 'Master Admin is already on the Sovereign Unlimited Tier.',
      planName: 'Master Admin (Sovereign Unlimited)',
      orderId: `admin_unlimited_${Date.now()}`,
      amount: 0,
      currency: 'INR',
      periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  async handlePaymentWebhook(gateway: string, payload: any) {
    return { received: true, gateway };
  }
}
