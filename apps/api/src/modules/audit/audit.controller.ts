import { Controller, Get, Post, Body, Query, Request } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('api/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async listLogs(@Request() req: any, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.auditService.listLogs(req.tenantId, parsedLimit);
  }

  @Post('ticket')
  async createSupportTicket(@Request() req: any, @Body() body: any) {
    const ticketId = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
    const log = await this.auditService.recordLog({
      tenantId: req.tenantId,
      userId: req.userId,
      action: 'SUPPORT_TICKET_CREATED',
      entity: 'support_ticket',
      entityId: ticketId,
      after: {
        ticketId,
        category: body?.category || 'General',
        note: body?.note || '',
        screen: body?.screen || '/dashboard',
        contact: body?.contact || '',
        userName: body?.userName || '',
        businessName: body?.businessName || '',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      ticketId,
      message: 'Support ticket registered successfully',
      data: log,
    };
  }
}
