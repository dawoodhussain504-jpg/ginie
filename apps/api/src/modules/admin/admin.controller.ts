import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import {
  UpdateTenantStatusSchema,
  UpdateTenantStatusDto,
  UpdateTenantPlanSchema,
  UpdateTenantPlanDto,
} from '@ginie/common';

@Controller('api/admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  async getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get('tenants')
  async listTenants() {
    return this.adminService.listTenants();
  }

  @Post('tenants')
  async createTenant(
    @Body()
    body: {
      name: string;
      ownerName: string;
      ownerEmail: string;
      ownerPhone?: string;
      planName?: string;
      password?: string;
    },
  ) {
    return this.adminService.createTenant(body);
  }

  @Get('plans')
  async listPlans() {
    return this.adminService.listPlans();
  }

  @Patch('plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() body: { name?: string; monthlyPrice?: number; limits?: any },
  ) {
    return this.adminService.updatePlan(id, body);
  }

  @Post('tenants/:id/grant-discovery')
  async grantDiscoveryPlan(
    @Param('id') id: string,
    @Body() body: { days?: number },
  ) {
    return this.adminService.grantDiscoveryPlan(id, body.days || 30);
  }

  @Post('tenants/:id/revoke-discovery')
  async revokeDiscoveryPlan(@Param('id') id: string) {
    return this.adminService.revokeDiscoveryPlan(id);
  }

  @Patch('tenants/:id/status')
  @UsePipes(new ZodValidationPipe(UpdateTenantStatusSchema))
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    return this.adminService.updateTenantStatus(id, dto.status);
  }

  @Patch('tenants/:id/plan')
  @UsePipes(new ZodValidationPipe(UpdateTenantPlanSchema))
  async updateTenantPlan(
    @Param('id') id: string,
    @Body() dto: UpdateTenantPlanDto,
  ) {
    return this.adminService.updateTenantPlan(id, dto.planName);
  }

  @Post('tenants/:id/impersonate')
  async impersonateTenant(@Param('id') id: string) {
    return this.adminService.impersonateTenant(id);
  }

  // ─── Global WhatsApp Bridge Control ──────────────────────────────────────

  @Get('bridge/status')
  async getBridgeStatus() {
    return this.adminService.getBridgeStatus();
  }

  @Post('bridge/pairing-code')
  async requestBridgePairingCode(@Body() body: { phone: string }) {
    return this.adminService.requestBridgePairingCode(body.phone);
  }

  @Post('bridge/test-message')
  async sendBridgeTestMessage(@Body() body: { phone: string; text?: string }) {
    return this.adminService.sendBridgeTestMessage(body.phone, body.text);
  }

  @Post('bridge/disconnect')
  async disconnectBridge() {
    return this.adminService.disconnectBridge();
  }

  // ─── System & Audit ──────────────────────────────────────────────────────

  @Get('system-health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('support-tickets')
  async getSupportTickets(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return this.adminService.getSupportTickets(parsedLimit);
  }

  @Patch('support-tickets/:id/status')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateTicketStatus(id, status);
  }

  // ─── Platform UPI & Discovery Subscriptions ──────────────────────────────

  @Get('upi-settings')
  async getPlatformUpiSettings() {
    return this.adminService.getPlatformUpiSettings();
  }

  @Post('upi-settings')
  async updatePlatformUpiSettings(
    @Body()
    body: {
      upiId: string;
      payeeName?: string;
      qrCodeUrl: string;
      amount?: number;
      instructions?: string;
    },
  ) {
    return this.adminService.updatePlatformUpiSettings(body);
  }

  @Get('discovery-requests')
  async listDiscoveryRequests() {
    return this.adminService.listDiscoveryRequests();
  }

  @Post('discovery-requests/:id/approve')
  async approveDiscoveryRequest(
    @Param('id') id: string,
    @Body() body: { days?: number },
  ) {
    return this.adminService.approveDiscoveryRequest(id, body?.days || 30);
  }

  @Post('discovery-requests/:id/reject')
  async rejectDiscoveryRequest(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectDiscoveryRequest(id, body?.reason);
  }
}
