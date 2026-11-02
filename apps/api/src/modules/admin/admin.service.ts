import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { JwtService } from '@nestjs/jwt';
import { BridgeProvider } from '../whatsapp/providers/bridge.provider';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly jwtService: JwtService) {}

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

  async createTenant(data: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone?: string;
    planName?: string;
    password?: string;
  }) {
    const email = data.ownerEmail.toLowerCase().trim();
    const existing = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (existing) {
      throw new BadRequestException('A user with this email address already exists.');
    }

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `biz-${Date.now()}`;

    const plan = (await prisma.plan.findFirst({ where: { name: data.planName || 'Pro' } })) || (await prisma.plan.findFirst());

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name.trim(),
        slug,
        brandColor: '#1677ff',
        status: 'active',
        planId: plan?.id,
      },
    });

    const ownerPermissions = {
      leads: { view: true, create: true, edit: true, delete: true, export: true },
      deals: { view: true, create: true, edit: true, delete: true, export: true },
      contacts: { view: true, create: true, edit: true, delete: true, export: true },
      tasks: { view: true, create: true, edit: true, delete: true, export: true },
      discovery: { view: true, search: true, import: true },
      whatsapp: { view: true, send: true, manage: true },
      billing: { view: true, create: true, edit: true },
      settings: { view: true, edit: true },
    };

    const ownerRole = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Owner',
        isSystem: true,
        permissions: ownerPermissions,
      },
    });

    const passwordHash = await bcrypt.hash(data.password || 'Ginie@123', 10);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        roleId: ownerRole.id,
        name: data.ownerName.trim(),
        email,
        phone: data.ownerPhone ? `+91 ${data.ownerPhone.replace(/\D/g, '').slice(-10)}` : null,
        passwordHash,
        status: 'active',
        language: 'en',
      },
      include: { tenant: true, role: true },
    });

    return {
      success: true,
      tenantId: tenant.id,
      tenantName: tenant.name,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        temporaryPassword: data.password || 'Ginie@123',
      },
    };
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

  async listPlans() {
    return prisma.plan.findMany({
      orderBy: { monthlyPrice: 'asc' },
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

  async impersonateTenant(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId, deletedAt: null },
      include: {
        users: {
          where: { deletedAt: null },
          include: { role: true },
          take: 1,
        },
        plan: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Target business not found.');
    }

    const targetUser = tenant.users[0];
    if (!targetUser) {
      throw new NotFoundException('No active user found in this business.');
    }

    const payload = {
      id: targetUser.id,
      tenantId: tenant.id,
      email: targetUser.email,
      isSuperAdmin: false,
      impersonatedBy: 'Master Admin',
    };

    const secret = process.env.JWT_SECRET || 'dev_secret_jwt_ginie_app';
    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '2h',
    });

    const userProfile = {
      id: targetUser.id,
      tenantId: tenant.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role?.name || 'Owner',
      companyName: tenant.name,
      companyBrandColor: tenant.brandColor || '#1677ff',
      language: targetUser.language || 'en',
      isSuperAdmin: false,
      impersonated: true,
      permissions: targetUser.role?.permissions,
    };

    return {
      success: true,
      accessToken,
      user: userProfile,
    };
  }

  // ─── Global WhatsApp Bridge Hub ──────────────────────────────────────────

  async getBridgeStatus() {
    try {
      const bridge = new BridgeProvider('admin-master');
      const status = await bridge.getStatus();
      return {
        ...status,
        bridgeUrl: process.env.WHATSAPP_BRIDGE_URL || 'https://ginie-whatsapp-bridge.onrender.com',
        dbPersistence: true,
      };
    } catch (err: any) {
      this.logger.warn(`Failed to query bridge status: ${err.message}`);
      return {
        status: 'disconnected',
        error: err.message,
        bridgeUrl: process.env.WHATSAPP_BRIDGE_URL || 'https://ginie-whatsapp-bridge.onrender.com',
      };
    }
  }

  async requestBridgePairingCode(phone: string) {
    if (!phone) {
      throw new BadRequestException('Phone number is required.');
    }
    const bridge = new BridgeProvider('admin-master');
    return bridge.requestPairingCode(phone);
  }

  async sendBridgeTestMessage(phone: string, text?: string) {
    if (!phone) {
      throw new BadRequestException('Recipient phone number is required.');
    }
    const cleanNumber = phone.replace(/\D/g, '');
    const fullNumber = cleanNumber.length === 10 ? '91' + cleanNumber : cleanNumber;

    const messageText =
      text ||
      `✅ *GINIE Platform Live Ping*\n\nWhatsApp Web Bridge is active and operating with PostgreSQL session persistence!\n\n⏰ *Timestamp:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    const bridge = new BridgeProvider('admin-master');
    return bridge.sendText(fullNumber, messageText);
  }

  async disconnectBridge() {
    const bridge = new BridgeProvider('admin-master');
    await bridge.disconnect();
    return { success: true, message: 'WhatsApp bridge disconnect signaled.' };
  }

  // ─── System Health & Audit Watchdog ──────────────────────────────────────

  async getSystemHealth() {
    const startTime = Date.now();
    let dbConnected = false;
    let dbLatencyMs = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
      dbLatencyMs = Date.now() - startTime;
    } catch (err: any) {
      this.logger.error(`DB Health Check Error: ${err.message}`);
    }

    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const searchesThisMonth = await prisma.discoverySearch.count({
      where: { createdAt: { gte: currentMonthStart } },
    });

    const activeSessionsCount = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24h
        },
      },
    });

    return {
      database: {
        status: dbConnected ? 'healthy' : 'degraded',
        latencyMs: dbLatencyMs,
        provider: 'Managed PostgreSQL (Oregon)',
      },
      placesApi: {
        status: process.env.GOOGLE_PLACES_API_KEY ? 'configured' : 'missing_key',
        searchesThisMonth,
        monthlyQuotaEstimate: 'Unlimited (Sovereign Mode)',
      },
      aiEngine: {
        status: process.env.GEMINI_API_KEY || process.env.AI_API_KEY ? 'gemini-1.5-flash' : 'built-in-heuristic-engine',
        model: 'Google Gemini 1.5 Flash',
      },
      bridge: {
        url: process.env.WHATSAPP_BRIDGE_URL || 'https://ginie-whatsapp-bridge.onrender.com',
        dbPersistence: true,
      },
      activeUsers24h: activeSessionsCount,
      timestamp: new Date().toISOString(),
    };
  }

  async getAuditLogs(limit = 40) {
    try {
      const logs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          tenant: { select: { name: true } },
        },
      });
      return logs;
    } catch (err: any) {
      return [];
    }
  }
}
