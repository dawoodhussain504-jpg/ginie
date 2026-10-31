import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@ginie/database';
import { RegisterDto, LoginDto, AuthenticatedUser, AuthTokens } from '@ginie/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(_dto: RegisterDto): Promise<{ tokens: AuthTokens; user: AuthenticatedUser }> {
    throw new ForbiddenException(
      'Public registration is closed. GINIE is running in private Single-Admin Mode.',
    );
  }

  async login(dto: LoginDto): Promise<{ tokens: AuthTokens; user: AuthenticatedUser }> {
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'admin@ginie.space').toLowerCase();
    const configuredAdminPass = process.env.ADMIN_PASSWORD || 'Admin@123';

    try {
      const user = await prisma.user.findFirst({
        where: { email: dto.email.toLowerCase(), deletedAt: null },
        include: { tenant: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedException('Wrong email or password. Please try again.');
      }

      const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('Wrong email or password. Please try again.');
      }

      if (user.status !== 'active') {
        throw new UnauthorizedException('Your account is not active. Please contact your company administrator.');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const tokens = this.generateTokens({
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        isSuperAdmin: true,
      });

      const profile: AuthenticatedUser = {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: 'Master Admin',
        permissions: {
          leads: { view: true, create: true, edit: true, delete: true, export: true },
          deals: { view: true, create: true, edit: true, delete: true, export: true },
          contacts: { view: true, create: true, edit: true, delete: true, export: true },
          tasks: { view: true, create: true, edit: true, delete: true, export: true },
          discovery: { view: true, search: true, import: true },
          settings: { view: true, edit: true },
        },
        companyName: user.tenant?.name || 'Ginie Space',
        companyBrandColor: user.tenant?.brandColor || '#1677ff',
        language: user.language || 'en',
        isSuperAdmin: true,
      };

      return { tokens, user: profile };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      // Offline/Local dev master admin fallback
      const isConfiguredAdmin =
        (dto.email.toLowerCase() === configuredAdminEmail && dto.password === configuredAdminPass) ||
        (dto.email.toLowerCase() === 'admin@ginie.space' && dto.password === 'Admin@123');

      if (isConfiguredAdmin) {
        const demoTenantId = 'tenant-ginie-001';
        const demoUserId = 'user-admin-001';
        const tokens = this.generateTokens({
          id: demoUserId,
          tenantId: demoTenantId,
          email: dto.email.toLowerCase(),
          isSuperAdmin: true,
        });

        const profile: AuthenticatedUser = {
          id: demoUserId,
          tenantId: demoTenantId,
          name: 'Master Admin',
          email: dto.email.toLowerCase(),
          role: 'Master Admin',
          companyName: 'Ginie Space (Private Cockpit)',
          companyBrandColor: '#1677ff',
          language: 'en',
          isSuperAdmin: true,
          permissions: {
            leads: { view: true, create: true, edit: true, delete: true, export: true },
            deals: { view: true, create: true, edit: true, delete: true, export: true },
            contacts: { view: true, create: true, edit: true, delete: true, export: true },
            tasks: { view: true, create: true, edit: true, delete: true, export: true },
            discovery: { view: true, search: true, import: true },
            settings: { view: true, edit: true },
          },
        };
        return { tokens, user: profile };
      }
      throw err;
    }
  }

  async getMe(userId: string, tenantId: string): Promise<AuthenticatedUser> {
    try {
      const user = await prisma.user.findFirst({
        where: { id: userId, tenantId, deletedAt: null },
        include: { tenant: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedException('Please sign in to continue.');
      }

      return {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: 'Master Admin',
        permissions: {
          leads: { view: true, create: true, edit: true, delete: true, export: true },
          deals: { view: true, create: true, edit: true, delete: true, export: true },
          contacts: { view: true, create: true, edit: true, delete: true, export: true },
          tasks: { view: true, create: true, edit: true, delete: true, export: true },
          discovery: { view: true, search: true, import: true },
          settings: { view: true, edit: true },
        },
        companyName: user.tenant?.name || 'Ginie Space',
        companyBrandColor: user.tenant?.brandColor || '#1677ff',
        language: user.language || 'en',
        isSuperAdmin: true,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      // Demo admin session fallback
      return {
        id: userId,
        tenantId,
        name: 'Master Admin',
        email: process.env.ADMIN_EMAIL || 'admin@ginie.space',
        role: 'Master Admin',
        companyName: 'Ginie Space (Private Cockpit)',
        companyBrandColor: '#1677ff',
        language: 'en',
        isSuperAdmin: true,
        permissions: {
          leads: { view: true, create: true, edit: true, delete: true, export: true },
          deals: { view: true, create: true, edit: true, delete: true, export: true },
          contacts: { view: true, create: true, edit: true, delete: true, export: true },
          tasks: { view: true, create: true, edit: true, delete: true, export: true },
          discovery: { view: true, search: true, import: true },
          settings: { view: true, edit: true },
        },
      };
    }
  }

  private generateTokens(payload: { id: string; tenantId: string; email: string; isSuperAdmin?: boolean }): AuthTokens {
    const secret = process.env.JWT_SECRET || 'dev_secret_jwt_ginie_app';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_secret_refresh_ginie_app';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    });

    return { accessToken, refreshToken };
  }
}
