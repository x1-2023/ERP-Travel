# ═══════════════════════════════════════════════════════════════════════════════
#                         🏗️ CODER PACK
#                    SCAFFOLD NESTJS PROJECT
#                    "Promo Master V3 Backend"
# ═══════════════════════════════════════════════════════════════════════════════
#
#  📋 CONTEXT:
#  - API Spec: 257 endpoints, 37 modules documented
#  - Frontend: 100% complete, expects exact response shapes
#  - Prisma Schema: Existing models in vierp-tpm-web
#  - Contract: docs/api/api-contracts.json
#
#  🎯 GOALS:
#  - Scaffold NestJS project structure
#  - Create all 37 modules (empty shells)
#  - Setup auth, guards, interceptors
#  - Copy existing Prisma schema
#  - Docker development environment
#
#  📅 Timeline: 1-2 days
#
# ═══════════════════════════════════════════════════════════════════════════════

## 🎭 VAI TRÒ

Bạn là ARCHITECT trong hệ thống Vibecode Kit v4.0.

Task: Scaffold NestJS backend project aligned với API specification đã extract.

---

## 🚀 PHASE 1: PROJECT INITIALIZATION

```bash
# Navigate to monorepo root
cd /Users/mac/TPM-TPO/vierp-tpm-web

# Create backend directory
mkdir -p apps/api-nestjs
cd apps/api-nestjs

# Initialize NestJS project
npx @nestjs/cli new . --skip-git --package-manager npm

# Install core dependencies
npm install @nestjs/config @nestjs/swagger swagger-ui-express
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @prisma/client
npm install class-validator class-transformer
npm install bcrypt helmet compression
npm install @nestjs/throttler
npm install ioredis @nestjs/cache-manager cache-manager cache-manager-ioredis-yet
npm install @nestjs/bull bull
npm install @aws-sdk/client-s3
npm install dayjs

# Install dev dependencies
npm install -D prisma
npm install -D @types/passport-jwt @types/bcrypt @types/multer
npm install -D @nestjs/testing

# Initialize Prisma (will copy schema later)
npx prisma init
```

---

## 🚀 PHASE 2: PROJECT STRUCTURE

```bash
# Create full directory structure
mkdir -p src/{common,config,database,modules}
mkdir -p src/common/{decorators,filters,guards,interceptors,pipes,utils}
mkdir -p src/config

# Create module directories (all 37 modules from spec)
# Core modules
mkdir -p src/modules/{auth,users,budgets,promotions,claims,customers,products}

# V3 Feature modules  
mkdir -p src/modules/{contracts,ai,monitoring}

# Finance modules
mkdir -p src/modules/{settlements,payments,reconciliation,funds,cheques,deductions}

# Planning & Operations modules
mkdir -p src/modules/{planning,targets,execution,operations}

# Support modules
mkdir -p src/modules/{analytics,reports,settings,notifications,audit}

# Additional modules from spec
mkdir -p src/modules/{templates,regions,channels,categories}

# Create standard files in each module
for module in auth users budgets promotions claims customers products contracts ai monitoring settlements payments reconciliation funds cheques deductions planning targets execution operations analytics reports settings notifications audit templates regions channels categories; do
  mkdir -p src/modules/$module/{dto,entities}
  touch src/modules/$module/$module.module.ts
  touch src/modules/$module/$module.controller.ts
  touch src/modules/$module/$module.service.ts
  touch src/modules/$module/dto/index.ts
  touch src/modules/$module/entities/index.ts
done

# Test directories
mkdir -p test/{unit,integration,e2e}
```

---

## 🚀 PHASE 3: CORE FILES

### 3.1 Main Entry Point

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/main.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || ['http://localhost:5173'],
    credentials: true,
  });

  // API Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Promo Master V3 API')
    .setDescription('Trade Promotion Management System API')
    .setVersion('3.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Budgets', 'Budget management')
    .addTag('Promotions', 'Promotion management')
    .addTag('Claims', 'Claims processing')
    .addTag('Contracts', 'Volume contracts (V3)')
    .addTag('Customers', 'Customer management')
    .addTag('Products', 'Product catalog')
    .addTag('Analytics', 'Reports and analytics')
    .addTag('AI', 'AI suggestions (V3)')
    .addTag('Monitoring', 'Live monitoring (V3)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Promo Master API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 3.2 App Module

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/app.module.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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

    // Core Modules
    AuthModule,
    UsersModule,
    BudgetsModule,
    PromotionsModule,
    ClaimsModule,
    CustomersModule,
    ProductsModule,

    // V3 Feature Modules
    ContractsModule,
    AiModule,
    MonitoringModule,

    // Finance Modules
    SettlementsModule,
    PaymentsModule,
    ReconciliationModule,
    FundsModule,
    ChequesModule,
    DeductionsModule,

    // Planning & Operations Modules
    PlanningModule,
    TargetsModule,
    ExecutionModule,
    OperationsModule,

    // Support Modules
    AnalyticsModule,
    ReportsModule,
    SettingsModule,
    NotificationsModule,
    AuditModule,

    // Additional Modules
    TemplatesModule,
    RegionsModule,
    ChannelsModule,
    CategoriesModule,
  ],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // Global Filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

