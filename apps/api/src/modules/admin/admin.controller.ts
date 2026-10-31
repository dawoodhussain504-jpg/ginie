import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
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
}
