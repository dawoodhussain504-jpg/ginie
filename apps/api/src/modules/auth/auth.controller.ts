import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema } from '@ginie/common';
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

  @Get('me')
  async getMe(@CurrentUser('id') userId: string, @CurrentUser('tenantId') tenantId: string) {
    return this.authService.getMe(userId, tenantId);
  }
}
