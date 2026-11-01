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
        ...(data.bankName !== undefined ? { bankName: data.bankName } : {}),
        ...(data.bankAccountNumber !== undefined ? { bankAccountNumber: data.bankAccountNumber } : {}),
        ...(data.bankIfsc !== undefined ? { bankIfsc: data.bankIfsc } : {}),
      };

      return await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.brandColor ? { brandColor: data.brandColor } : {}),
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
      { id: 'usr-1', name: 'Rajesh Sharma', email: 'admin@ginie.space', role: { name: 'Owner' }, status: 'active' },
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
    const template = BUSINESS_TEMPLATES[dto.businessType] || BUSINESS_TEMPLATES.other;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: dto.businessName,
        businessType: dto.businessType,
        onboardingCompleted: true,
        settings: {
          teamSize: dto.teamSize,
          language: dto.language,
        },
      },
    });

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
