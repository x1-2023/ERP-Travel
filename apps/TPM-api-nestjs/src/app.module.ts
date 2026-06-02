import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Database
import { DatabaseModule } from './database/database.module';

// Common
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';

// V3 Feature Modules
import { ContractsModule } from './modules/contracts/contracts.module';
import { AiModule } from './modules/ai/ai.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

// Finance Modules
import { SettlementsModule } from './modules/settlements/settlements.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { FundsModule } from './modules/funds/funds.module';
import { ChequesModule } from './modules/cheques/cheques.module';
import { DeductionsModule } from './modules/deductions/deductions.module';

// Planning & Operations Modules
import { PlanningModule } from './modules/planning/planning.module';
import { TargetsModule } from './modules/targets/targets.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { OperationsModule } from './modules/operations/operations.module';

// Support Modules
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';

// Additional Modules
import { TemplatesModule } from './modules/templates/templates.module';
import { RegionsModule } from './modules/regions/regions.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ActivitiesModule } from './modules/activities/activities.module';

// Health Check
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    DatabaseModule,

    // ═══════════════════════════════════════════════════════════════════
    // CORE MODULES (P0)
    // ═══════════════════════════════════════════════════════════════════
    AuthModule,
    UsersModule,
    BudgetsModule,
    PromotionsModule,
    ClaimsModule,
    CustomersModule,
    ProductsModule,

    // ═══════════════════════════════════════════════════════════════════
    // V3 FEATURE MODULES
    // ═══════════════════════════════════════════════════════════════════
    ContractsModule,
    AiModule,
    MonitoringModule,

    // ═══════════════════════════════════════════════════════════════════
    // FINANCE MODULES (P1)
    // ═══════════════════════════════════════════════════════════════════
    SettlementsModule,
    PaymentsModule,
    ReconciliationModule,
    FundsModule,
    ChequesModule,
    DeductionsModule,

    // ═══════════════════════════════════════════════════════════════════
    // PLANNING & OPERATIONS MODULES (P2)
    // ═══════════════════════════════════════════════════════════════════
    PlanningModule,
    TargetsModule,
    ExecutionModule,
    OperationsModule,

    // ═══════════════════════════════════════════════════════════════════
    // SUPPORT MODULES
    // ═══════════════════════════════════════════════════════════════════
    AnalyticsModule,
    ReportsModule,
    SettingsModule,
    NotificationsModule,
    AuditModule,

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL MODULES
    // ═══════════════════════════════════════════════════════════════════
    TemplatesModule,
    RegionsModule,
    ChannelsModule,
    CategoriesModule,
    WorkflowsModule,
    ApprovalsModule,
    DocumentsModule,
    IntegrationsModule,
    ActivitiesModule,
  ],
  controllers: [HealthController],
  providers: [
    // Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // JWT Auth Guard (global)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Roles Guard (global)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Response Transform Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
