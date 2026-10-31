import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  CreateActivitySchema,
} from '@ginie/common';
import { CurrentUser, CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
    @Query('statusId') statusId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.leadsService.findAll(tenantId, { search, statusId, ownerId, page, pageSize });
  }

  @Get('statuses')
  async getStatuses(@CurrentTenant() tenantId: string) {
    return this.leadsService.getStatuses(tenantId);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.leadsService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const validated = CreateLeadSchema.parse(body);
    return this.leadsService.create(tenantId, userId, validated);
  }

  @Patch(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const validated = UpdateLeadSchema.parse(body);
    return this.leadsService.update(tenantId, userId, id, validated);
  }

  @Delete(':id')
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.leadsService.remove(tenantId, id);
  }

  @Post(':id/activities')
  async addActivity(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const validated = CreateActivitySchema.parse({ ...body, entityType: 'lead', entityId: id });
    return this.leadsService.addActivity(tenantId, userId, id, validated);
  }

  @Post(':id/convert')
  async convert(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.leadsService.convertLead(tenantId, userId, id, body);
  }
}
