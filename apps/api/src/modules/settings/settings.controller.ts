import { CompleteOnboardingDto } from '@ginie/common';
import { Controller, Get, Patch, Post, Delete, Param, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('company')
  async getCompany(@CurrentTenant() tenantId: string) {
    return this.settingsService.getCompany(tenantId);
  }

  @Patch('company')
  async updateCompany(
    @CurrentTenant() tenantId: string,
    @Body() body: { name?: string; brandColor?: string },
  ) {
    return this.settingsService.updateCompany(tenantId, body);
  }

  @Get('team')
  async getTeam(@CurrentTenant() tenantId: string) {
    return this.settingsService.getTeam(tenantId);
  }

  @Post('team')
  async addTeamMember(
    @CurrentTenant() tenantId: string,
    @Body() body: { name: string; email: string; phone?: string; roleId: string; password?: string },
  ) {
    return this.settingsService.addTeamMember(tenantId, body);
  }

  @Delete('team/:id')
  async removeTeamMember(
    @CurrentTenant() tenantId: string,
    @Param('id') userId: string,
  ) {
    return this.settingsService.removeTeamMember(tenantId, userId);
  }

  @Get('roles')
  async getRoles(@CurrentTenant() tenantId: string) {
    return this.settingsService.getRoles(tenantId);
  }

  @Get('alerts')
  async getAlerts(@CurrentTenant() tenantId: string) {
    return this.settingsService.getAlerts(tenantId);
  }

  @Patch('alerts')
  async updateAlerts(
    @CurrentTenant() tenantId: string,
    @Body() body: {
      telegramBotToken?: string;
      telegramChatId?: string;
      adminWhatsAppPhone?: string;
      leadAlertsEnabled?: boolean;
    },
  ) {
    return this.settingsService.updateAlerts(tenantId, body);
  }

  @Post('alerts/test')
  async testAlert(
    @CurrentTenant() tenantId: string,
    @Body() body: {
      channel: 'telegram' | 'whatsapp';
      botToken?: string;
      chatId?: string;
      phone?: string;
    },
  ) {
    return this.settingsService.testAlert(body.channel, {
      botToken: body.botToken,
      chatId: body.chatId,
      phone: body.phone,
    });
  }

  @Get('onboarding/templates')
  async getTemplates() {
    return this.settingsService.getBusinessTemplates();
  }

  @Post('onboarding/complete')
  async completeOnboarding(
    @CurrentTenant() tenantId: string,
    @Body() dto: CompleteOnboardingDto,
  ) {
    return this.settingsService.completeOnboarding(tenantId, dto);
  }
}
