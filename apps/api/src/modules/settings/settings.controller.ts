import { Controller, Get, Patch, Body } from '@nestjs/common';
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

  @Get('roles')
  async getRoles(@CurrentTenant() tenantId: string) {
    return this.settingsService.getRoles(tenantId);
  }
}
