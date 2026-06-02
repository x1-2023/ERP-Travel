# Developer Guide - Trade Promotion Management System

This guide covers development setup, architecture, and best practices for the TPM system.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Database](#database)
7. [Testing](#testing)
8. [Code Standards](#code-standards)
9. [Debugging](#debugging)
10. [Contributing](#contributing)

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| pnpm | 8.x | Package manager |
| Docker | 24.x | Containers |
| Git | 2.x | Version control |
| VS Code | Latest | Recommended IDE |

### Quick Start

```bash
# Clone repository
git clone https://github.com/company/vierp-tpm-web.git
cd vierp-tpm-web

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start database
docker compose up -d postgres redis

# Run database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Start development servers
pnpm dev
```

### Environment Variables

Create `.env.local` in project root:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/tpm_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="your-development-secret-min-32-chars"
JWT_EXPIRES_IN="1d"

# API
API_PORT=3001
API_BASE_URL="http://localhost:3001"

# Frontend
VITE_API_URL="http://localhost:3001/api"

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_DEBUG_TOOLS=true
```

### VS Code Setup

Recommended extensions (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright"
  ]
}
```

Workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Project Structure

```
vierp-tpm-web/
├── apps/
│   ├── web/                 # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── features/    # Feature modules
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and helpers
│   │   │   ├── stores/      # Zustand state stores
│   │   │   ├── pages/       # Route pages
│   │   │   └── types/       # TypeScript types
│   │   ├── e2e/             # Playwright E2E tests
│   │   └── __tests__/       # Unit tests
│   │
│   └── api/                 # Backend (Express/Hono)
│       ├── src/
│       │   ├── api/         # Route handlers
│       │   ├── middleware/  # Express middleware
│       │   ├── services/    # Business logic
│       │   ├── lib/         # Utilities
│       │   └── types/       # TypeScript types
│       └── __tests__/       # API tests
│
├── packages/
│   ├── database/            # Prisma schema and migrations
│   ├── shared/              # Shared types and utilities
│   └── config/              # Shared configurations
│
├── docs/                    # Documentation
├── docker/                  # Docker configurations
└── .github/                 # GitHub Actions workflows
```

### Monorepo Structure

This project uses **pnpm workspaces** for monorepo management.

Workspace configuration (`pnpm-workspace.yaml`):

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Run commands across workspaces:

```bash
# All workspaces
pnpm -r build

# Specific workspace
pnpm --filter web dev
pnpm --filter api dev

# Multiple workspaces
pnpm --filter "./apps/*" dev
```

---

## Development Workflow

### Branch Strategy

```
main (production)
  └── develop (staging)
        ├── feature/TPM-123-add-claim-export
        ├── bugfix/TPM-456-fix-calculation
        └── hotfix/TPM-789-critical-fix
```

### Creating a Feature

```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/TPM-123-description

# Make changes and commit
git add .
git commit -m "feat(claims): add export to Excel functionality

Implement Excel export for claims list with filters.

Refs: TPM-123"

# Push and create PR
git push -u origin feature/TPM-123-description
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### Pull Request Process

1. Create PR from feature branch to `develop`
2. Fill out PR template
3. Wait for CI checks to pass
4. Request review from CODEOWNERS
5. Address review feedback
6. Merge when approved

---

## Frontend Development

### Tech Stack

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| TypeScript 5 | Type safety |
| Vite 5 | Build tool |
| TanStack Query | Server state |
| Zustand | Client state |
| React Hook Form | Form handling |
| Zod | Validation |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |

### Component Structure

```
components/
├── ui/                    # shadcn/ui primitives
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── common/                # Shared components
│   ├── DataTable.tsx
│   ├── PageHeader.tsx
│   └── LoadingSpinner.tsx
└── features/              # Feature-specific components
    ├── promotions/
    │   ├── PromotionCard.tsx
    │   └── PromotionForm.tsx
    └── claims/
        └── ClaimForm.tsx
```

### Creating Components

```tsx
// components/features/promotions/PromotionCard.tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Promotion } from '@/types';

interface PromotionCardProps {
  promotion: Promotion;
  onSelect?: (id: string) => void;
}

export function PromotionCard({ promotion, onSelect }: PromotionCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect?.(promotion.id)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">{promotion.name}</h3>
          <Badge variant={getStatusVariant(promotion.status)}>
            {promotion.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {promotion.description}
        </p>
      </CardContent>
    </Card>
  );
}
```

### State Management

**Server State (TanStack Query)**:

```tsx
// hooks/usePromotions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePromotions(filters?: PromotionFilters) {
  return useQuery({
    queryKey: ['promotions', filters],
    queryFn: () => api.promotions.list(filters),
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.promotions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}
```

**Client State (Zustand)**:

```tsx
// stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeModal: string | null;
  openModal: (name: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  activeModal: null,
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
}));
```

### Form Handling

```tsx
// features/promotions/PromotionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const promotionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  code: z.string().regex(/^[A-Z0-9-]+$/, 'Invalid code format'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.number().positive('Budget must be positive'),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

export function PromotionForm({ onSubmit }: { onSubmit: (data: PromotionFormData) => void }) {
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: '',
      code: '',
      budget: 0,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Backend Development

### Tech Stack

| Library | Purpose |
|---------|---------|
| Express/Hono | HTTP framework |
| TypeScript 5 | Type safety |
| Prisma | Database ORM |
| Zod | Validation |
| Pino | Logging |
| rate-limiter-flexible | Rate limiting |
| helmet | Security headers |

### API Route Structure

```
api/
├── auth/
│   ├── route.ts          # POST /api/auth/login, etc.
│   └── handlers.ts       # Handler functions
├── promotions/
│   ├── route.ts          # CRUD routes
│   ├── handlers.ts
│   └── validators.ts     # Zod schemas
├── claims/
│   ├── route.ts
│   ├── handlers.ts
│   └── validators.ts
└── health/
    └── route.ts          # Health checks
```

### Creating API Endpoints

```typescript
// api/promotions/route.ts
import { Router } from 'express';
import { rateLimit } from '@/middleware/rateLimit';
import { authenticate, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { promotionSchema, updatePromotionSchema } from './validators';
import * as handlers from './handlers';

const router = Router();

router.use(authenticate);

router.get('/',
  authorize('promotions:read'),
  handlers.list
);

router.get('/:id',
  authorize('promotions:read'),
  handlers.getById
);

router.post('/',
  authorize('promotions:create'),
  validate(promotionSchema),
  handlers.create
);

router.put('/:id',
  authorize('promotions:update'),
  validate(updatePromotionSchema),
  handlers.update
);

router.delete('/:id',
  authorize('promotions:delete'),
  handlers.remove
);

export default router;
```

### Handler Implementation

```typescript
// api/promotions/handlers.ts
import type { Request, Response, NextFunction } from 'express';
import { promotionService } from '@/services/promotions';
import { logger } from '@/middleware/logging';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 20, status, region } = req.query;

    const result = await promotionService.list({
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      region: region as string,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const promotion = await promotionService.create({
      ...req.body,
      createdBy: req.user.id,
    });

    logger.info({ promotionId: promotion.id }, 'Promotion created');

    res.status(201).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
}
```

### Service Layer

```typescript
// services/promotions.ts
import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { CreatePromotionInput, UpdatePromotionInput } from './types';

export const promotionService = {
  async list(params: ListParams) {
    const { page, limit, status, region, userId } = params;

    const where = {
      ...(status && { status }),
      ...(region && { region }),
    };

    const [items, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.promotion.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async create(input: CreatePromotionInput) {
    // Validate business rules
    await this.validateDateRange(input.startDate, input.endDate);
    await this.validateBudget(input.budget, input.region);

    return prisma.promotion.create({
      data: input,
    });
  },

  async validateDateRange(start: Date, end: Date) {
    if (end <= start) {
      throw new ValidationError('End date must be after start date');
    }
  },

  async validateBudget(budget: number, region: string) {
    const available = await this.getAvailableBudget(region);
    if (budget > available) {
      throw new ValidationError('Budget exceeds available balance');
    }
  },
};
```

---

## Database

### Prisma Schema

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(SALES_REP)
  status    UserStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  promotions Promotion[]
  claims     Claim[]

  @@index([email])
  @@index([role])
}

model Promotion {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String?
  type        PromotionType
  status      PromotionStatus @default(DRAFT)
  startDate   DateTime
  endDate     DateTime
  budget      Decimal  @db.Decimal(15, 2)
  region      String
  channel     String?

  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  claims      Claim[]
  accruals    Accrual[]

  @@index([status])
  @@index([region])
  @@index([startDate, endDate])
}
```

### Migrations

```bash
# Create migration
pnpm db:migrate:dev --name add_promotion_type

# Apply migrations
pnpm db:migrate

# Reset database (dev only)
pnpm db:reset

# Generate client
pnpm db:generate
```

### Seeding

```typescript
// packages/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create sample promotions
  await prisma.promotion.createMany({
    data: [
      {
        code: 'PROMO-2024-001',
        name: 'Q1 Sales Boost',
        type: 'DISCOUNT',
        status: 'ACTIVE',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        budget: 100000000,
        region: 'MB',
        createdById: adminUser.id,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Testing

### Unit Tests (Vitest)

```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

Example test:

```typescript
// __tests__/lib/validators.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validateTaxCode } from '@/lib/validators';

describe('validateEmail', () => {
  it('should accept valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validateTaxCode', () => {
  it('should accept 10-digit tax code', () => {
    expect(validateTaxCode('0123456789')).toBe(true);
  });

  it('should accept 13-digit tax code', () => {
    expect(validateTaxCode('0123456789-001')).toBe(true);
  });
});
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# UI mode
pnpm test:e2e:ui

# Specific file
pnpm test:e2e e2e/promotions.spec.ts
```

Example E2E test:

```typescript
// e2e/promotions.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Promotions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new promotion', async ({ page }) => {
    await page.click('text=Promotions');
    await page.click('text=Create New');

    await page.fill('[name="name"]', 'Test Promotion');
    await page.fill('[name="code"]', 'TEST-001');
    await page.fill('[name="budget"]', '1000000');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Promotion created')).toBeVisible();
  });
});
```

---

## Code Standards

### TypeScript

- Enable strict mode
- No `any` types (use `unknown` if needed)
- Prefer interfaces over types for objects
- Export types from dedicated files

### ESLint

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Debugging

### Frontend

```typescript
// Enable React Query devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In App.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

### Backend

```typescript
// Debug logging
import { logger } from '@/middleware/logging';

logger.debug({ data }, 'Processing request');
logger.info({ result }, 'Operation completed');
logger.error({ error }, 'Operation failed');
```

### VS Code Launch Config

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter", "api", "dev"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run linting and tests
5. Submit pull request

### Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Types check (`pnpm typecheck`)
- [ ] PR template filled out
- [ ] Documentation updated if needed
