import { Controller, Get, Query, Request } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('api/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async listLogs(@Request() req: any, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.auditService.listLogs(req.tenantId, parsedLimit);
  }
}
