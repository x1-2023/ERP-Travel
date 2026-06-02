# TÀI LIỆU BÀN GIAO DỰ ÁN PROMO MASTER V2

**Ngày tạo:** 2026-02-05
**Cập nhật lần cuối:** 2026-02-10
**Phiên bản:** 3.0
**Dự án:** PROMO MASTER V2 - Trade Promotion Management System (Aforza-style)

---

## MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Production Deployment (Render)](#3-production-deployment-render)
4. [Phase 5: Budget & Target Integration](#4-phase-5-budget--target-integration)
5. [API Endpoints](#5-api-endpoints)
6. [Frontend Hooks & Components](#6-frontend-hooks--components)
7. [Cơ Sở Dữ Liệu](#7-cơ-sở-dữ-liệu)
8. [Hướng Dẫn Phát Triển](#8-hướng-dẫn-phát-triển)
9. [Pending Tasks](#9-pending-tasks)

---

## 1. TỔNG QUAN

### 1.1 Mô Tả Dự Án

**PROMO MASTER V2** là phiên bản nâng cấp của hệ thống quản lý khuyến mại thương mại, được thiết kế theo best practices của **Aforza TPM** với các tính năng enterprise-grade:

- Multi-level approval workflow
- Fund Health Score calculation
- Hierarchical Geographic allocation (Country → Region → Province → District → Dealer)
- Activity-Fund ROI tracking
- Period-over-period comparison

### 1.2 Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  React 18 | Vite | TailwindCSS v4 | TanStack Query         │
│  MSW (Mock Service Worker) for dev mode                     │
└─────────────────────────────────────────────────────────────┘
                              ↓ REST API
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Dual API)                        │
│  Production: NestJS (apps/api-nestjs) on Render             │
│  Legacy:     Vercel Functions (apps/api)                    │
│  Prisma 5 | JWT Auth | 101 models | 257 endpoints          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                              │
│     PostgreSQL (Render) | Prisma ORM | 89 enums             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Monorepo Structure

```
vierp-tpm-web/
├── apps/
│   ├── api/                    # Vercel Serverless Functions (legacy)
│   ├── api-nestjs/             # NestJS API (production on Render)
│   │   ├── src/
│   │   │   ├── main.ts         # Auto-migrate + seed on startup
│   │   │   ├── modules/        # 37 NestJS modules
│   │   │   │   ├── auth/       # JWT login/refresh/logout
│   │   │   │   ├── budgets/
│   │   │   │   ├── promotions/
│   │   │   │   └── ...
│   │   │   └── common/         # Guards, filters, interceptors
│   │   └── prisma/
│   │       ├── schema.prisma   # 101 models, 89 enums
│   │       └── seed/           # Seed data scripts
│   │
│   └── web/                    # React + Vite Frontend
│       ├── public/logo.png     # Brand logo
│       └── src/
│           ├── pages/          # Lazy-loaded route pages
│           ├── components/     # UI components
│           ├── hooks/          # React Query hooks
│           ├── stores/         # Zustand stores
│           ├── mocks/          # MSW handlers (dev mode)
│           └── lib/api.ts      # Axios client
│
├── render.yaml                 # Render deployment config
└── packages/
    └── shared/                 # Shared types
```

### 1.4 Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://vierp-tpm.onrender.com |
| API | https://vierp-tpm-api.onrender.com/api |
| Swagger Docs | https://vierp-tpm-api.onrender.com/api/docs |
| Health Check | https://vierp-tpm-api.onrender.com/api/health |

### 1.5 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@your-domain.com | admin123 |
| Manager | manager@your-domain.com | admin123 |
| KAM | kam1@your-domain.com | admin123 |
| Finance | finance@your-domain.com | admin123 |

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Approval Workflow (Aforza-style)

```
┌──────────────────────────────────────────────────────────────┐
│                 MULTI-LEVEL APPROVAL WORKFLOW                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Amount Threshold    │  Approval Levels                      │
│  ────────────────────┼─────────────────────────────────────  │
│  < 100M VND          │  KAM only                             │
│  100M - 500M VND     │  KAM → Trade Marketing                │
│  > 500M VND          │  KAM → Trade Marketing → Finance      │
│                                                              │
│  Status Flow:                                                │
│  DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED       │
│                        ↓                                     │
│                   REVISION_NEEDED                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Fund Health Score (4 Dimensions)

```
┌──────────────────────────────────────────────────────────────┐
│                    FUND HEALTH SCORE                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Dimension       │  Weight │  Calculation                    │
│  ────────────────┼─────────┼───────────────────────────────  │
│  Utilization     │   35%   │  (spent/allocated) optimal 80%  │
│  Timeliness      │   25%   │  Expected vs Actual burn rate   │
│  ROI             │   25%   │  Revenue generated / Spent      │
│  Coverage        │   15%   │  Active allocations %           │
│                                                              │
│  Score Levels:                                               │
│  ≥85 = EXCELLENT │ ≥70 = GOOD │ ≥50 = WARNING │ <50 = CRITICAL│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Geographic Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                  VIETNAM GEOGRAPHIC HIERARCHY                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  COUNTRY (VN)                                                │
│     └── REGION (Miền Bắc, Miền Trung, Miền Nam, Tây Nguyên)  │
│            └── PROVINCE (63 tỉnh/thành)                      │
│                  └── DISTRICT (Quận/Huyện)                   │
│                        └── DEALER (Đại lý)                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. PRODUCTION DEPLOYMENT (RENDER)

### 3.1 Architecture

```
render.yaml defines 2 services + 1 database:

┌─────────────────────────────────────────────────────────────┐
│  vierp-tpm-web (Frontend)                                 │
│  rootDir: apps/web                                          │
│  Build: npm install && npm run build                        │
│  Start: node server.cjs                                     │
│  Env: VITE_API_URL=https://vierp-tpm-api.onrender.com/api│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  vierp-tpm-api (NestJS Backend)                          │
│  rootDir: apps/api-nestjs                                   │
│  Build: npm install && prisma generate && npm run build     │
│  Start: node dist/src/main                                  │
│  Auto: prisma db push + seed on startup (main.ts)           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  vierp-tpm-db (PostgreSQL)                               │
│  Plan: free                                                 │
│  Auto-connected via DATABASE_URL                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Auto-Migration & Seed (main.ts)

NestJS `main.ts` runs before app bootstrap:
1. `prisma db push --skip-generate --accept-data-loss` → creates/syncs all 101 tables
2. Checks `user.count()` → if 0, seeds company + 4 users with bcrypt-hashed passwords
3. Idempotent: safe to run on every server start

### 3.3 API Response Format

All responses are wrapped by `TransformInterceptor`:
```json
// Success
{ "success": true, "data": { ... }, "meta": { "timestamp": "...", "requestId": "..." } }

// Error (AllExceptionsFilter)
{ "success": false, "error": { "code": "...", "message": "..." }, "meta": { ... } }
```

### 3.4 Key Config Notes

- `render.yaml` is a reference file. Render services may be configured via dashboard.
- NestJS global prefix: `api` → all routes at `/api/*`
- CORS: configured for `https://vierp-tpm.onrender.com`
- JWT secrets: auto-generated by Render via `generateValue: true`

---

## 4. PHASE 5: BUDGET & TARGET INTEGRATION

### 3.1 Completed Tasks

| Task | Status | Description |
|------|--------|-------------|
| Budget API Enhancement | ✅ | CRUD + Approval workflow |
| Budget Submit/Review | ✅ | Multi-level approval |
| Approval History | ✅ | Audit trail |
| Fund Health Score | ✅ | 4-dimension calculation |
| Budget Comparison | ✅ | Period-over-period |
| Target Allocation APIs | ✅ | Hierarchical allocation tree |
| Target Progress | ✅ | Progress by geographic level |
| Fund Activity APIs | ✅ | Activity-Fund linking + ROI |
| Frontend Hooks | ✅ | All React Query hooks |
| UI Components | ✅ | Health Score, Comparison, ROI Dashboard |
| Seed Data | ✅ | Geographic + Demo data |

### 3.2 API Files Created

```
apps/api/
├── budgets/
│   ├── index.ts              # GET list, POST create
│   ├── [id].ts               # GET/PUT/DELETE single
│   ├── [id]/
│   │   ├── submit.ts         # POST - Submit for approval
│   │   ├── review.ts         # POST - Approve/Reject
│   │   ├── approval-history.ts # GET - Audit trail
│   │   ├── health-score.ts   # GET - Fund health
│   │   └── comparison.ts     # GET - Period comparison
│
├── targets/
│   ├── [id]/
│   │   ├── progress.ts       # GET - Progress by level
│   │   ├── allocation.ts     # GET tree, POST create
│   │   └── allocation/
│   │       └── [allocId].ts  # GET/PUT/DELETE allocation
│
└── fund-activities/
    ├── index.ts              # GET list, POST create
    ├── [id].ts               # GET/PUT/DELETE single
    └── summary.ts            # GET - ROI summary
```

### 3.3 Frontend Files Created/Modified

```
apps/web/src/
├── hooks/
│   ├── useBudgets.ts         # + Approval, Health, Comparison
│   ├── useTargets.ts         # + Progress, Allocation nested
│   └── useFundActivities.ts  # NEW - Activity hooks
│
├── components/budget/
│   ├── FundHealthScore.tsx   # Health gauge component
│   ├── BudgetComparison.tsx  # Period comparison chart
│   ├── FundActivityROI.tsx   # ROI Dashboard
│   └── index.ts              # Exports
│
└── pages/
    ├── budget/
    │   ├── Approval.tsx      # Wired to real APIs
    │   └── Allocation.tsx    # Wired to real APIs
    └── targets/
        └── TargetAllocation.tsx # Wired with dialogs
```

---

## 5. API ENDPOINTS

### 4.1 Budget APIs

```
# CRUD
GET    /budgets                    # List with pagination
POST   /budgets                    # Create budget
GET    /budgets/:id                # Get single (with comparison)
PUT    /budgets/:id                # Update budget
DELETE /budgets/:id                # Delete budget

# Approval Workflow
POST   /budgets/:id/submit         # Submit for approval
POST   /budgets/:id/review         # Approve/Reject/Revision

# Analytics
GET    /budgets/:id/approval-history # Audit trail
GET    /budgets/:id/health-score     # Fund health calculation
GET    /budgets/:id/comparison       # Period comparison
```

### 4.2 Target APIs

```
# CRUD
GET    /targets                    # List targets
POST   /targets                    # Create target
GET    /targets/:id                # Get single
PUT    /targets/:id                # Update
DELETE /targets/:id                # Delete

# Allocations (Nested Routes)
GET    /targets/:id/allocation     # Get allocation tree + summary
POST   /targets/:id/allocation     # Create allocation
GET    /targets/:id/allocation/:allocId  # Get single allocation
PUT    /targets/:id/allocation/:allocId  # Update allocation
DELETE /targets/:id/allocation/:allocId  # Delete allocation

# Progress
GET    /targets/:id/progress       # Progress by geographic level
```

### 4.3 Fund Activity APIs

```
GET    /fund-activities            # List with filtering
POST   /fund-activities            # Create activity
GET    /fund-activities/:id        # Get single
PUT    /fund-activities/:id        # Update (spent, revenue, status)
DELETE /fund-activities/:id        # Delete (PLANNED only)
GET    /fund-activities/summary    # ROI analysis summary
```

---

## 6. FRONTEND HOOKS & COMPONENTS

### 5.1 Budget Hooks (`useBudgets.ts`)

```typescript
// Basic CRUD
useBudgets(params)                 // List budgets
useBudget(id)                      // Get single
useCreateBudget()                  // Create mutation
useUpdateBudget()                  // Update mutation
useDeleteBudget()                  // Delete mutation

// Approval Workflow
useSubmitBudget()                  // Submit for approval
useReviewBudget()                  // Approve/Reject/Revision
useApprovalHistory(budgetId)       // Audit trail

// Analytics
useFundHealthScore(budgetId)       // Health score data
useBudgetComparison(budgetId)      // Period comparison data
```

### 5.2 Target Hooks (`useTargets.ts`)

```typescript
// Basic CRUD
useTargets(params)                 // List targets
useTarget(id)                      // Get single

// Progress
useTargetProgress(targetId)        // Progress by level
useTargetAllocationTreeWithSummary(targetId)

// Allocations (Nested)
useCreateTargetAllocationNested(targetId)
useUpdateTargetAllocationNested(targetId)
useDeleteTargetAllocationNested(targetId)
useUpdateTargetProgress()          // Update achieved value
```

### 5.3 Fund Activity Hooks (`useFundActivities.ts`)

```typescript
useFundActivities(params)          // List activities
useFundActivity(id)                // Get single
useFundActivitySummary(budgetId?)  // ROI analysis
useCreateFundActivity()            // Create
useUpdateFundActivity()            // Update
useDeleteFundActivity()            // Delete
```

### 5.4 Components

| Component | Description |
|-----------|-------------|
| `FundHealthScore` | Circular gauge with 4-dimension breakdown |
| `BudgetComparison` | Period comparison with trending chart |
| `FundActivityROI` | ROI Dashboard with activity list |

---

## 7. CƠ SỞ DỮ LIỆU

### 6.1 Key Models Added in Phase 5

```prisma
// Budget Approval Workflow
model BudgetApproval {
  id            String   @id @default(cuid())
  budgetId      String
  step          Int
  level         Int
  role          String
  status        BudgetApprovalStatus
  reviewerId    String?
  comments      String?
  submittedAt   DateTime
  reviewedAt    DateTime?
}

// Fund Activity (ROI Tracking)
model FundActivity {
  id               String   @id @default(cuid())
  budgetId         String
  activityType     String   // promotion, display, sampling, event, listing_fee
  activityName     String
  allocatedAmount  Decimal
  spentAmount      Decimal
  revenueGenerated Decimal?
  roi              Decimal? // Calculated: revenue/spent
  status           String   // PLANNED, ACTIVE, COMPLETED, CANCELLED
}

// Enhanced Budget
model Budget {
  // ... existing fields
  fundType        BudgetFundType     // PROMOTIONAL, TACTICAL, etc.
  approvalStatus  BudgetApprovalStatus
  approvalLevel   Int
  minApproval     Decimal?
  maxApproval     Decimal?
}
```

### 6.2 Seed Data

Run seed to populate demo data:

```bash
cd apps/api
npm run db:seed
```

**Creates:**
- Vietnam geographic hierarchy (Country → Region → Province → District → Dealer)
- 4 sample budgets with allocations
- 3 sample targets with allocations
- 6 fund activities with ROI data

---

## 8. HƯỚNG DẪN PHÁT TRIỂN

### 8.1 Quick Start (Local Dev with MSW)

```bash
# 1. Clone & Install
cd vierp-tpm-web
npm install

# 2. Start Frontend (MSW mock mode - no backend needed)
cd apps/web
npm run dev
# → http://localhost:5173 (MSW intercepts all API calls)
```

### 8.2 Quick Start (Local Dev with Real Backend)

```bash
# 1. Setup Database
cd apps/api-nestjs
cp .env.example .env  # Set DATABASE_URL
npx prisma db push
npx prisma db seed

# 2. Start NestJS API
npm run start:dev  # → http://localhost:3000/api

# 3. Start Frontend (separate terminal)
cd apps/web
VITE_API_URL=http://localhost:3000/api npm run dev
```

### 8.3 Environment Variables

**API NestJS (.env)**
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3000
```

**Web (.env.development)**
```
VITE_API_URL=/api
VITE_ENABLE_MSW=true      # Enable mock service worker
VITE_APP_NAME=PROMO MASTER
```

### 8.4 Development URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| NestJS API | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |
| Prisma Studio | npx prisma studio |

---

## 9. PENDING TASKS

### 8.1 Days 9-10: E2E Testing & Polish

| Task | Priority | Estimate |
|------|----------|----------|
| E2E Tests for Budget Approval | High | 1 day |
| E2E Tests for Target Allocation | High | 0.5 day |
| UI Polish & Error Handling | Medium | 0.5 day |
| Performance Optimization | Low | As needed |

### 8.2 Future Enhancements

- [ ] Bulk allocation import/export
- [ ] Allocation templates
- [ ] Advanced filtering on allocation pages
- [ ] Real-time notifications for approval
- [ ] Dashboard widgets for health scores
- [ ] Mobile-responsive allocation views

---

**Tài liệu này được tạo bởi Claude Code.**
**Cập nhật lần cuối:** 2026-02-10

**Repository:** https://github.com/nclamvn/vierp-tpm-web
