import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealSchema } from '@ginie/common';
import { CurrentUser, CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('pipelines')
  async getPipelines(@CurrentTenant() tenantId: string) {
    return this.dealsService.getPipelines(tenantId);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const validated = CreateDealSchema.parse(body);
    return this.dealsService.create(tenantId, userId, validated);
  }

  @Patch(':id/stage')
  async updateStage(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { stageId: string; status?: 'open' | 'won' | 'lost'; lostReason?: string },
  ) {
    return this.dealsService.updateStage(tenantId, id, body);
  }

  @Delete(':id')
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.dealsService.remove(tenantId, id);
  }
}
