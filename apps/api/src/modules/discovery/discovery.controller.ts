import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import {
  DiscoverySearchSchema,
  ImportDiscoveryResultsSchema,
} from '@ginie/common';
import { CurrentUser, CurrentTenant } from '../../common/current-user.decorator';

@Controller('api/discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('usage')
  async getUsage(@CurrentTenant() tenantId: string) {
    return this.discoveryService.getUsage(tenantId);
  }

  @Post('search')
  async search(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const validated = DiscoverySearchSchema.parse(body);
    return this.discoveryService.search(tenantId, userId, validated);
  }

  @Get(':searchId')
  async getSearchResults(
    @CurrentTenant() tenantId: string,
    @Param('searchId') searchId: string,
  ) {
    return this.discoveryService.getSearchResults(tenantId, searchId);
  }

  @Post(':searchId/import')
  async importResults(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('searchId') searchId: string,
    @Body() body: any,
  ) {
    const validated = ImportDiscoveryResultsSchema.parse(body);
    return this.discoveryService.importResults(tenantId, userId, searchId, validated);
  }
}
