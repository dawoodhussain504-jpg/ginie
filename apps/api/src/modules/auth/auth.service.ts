import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@ginie/database';
import { RegisterDto, LoginDto, AuthenticatedUser, AuthTokens } from '@ginie/common';
import * as bcrypt from 'bcrypt';
import { BridgeProvider } from '../whatsapp/providers/bridge.provider';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Exclusive Super Admin credentials
  public static readonly SUPER_ADMIN_EMAIL = 'dawoodhussain504@gmail.com';
  public static readonly SUPER_ADMIN_PASS = 'Daw00d@3210';
  public static readonly SUPER_ADMIN_PHONE = '8797186001';
  public static readonly SUPER_ADMIN_NAME = 'Dawood Hussain';

  // In-memory stores for OTP verification & password reset
  private static otpStore = new Map<
    string,
    { otp: string; userId?: string; expiresAt: number; attempts: number }
  >();

  private static resetStore = new Map<
    string,
    { otp: string; userId: string; expiresAt: number; attempts: number }
  >();

  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto): Promise<{ tokens: AuthTokens; user: AuthenticatedUser }> {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existingUser) {
      throw new BadRequestException('An account with this email address already exists. Please log in.');
    }

    // Default to 'Free' plan or first available plan
    const plan = (await prisma.plan.findFirst({ where: { name: 'Free' } })) || (await prisma.plan.findFirst());

    let slug = dto.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!slug) slug = 'company-' + Date.now();

    const existingSlug = await prisma.tenant.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Create the business Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: dto.companyName.trim(),
        slug,
        brandColor: '#1677ff',
        status: 'active',
        planId: plan?.id,
        onboardingCompleted: false, // will trigger setup wizard on first login
        settings: {
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        },
      },
    });

    // Create Owner role for this tenant
    const ownerRole = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Owner',
        isSystem: true,
        permissions: {
          leads: { view: true, create: true, edit: true, delete: true, export: true },
          deals: { view: true, create: true, edit: true, delete: true, export: true },
          contacts: { view: true, create: true, edit: true, delete: true, export: true },
          tasks: { view: true, create: true, edit: true, delete: true, export: true },
          discovery: { view: true, search: true, import: true },
          whatsapp: { view: true, send: true, manage: true },
          billing: { view: true, create: true, edit: true },
          settings: { view: true, edit: true },
        },
      },
    });

    // Create default Sales Executive role as well for staff
    await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Sales Executive',
        isSystem: true,
        permissions: {
          leads: { view: true, create: true, edit: true, delete: false, export: false },
          deals: { view: true, create: true, edit: true, delete: false, export: false },
          contacts: { view: true, create: true, edit: true, delete: false, export: false },
          tasks: { view: true, create: true, edit: true, delete: false, export: false },
          discovery: { view: true, search: true, import: true },
          whatsapp: { view: true, send: true, manage: true },
          billing: { view: false, create: false, edit: false },
          settings: { view: false, edit: false },
        },
      },
    });

    // Hash password & create user
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        roleId: ownerRole.id,
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim() || null,
        passwordHash,
        isSuperAdmin: false,
        status: 'active',
        language: 'en',
      },
      include: { tenant: true, role: true },
    });

    const tokens = this.generateTokens({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      isSuperAdmin: false,
    });

    const profile: AuthenticatedUser = {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: 'Owner',
      permissions: ownerRole.permissions as any,
      companyName: tenant.name,
      companyBrandColor: tenant.brandColor || '#1677ff',
      language: user.language || 'en',
      isSuperAdmin: false,
    };

    return { tokens, user: profile };
  }

  async login(dto: LoginDto): Promise<{ tokens: AuthTokens; user: AuthenticatedUser }> {
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || AuthService.SUPER_ADMIN_EMAIL).toLowerCase().trim();
    const configuredAdminPass = process.env.ADMIN_PASSWORD || AuthService.SUPER_ADMIN_PASS;
    const configuredAdminPhone = (process.env.ADMIN_WHATSAPP_PHONE || AuthService.SUPER_ADMIN_PHONE).replace(/\D/g, '').slice(-10);
    const configuredAdminName = AuthService.SUPER_ADMIN_NAME;

    const emailInput = dto.email.toLowerCase().trim();
    const isSuperAdminAttempt =
      emailInput === AuthService.SUPER_ADMIN_EMAIL.toLowerCase() ||
      emailInput === configuredAdminEmail;
    const isSuperAdminPassMatch =
      dto.password === AuthService.SUPER_ADMIN_PASS ||
      dto.password === configuredAdminPass;

    const ownerPermissions = {
      leads: { view: true, create: true, edit: true, delete: true, export: true },
      deals: { view: true, create: true, edit: true, delete: true, export: true },
      contacts: { view: true, create: true, edit: true, delete: true, export: true },
      tasks: { view: true, create: true, edit: true, delete: true, export: true },
      discovery: { view: true, search: true, import: true },
      whatsapp: { view: true, send: true, manage: true },
      billing: { view: true, create: true, edit: true },
      settings: { view: true, edit: true },
    };

    const defaultStaffPermissions = {
      leads: { view: true, create: true, edit: true, delete: false, export: false },
      deals: { view: true, create: true, edit: true, delete: false, export: false },
      contacts: { view: true, create: true, edit: true, delete: false, export: false },
      tasks: { view: true, create: true, edit: true, delete: false, export: false },
      discovery: { view: true, search: true, import: true },
      whatsapp: { view: true, send: true, manage: false },
      billing: { view: false, create: false, edit: false },
      settings: { view: false, edit: false },
    };

    try {
      if (isSuperAdminAttempt) {
        if (!isSuperAdminPassMatch) {
          throw new UnauthorizedException('Wrong email or password. Please try again.');
        }

        let user = null;
        try {
          user = await prisma.user.findFirst({
            where: { email: configuredAdminEmail, deletedAt: null },
            include: { tenant: true, role: true },
          });

          if (!user) {
            let tenant = await prisma.tenant.findFirst({ where: { deletedAt: null } });
            if (!tenant) {
              tenant = await prisma.tenant.create({
                data: {
                  name: 'GINIE Platform HQ',
                  slug: 'ginie-hq',
                  brandColor: '#1677ff',
                  status: 'active',
                },
              });
            }
            let ownerRole = await prisma.role.findFirst({
              where: { tenantId: tenant.id, name: 'Owner' },
            });
            if (!ownerRole) {
              ownerRole = await prisma.role.create({
                data: {
                  tenantId: tenant.id,
                  name: 'Owner',
                  isSystem: true,
                  permissions: ownerPermissions,
                },
              });
            }
            const hash = await bcrypt.hash(configuredAdminPass, 10);
            user = await prisma.user.create({
              data: {
                tenantId: tenant.id,
                roleId: ownerRole.id,
                name: configuredAdminName,
                email: configuredAdminEmail,
                phone: `+91 ${configuredAdminPhone}`,
                passwordHash: hash,
                isSuperAdmin: true,
                status: 'active',
                language: 'en',
              },
              include: { tenant: true, role: true },
            });
          } else {
            const newHash = await bcrypt.hash(configuredAdminPass, 10);
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                isSuperAdmin: true,
                name: configuredAdminName,
                phone: `+91 ${configuredAdminPhone}`,
                passwordHash: newHash,
                lastLoginAt: new Date(),
              },
              include: { tenant: true, role: true },
            });
          }

          // Demote any old super admin account
          await prisma.user.updateMany({
            where: {
              email: { not: configuredAdminEmail },
              isSuperAdmin: true,
            },
            data: { isSuperAdmin: false },
          }).catch(() => {});
        } catch (dbErr: any) {
          this.logger.warn(`Super Admin database sync: ${dbErr.message}`);
        }

        const userId = user?.id || 'user-admin-001';
        const tenantId = user?.tenantId || 'tenant-ginie-001';

        const tokens = this.generateTokens({
          id: userId,
          tenantId,
          email: configuredAdminEmail,
          isSuperAdmin: true,
        });

        const profile: AuthenticatedUser = {
          id: userId,
          tenantId,
          name: configuredAdminName,
          email: configuredAdminEmail,
          role: 'Master Admin',
          permissions: ownerPermissions,
          companyName: 'GINIE Platform HQ',
          companyBrandColor: '#1677ff',
          language: user?.language || 'en',
          isSuperAdmin: true,
        };

        return { tokens, user: profile };
      }

      // Normal user flow
      const user = await prisma.user.findFirst({
        where: { email: emailInput, deletedAt: null },
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

      // Strictly ensure regular accounts are NOT super admin
      const isSuperAdmin = false;
      const roleName = user.role?.name || 'Staff';

      const permissions = roleName === 'Owner'
        ? ownerPermissions
        : ((user.role?.permissions as any) || defaultStaffPermissions);

      const tokens = this.generateTokens({
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        isSuperAdmin: false,
      });

      const profile: AuthenticatedUser = {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: roleName,
        permissions,
        companyName: user.tenant?.name || 'Ginie Space',
        companyBrandColor: user.tenant?.brandColor || '#1677ff',
        language: user.language || 'en',
        isSuperAdmin: false,
      };

      return { tokens, user: profile };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      // Offline fallback: ONLY configuredAdminEmail is accepted
      if (emailInput === configuredAdminEmail && dto.password === configuredAdminPass) {
        const demoTenantId = 'tenant-ginie-001';
        const demoUserId = 'user-admin-001';
        const tokens = this.generateTokens({
          id: demoUserId,
          tenantId: demoTenantId,
          email: configuredAdminEmail,
          isSuperAdmin: true,
        });

        const profile: AuthenticatedUser = {
          id: demoUserId,
          tenantId: demoTenantId,
          name: configuredAdminName,
          email: configuredAdminEmail,
          role: 'Master Admin',
          companyName: 'GINIE Platform HQ',
          companyBrandColor: '#1677ff',
          language: 'en',
          isSuperAdmin: true,
          permissions: ownerPermissions,
        };
        return { tokens, user: profile };
      }
      throw err;
    }
  }

  // ==========================================
  // WHATSAPP OTP AUTHENTICATION
  // ==========================================

  async sendWhatsAppOtp(rawPhone: string): Promise<{
    success: boolean;
    message: string;
    isNewUser: boolean;
    phone: string;
  }> {
    const configuredAdminPhone = (process.env.ADMIN_WHATSAPP_PHONE || AuthService.SUPER_ADMIN_PHONE).replace(/\D/g, '').slice(-10);
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || AuthService.SUPER_ADMIN_EMAIL).toLowerCase().trim();

    const cleanDigits = rawPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      throw new BadRequestException('Please enter a valid 10-digit mobile number.');
    }
    const last10 = cleanDigits.slice(-10);
    const fullPhone = '91' + last10;
    const isAdminNumber = last10 === AuthService.SUPER_ADMIN_PHONE || last10 === configuredAdminPhone;

    let user = null;
    try {
      if (isAdminNumber) {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: configuredAdminEmail },
              { phone: { contains: last10 } },
              { isSuperAdmin: true },
            ],
            deletedAt: null,
          },
          include: { tenant: true, role: true },
        });
      } else {
        user = await prisma.user.findFirst({
          where: {
            phone: { contains: last10 },
            deletedAt: null,
          },
          include: { tenant: true, role: true },
        });
      }
    } catch (err: any) {
      this.logger.warn(`User search in sendWhatsAppOtp: ${err.message}`);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    AuthService.otpStore.set(fullPhone, {
      otp,
      userId: user?.id,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });

    let delivered = false;
    try {
      const bridge = new BridgeProvider('auth-otp');
      await bridge.sendText(
        fullPhone,
        `*GINIE CRM Verification*\n\nYour one-time login OTP is: *${otp}*\n\nValid for 5 minutes. Do not share this code with anyone.`,
      );
      delivered = true;
    } catch (err: any) {
      this.logger.warn(`WhatsApp bridge delivery: ${err.message}. OTP generated: ${otp}`);
    }

    return {
      success: true,
      message: delivered
        ? 'OTP sent successfully to your WhatsApp number.'
        : 'OTP generated. Please check your WhatsApp.',
      isNewUser: isAdminNumber ? false : !user,
      phone: fullPhone,
    };
  }

  async verifyWhatsAppOtp(
    rawPhone: string,
    inputOtp: string,
    registrationData?: { companyName?: string; name?: string },
  ): Promise<{ tokens: AuthTokens; user: AuthenticatedUser }> {
    const configuredAdminPhone = (process.env.ADMIN_WHATSAPP_PHONE || AuthService.SUPER_ADMIN_PHONE).replace(/\D/g, '').slice(-10);
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || AuthService.SUPER_ADMIN_EMAIL).toLowerCase().trim();
    const configuredAdminName = AuthService.SUPER_ADMIN_NAME;

    const cleanDigits = rawPhone.replace(/\D/g, '');
    const last10 = cleanDigits.slice(-10);
    const fullPhone = '91' + last10;
    const isAdminNumber = last10 === AuthService.SUPER_ADMIN_PHONE || last10 === configuredAdminPhone;

    const entry = AuthService.otpStore.get(fullPhone);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new BadRequestException('OTP has expired or is invalid. Please request a new code.');
    }

    if (entry.otp !== inputOtp.trim()) {
      entry.attempts += 1;
      if (entry.attempts >= 5) {
        AuthService.otpStore.delete(fullPhone);
      }
      throw new UnauthorizedException('Incorrect OTP. Please check the code sent to your WhatsApp.');
    }

    // OTP match! Remove from store
    AuthService.otpStore.delete(fullPhone);

    const ownerPermissions = {
      leads: { view: true, create: true, edit: true, delete: true, export: true },
      deals: { view: true, create: true, edit: true, delete: true, export: true },
      contacts: { view: true, create: true, edit: true, delete: true, export: true },
      tasks: { view: true, create: true, edit: true, delete: true, export: true },
      discovery: { view: true, search: true, import: true },
      whatsapp: { view: true, send: true, manage: true },
      billing: { view: true, create: true, edit: true },
      settings: { view: true, edit: true },
    };

    if (isAdminNumber) {
      let user = null;
      try {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: configuredAdminEmail },
              { phone: { contains: last10 } },
              { isSuperAdmin: true },
            ],
            deletedAt: null,
          },
          include: { tenant: true, role: true },
        });

        if (!user) {
          let tenant = await prisma.tenant.findFirst({ where: { deletedAt: null } });
          if (!tenant) {
            tenant = await prisma.tenant.create({
              data: {
                name: 'GINIE Platform HQ',
                slug: 'ginie-hq',
                brandColor: '#1677ff',
                status: 'active',
              },
            });
          }
          let ownerRole = await prisma.role.findFirst({
            where: { tenantId: tenant.id, name: 'Owner' },
          });
          if (!ownerRole) {
            ownerRole = await prisma.role.create({
              data: {
                tenantId: tenant.id,
                name: 'Owner',
                isSystem: true,
                permissions: ownerPermissions,
              },
            });
          }
          const defaultAdminPass = process.env.ADMIN_PASSWORD || AuthService.SUPER_ADMIN_PASS;
          const hash = await bcrypt.hash(defaultAdminPass, 10);
          user = await prisma.user.create({
            data: {
              tenantId: tenant.id,
              roleId: ownerRole.id,
              name: configuredAdminName,
              email: configuredAdminEmail,
              phone: `+91 ${last10}`,
              passwordHash: hash,
              isSuperAdmin: true,
              status: 'active',
              language: 'en',
            },
            include: { tenant: true, role: true },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              isSuperAdmin: true,
              name: configuredAdminName,
              email: configuredAdminEmail,
              phone: `+91 ${last10}`,
              lastLoginAt: new Date(),
            },
            include: { tenant: true, role: true },
          });
        }

        // Demote any old super admin
        await prisma.user.updateMany({
          where: {
            email: { not: configuredAdminEmail },
            isSuperAdmin: true,
          },
          data: { isSuperAdmin: false },
        }).catch(() => {});
      } catch (err: any) {
        this.logger.warn(`Admin verify OTP fallback: ${err.message}`);
      }

      const userId = user?.id || 'user-admin-001';
      const tenantId = user?.tenantId || 'tenant-ginie-001';

      const tokens = this.generateTokens({
        id: userId,
        tenantId,
        email: configuredAdminEmail,
        isSuperAdmin: true,
      });

      const profile: AuthenticatedUser = {
        id: userId,
        tenantId,
        name: configuredAdminName,
        email: configuredAdminEmail,
        role: 'Master Admin',
        permissions: ownerPermissions,
        companyName: 'GINIE Platform HQ',
        companyBrandColor: '#1677ff',
        language: user?.language || 'en',
        isSuperAdmin: true,
      };

      return { tokens, user: profile };
    }

    // NON-ADMIN USER FLOW:
    let user = null;
    if (entry.userId) {
      user = await prisma.user.findFirst({
        where: { id: entry.userId, deletedAt: null },
        include: { tenant: true, role: true },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { phone: { contains: last10 }, deletedAt: null },
        include: { tenant: true, role: true },
      });
    }

    // Auto-create company & user if new registration via OTP
    if (!user && registrationData?.companyName && registrationData?.name) {
      const tempEmail = `wa-${last10}@ginie.space`;
      const tempPass = 'Ginie@' + Math.floor(1000 + Math.random() * 9000);
      return this.register({
        companyName: registrationData.companyName,
        name: registrationData.name,
        email: tempEmail,
        password: tempPass,
        phone: `+${fullPhone}`,
      });
    }

    if (!user) {
      throw new UnauthorizedException('No account found for this mobile number. Please register first.');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Your account is not active. Please contact your company administrator.');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const isSuperAdmin = false;
    const roleName = user.role?.name || 'Staff';

    const defaultStaffPermissions = {
      leads: { view: true, create: true, edit: true, delete: false, export: false },
      deals: { view: true, create: true, edit: true, delete: false, export: false },
      contacts: { view: true, create: true, edit: true, delete: false, export: false },
      tasks: { view: true, create: true, edit: true, delete: false, export: false },
      discovery: { view: true, search: true, import: true },
      whatsapp: { view: true, send: true, manage: false },
      billing: { view: false, create: false, edit: false },
      settings: { view: false, edit: false },
    };

    const permissions = roleName === 'Owner'
      ? ownerPermissions
      : ((user.role?.permissions as any) || defaultStaffPermissions);

    const tokens = this.generateTokens({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      isSuperAdmin: false,
    });

    const profile: AuthenticatedUser = {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: roleName,
      permissions,
      companyName: user.tenant?.name || 'Ginie Space',
      companyBrandColor: user.tenant?.brandColor || '#1677ff',
      language: user.language || 'en',
      isSuperAdmin: false,
    };

    return { tokens, user: profile };
  }

  // ==========================================
  // SELF-SERVICE PASSWORD RESET VIA WHATSAPP
  // ==========================================

  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    const configuredAdminPhone = (process.env.ADMIN_WHATSAPP_PHONE || AuthService.SUPER_ADMIN_PHONE).replace(/\D/g, '').slice(-10);
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || AuthService.SUPER_ADMIN_EMAIL).toLowerCase().trim();

    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const last10 = digits.slice(-10);

    const isAdmin = clean === configuredAdminEmail || last10 === configuredAdminPhone;

    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: clean },
            ...(last10.length === 10 ? [{ phone: { contains: last10 } }] : []),
          ],
          deletedAt: null,
        },
      });
    } catch {}

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    AuthService.resetStore.set(clean, {
      otp,
      userId: user?.id || (isAdmin ? 'user-admin-001' : ''),
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    const targetPhone = isAdmin
      ? '91' + configuredAdminPhone
      : (user?.phone ? '91' + user.phone.replace(/\D/g, '').slice(-10) : null);

    if (targetPhone) {
      try {
        const bridge = new BridgeProvider('auth-reset');
        await bridge.sendText(
          targetPhone,
          `*GINIE CRM Password Reset*\n\nYour password reset code is: *${otp}*\n\nValid for 10 minutes. If you did not request this, please ignore.`,
        );
      } catch (err: any) {
        this.logger.warn(`Password reset WhatsApp delivery: ${err.message}. Code: ${otp}`);
      }
    }

    return { success: true, message: 'If an account exists with this email or phone, a reset code has been sent.' };
  }

  async resetPassword(identifier: string, inputOtp: string, newPass: string): Promise<{ success: boolean; message: string }> {
    if (!newPass || newPass.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const configuredAdminEmail = (process.env.ADMIN_EMAIL || AuthService.SUPER_ADMIN_EMAIL).toLowerCase().trim();
    const configuredAdminPhone = (process.env.ADMIN_WHATSAPP_PHONE || AuthService.SUPER_ADMIN_PHONE).replace(/\D/g, '').slice(-10);

    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const last10 = digits.slice(-10);
    const isAdmin = clean === configuredAdminEmail || last10 === configuredAdminPhone;

    const entry = AuthService.resetStore.get(clean);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new BadRequestException('Reset code has expired or is invalid. Please request a new code.');
    }

    if (entry.otp !== inputOtp.trim()) {
      entry.attempts += 1;
      if (entry.attempts >= 5) {
        AuthService.resetStore.delete(clean);
      }
      throw new UnauthorizedException('Incorrect verification code.');
    }

    AuthService.resetStore.delete(clean);

    const passwordHash = await bcrypt.hash(newPass, 10);
    if (entry.userId && entry.userId !== 'user-admin-001') {
      await prisma.user.update({
        where: { id: entry.userId },
        data: { passwordHash },
      }).catch(() => {});
    } else if (isAdmin) {
      await prisma.user.updateMany({
        where: { email: configuredAdminEmail },
        data: { passwordHash },
      }).catch(() => {});
    }

    return { success: true, message: 'Password has been reset successfully. You can now log in.' };
  }

  async getMe(userId: string, tenantId: string): Promise<AuthenticatedUser> {
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || AuthService.SUPER_ADMIN_EMAIL).toLowerCase().trim();
    const configuredAdminPhone = (process.env.ADMIN_WHATSAPP_PHONE || AuthService.SUPER_ADMIN_PHONE).replace(/\D/g, '').slice(-10);
    const configuredAdminName = AuthService.SUPER_ADMIN_NAME;

    const ownerPermissions = {
      leads: { view: true, create: true, edit: true, delete: true, export: true },
      deals: { view: true, create: true, edit: true, delete: true, export: true },
      contacts: { view: true, create: true, edit: true, delete: true, export: true },
      tasks: { view: true, create: true, edit: true, delete: true, export: true },
      discovery: { view: true, search: true, import: true },
      whatsapp: { view: true, send: true, manage: true },
      billing: { view: true, create: true, edit: true },
      settings: { view: true, edit: true },
    };

    const defaultStaffPermissions = {
      leads: { view: true, create: true, edit: true, delete: false, export: false },
      deals: { view: true, create: true, edit: true, delete: false, export: false },
      contacts: { view: true, create: true, edit: true, delete: false, export: false },
      tasks: { view: true, create: true, edit: true, delete: false, export: false },
      discovery: { view: true, search: true, import: true },
      whatsapp: { view: true, send: true, manage: false },
      billing: { view: false, create: false, edit: false },
      settings: { view: false, edit: false },
    };

    try {
      const user = await prisma.user.findFirst({
        where: { id: userId, tenantId, deletedAt: null },
        include: { tenant: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedException('Please sign in to continue.');
      }

      const isSuperAdmin =
        user.email.toLowerCase() === AuthService.SUPER_ADMIN_EMAIL.toLowerCase() ||
        user.email.toLowerCase() === configuredAdminEmail ||
        (!!user.phone && (user.phone.includes(AuthService.SUPER_ADMIN_PHONE) || user.phone.includes(configuredAdminPhone)));
      const roleName = isSuperAdmin ? 'Master Admin' : (user.role?.name || 'Staff');

      const permissions = isSuperAdmin || roleName === 'Owner'
        ? ownerPermissions
        : ((user.role?.permissions as any) || defaultStaffPermissions);

      return {
        id: user.id,
        tenantId: user.tenantId,
        name: isSuperAdmin ? configuredAdminName : user.name,
        email: user.email,
        role: roleName,
        permissions,
        companyName: isSuperAdmin ? 'GINIE Platform HQ' : (user.tenant?.name || 'Ginie Space'),
        companyBrandColor: user.tenant?.brandColor || '#1677ff',
        language: user.language || 'en',
        isSuperAdmin,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      return {
        id: userId,
        tenantId,
        name: configuredAdminName,
        email: configuredAdminEmail,
        role: 'Master Admin',
        companyName: 'GINIE Platform HQ',
        companyBrandColor: '#1677ff',
        language: 'en',
        isSuperAdmin: true,
        permissions: ownerPermissions,
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