### 3.3 Database Module

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/database/database.module.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/database/prisma.service.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }
    // For testing - delete in correct order due to foreign keys
    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
    // Implementation for test cleanup
  }
}
```

---

## 🚀 PHASE 4: COMMON UTILITIES

### 4.1 Response Transform Interceptor

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/common/interceptors/transform.interceptor.ts
// ═══════════════════════════════════════════════════════════════════════════════

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.headers['x-request-id'] || crypto.randomUUID(),
        },
      })),
    );
  }
}
```

### 4.2 Exception Filter

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/common/filters/all-exceptions.filter.ts
// ═══════════════════════════════════════════════════════════════════════════════

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    // Handle different exception types
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).error || 'HTTP_ERROR';
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma errors
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          code = 'DUPLICATE_ERROR';
          message = 'A record with this value already exists';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          code = 'NOT_FOUND';
          message = 'Record not found';
          break;
        default:
          code = 'DATABASE_ERROR';
          message = 'Database operation failed';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message = 'Invalid data provided';
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Send response matching frontend expectations
    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.headers['x-request-id'] || crypto.randomUUID(),
      },
    });
  }
}
```

### 4.3 JWT Auth Guard

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/common/guards/jwt-auth.guard.ts
// ═══════════════════════════════════════════════════════════════════════════════

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

### 4.4 Roles Guard

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/common/guards/roles.guard.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### 4.5 Decorators

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/common/decorators/public.decorator.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/common/decorators/roles.decorator.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/common/decorators/current-user.decorator.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
```

### 4.6 Pagination DTO

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/common/dto/pagination.dto.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

---

## 🚀 PHASE 5: SAMPLE MODULE (BUDGETS)

### 5.1 Budget Module

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/modules/budgets/budgets.module.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

