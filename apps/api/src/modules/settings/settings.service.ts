import { BUSINESS_TEMPLATES, CompleteOnboardingDto } from '@ginie/common';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@ginie/database';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SettingsService {
  constructor(private readonly notificationsService?: NotificationsService) {}

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

  async updateCompany(tenantId: string, data: any) {
    try {
      const existing = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const currentSettings = ((existing?.settings as any) || {});
      const newSettings = {
        ...currentSettings,
        ...(data.gstin !== undefined ? { gstin: data.gstin } : {}),
        ...(data.pan !== undefined ? { pan: data.pan } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
        ...(data.stateCode !== undefined ? { stateCode: data.stateCode } : {}),
        ...(data.pincode !== undefined ? { pincode: data.pincode } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.upiId !== undefined ? { upiId: data.upiId } : {}),
        ...(data.upiName !== undefined ? { upiName: data.upiName } : {}),
        ...(data.whatsappPhone !== undefined ? { whatsappPhone: data.whatsappPhone } : {}),
        ...(data.bankName !== undefined ? { bankName: data.bankName } : {}),
        ...(data.bankAccountNumber !== undefined ? { bankAccountNumber: data.bankAccountNumber } : {}),
        ...(data.bankIfsc !== undefined ? { bankIfsc: data.bankIfsc } : {}),
      };

      return await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.slug ? { slug: data.slug } : {}),
          ...(data.brandColor ? { brandColor: data.brandColor } : {}),
          // LOCKED: Only set businessType if never set before; never allow overwriting once registered
          ...(!existing?.businessType && data.businessType ? { businessType: data.businessType } : {}),
          settings: newSettings,
        },
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
      { id: 'usr-1', name: 'Workspace Admin', email: 'owner@yourcompany.com', role: { name: 'Owner' }, status: 'active' },
      { id: 'usr-2', name: 'Sunil Verma', email: 'sunil@acme.in', role: { name: 'Sales Executive' }, status: 'active' },
    ];
  }

  async addTeamMember(
    tenantId: string,
    data: { name: string; email: string; phone?: string; roleId: string; password?: string },
  ) {
    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findFirst({
      where: { tenantId, email, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException('A team member with this email already exists in your company.');
    }

    // Default password if not provided
    const password = data.password && data.password.length >= 6 ? data.password : 'Staff@123';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        tenantId,
        roleId: data.roleId,
        name: data.name.trim(),
        email,
        phone: data.phone?.trim() || null,
        passwordHash,
        status: 'active',
        isSuperAdmin: false,
      },
      include: { role: true },
    });

    return {
      success: true,
      user,
      initialPassword: password,
      message: `Team member ${user.name} added successfully.`,
    };
  }

  async removeTeamMember(tenantId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user) {
      throw new NotFoundException('Team member not found.');
    }
    if (user.isSuperAdmin) {
      throw new BadRequestException('Cannot remove platform Super Admin account.');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), status: 'suspended' },
    });

    return { success: true, message: 'Team member removed.' };
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

  async getAlerts(tenantId: string) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      });
      const settings: any = tenant?.settings || {};
      return {
        telegramBotToken: settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '',
        telegramChatId: settings.telegramChatId || process.env.TELEGRAM_CHAT_ID || '',
        adminWhatsAppPhone: settings.adminWhatsAppPhone || process.env.ADMIN_WHATSAPP_PHONE || '',
        leadAlertsEnabled: settings.leadAlertsEnabled !== undefined ? settings.leadAlertsEnabled : true,
      };
    } catch {
      return {
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
        telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
        adminWhatsAppPhone: process.env.ADMIN_WHATSAPP_PHONE || '',
        leadAlertsEnabled: true,
      };
    }
  }

  async updateAlerts(tenantId: string, data: any) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { settings: true },
      });
      const currentSettings: any = tenant?.settings || {};
      const newSettings = {
        ...currentSettings,
        telegramBotToken: data.telegramBotToken,
        telegramChatId: data.telegramChatId,
        adminWhatsAppPhone: data.adminWhatsAppPhone,
        leadAlertsEnabled: data.leadAlertsEnabled,
      };
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { settings: newSettings },
      });
      return { success: true, settings: newSettings };
    } catch {
      return { success: true, settings: data };
    }
  }

  async testAlert(
    channel: 'telegram' | 'whatsapp',
    config: { botToken?: string; chatId?: string; phone?: string },
  ) {
    if (!this.notificationsService) {
      return { success: false, message: 'Notifications service unavailable' };
    }
    return this.notificationsService.sendTestAlert(channel, config);
  }

  getBusinessTemplates() {
    return BUSINESS_TEMPLATES;
  }

  async completeOnboarding(tenantId: string, dto: CompleteOnboardingDto) {
    const existing = await prisma.tenant.findUnique({ where: { id: tenantId } });
    // LOCKED: Preserve existing businessType if already onboarded; never allow switching
    const businessType = (existing?.onboardingCompleted && existing?.businessType)
      ? existing.businessType
      : (dto.businessType || 'retail');

    const template = BUSINESS_TEMPLATES[businessType] || BUSINESS_TEMPLATES.other;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: dto.businessName || existing?.name,
        businessType: businessType,
        onboardingCompleted: true,
        settings: {
          ...((existing?.settings as any) || {}),
          teamSize: dto.teamSize,
          language: dto.language,
        },
      },
    });

    // Auto-seed industry starter products if tenant has 0 products
    try {
      const prodCount = await prisma.product.count({ where: { tenantId } });
      if (prodCount === 0) {
        const catalog: Record<string, any[]> = {
          restaurant: [
            { name: 'Paneer Butter Masala', category: 'Main Course', price: 260, code: 'REST-01', unit: 'plate', stockInHand: 40, description: 'Rich cottage cheese cubes in buttery creamy tomato gravy (Veg)' },
            { name: 'Butter Tandoori Naan', category: 'Breads', price: 45, code: 'REST-02', unit: 'piece', stockInHand: 100, description: 'Crisp hot tandoori bread topped with fresh butter (Veg)' },
            { name: 'Dum Handi Veg Biryani', category: 'Biryani & Rice', price: 240, code: 'REST-03', unit: 'pot', stockInHand: 30, description: 'Aromatic basmati rice layered with fresh veggies & saffron (Veg)' },
            { name: 'Cold Coffee with Ice Cream', category: 'Beverages', price: 110, code: 'REST-04', unit: 'glass', stockInHand: 50, description: 'Chilled creamy blended coffee topped with vanilla scoop' },
          ],
          wholesale: [
            { name: 'Heavy Duty Packaging Tape (Box of 72)', category: 'Packaging Materials', price: 3240, code: 'B2B-01', unit: 'box', stockInHand: 25, description: 'Brown self-adhesive 65m tape rolls for cartons (MOQ: 1 Box)' },
            { name: 'Plain Cotton Round-Neck T-Shirts (Lot of 50)', category: 'Apparel Bulk', price: 11500, code: 'B2B-02', unit: 'lot', stockInHand: 15, description: '180 GSM combed cotton bulk blanks (MOQ: 1 Lot)' },
            { name: 'A4 Copier Paper 75 GSM (Carton of 5 Reams)', category: 'Stationery', price: 1450, code: 'B2B-03', unit: 'carton', stockInHand: 35, description: 'Super bright high speed photocopy paper (MOQ: 2 Cartons)' },
          ],
          clinic: [
            { name: 'General Physician OPD Consultation', category: 'Doctor Consultation', price: 500, code: 'MED-01', unit: 'session', stockInHand: 100, description: 'Comprehensive diagnostic checkup & medical prescription' },
            { name: 'Complete Blood Count (CBC) Profile', category: 'Diagnostics & Pathology', price: 350, code: 'MED-02', unit: 'test', stockInHand: 100, description: 'Automated 24-parameter blood test report within 4 hours' },
            { name: 'Full Body Preventive Screening Package', category: 'Health Packages', price: 2499, code: 'MED-03', unit: 'package', stockInHand: 50, description: '65 vital health tests including Lipid, Liver, Kidney & Sugar' },
          ],
          services: [
            { name: 'Social Media Management & Growth (Monthly)', category: 'Digital Marketing', price: 14999, code: 'SRV-01', unit: 'month', stockInHand: 20, description: '12 high quality graphic creatives + reel videos + ads management' },
            { name: 'Company GST Filing & Accounting Retainer', category: 'Tax & Compliance', price: 2999, code: 'SRV-02', unit: 'month', stockInHand: 50, description: 'GSTR-1, GSTR-3B filing, reconciliation & monthly tax report' },
            { name: 'Custom Business Website & Domain Setup', category: 'Web Development', price: 24999, code: 'SRV-03', unit: 'project', stockInHand: 10, description: 'Modern responsive Next.js website with lead capturing & SEO' },
          ],
          factory: [
            { name: 'Precision CNC Machined Aluminum Flange', category: 'Machined Components', price: 1850, code: 'MFG-01', unit: 'piece', stockInHand: 60, description: 'High tolerance aerospace grade 6061-T6 aluminum flange' },
            { name: 'Heavy Duty Industrial Ball Valve 2-Inch', category: 'Valves & Fittings', price: 4200, code: 'MFG-02', unit: 'piece', stockInHand: 30, description: 'Stainless steel 316 rated for 1000 WOG high pressure' },
            { name: 'Mild Steel Laser-Cut Mounting Bracket', category: 'Sheet Metal', price: 320, code: 'MFG-03', unit: 'piece', stockInHand: 150, description: '3mm hot rolled steel powder-coated black bracket' },
          ],
          retail: [
            { name: 'Premium Royal Basmati Rice (5kg Bag)', category: 'Groceries & Staples', price: 480, code: 'RET-01', unit: 'bag', stockInHand: 45, description: 'Extra long grain aged basmati rice for daily cooking' },
            { name: 'Cold Pressed Pure Mustard Oil (1 Litre)', category: 'Cooking Oils', price: 195, code: 'RET-02', unit: 'bottle', stockInHand: 60, description: '100% natural kachi ghani unrefined mustard oil' },
            { name: 'Wireless Bluetooth Earbuds with Mic', category: 'Electronics', price: 1299, code: 'RET-03', unit: 'piece', stockInHand: 25, description: 'Active environmental noise cancellation with 30hr battery' },
            { name: 'Stainless Steel Insulated Water Bottle 1L', category: 'Home & Kitchen', price: 550, code: 'RET-04', unit: 'piece', stockInHand: 35, description: 'Double-walled vacuum insulated flask keeps liquids hot/cold for 24h' },
          ],
        };

        const prods = catalog[dto.businessType] || catalog.retail;
        for (const p of prods) {
          await prisma.product.create({
            data: {
              tenantId,
              name: p.name,
              category: p.category,
              price: p.price,
              code: p.code,
              unit: p.unit,
              description: p.description,
              stockInHand: p.stockInHand,
              minStockAlert: 5,
              isPublishedToStore: true,
              isActive: true,
            },
          }).catch(() => {});
        }
      }
    } catch (_) {}

    if (template.pipelineStages && template.pipelineStages.length > 0) {
      let pipeline = await prisma.pipeline.findFirst({
        where: { tenantId, isDefault: true },
      });
      if (!pipeline) {
        pipeline = await prisma.pipeline.create({
          data: {
            tenantId,
            name: `${dto.businessName} Pipeline`,
            isDefault: true,
          },
        });
      }

      const existingStages = await prisma.pipelineStage.findMany({
        where: { pipelineId: pipeline.id },
      });

      if (existingStages.length === 0) {
        for (let i = 0; i < template.pipelineStages.length; i++) {
          const st = template.pipelineStages[i];
          await prisma.pipelineStage.create({
            data: {
              tenantId,
              pipelineId: pipeline.id,
              name: st.name,
              probability: st.probability,
              color: st.color,
              orderIndex: i,
            },
          });
        }
      }
    }

    if (template.customFields && template.customFields.length > 0) {
      for (const cf of template.customFields) {
        await prisma.customFieldDefinition.upsert({
          where: {
            tenantId_entityType_key: {
              tenantId,
              entityType: cf.entityType,
              key: cf.key,
            },
          },
          update: {
            label: cf.label,
            fieldType: cf.fieldType,
            options: cf.options || [],
            isRequired: cf.isRequired || false,
          },
          create: {
            tenantId,
            entityType: cf.entityType,
            key: cf.key,
            label: cf.label,
            fieldType: cf.fieldType,
            options: cf.options || [],
            isRequired: cf.isRequired || false,
          },
        });
      }
    }

    if (template.messageTemplates && template.messageTemplates.length > 0) {
      for (const mt of template.messageTemplates) {
        const existing = await prisma.messageTemplate.findFirst({
          where: { tenantId, name: mt.name },
        });
        if (!existing) {
          await prisma.messageTemplate.create({
            data: {
              tenantId,
              channel: mt.channel,
              name: mt.name,
              body: mt.body,
            },
          });
        }
      }
    }

    return {
      success: true,
      tenant,
      template,
    };
  }
}
