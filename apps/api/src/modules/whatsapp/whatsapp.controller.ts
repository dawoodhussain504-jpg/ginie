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

  @Get('anti-ban-status')
  async getAntiBanStatus(@CurrentTenant() tenantId: string) {
    return this.whatsappService.getAntiBanStatus(tenantId);
  }

  @Get('conversations')
  async getConversations(@CurrentTenant() tenantId: string) {
    return this.whatsappService.getConversations(tenantId);
  }

  @Get('conversations/:phone')
  async getConversationThread(
    @CurrentTenant() tenantId: string,
    @Param('phone') phone: string,
  ) {
    return this.whatsappService.getConversationThread(tenantId, phone);
  }

  @Post('conversations/:phone/send')
  async sendConversationMessage(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('phone') phone: string,
    @Body() body: { message: string },
  ) {
    return this.whatsappService.sendMessage(tenantId, userId, {
      phone,
      message: body.message,
    });
  }

  @Post('followup-check')
  async checkFollowups(
    @CurrentTenant() tenantId: string,
    @Body() body: { daysInactive?: number },
  ) {
    return this.whatsappService.createFollowUpTasks(tenantId, body.daysInactive || 2);
  }

  @Get('templates')
  async getTemplates(@CurrentTenant() tenantId: string) {
    return this.whatsappService.getTemplates(tenantId);
  }

  @Post('templates')
  async createTemplate(
    @CurrentTenant() tenantId: string,
    @Body() body: { name: string; body: string },
  ) {
    return this.whatsappService.createTemplate(tenantId, body);
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

  // Webhook from Baileys bridge container
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
    return { status: 'received' };
  }
}
