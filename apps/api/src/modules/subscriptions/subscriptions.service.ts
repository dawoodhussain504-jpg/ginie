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
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Company profile not found.');
    }

    // Get usage statistics
    const [leadsCount, usersCount] = await Promise.all([
      prisma.lead.count({ where: { tenantId, deletedAt: null } }),
      prisma.user.count({ where: { tenantId, deletedAt: null } }),
    ]);

    // Monthly discovery searches from usage_counters
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const discoveryCounter = await prisma.usageCounter.findFirst({
      where: {
        tenantId,
        metric: 'discovery_searches',
        periodStart: { gte: startOfMonth },
      },
    });

    const activePlan = tenant.plan || {
      name: 'Free',
      monthlyPrice: 0,
      limits: {
        maxUsers: 2,
        maxLeads: 500,
        monthlyDiscoverySearches: 50,
      },
    };

    const limits = (activePlan.limits as any) || {};

    return {
      companyName: tenant.name,
      plan: {
        name: activePlan.name,
        monthlyPrice: activePlan.monthlyPrice,
        limits,
      },
      usage: {
        leadsUsed: leadsCount,
        leadsLimit: limits.maxLeads || 500,
        usersUsed: usersCount,
        usersLimit: limits.maxUsers || 2,
        discoveryUsed: discoveryCounter?.counter || 0,
        discoveryLimit: limits.monthlyDiscoverySearches || 50,
      },
      subscription: tenant.subscriptions[0] || {
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    };
  }

  async upgradePlan(tenantId: string, dto: UpgradePlanDto) {
    const targetPlan = await prisma.plan.findFirst({
      where: { name: dto.planName },
    });

    if (!targetPlan) {
      throw new BadRequestException('Selected plan was not found.');
    }

    const price = Number(targetPlan.monthlyPrice);

    // If upgrading to Free, switch immediately
    if (price === 0) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { planId: targetPlan.id },
      });
      return {
        status: 'success',
        message: 'Plan updated to Free successfully.',
        planName: targetPlan.name,
      };
    }

    // Simulated / live payment gateway checkout order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Record subscription & payment record
    const subscription = await prisma.subscription.create({
      data: {
        tenantId,
        planId: targetPlan.id,
        provider: dto.paymentGateway,
        providerSubscriptionId: orderId,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    await prisma.paymentRecord.create({
      data: {
        tenantId,
        provider: dto.paymentGateway,
        providerPaymentId: `pay_${Date.now()}`,
        amount: price,
        currency: 'INR',
        status: 'succeeded',
        metadata: {
          planName: targetPlan.name,
          orderId,
        },
      },
    });

    // Update tenant plan
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { planId: targetPlan.id },
    });

    return {
      status: 'success',
      message: `Successfully upgraded to ${targetPlan.name} Plan!`,
      planName: targetPlan.name,
      orderId,
      amount: price,
      currency: 'INR',
      periodEnd,
    };
  }

  async handlePaymentWebhook(gateway: string, payload: any) {
    // Webhook processor for Razorpay / Stripe
    return { received: true, gateway };
  }
}
