import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { DealsModule } from './modules/deals/deals.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SettingsModule } from './modules/settings/settings.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { BillingModule } from './modules/billing/billing.module';
import { FormsModule } from './modules/forms/forms.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { AiModule } from './modules/ai/ai.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
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
    WhatsAppModule,
    BillingModule,
    FormsModule,
    ReportsModule,
    AutomationsModule,
    AiModule,
    SubscriptionsModule,
    AdminModule,
    AuditModule,
    NotificationsModule,
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
