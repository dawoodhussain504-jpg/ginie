import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UsePipes,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { UpgradePlanSchema, UpgradePlanDto } from '@ginie/common';
import { Public } from '../../common/tenant.guard';

@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  async getCurrentSubscription(@Request() req: any) {
    return this.subscriptionsService.getCurrentSubscription(req.tenantId);
  }

  @Get('plans')
  async listPlans() {
    return this.subscriptionsService.listPlans();
  }

  @Post('upgrade')
  @UsePipes(new ZodValidationPipe(UpgradePlanSchema))
  async upgradePlan(@Request() req: any, @Body() dto: UpgradePlanDto) {
    return this.subscriptionsService.upgradePlan(req.tenantId, dto);
  }

  @Public()
  @Post('webhooks/razorpay')
  async handleRazorpayWebhook(@Body() payload: any) {
    return this.subscriptionsService.handlePaymentWebhook('razorpay', payload);
  }

  @Public()
  @Post('webhooks/stripe')
  async handleStripeWebhook(@Body() payload: any) {
    return this.subscriptionsService.handlePaymentWebhook('stripe', payload);
  }
}
