import { Controller, Post, Body, Get, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginSchema, RegisterSchema } from '@ginie/common';
import { Public } from '../../common/tenant.guard';
import { CurrentUser } from '../../common/current-user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: any) {
    const validated = RegisterSchema.parse(body);
    return this.authService.register(validated);
  }

  @Public()
  @Post('login')
  async login(@Body() body: any) {
    const validated = LoginSchema.parse(body);
    return this.authService.login(validated);
  }

  @Public()
  @Post('otp/send')
  async sendOtp(@Body() body: { phone: string }) {
    if (!body?.phone) {
      throw new BadRequestException('Phone number is required.');
    }
    return this.authService.sendWhatsAppOtp(body.phone);
  }

  @Public()
  @Post('otp/verify')
  async verifyOtp(
    @Body()
    body: {
      phone: string;
      otp: string;
      registrationData?: { companyName?: string; name?: string };
    },
  ) {
    if (!body?.phone || !body?.otp) {
      throw new BadRequestException('Phone number and OTP are required.');
    }
    return this.authService.verifyWhatsAppOtp(body.phone, body.otp, body.registrationData);
  }

  @Public()
  @Post('forgot-password/request')
  async requestReset(@Body() body: { identifier: string }) {
    if (!body?.identifier) {
      throw new BadRequestException('Email or phone number is required.');
    }
    return this.authService.requestPasswordReset(body.identifier);
  }

  @Public()
  @Post('forgot-password/reset')
  async resetPassword(
    @Body() body: { identifier: string; otp: string; newPassword: string },
  ) {
    if (!body?.identifier || !body?.otp || !body?.newPassword) {
      throw new BadRequestException('Identifier, OTP, and new password are required.');
    }
    return this.authService.resetPassword(body.identifier, body.otp, body.newPassword);
  }

  @Get('me')
  async getMe(@CurrentUser('id') userId: string, @CurrentUser('tenantId') tenantId: string) {
    return this.authService.getMe(userId, tenantId);
  }
}
