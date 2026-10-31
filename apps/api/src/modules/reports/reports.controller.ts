import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  async getOverview(@CurrentTenant() tenantId: string) {
    return this.reportsService.getOverview(tenantId);
  }
}
