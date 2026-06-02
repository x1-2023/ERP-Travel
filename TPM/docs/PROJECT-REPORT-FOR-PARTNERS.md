# BÁO CÁO TOÀN DIỆN DỰ ÁN PROMO MASTER
## Hệ Thống Quản Lý Khuyến Mãi Thương Mại (Trade Promotion Management - TPM)

**Ngày lập:** 27/01/2026
**Phiên bản:** 2.0
**Trạng thái:** Production-Ready với Mock Data

---

## MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Công Nghệ Sử Dụng](#3-công-nghệ-sử-dụng)
4. [Tính Năng Đã Triển Khai](#4-tính-năng-đã-triển-khai)
5. [Cấu Trúc Database](#5-cấu-trúc-database)
6. [API Endpoints](#6-api-endpoints)
7. [Giao Diện Người Dùng](#7-giao-diện-người-dùng)
8. [Hiện Trạng Dự Án](#8-hiện-trạng-dự-án)
9. [Kế Hoạch Phát Triển](#9-kế-hoạch-phát-triển)
10. [Hướng Dẫn Triển Khai](#10-hướng-dẫn-triển-khai)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Giới Thiệu

**Promo Master** là hệ thống quản lý khuyến mãi thương mại (TPM) toàn diện, được thiết kế dành cho các doanh nghiệp FMCG (Fast-Moving Consumer Goods). Hệ thống hỗ trợ quản lý toàn bộ vòng đời khuyến mãi từ lập kế hoạch, thực thi, đến thanh toán và phân tích hiệu quả.

### 1.2 Quy Mô Dự Án

| Chỉ số | Giá trị |
|--------|---------|
| **Tổng số dòng code** | ~72,700 LOC TypeScript |
| **Frontend** | 54,086 LOC |
| **Backend** | 18,614 LOC |
| **Số trang UI** | 60+ pages |
| **API Endpoints** | 80+ endpoints |
| **Database Models** | 45+ entities |
| **Test Files** | 16 unit + 11 E2E suites |

### 1.3 Cấu Trúc Monorepo

```
vierp-tpm-web/
├── apps/
│   ├── web/           # Frontend React 19 + Vite
│   └── api/           # Backend Node.js + Prisma
├── packages/
│   └── shared/        # Shared TypeScript utilities
├── docs/              # Documentation
├── docker/            # Docker configuration
└── .github/           # CI/CD workflows
```

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   React 19   │  │  React Query │  │      Zustand         │   │
│  │   + Router   │  │  (API Cache) │  │   (Local State)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Tailwind CSS + shadcn/ui Components           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      Express.js / Vercel Serverless Functions            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │  Auth   │  │  CORS   │  │  Rate   │  │  Audit  │     │   │
│  │  │Middleware│  │ Handler │  │ Limiter │  │ Logger  │     │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                             │   │
│  │  - Type-safe database queries                             │   │
│  │  - Automatic migrations                                   │   │
│  │  - Connection pooling                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL (Neon Serverless)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │    ERP     │  │    DMS     │  │   S3/AWS   │                 │
│  │ Integration│  │ Integration│  │  Storage   │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │  Webhooks  │  │  Power BI  │  │  AI/ML     │                 │
│  │   Events   │  │  Reports   │  │  Engine    │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Flow Xử Lý Request

```
User Action → React Component → React Query Hook → Axios API Call
                                                        │
                    ┌───────────────────────────────────┘
                    ▼
            MSW (Mock) ←──── Development Mode
                    │
                    ▼
            Express Router → Controller → Service → Prisma → PostgreSQL
                    │
                    ▼
            Response → React Query Cache → UI Update
```

---

## 3. CÔNG NGHỆ SỬ DỤNG

### 3.1 Frontend Stack

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **React** | 19.2.0 | UI Library với Concurrent Rendering |
| **TypeScript** | 5.9 | Type Safety |
| **Vite** | 7.2 | Build Tool & Dev Server |
| **Tailwind CSS** | 4.1 | Styling Framework |
| **shadcn/ui** | Latest | Component Library (Radix-based) |
| **React Router** | 7.13 | Client-side Routing |
| **Zustand** | 5.0 | Client State Management |
| **TanStack Query** | 5.90 | Server State & API Caching |
| **React Hook Form** | 7.71 | Form Management |
| **Zod** | 4.3 | Schema Validation |
| **Recharts** | 3.7 | Data Visualization |
| **Axios** | 1.13 | HTTP Client |
| **MSW** | 2.12 | API Mocking |
| **Vitest** | 4.0 | Unit Testing |
| **Playwright** | 1.58 | E2E Testing |

### 3.2 Backend Stack

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Node.js** | 18+ | Runtime Environment |
| **Express.js** | 4.18 | Web Framework |
| **TypeScript** | 5.3 | Type Safety |
| **Prisma** | 5.10 | ORM & Database Toolkit |
| **PostgreSQL** | 15+ | Database (Neon Serverless) |
| **JWT** | 9.0 | Authentication |
| **bcryptjs** | 2.4 | Password Hashing |

### 3.3 DevOps & Tools

| Công nghệ | Mục đích |
|-----------|----------|
| **Turbo** | Monorepo Build Orchestration |
| **Vercel** | Deployment Platform |
| **GitHub Actions** | CI/CD Pipeline |
| **Docker** | Containerization |
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |

---

## 4. TÍNH NĂNG ĐÃ TRIỂN KHAI

### 4.1 Module Quản Lý Khuyến Mãi (Promotions)

#### Vòng đời khuyến mãi
```
DRAFT → PLANNED → CONFIRMED → EXECUTING → COMPLETED
         │
         └──────────→ CANCELLED (có thể hủy ở mọi giai đoạn)
```

#### Tính năng chi tiết
- **Tạo & Quản lý Promotion**: CRUD đầy đủ với validation
- **Loại Promotion**: DISCOUNT, REBATE, DISPLAY, LISTING_FEE, COOP_ADVERTISING, SAMPLING
- **Mechanics**: On-Invoice (FIXED) và Off-Invoice (VARIABLE)
- **Template System**: Tạo template tái sử dụng (SEASONAL, DISPLAY, LISTING, REBATE, CUSTOM)
- **Calendar View**: Xem lịch trình promotion trực quan
- **Phê duyệt phân cấp**: Multi-level approval workflow

### 4.2 Module Quản Lý Tài Chính (Finance)

#### 4.2.1 Accrual Engine (Dồn tích)
- **Loại tính toán**: TIME_BASED, EXECUTION_BASED, CLAIM_BASED, MANUAL
- **Tần suất**: Monthly, Weekly, Daily
- **FiscalPeriod**: OPEN → SOFT_CLOSE → HARD_CLOSE
- **Entry Types**: INITIAL_RESERVE, MONTHLY, ADJUSTMENT, TRUE_UP, REVERSAL, SETTLEMENT

#### 4.2.2 Deduction Management (Quản lý khấu trừ)
- **Nguồn dữ liệu**: ERP_AR, BANK_LOCKBOX, EDI_812, MANUAL, CUSTOMER_PORTAL
- **Auto-matching**: Tự động ghép với promotion/claim
- **Dispute Workflow**: Quy trình tranh chấp và giải quyết
- **Write-off Rules**: Quy tắc xóa nợ với approval

#### 4.2.3 GL Journal Integration
- **Journal Entries**: Debit/Credit tracking
- **Source Types**: ACCRUAL, SETTLEMENT, ADJUSTMENT, REVERSAL, IMPORT
- **ERP Export**: Xuất dữ liệu sang ERP

#### 4.2.4 Cheque Management
- Quản lý chequebook
- Liên kết với claims

### 4.3 Module Claims (Yêu cầu thanh toán)

```
PENDING → MATCHED → APPROVED → SETTLED
              │
              └──→ DISPUTED → REJECTED / SETTLED
```

- **POA/POP Handling**: Upload Proof of Activation / Proof of Performance
- **File Management**: S3-based với categories (POA, POP, INVOICE, CONTRACT, REPORT)
- **Settlement Tracking**: Variance analysis

### 4.4 Module Operations (Vận hành)

#### 4.4.1 Delivery Management
- Quản lý đơn hàng giao
- Tracking trạng thái: Planning → In Transit → Delivered → Returned
- Calendar view
- Timeline visualization

#### 4.4.2 Inventory Tracking
- Real-time inventory snapshots
- Bulk import/export
- Stock alerts
- Multi-location support

#### 4.4.3 Sell-Through Tracking
- **Sell-in**: Bán vào (từ công ty đến đại lý)
- **Sell-out**: Bán ra (từ đại lý đến người tiêu dùng)
- Daily/Weekly/Monthly tracking
- Trend analysis
- Bulk import

### 4.5 Module Planning (Lập kế hoạch)

#### 4.5.1 Scenario Builder
- Tạo kịch bản "what-if"
- Parameters: Duration, Budget, Expected Lift %, Redemption Rate
- ROI Projections với daily breakdown
- Compare multiple scenarios

#### 4.5.2 Clash Detection
- Phát hiện xung đột sản phẩm
- Timeline conflict
- Geographic zone clashes
- Resolution workflow

#### 4.5.3 Template Management
- Template versioning
- Apply templates to promotions

### 4.6 Module AI & Analytics

#### 4.6.1 AI Insights
- Anomaly detection
- Automated insights generation
- Confidence scoring
- Action recommendations

#### 4.6.2 AI Recommendations
- Performance optimization suggestions
- Budget reallocation recommendations
- Accept/Reject workflow

#### 4.6.3 Voice Commands (Placeholder)
- Voice-activated operations
- Speech-to-text ready

### 4.7 Module BI (Business Intelligence)

- **Dashboard Analytics**: KPI cards, trend charts
- **Report Builder**: Custom queries
- **Export Center**: CSV/Excel export
- **Chart Types**: Line, Bar, Area, Pie, Donut
- **Custom Filters**: Multi-dimensional filtering

### 4.8 Module Integration

#### 4.8.1 ERP Integration
- Connection management
- Sync configurations
- Test connections
- Sync logs

#### 4.8.2 DMS Integration
- Distribution channel sync
- Push/Pull data

#### 4.8.3 Webhooks
- Event subscriptions
- Delivery tracking
- Retry mechanism

#### 4.8.4 Security
- API Key management (Create, Revoke)
- Immutable Audit Trail
- Security Dashboard

### 4.9 Budget & Target Allocation

#### Hierarchical Allocation
```
Country (Vietnam)
├── Region (Miền Bắc)
│   ├── Province (Hà Nội)
│   │   ├── District (Hoàn Kiếm)
│   │   │   └── Dealer (Đại lý ABC)
│   │   └── District (Ba Đình)
│   └── Province (Hải Phòng)
├── Region (Miền Trung)
└── Region (Miền Nam)
```

- **Budget Allocation**: Phân bổ ngân sách theo cấp
- **Target Allocation**: Phân bổ chỉ tiêu (Revenue, Volume, Distribution, Coverage)
- **Tree View**: Visualization dạng cây
- **Flow View**: Visualization luồng phân bổ

---

## 5. CẤU TRÚC DATABASE

### 5.1 Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Company   │────<│    User     │     │   Customer  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Fund     │────<│  Promotion  │────<│   Tactic    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Budget    │     │    Claim    │     │ TacticItem  │
│ Allocation  │     └─────────────┘     └─────────────┘
└─────────────┘           │
                          │
                          ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ AccrualEntry│────>│  GLJournal  │
                    └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Deduction  │
                    └─────────────┘
```

### 5.2 Core Domain Models

| Model | Mô tả | Quan hệ chính |
|-------|-------|---------------|
| **User** | Người dùng với roles (ADMIN, MANAGER, KAM, FINANCE) | Company, UserSession, UserMFA |
| **Company** | Đơn vị kinh doanh, hỗ trợ multi-tenancy | Users, Funds, SSOConfig |
| **Customer** | Khách hàng theo kênh (MT, GT, E-commerce, HORECA) | Promotions, Claims |
| **Product** | Sản phẩm với SKU, COGS, Price | TacticItems |
| **Fund** | Ngân sách FIXED/VARIABLE | Promotions, Budgets |

### 5.3 Promotion Models

| Model | Mô tả |
|-------|-------|
| **Promotion** | Chương trình khuyến mãi với lifecycle đầy đủ |
| **Tactic** | Chi tiết cơ chế khuyến mãi |
| **TacticItem** | Sản phẩm trong tactic |
| **PromotionTemplate** | Template tái sử dụng |
| **PromotionClash** | Xung đột giữa các promotion |

### 5.4 Financial Models

| Model | Mô tả |
|-------|-------|
| **FiscalPeriod** | Kỳ tài chính (OPEN, SOFT_CLOSE, HARD_CLOSE) |
| **AccrualEntry** | Bút toán dồn tích |
| **AccrualConfig** | Cấu hình accrual theo company |
| **GLJournal** | Sổ cái tổng hợp |
| **GLJournalLine** | Dòng chi tiết GL (Debit/Credit) |
| **GLAccount** | Tài khoản kế toán |
| **Deduction** | Khấu trừ từ nhiều nguồn |
| **DeductionDispute** | Tranh chấp khấu trừ |
| **WriteOffRule** | Quy tắc xóa nợ |

### 5.5 Operations Models

| Model | Mô tả |
|-------|-------|
| **DeliveryOrder** | Đơn hàng giao |
| **DeliveryLine** | Chi tiết đơn hàng |
| **InventorySnapshot** | Ảnh chụp tồn kho |
| **SellTracking** | Dữ liệu sell-in/sell-out |

### 5.6 Integration & Security Models

| Model | Mô tả |
|-------|-------|
| **ERPConnection** | Kết nối ERP |
| **WebhookSubscription** | Đăng ký webhook |
| **APIKey** | API authentication |
| **ImmutableAuditLog** | Audit trail không thể sửa đổi |
| **SSOConfig** | Cấu hình SSO (Azure AD, Google, Okta) |
| **MFAConfig** | Cấu hình MFA |
| **SOXControl** | Kiểm soát SOX compliance |

---

## 6. API ENDPOINTS

### 6.1 Authentication

```http
POST   /api/auth/login              # Đăng nhập, trả về JWT token
GET    /api/auth/me                 # Lấy thông tin user hiện tại
```

### 6.2 Promotions

```http
GET    /api/promotions              # Danh sách (có pagination, filter)
POST   /api/promotions              # Tạo mới
GET    /api/promotions/:id          # Chi tiết
PATCH  /api/promotions/:id          # Cập nhật
DELETE /api/promotions/:id          # Xóa
GET    /api/promotions/calendar     # Calendar view
```

### 6.3 Claims

```http
GET    /api/claims                  # Danh sách
POST   /api/claims                  # Tạo mới
GET    /api/claims/:id              # Chi tiết
PATCH  /api/claims/:id              # Cập nhật trạng thái
```

### 6.4 Finance - Accruals

```http
GET    /api/finance/accruals                  # Danh sách
POST   /api/finance/accruals/calculate        # Tính toán accruals
POST   /api/finance/accruals/post-batch       # Post hàng loạt
GET    /api/finance/accruals/:id              # Chi tiết
POST   /api/finance/accruals/:id/post         # Post lên GL
POST   /api/finance/accruals/:id/reverse      # Reverse entry
```

### 6.5 Finance - Deductions

```http
GET    /api/finance/deductions                        # Danh sách
POST   /api/finance/deductions                        # Tạo mới
GET    /api/finance/deductions/:id                    # Chi tiết
POST   /api/finance/deductions/:id/match              # Ghép với promotion/claim
POST   /api/finance/deductions/:id/resolve            # Giải quyết dispute
POST   /api/finance/deductions/:id/suggestions        # AI suggestions
PATCH  /api/finance/deductions/:id/dispute            # Mở dispute
```

### 6.6 Finance - GL Journals

```http
GET    /api/finance/journals                  # Danh sách
POST   /api/finance/journals                  # Tạo mới
GET    /api/finance/journals/:id              # Chi tiết
POST   /api/finance/journals/:id/post         # Post
POST   /api/finance/journals/:id/reverse      # Reverse
```

### 6.7 Budgets & Targets

```http
GET    /api/budgets                           # Danh sách ngân sách
POST   /api/budgets                           # Tạo ngân sách
GET    /api/budget-allocations                # Cây phân bổ ngân sách
GET    /api/targets                           # Danh sách targets
POST   /api/targets                           # Tạo target
GET    /api/target-allocations                # Cây phân bổ target
```

### 6.8 Planning

```http
GET    /api/planning/scenarios                # Danh sách scenarios
POST   /api/planning/scenarios                # Tạo scenario
POST   /api/planning/scenarios/:id/run        # Chạy scenario
GET    /api/planning/scenarios/compare        # So sánh scenarios
POST   /api/planning/scenarios/:id/clone      # Clone scenario

GET    /api/planning/templates                # Danh sách templates
POST   /api/planning/templates                # Tạo template
POST   /api/planning/templates/:id/apply      # Apply template

GET    /api/planning/clashes                  # Danh sách xung đột
POST   /api/planning/clash-detection/index    # Phát hiện xung đột
POST   /api/planning/clashes/:id/resolve      # Giải quyết xung đột
```

### 6.9 Operations

```http
# Delivery
GET    /api/operations/delivery               # Danh sách
POST   /api/operations/delivery               # Tạo mới
GET    /api/operations/delivery/calendar      # Calendar view
POST   /api/operations/delivery/:id/status    # Cập nhật trạng thái
GET    /api/operations/delivery/:id/tracking  # Tracking info

# Inventory
GET    /api/operations/inventory              # Danh sách
POST   /api/operations/inventory/import       # Import hàng loạt
GET    /api/operations/inventory/snapshots    # Snapshots
POST   /api/operations/inventory/snapshots-bulk # Bulk snapshot

# Sell Tracking
GET    /api/operations/sell-tracking          # Danh sách
POST   /api/operations/sell-tracking/import   # Import
GET    /api/operations/sell-tracking/sell-in  # Phân tích sell-in
GET    /api/operations/sell-tracking/sell-out # Phân tích sell-out
```

### 6.10 AI & Analytics

```http
# AI Insights
GET    /api/ai/insights                       # Danh sách insights
POST   /api/ai/insights/generate              # Generate insights
POST   /api/ai/insights/:id/action            # Thực hiện action
POST   /api/ai/insights/:id/dismiss           # Dismiss insight

# AI Recommendations
GET    /api/ai/recommendations                # Danh sách
POST   /api/ai/recommendations/generate       # Generate
POST   /api/ai/recommendations/:id/accept     # Accept
POST   /api/ai/recommendations/:id/reject     # Reject

# BI
GET    /api/bi/analytics/dashboard            # Dashboard data
GET    /api/bi/analytics/kpis                 # KPI metrics
GET    /api/bi/analytics/trends               # Trend analysis
GET    /api/bi/reports                        # Danh sách reports
POST   /api/bi/reports/:id/execute            # Execute report
POST   /api/bi/export                         # Export data
```

### 6.11 Integration

```http
# ERP
GET    /api/integration/erp                   # Danh sách connections
POST   /api/integration/erp                   # Tạo connection
POST   /api/integration/erp/:id/sync          # Sync data
POST   /api/integration/erp/:id/test          # Test connection
GET    /api/integration/erp/:id/logs          # Sync logs

# Webhooks
GET    /api/integration/webhooks              # Danh sách
POST   /api/integration/webhooks              # Tạo webhook
POST   /api/integration/webhooks/:id/test     # Test webhook
POST   /api/integration/webhooks/:id/retry    # Retry delivery

# Security
GET    /api/integration/security/api-keys     # Danh sách API keys
POST   /api/integration/security/api-keys     # Tạo API key
DELETE /api/integration/security/api-keys/:id # Revoke key
GET    /api/integration/security/audit-logs   # Audit trail
GET    /api/integration/security/dashboard    # Security overview
```

---

## 7. GIAO DIỆN NGƯỜI DÙNG

### 7.1 Component Library

Sử dụng **shadcn/ui** (built on Radix UI) + custom components:

#### UI Components
- Form controls: Input, Select, Checkbox, Radio, Switch, Textarea
- Dialogs: Dialog, AlertDialog, Popover, Sheet
- Menus: DropdownMenu, CommandMenu
- Data: Table, DataTable với sorting/filtering/pagination
- Feedback: Badge, Toast, Alert, Progress, Skeleton
- Navigation: Tabs, Breadcrumb, Sidebar

#### Feature Components
- **Layout**: DashboardLayout, AuthLayout, Header, Sidebar
- **Charts**: LineChart, BarChart, AreaChart, PieChart
- **Cards**: PromotionCard, ClaimCard, AccrualCard, DeliveryCard, InsightCard, KPICard
- **Filters**: FilterPanel, SearchInput, DateRangePicker
- **Status**: StatusBadge, ConfidenceBadge
- **Tables**: DataTable với export, column visibility

### 7.2 Danh Sách Trang (60+ pages)

#### Core Navigation
| Đường dẫn | Tên trang | Mô tả |
|-----------|-----------|-------|
| `/dashboard` | Dashboard | Trang chủ với KPIs và overview |
| `/calendar` | Calendar | Lịch promotions |
| `/settings` | Settings | Cài đặt hệ thống |

#### Promotions Module
| Đường dẫn | Tên trang |
|-----------|-----------|
| `/promotions` | Danh sách Promotions |
| `/promotions/new` | Tạo Promotion mới |
| `/promotions/:id` | Chi tiết Promotion |
| `/promotions/:id/edit` | Chỉnh sửa Promotion |

#### Claims Module
| Đường dẫn | Tên trang |
|-----------|-----------|
| `/claims` | Danh sách Claims |
| `/claims/new` | Tạo Claim mới |
| `/claims/:id` | Chi tiết Claim |

#### Finance Module
| Đường dẫn | Tên trang |
|-----------|-----------|
| `/finance/accruals` | Danh sách Accruals |
| `/finance/accruals/:id` | Chi tiết Accrual |
| `/finance/accruals/calculate` | Tính toán Accruals |
| `/finance/deductions` | Danh sách Deductions |
| `/finance/deductions/:id` | Chi tiết Deduction |
| `/finance/deductions/matching` | Matching Deductions |
| `/finance/journals` | GL Journals |
| `/finance/journals/:id` | Chi tiết Journal |
| `/finance/cheques` | Danh sách Cheques |
| `/finance/cheques/:id` | Chi tiết Cheque |

#### Master Data Module
| Đường dẫn | Tên trang |
|-----------|-----------|
| `/customers` | Quản lý Khách hàng |
| `/products` | Quản lý Sản phẩm |
| `/budgets` | Quản lý Ngân sách |
| `/targets` | Quản lý Chỉ tiêu |
| `/baselines` | Quản lý Baseline |
| `/budget-allocations` | Phân bổ Ngân sách |
| `/target-allocations` | Phân bổ Chỉ tiêu |

#### Planning Module
| Đường dẫn | Tên trang |
|-----------|-----------|
| `/planning/templates` | Danh sách Templates |
| `/planning/templates/builder` | Template Builder |
| `/planning/templates/:id` | Chi tiết Template |
| `/planning/scenarios` | Danh sách Scenarios |
| `/planning/scenarios/builder` | Scenario Builder |
| `/planning/scenarios/:id` | Chi tiết Scenario |
| `/planning/scenarios/compare` | So sánh Scenarios |
| `/planning/clashes` | Danh sách Clashes |
| `/planning/clashes/:id` | Chi tiết Clash |

#### Operations Module
| Đường dẫn | Tên trang |
|-----------|-----------|
| `/operations/delivery` | Danh sách Delivery |
| `/operations/delivery/new` | Tạo Delivery mới |
| `/operations/delivery/calendar` | Calendar View |
| `/operations/delivery/:id` | Chi tiết Delivery |
| `/operations/inventory` | Danh sách Inventory |
| `/operations/inventory/new` | Tạo Inventory |
| `/operations/inventory/import` | Import Inventory |
| `/operations/inventory/snapshots` | Snapshots |
| `/operations/sell-tracking` | Sell Tracking |
| `/operations/sell-tracking/import` | Import Data |
| `/operations/sell-tracking/sell-in` | Sell-in Analysis |
| `/operations/sell-tracking/sell-out` | Sell-out Analysis |

#### AI & BI Module
| Đường dẫn | Tên trang |
|-----------|-----------|
| `/ai/dashboard` | AI Dashboard |
| `/ai/insights` | AI Insights |
| `/ai/recommendations` | Recommendations |
| `/bi/dashboard` | BI Dashboard |
| `/bi/analytics` | Analytics |
| `/bi/reports` | Reports |
| `/bi/export` | Export Center |
| `/voice/commands` | Voice Commands |

#### Integration Module
| Đường dẫn | Tên trang |
|-----------|-----------|
| `/integration/dashboard` | Integration Overview |
| `/integration/erp` | ERP Connections |
| `/integration/erp/:id` | ERP Detail |
| `/integration/dms` | DMS Connections |
| `/integration/dms/:id` | DMS Detail |
| `/integration/webhooks` | Webhooks |
| `/integration/webhooks/:id` | Webhook Detail |
| `/integration/security` | Security Dashboard |
| `/integration/security/api-keys` | API Keys |
| `/integration/security/audit-logs` | Audit Logs |

---

## 8. HIỆN TRẠNG DỰ ÁN

### 8.1 Tổng Quan Tiến Độ

```
┌────────────────────────────────────────────────────────────────┐
│                    TỔNG QUAN HIỆN TRẠNG                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ████████████████████████████████████████░░░░░░░░  80%        │
│                                                                │
│  ✅ UI/UX: 95% hoàn thành                                      │
│  ✅ Frontend Logic: 90% hoàn thành                             │
│  ✅ API Design: 100% hoàn thành                                │
│  ⚡ Backend Implementation: 70% hoàn thành                     │
│  ⚡ Database: 100% schema, 60% real data                       │
│  🔄 Integration: 40% hoàn thành (mock)                         │
│  🔄 AI/ML: 30% hoàn thành (mock)                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 8.2 Chi Tiết Trạng Thái Từng Module

#### ✅ HOÀN THÀNH (Production-Ready)

| Module | Trạng thái | Chi tiết |
|--------|------------|----------|
| **Authentication** | ✅ 100% | JWT, Roles, MFA-ready, SSO framework |
| **UI/UX System** | ✅ 95% | 60+ pages, responsive, dark/light theme |
| **Promotion Management** | ✅ 90% | Full CRUD, lifecycle, calendar |
| **Claims Processing** | ✅ 90% | Full workflow, POA/POP |
| **Fund Management** | ✅ 85% | Budget tracking, alerts |
| **Accrual Engine** | ✅ 85% | Multi-type calculation, GL posting |
| **Deduction Management** | ✅ 80% | Multi-source, dispute workflow |
| **Operations Tracking** | ✅ 85% | Delivery, Inventory, Sell-tracking |
| **Scenario Planning** | ✅ 80% | Builder, compare, clone |
| **Clash Detection** | ✅ 80% | Detection, resolution |
| **Dashboard & Analytics** | ✅ 85% | KPIs, charts, filters |
| **BI Reports** | ✅ 75% | Report builder, export |
| **Security & Audit** | ✅ 90% | Audit trail, API keys |

#### ⚡ ĐANG PHÁT TRIỂN (Mock Implementation)

| Module | Trạng thái | Công việc còn lại |
|--------|------------|-------------------|
| **Real API Backend** | 70% | Cần kết nối thực với PostgreSQL |
| **ERP Integration** | 40% | Mock only, cần SAP/Oracle connector |
| **DMS Integration** | 40% | Mock only, cần real DMS API |
| **Webhook Delivery** | 50% | Framework ready, cần event queue |
| **File Upload (S3)** | 60% | UI ready, cần AWS S3 setup |

#### 🔄 PLACEHOLDER (Cần Phát Triển Thêm)

| Module | Trạng thái | Yêu cầu |
|--------|------------|---------|
| **AI Insights** | 30% | Cần ML model integration |
| **AI Recommendations** | 30% | Cần ML training data |
| **Voice Commands** | 20% | Cần Speech-to-Text API |
| **Power BI Integration** | 10% | Cần Power BI Embedded setup |
| **Advanced Analytics** | 40% | Cần data warehouse |

### 8.3 Mock Data System (MSW)

Hệ thống hiện đang sử dụng **MSW (Mock Service Worker)** để giả lập API:

```typescript
// Cách hoạt động hiện tại
Frontend Request → MSW Interceptor → Mock Handler → Mock Response
                                          ↓
                              (Dữ liệu từ mock files)
```

**Mock Data Files:**
- `budget-target.ts` - Ngân sách & Chỉ tiêu
- `claims.ts` - Claims & Statistics
- `finance.ts` - Accruals, Deductions, Journals, Cheques
- `master-data.ts` - Users, Customers, Products
- `operations-ai-bi.ts` - Delivery, Inventory, Sell-tracking, AI, BI
- `promotions.ts` - Promotions & Statistics

### 8.4 Testing Coverage

| Loại Test | Số lượng | Coverage |
|-----------|----------|----------|
| **Unit Tests** | 16 test files | ~15% code coverage |
| **E2E Tests** | 11 test suites | Core workflows |
| **Component Tests** | Included in unit | Key components |

---

## 9. KẾ HOẠCH PHÁT TRIỂN

### 9.1 Phase 1: Backend Completion (2-3 tuần)

```
Tuần 1-2:
├── Hoàn thiện API endpoints với PostgreSQL
├── Implement real authentication flow
├── Setup database migrations & seeds
└── Unit tests cho services

Tuần 3:
├── Integration tests
├── Performance optimization
└── Error handling & logging
```

**Deliverables:**
- [ ] Real PostgreSQL database với full schema
- [ ] All API endpoints connected to database
- [ ] JWT authentication with refresh tokens
- [ ] Database seeds với sample data
- [ ] API documentation (Swagger/OpenAPI)

### 9.2 Phase 2: Integration Layer (2-3 tuần)

```
Tuần 1:
├── AWS S3 setup for file uploads
├── Email service integration (SendGrid/SES)
└── Background job queue (Bull/Agenda)

Tuần 2:
├── Webhook event system
├── Real-time notifications (WebSocket)
└── Audit logging to database

Tuần 3:
├── ERP connector framework
├── DMS connector framework
└── Integration testing
```

**Deliverables:**
- [ ] S3 file upload working
- [ ] Email notifications
- [ ] Webhook delivery system
- [ ] Basic ERP sync (configurable)
- [ ] Real-time updates via WebSocket

### 9.3 Phase 3: AI/ML Features (3-4 tuần)

```
Tuần 1-2:
├── Data pipeline setup
├── Feature engineering
└── Model training environment

Tuần 3-4:
├── Insight generation model
├── Recommendation engine
├── Anomaly detection
└── A/B testing framework
```

**Deliverables:**
- [ ] AI Insights với real predictions
- [ ] Smart recommendations
- [ ] Anomaly alerts
- [ ] Model monitoring dashboard

### 9.4 Phase 4: Advanced Features (2-3 tuần)

```
Tuần 1:
├── Voice command integration
├── Power BI Embedded
└── Advanced reporting

Tuần 2-3:
├── Mobile-responsive optimization
├── Offline capability
├── Performance optimization
└── Security hardening
```

**Deliverables:**
- [ ] Voice command center working
- [ ] Power BI embedded reports
- [ ] Mobile-optimized UI
- [ ] PWA capability

### 9.5 Phase 5: Production Deployment (1-2 tuần)

```
Tuần 1:
├── Production environment setup
├── CI/CD pipeline finalization
├── Security audit
└── Load testing

Tuần 2:
├── User acceptance testing
├── Documentation finalization
├── Training materials
└── Go-live preparation
```

**Deliverables:**
- [ ] Production deployment
- [ ] CI/CD fully automated
- [ ] Security audit passed
- [ ] User documentation
- [ ] Admin training

### 9.6 Timeline Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROADMAP PHÁT TRIỂN                           │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────────┤
│ Phase 1 │ Phase 2 │ Phase 3 │ Phase 4 │ Phase 5 │             │
│ Backend │ Integr. │ AI/ML   │ Advanced│ Deploy  │             │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────────┤
│ 2-3 wks │ 2-3 wks │ 3-4 wks │ 2-3 wks │ 1-2 wks │ Total:      │
│         │         │         │         │         │ 10-15 weeks │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────────┘
```

---

## 10. HƯỚNG DẪN TRIỂN KHAI

### 10.1 Yêu Cầu Hệ Thống

```bash
# Development
Node.js >= 18.0.0
npm >= 10.0.0
PostgreSQL >= 15

# Production
Docker & Docker Compose
Vercel Account (hoặc AWS/GCP)
PostgreSQL Database (Neon/Supabase/RDS)
```

### 10.2 Cài Đặt Development

```bash
# Clone repository
git clone https://github.com/nclamvn/vierp-tpm-web.git
cd vierp-tpm-web

# Install dependencies
npm install

# Setup environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Setup database
cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development
npm run dev
```

### 10.3 Environment Variables

```bash
# apps/api/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# apps/web/.env
VITE_API_URL="http://localhost:4000"
VITE_APP_NAME="Promo Master"
```

### 10.4 Build & Deploy

```bash
# Build all apps
npm run build

# Deploy to Vercel
vercel --prod

# Or Docker
docker-compose up -d
```

---

## PHỤ LỤC

### A. Glossary

| Thuật ngữ | Giải thích |
|-----------|------------|
| **TPM** | Trade Promotion Management - Quản lý khuyến mãi thương mại |
| **FMCG** | Fast-Moving Consumer Goods - Hàng tiêu dùng nhanh |
| **MT** | Modern Trade - Kênh thương mại hiện đại (siêu thị, cửa hàng tiện lợi) |
| **GT** | General Trade - Kênh thương mại truyền thống (tạp hóa, chợ) |
| **KAM** | Key Account Manager - Quản lý khách hàng lớn |
| **POA** | Proof of Activation - Bằng chứng kích hoạt |
| **POP** | Proof of Performance - Bằng chứng thực hiện |
| **Accrual** | Dồn tích - Ghi nhận chi phí theo kỳ |
| **Deduction** | Khấu trừ - Khoản trừ từ thanh toán |
| **GL** | General Ledger - Sổ cái tổng hợp |
| **DMS** | Distribution Management System - Hệ thống quản lý phân phối |
| **ERP** | Enterprise Resource Planning - Hệ thống hoạch định nguồn lực |

### B. Contact

**Development Team:**
- Repository: https://github.com/nclamvn/vierp-tpm-web
- Issues: https://github.com/nclamvn/vierp-tpm-web/issues

---

*Tài liệu này được tạo tự động và cập nhật lần cuối: 27/01/2026*
