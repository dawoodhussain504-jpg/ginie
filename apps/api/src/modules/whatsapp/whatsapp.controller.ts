import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import {
  SendWhatsAppMessageSchema,
  CreateAutoReplyRuleSchema,
} from '@ginie/common';
import { CurrentUser, CurrentTenant } from '../../common/current-user.decorator';
import { Public } from '../../common/tenant.guard';

@Controller('api/whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('session')
  async getSession(@CurrentTenant() tenantId: string) {
    return this.whatsappService.getSession(tenantId);
  }

  @Delete('session')
  async unlinkSession(@CurrentTenant() tenantId: string) {
    return this.whatsappService.unlinkSession(tenantId);
  }

  @Get('messages')
  async getMessages(
    @CurrentTenant() tenantId: string,
    @Query('phone') phone?: string,
  ) {
    return this.whatsappService.getMessages(tenantId, phone);
  }

  @Post('messages')
  async sendMessage(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    const validated = SendWhatsAppMessageSchema.parse(body);
    return this.whatsappService.sendMessage(tenantId, userId, validated);
  }

  @Get('auto-reply-rules')
  async getRules(@CurrentTenant() tenantId: string) {
    return this.whatsappService.getRules(tenantId);
  }

  @Post('auto-reply-rules')
  async createRule(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    const validated = CreateAutoReplyRuleSchema.parse(body);
    return this.whatsappService.createRule(tenantId, validated);
  }

  // Webhook from Baileys bridge container (HMAC or bridge secret verified)
  @Public()
  @Post('webhook/bridge')
  async handleBridgeWebhook(
    @Headers('X-Bridge-Secret') secret: string,
    @Body() body: { tenantId: string; from: string; text: string },
  ) {
    const expectedSecret = process.env.WHATSAPP_BRIDGE_SECRET || 'dev_bridge_secret';
    if (secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid bridge webhook secret.');
    }

    return this.whatsappService.handleInboundMessage(
      body.tenantId,
      body.from,
      body.text,
    );
  }

  // Webhook for Meta Cloud API
  @Public()
  @Post('webhook/cloud')
  async handleCloudWebhook(@Body() body: any) {
    // Process inbound message event from Meta webhook
    return { status: 'received' };
  }
}
