import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { DealsModule } from './modules/deals/deals.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TenantAuthGuard } from './common/tenant.guard';
import { PlainLanguageExceptionFilter } from './common/plain-language-exception.filter';
import { HealthController } from './health.controller';

@Module({
  imports: [
    AuthModule,
    LeadsModule,
    DealsModule,
    TasksModule,
    DiscoveryModule,
    ContactsModule,
    SettingsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PlainLanguageExceptionFilter,
    },
  ],
})
export class AppModule {}