@Module({
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
```

### 5.2 Budget Controller

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/modules/budgets/budgets.controller.ts
// ═══════════════════════════════════════════════════════════════════════════════

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetQueryDto } from './dto/budget-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all budgets' })
  @ApiResponse({ status: 200, description: 'Budget list with pagination' })
  async findAll(@Query() query: BudgetQueryDto) {
    return this.budgetsService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get budget summary statistics' })
  async getSummary(@Query('year') year?: number) {
    return this.budgetsService.getSummary(year);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available fiscal years' })
  async getYears() {
    return this.budgetsService.getAvailableYears();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  @ApiResponse({ status: 200, description: 'Budget details' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.FINANCE)
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.create(createBudgetDto, userId);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FINANCE)
  @ApiOperation({ summary: 'Update a budget' })
  @ApiResponse({ status: 200, description: 'Budget updated' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.update(id, updateBudgetDto, userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({ status: 204, description: 'Budget deleted' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Approve a budget' })
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.approve(id, userId);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Reject a budget' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.reject(id, reason, userId);
  }

  @Get(':id/allocations')
  @ApiOperation({ summary: 'Get budget allocations' })
  async getAllocations(@Param('id') id: string) {
    return this.budgetsService.getAllocations(id);
  }

  @Post(':id/allocations')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FINANCE)
  @ApiOperation({ summary: 'Create budget allocation' })
  async createAllocation(
    @Param('id') id: string,
    @Body() allocationDto: any, // TODO: CreateAllocationDto
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.createAllocation(id, allocationDto, userId);
  }
}
```

### 5.3 Budget Service

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/modules/budgets/budgets.service.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetQueryDto } from './dto/budget-query.dto';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';
import { BudgetStatus, Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: BudgetQueryDto) {
    const { page = 1, pageSize = 10, status, year, search, sortBy, sortOrder } = query;

    const where: Prisma.BudgetWhereInput = {};

    if (status) {
      where.status = status as BudgetStatus;
    }

    if (year) {
      where.fiscalYear = year;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.budget.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.budget.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        allocations: true,
        promotions: {
          select: { id: true, name: true, status: true, allocatedBudget: true },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return budget;
  }

  async create(dto: CreateBudgetDto, userId: string) {
    // Generate unique code
    const code = await this.generateBudgetCode(dto.fiscalYear, dto.quarter);

    return this.prisma.budget.create({
      data: {
        ...dto,
        code,
        status: BudgetStatus.DRAFT,
        createdById: userId,
      },
    });
  }

  async update(id: string, dto: UpdateBudgetDto, userId: string) {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException('Only draft budgets can be updated');
    }

    return this.prisma.budget.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException('Only draft budgets can be deleted');
    }

    return this.prisma.budget.delete({ where: { id } });
  }

  async approve(id: string, userId: string) {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Budget is not pending approval');
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: userId,
      },
    });
  }

  async reject(id: string, reason: string, userId: string) {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Budget is not pending approval');
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.DRAFT,
        // Store rejection in audit log instead
      },
    });
  }

  async getSummary(year?: number) {
    const where: Prisma.BudgetWhereInput = year ? { fiscalYear: year } : {};

    const budgets = await this.prisma.budget.findMany({ where });

    const summary = {
      totalBudget: budgets.reduce((sum, b) => sum + Number(b.totalAmount), 0),
      totalAllocated: budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0),
      totalSpent: budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0),
      budgetCount: budgets.length,
      byStatus: {} as Record<string, number>,
    };

    // Count by status
    budgets.forEach((b) => {
      summary.byStatus[b.status] = (summary.byStatus[b.status] || 0) + 1;
    });

    return summary;
  }

  async getAvailableYears() {
    const result = await this.prisma.budget.findMany({
      select: { fiscalYear: true },
      distinct: ['fiscalYear'],
      orderBy: { fiscalYear: 'desc' },
    });

    return result.map((r) => r.fiscalYear);
  }

  async getAllocations(budgetId: string) {
    await this.findOne(budgetId); // Ensure budget exists

    return this.prisma.budgetAllocation.findMany({
      where: { budgetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAllocation(budgetId: string, dto: any, userId: string) {
    const budget = await this.findOne(budgetId);

    return this.prisma.budgetAllocation.create({
      data: {
        ...dto,
        budgetId,
      },
    });
  }

  private async generateBudgetCode(year: number, quarter?: number): Promise<string> {
    const prefix = quarter ? `BUD-${year}-Q${quarter}` : `BUD-${year}`;
    const count = await this.prisma.budget.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
}
```

### 5.4 Budget DTOs

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/modules/budgets/dto/create-budget.dto.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { IsString, IsInt, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @ApiProperty({ example: 'Q1 2024 Marketing Budget' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2030)
  fiscalYear: number;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @ApiProperty({ example: 1000000000, description: 'Total amount in VND' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  endDate: string;
}
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/modules/budgets/dto/update-budget.dto.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { PartialType } from '@nestjs/swagger';
import { CreateBudgetDto } from './create-budget.dto';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/modules/budgets/dto/budget-query.dto.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export class BudgetQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: BudgetStatus })
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
```

---

## 🚀 PHASE 6: AUTH MODULE

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/modules/auth/auth.module.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/modules/auth/strategies/jwt.strategy.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

---

## 🚀 PHASE 7: DOCKER SETUP

```yaml
# ═══════════════════════════════════════════════════════════════════════════════
# FILE: docker-compose.yml
# ═══════════════════════════════════════════════════════════════════════════════

version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/promo_master?schema=public
      - REDIS_URL=redis://redis:6379
      - JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
      - JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run start:dev

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=promo_master
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

```dockerfile
# ═══════════════════════════════════════════════════════════════════════════════
# FILE: Dockerfile
# ═══════════════════════════════════════════════════════════════════════════════

# Development stage
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "start:dev"]

# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
```

---

## 🚀 PHASE 8: CONFIGURATION FILES

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: .env.example
// ═══════════════════════════════════════════════════════════════════════════════

# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/promo_master?schema=public"

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# File Storage (S3/MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=vierp-files-tpm
```

```json
// ═══════════════════════════════════════════════════════════════════════════════
// FILE: tsconfig.json
// ═══════════════════════════════════════════════════════════════════════════════

{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## ✅ CHECKLIST

```
PHASE 1: PROJECT INITIALIZATION
[ ] Create apps/api-nestjs directory
[ ] Initialize NestJS project
[ ] Install all dependencies
[ ] Initialize Prisma

PHASE 2: DIRECTORY STRUCTURE
[ ] Create src/common directories
[ ] Create all 37 module directories
[ ] Create standard files in each module

PHASE 3: CORE FILES
[ ] main.ts with Swagger setup
[ ] app.module.ts with all imports
[ ] database.module.ts + prisma.service.ts

PHASE 4: COMMON UTILITIES
[ ] Transform interceptor (response format)
[ ] Exception filter (error format)
[ ] JWT auth guard
[ ] Roles guard
[ ] Decorators (Public, Roles, CurrentUser)
[ ] Pagination DTOs

PHASE 5: SAMPLE MODULE (BUDGETS)
[ ] budgets.module.ts
[ ] budgets.controller.ts (all endpoints)
[ ] budgets.service.ts (all methods)
[ ] DTOs (create, update, query)

PHASE 6: AUTH MODULE
[ ] auth.module.ts
[ ] JWT strategy
[ ] Auth controller (login, refresh, me)

PHASE 7: DOCKER SETUP
[ ] docker-compose.yml
[ ] Dockerfile (multi-stage)

PHASE 8: CONFIGURATION
[ ] .env.example
[ ] tsconfig.json

PHASE 9: COPY PRISMA SCHEMA
[ ] Copy from existing vierp-tpm-web
[ ] Run prisma generate
[ ] Run prisma migrate

FINAL VERIFICATION
[ ] npm run start:dev works
[ ] Swagger docs accessible at /api/docs
[ ] Database connection successful
[ ] All modules imported without errors
```

---
# END OF CODER PACK
