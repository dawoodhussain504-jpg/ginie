import { Injectable } from '@nestjs/common';
import { prisma } from '@ginie/database';

@Injectable()
export class ReportsService {
  async getOverview(tenantId: string) {
    // 1. Leads by Source
    const leads = await prisma.lead.findMany({
      where: { tenantId, deletedAt: null },
      select: { source: true, status: true },
    });

    const sourceCounts: Record<string, number> = {};
    leads.forEach((l) => {
      const src = l.source || 'Direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const sourcesData = Object.entries(sourceCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // 2. Sales Pipeline Overview
    const pipeline = await prisma.pipeline.findFirst({
      where: { tenantId, isDefault: true },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
          include: {
            deals: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    const funnelData = (pipeline?.stages || []).map((s) => ({
      stage: s.name,
      dealCount: s.deals.length,
      totalValue: s.deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0),
    }));

    // 3. Team Performance
    const users = await prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        ownedLeads: { where: { deletedAt: null } },
        ownedDeals: { where: { deletedAt: null } },
      },
    });

    const teamData = users.map((u) => {
      const wonDeals = u.ownedDeals.filter((d) => d.status === 'won');
      const wonSum = wonDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
      return {
        id: u.id,
        name: u.name,
        assignedCustomers: u.ownedLeads.length,
        totalSales: u.ownedDeals.length,
        wonSales: wonDeals.length,
        revenueWon: wonSum,
      };
    });

    return {
      sources: sourcesData,
      funnel: funnelData,
      team: teamData,
      totalCustomers: leads.length,
    };
  }
}
