# 🚀 PROMO MASTER - Hệ Thống Quản Lý Khuyến Mãi Thương Mại

[![Build Status](https://github.com/nclamvn/vierp-tpm-web/actions/workflows/ci.yml/badge.svg)](https://github.com/nclamvn/vierp-tpm-web/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng Chính](#-tính-năng-chính)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Tích Hợp Power BI](#-tích-hợp-power-bi)
- [Triển Khai](#-triển-khai)
- [Testing](#-testing)

---

## 🎯 Giới Thiệu

**Promo Master** là hệ thống quản lý khuyến mãi thương mại (Trade Promotion Management - TPM) toàn diện, được thiết kế cho các doanh nghiệp FMCG tại Việt Nam.

### Vấn Đề Giải Quyết

| Thách Thức | Giải Pháp Promo Master |
|------------|------------------------|
| Quản lý khuyến mãi phân tán trên Excel | Hệ thống tập trung, real-time |
| Theo dõi ngân sách thủ công | Tự động cập nhật, cảnh báo vượt mức |
| Quy trình phê duyệt chậm | Workflow tự động, thông báo tức thì |
| Báo cáo thiếu chính xác | Dashboard real-time, tích hợp Power BI |
| Khó đo lường ROI khuyến mãi | Phân tích chi tiết, so sánh hiệu quả |

### Đối Tượng Sử Dụng

- **Trade Marketing Manager**: Lập kế hoạch, phê duyệt chương trình khuyến mãi
- **Sales Team**: Đăng ký khuyến mãi, theo dõi tiến độ, claim chi phí
- **Finance Team**: Kiểm soát ngân sách, phê duyệt claims, theo dõi thanh toán
- **Management**: Theo dõi KPIs, phân tích ROI, ra quyết định chiến lược

---

## ✨ Tính Năng Chính

### 1. Quản Lý Khuyến Mãi (Promotions)

```
┌─────────────────────────────────────────────────────────────┐
│  DRAFT → PENDING → APPROVED → ACTIVE → COMPLETED           │
│    ↓                                                        │
│  REJECTED ←────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────┘
```

- ✅ Tạo và quản lý chương trình khuyến mãi đa dạng
- ✅ Workflow phê duyệt đa cấp tùy chỉnh
- ✅ Theo dõi trạng thái real-time
- ✅ Gắn kết với quỹ ngân sách và khách hàng
- ✅ Hỗ trợ nhiều loại cơ chế: Discount, Rebate, Free Goods

### 2. Quản Lý Claims

- ✅ Đăng ký claim từ chương trình khuyến mãi
- ✅ Xác nhận ngân sách khả dụng tự động
- ✅ Quy trình phê duyệt linh hoạt
- ✅ Theo dõi trạng thái thanh toán
- ✅ Đính kèm chứng từ (invoices, photos)

### 3. Quản Lý Quỹ Ngân Sách (Funds)

- ✅ Phân bổ ngân sách theo quỹ/chương trình
- ✅ Theo dõi sử dụng real-time
- ✅ Cảnh báo khi đạt ngưỡng (80%, 90%, 100%)
- ✅ Báo cáo utilization chi tiết

### 4. Dashboard & Analytics

- ✅ **Command Center**: Tổng quan hoạt động real-time
- ✅ **KPI Cards**: Các chỉ số quan trọng
- ✅ **Charts**: Biểu đồ xu hướng, phân bố
- ✅ **Alerts**: Cảnh báo tự động

### 5. Báo Cáo & Tích Hợp

- ✅ Export CSV/Excel
- ✅ **Tích hợp Power BI** (xem chi tiết bên dưới)
- ✅ REST API cho third-party tools
- ✅ Scheduled reports (tương lai)

---

## 🏗 Kiến Trúc Hệ Thống

### Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROMO MASTER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Frontend   │────▶│   Backend    │────▶│   Database   │    │
│  │   (Vite)     │     │  (NestJS /   │     │ (PostgreSQL) │    │
│  │   React 18   │     │   Vercel)    │     │              │    │
│  │   TypeScript │     │   Prisma     │     │              │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Render /   │     │   Render /   │     │   Power BI   │    │
│  │   Vercel     │     │   Docker     │     │   Reports    │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Công Nghệ Sử Dụng

| Tầng | Công Nghệ | Mô Tả |
|------|-----------|-------|
| **Frontend** | React 18, TypeScript, Vite | SPA hiện đại, build nhanh |
| **UI Framework** | Tailwind CSS v4, Lucide Icons, CVA | Design system nhất quán |
| **State Management** | Zustand, TanStack React Query | Quản lý state hiệu quả |
| **Backend Option 1** | Vercel Functions (Serverless) | `apps/api` - Lightweight, serverless |
| **Backend Option 2** | NestJS (Full Framework) | `apps/api-nestjs` - Full-featured, Swagger |
| **ORM** | Prisma | Type-safe database access |
| **Database** | PostgreSQL | Local hoặc cloud (Neon, Render) |
| **Authentication** | JWT, bcrypt | Bảo mật cao |
| **Deployment** | Render, Vercel | Auto-deploy từ GitHub |
| **Testing** | Playwright, Vitest | E2E và Unit tests |

---

## 🛠 Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL 14+ (hoặc tài khoản Neon)
- Git

### Cài Đặt Nhanh (5 phút)

```bash
# 1. Clone repository
git clone https://github.com/nclamvn/vierp-tpm-web.git
cd vierp-tpm-web

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình môi trường
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Chỉnh sửa file .env với thông tin database của bạn
#    (DATABASE_URL, JWT_SECRET, ...)

# 5. Khởi tạo database
npm run db:push
npm run db:seed

# 6. Chạy development server
npm run dev
```

> **Tip:** Nếu chưa có PostgreSQL, bạn có thể bật mock data bằng cách set `VITE_ENABLE_MOCK=true` trong `apps/web/.env` để xem demo UI mà không cần backend.

### Chọn Backend

Dự án hỗ trợ **2 backend** (chọn 1 tùy nhu cầu):

| Backend | Thư mục | Port | Khi nào dùng |
|---------|---------|------|-------------|
| **NestJS** (Khuyến nghị) | `apps/api-nestjs` | 3000 | Full-featured, Swagger docs, Docker-ready |
| **Vercel Functions** | `apps/api` | 3000 | Serverless, lightweight, deploy lên Vercel |

```bash
# Option 1: NestJS (khuyến nghị cho local dev)
cd apps/api-nestjs
npm install
npm run start:dev
# Swagger docs: http://localhost:3000/api/docs

# Option 2: Vercel Functions
cd apps/api
npm run dev
```

### Truy Cập Ứng Dụng

| Dịch Vụ | URL | Mô Tả |
|---------|-----|-------|
| Web App | http://localhost:5173 | Giao diện người dùng |
| API (NestJS) | http://localhost:3000 | Backend API |
| Swagger Docs | http://localhost:3000/api/docs | API documentation |
| Prisma Studio | http://localhost:5555 | Công cụ quản lý database |

### Tài Khoản Mặc Định

| Email | Mật Khẩu | Vai Trò | Quyền Hạn |
|-------|----------|---------|-----------|
| admin@your-domain.com | admin123 | ADMIN | Toàn quyền |
| manager@your-domain.com | manager123 | MANAGER | Phê duyệt, báo cáo |
| user@your-domain.com | user123 | USER | Tạo, xem |

---

## 📁 Cấu Trúc Dự Án

```
vierp-tpm-web/
├── apps/
│   ├── web/                    # Frontend (Vite + React 18)
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   │   ├── ui/         # UI components (custom)
│   │   │   │   ├── layout/     # Layout (Header, Sidebar)
│   │   │   │   ├── charts/     # Biểu đồ (Recharts)
│   │   │   │   ├── ai/         # AI-powered components
│   │   │   │   └── shared/     # Components dùng chung
│   │   │   ├── pages/          # 29 trang (lazy-loaded)
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── lib/            # Utilities, API client (Axios)
│   │   │   └── types/          # TypeScript types
│   │   ├── e2e/                # Playwright E2E tests
│   │   └── package.json
│   │
│   ├── api/                    # Backend Option 1 (Vercel Functions)
│   │   ├── api/                # Serverless route handlers
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema (3,900+ dòng)
│   │   │   └── seeds/          # Seed data files
│   │   └── package.json
│   │
│   └── api-nestjs/             # Backend Option 2 (NestJS)
│       ├── src/
│       │   └── modules/        # 34 NestJS modules
│       ├── prisma/
│       │   ├── schema.prisma   # Database schema
│       │   └── seeds/          # Seed data files
│       └── package.json
│
├── docker/                     # Docker configs
│   ├── docker-compose.yml      # Full stack deployment
│   ├── Dockerfile.api          # API container
│   └── Dockerfile.web          # Web container
│
├── packages/
│   └── shared/                 # Types & utils dùng chung
│
├── render.yaml                 # Render.com deployment config
├── package.json                # Workspace root (npm workspaces)
├── turbo.json                  # Build orchestration
└── README.md                   # Tài liệu này
```

---

## 📚 API Documentation

### Base URL

```
Development: http://localhost:3000/api
Production:  https://vierp-tpm-api.onrender.com/api
```

### Xác Thực (Authentication)

```bash
# Đăng nhập
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@your-domain.com",
  "password": "admin123"
}

# Response thành công
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@your-domain.com",
      "name": "Admin User",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### Sử Dụng Token

```bash
# Thêm vào header cho tất cả các request cần xác thực
Authorization: Bearer eyJhbG...
```

### Các Endpoints Chính

#### Promotions (Khuyến Mãi)

| Phương Thức | Endpoint | Mô Tả |
|-------------|----------|-------|
| GET | `/api/promotions` | Danh sách khuyến mãi |
| GET | `/api/promotions/:id` | Chi tiết khuyến mãi |
| POST | `/api/promotions` | Tạo khuyến mãi mới |
| PUT | `/api/promotions/:id` | Cập nhật khuyến mãi |
| DELETE | `/api/promotions/:id` | Xóa khuyến mãi |
| POST | `/api/promotions/:id/submit` | Gửi yêu cầu phê duyệt |
| POST | `/api/promotions/:id/approve` | Phê duyệt |
| POST | `/api/promotions/:id/reject` | Từ chối |

#### Claims (Yêu Cầu Thanh Toán)

| Phương Thức | Endpoint | Mô Tả |
|-------------|----------|-------|
| GET | `/api/claims` | Danh sách claims |
| GET | `/api/claims/:id` | Chi tiết claim |
| POST | `/api/claims` | Tạo claim mới |
| POST | `/api/claims/:id/approve` | Phê duyệt claim |
| POST | `/api/claims/:id/reject` | Từ chối claim |
| POST | `/api/claims/:id/pay` | Đánh dấu đã thanh toán |

#### Dashboard

| Phương Thức | Endpoint | Mô Tả |
|-------------|----------|-------|
| GET | `/api/dashboard/stats` | Thống kê KPI tổng quan |
| GET | `/api/dashboard/charts/spend-trend` | Xu hướng chi tiêu |
| GET | `/api/dashboard/charts/status-distribution` | Phân bố trạng thái |
| GET | `/api/dashboard/charts/top-customers` | Top khách hàng |

---

## 📊 Tích Hợp Power BI

### Tổng Quan

Promo Master được thiết kế với **kiến trúc API-first**, cho phép tích hợp dễ dàng với **Microsoft Power BI** và các công cụ Business Intelligence khác như Tableau, Looker, Metabase.

```
┌─────────────────────────────────────────────────────────────────┐
│                   TÍCH HỢP POWER BI                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│         ┌─────────────┐                                         │
│         │  Power BI   │                                         │
│         │   Desktop   │                                         │
│         └──────┬──────┘                                         │
│                │                                                 │
│       ┌────────┴────────┐                                       │
│       ▼                 ▼                                       │
│  ┌─────────┐      ┌─────────┐                                  │
│  │REST API │      │ Direct  │                                  │
│  │ (JSON)  │      │   DB    │                                  │
│  └────┬────┘      └────┬────┘                                  │
│       │                │                                        │
│       ▼                ▼                                        │
│  ┌─────────────────────────────┐                               │
│  │      PROMO MASTER           │                               │
│  │   ┌───────┐  ┌──────────┐  │                               │
│  │   │  API  │──│PostgreSQL│  │                               │
│  │   └───────┘  └──────────┘  │                               │
│  └─────────────────────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Các Phương Thức Kết Nối

#### 1️⃣ REST API (Khuyến Nghị)

**Ưu điểm:**
- 🔒 Bảo mật cao với JWT authentication
- 📦 Dữ liệu đã được xử lý, sẵn sàng báo cáo
- 🚫 Không cần expose database trực tiếp
- 🔄 Hỗ trợ auto-refresh

**Cách thiết lập trong Power BI Desktop:**

1. Mở Power BI Desktop
2. Chọn **Get Data** → **Web**
3. Nhập URL API:
   ```
   https://api.promomaster.com/api/dashboard/stats
   ```
4. Chọn **Advanced** để thêm Headers:
   ```
   Authorization: Bearer <your-access-token>
   Content-Type: application/json
   ```
5. Click **OK** để kết nối

**Danh sách Endpoints cho Power BI:**

| Endpoint | Mô Tả | Tần Suất Refresh Khuyến Nghị |
|----------|-------|------------------------------|
| `/api/dashboard/stats` | KPIs tổng quan | 15 phút |
| `/api/dashboard/charts/spend-trend` | Xu hướng chi tiêu theo thời gian | 1 giờ |
| `/api/dashboard/charts/status-distribution` | Phân bố trạng thái khuyến mãi | 1 giờ |
| `/api/dashboard/charts/top-customers` | Top 10 khách hàng | 1 giờ |
| `/api/promotions?limit=1000` | Danh sách đầy đủ khuyến mãi | 1 giờ |
| `/api/claims?limit=1000` | Danh sách đầy đủ claims | 1 giờ |
| `/api/funds` | Danh sách quỹ ngân sách | 1 giờ |
| `/api/customers` | Danh sách khách hàng | 1 ngày |
| `/api/products` | Danh sách sản phẩm | 1 ngày |

#### 2️⃣ Kết Nối Database Trực Tiếp

**Ưu điểm:**
- 🔍 Truy vấn SQL linh hoạt
- ⚡ Real-time data
- 📊 Truy cập toàn bộ tables

**Cách thiết lập:**

1. Mở Power BI Desktop
2. Chọn **Get Data** → **PostgreSQL Database**
3. Nhập thông tin kết nối:
   ```
   Server: <your-neon-host>.neon.tech
   Database: promo_master
   ```
4. Chọn **DirectQuery** (khuyến nghị) hoặc **Import**
5. Nhập credentials và kết nối

**Connection String mẫu:**

```
Host=ep-xxx.neon.tech;Database=promo_master;Username=your_user;Password=your_password;SSL Mode=Require
```

**Danh sách Tables:**

| Table | Mô Tả | Số Lượng Records |
|-------|-------|------------------|
| `Promotion` | Chương trình khuyến mãi | Động (100-10,000) |
| `Claim` | Yêu cầu thanh toán | Động (500-50,000) |
| `Fund` | Quỹ ngân sách | 10-50 |
| `Customer` | Khách hàng | 100-1,000 |
| `Product` | Sản phẩm | 100-10,000 |
| `User` | Người dùng hệ thống | 10-100 |

#### 3️⃣ Export File (Thủ Công)

**Ưu điểm:**
- ✅ Đơn giản, không cần cấu hình
- ✅ Phù hợp báo cáo ad-hoc

**Cách sử dụng:**

1. Đăng nhập vào Promo Master
2. Vào trang Báo cáo hoặc danh sách cần export
3. Click nút **Export** → Chọn **CSV** hoặc **Excel**
4. Import file vào Power BI

---

### Mẫu Báo Cáo Power BI

#### 📊 Executive Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│           PROMO MASTER - BÁO CÁO ĐIỀU HÀNH                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │KM Đang   │  │Tỷ Lệ SD  │  │ Claims   │  │   ROI    │    │
│  │Hoạt Động │  │Ngân Sách │  │ Pending  │  │ Trung    │    │
│  │   24     │  │  85.2%   │  │   45     │  │  12.5%   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────┐ │
│  │  CHI TIÊU THEO THÁNG       │  │  PHÂN BỐ THEO KÊNH     │ │
│  │  [Biểu đồ đường]           │  │  [Biểu đồ tròn]        │ │
│  │                            │  │                        │ │
│  │  ^^^                       │  │     MT 45%             │ │
│  │     ^^^                    │  │     GT 35%             │ │
│  │        ^^^                 │  │     KA 20%             │ │
│  └────────────────────────────┘  └────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             TOP 10 KHÁCH HÀNG THEO CHI TIÊU            │ │
│  │  [Biểu đồ thanh ngang]                                 │ │
│  │                                                        │ │
│  │  Big C        ████████████████████████  2.5 tỷ        │ │
│  │  Co.opmart    ██████████████████       1.8 tỷ        │ │
│  │  VinMart      ████████████████         1.5 tỷ        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 📈 Báo Cáo Hiệu Quả Khuyến Mãi

```
┌─────────────────────────────────────────────────────────────┐
│          PHÂN TÍCH HIỆU QUẢ KHUYẾN MÃI                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Bộ lọc: [Năm ▼] [Quý ▼] [Kênh ▼] [Loại KM ▼]              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tên KM        | Ngân sách  | Chi tiêu  | Hiệu quả     │ │
│  │  ───────────────────────────────────────────────────── │ │
│  │  Summer Sale   | 500 triệu  | 420 triệu | 84%    ↑15%  │ │
│  │  Q1 Trade      | 300 triệu  | 285 triệu | 95%    ↑12%  │ │
│  │  Flash Deal    | 200 triệu  | 198 triệu | 99%    ↑18%  │ │
│  │  Tết Campaign  | 1 tỷ       | 850 triệu | 85%    ↑22%  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────┐  ┌────────────────────────────┐ │
│  │  NGÂN SÁCH VS THỰC CHI │  │  PHÂN BỐ TRẠNG THÁI        │ │
│  │  [Biểu đồ combo]       │  │  [Biểu đồ donut]           │ │
│  └────────────────────────┘  └────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 💰 Báo Cáo Claims

```
┌─────────────────────────────────────────────────────────────┐
│               PHÂN TÍCH CLAIMS                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Chờ      │  │ Đã       │  │ Đã       │  │ Từ       │    │
│  │ Duyệt    │  │ Duyệt    │  │ Thanh    │  │ Chối     │    │
│  │   45     │  │   89     │  │  Toán    │  │   12     │    │
│  │          │  │          │  │  156     │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │       THỜI GIAN XỬ LÝ CLAIM TRUNG BÌNH (NGÀY)         │ │
│  │       [Box Plot]                                       │ │
│  │                                                        │ │
│  │       Min: 1  |  Q1: 2  |  Median: 3  |  Q3: 5  |  Max: 10 │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────┐  ┌────────────────────────────┐ │
│  │  CLAIMS THEO KHÁCH     │  │  TỶ LỆ DUYỆT THEO THỜI    │ │
│  │  HÀNG [Treemap]        │  │  GIAN [Area Chart]        │ │
│  └────────────────────────┘  └────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Công Thức DAX Mẫu

```dax
// ═══════════════════════════════════════════════════════════
// MEASURES CƠ BẢN
// ═══════════════════════════════════════════════════════════

// Tổng ngân sách
Tổng Ngân Sách = SUM(Promotion[budget])

// Tổng chi tiêu thực tế
Tổng Chi Tiêu = SUM(Promotion[actualSpend])

// Tỷ lệ sử dụng ngân sách (%)
Tỷ Lệ Sử Dụng NS =
DIVIDE([Tổng Chi Tiêu], [Tổng Ngân Sách], 0) * 100

// Số lượng khuyến mãi đang hoạt động
KM Đang Hoạt Động =
CALCULATE(
    COUNTROWS(Promotion),
    Promotion[status] = "ACTIVE"
)

// ═══════════════════════════════════════════════════════════
// MEASURES CLAIMS
// ═══════════════════════════════════════════════════════════

// Tỷ lệ duyệt Claims (%)
Tỷ Lệ Duyệt Claim =
DIVIDE(
    CALCULATE(
        COUNTROWS(Claim),
        Claim[status] IN {"APPROVED", "PAID"}
    ),
    COUNTROWS(Claim),
    0
) * 100

// Thời gian xử lý trung bình (ngày)
TG Xử Lý TB =
AVERAGEX(
    FILTER(Claim, NOT(ISBLANK(Claim[approvedAt]))),
    DATEDIFF(Claim[createdAt], Claim[approvedAt], DAY)
)

// Tổng giá trị Claims chờ duyệt
Claims Chờ Duyệt =
CALCULATE(
    SUM(Claim[claimAmount]),
    Claim[status] = "SUBMITTED"
)

// ═══════════════════════════════════════════════════════════
// MEASURES SO SÁNH
// ═══════════════════════════════════════════════════════════

// Tăng trưởng so với tháng trước (%)
Tăng Trưởng MoM =
VAR ThangNay = [Tổng Chi Tiêu]
VAR ThangTruoc = CALCULATE(
    [Tổng Chi Tiêu],
    DATEADD(Calendar[Date], -1, MONTH)
)
RETURN
DIVIDE(ThangNay - ThangTruoc, ThangTruoc, 0) * 100

// So sánh với cùng kỳ năm trước (%)
Tăng Trưởng YoY =
VAR NamNay = [Tổng Chi Tiêu]
VAR NamTruoc = CALCULATE(
    [Tổng Chi Tiêu],
    DATEADD(Calendar[Date], -1, YEAR)
)
RETURN
DIVIDE(NamNay - NamTruoc, NamTruoc, 0) * 100
```

---

### Power Query (M) Mẫu

```m
// ═══════════════════════════════════════════════════════════
// KẾT NỐI REST API
// ═══════════════════════════════════════════════════════════

let
    // Cấu hình
    ApiUrl = "https://api.promomaster.com/api",
    Token = "your-jwt-token-here",

    // Gọi API Dashboard Stats
    Source = Json.Document(
        Web.Contents(
            ApiUrl & "/dashboard/stats",
            [
                Headers = [
                    #"Authorization" = "Bearer " & Token,
                    #"Content-Type" = "application/json"
                ]
            ]
        )
    ),

    // Lấy data
    Data = Source[data]
in
    Data

// ═══════════════════════════════════════════════════════════
// TRANSFORM PROMOTIONS DATA
// ═══════════════════════════════════════════════════════════

let
    // Gọi API
    Source = Json.Document(
        Web.Contents(ApiUrl & "/promotions?limit=1000")
    ),

    // Lấy danh sách promotions
    DataList = Source[data][promotions],

    // Chuyển thành table
    ToTable = Table.FromList(
        DataList,
        Splitter.SplitByNothing()
    ),

    // Mở rộng các cột
    ExpandedColumns = Table.ExpandRecordColumn(
        ToTable,
        "Column1",
        {"id", "code", "name", "status", "budget",
         "actualSpend", "startDate", "endDate", "customer"}
    ),

    // Mở rộng customer
    ExpandCustomer = Table.ExpandRecordColumn(
        ExpandedColumns,
        "customer",
        {"name", "channel"},
        {"customerName", "channel"}
    ),

    // Đặt kiểu dữ liệu
    TypedColumns = Table.TransformColumnTypes(
        ExpandCustomer,
        {
            {"budget", type number},
            {"actualSpend", type number},
            {"startDate", type date},
            {"endDate", type date}
        }
    ),

    // Thêm cột tính toán
    AddUtilization = Table.AddColumn(
        TypedColumns,
        "Utilization %",
        each [actualSpend] / [budget] * 100,
        type number
    )
in
    AddUtilization
```

---

### Lịch Refresh Data Khuyến Nghị

| Loại Báo Cáo | Tần Suất | Thời Điểm | Ghi Chú |
|--------------|----------|-----------|---------|
| Executive Dashboard | 15 phút | Liên tục | DirectQuery |
| Operational Reports | 1 giờ | Mỗi giờ chẵn | Import |
| Daily Summary | 1 ngày | 6:00 AM | Import |
| Weekly Analysis | 1 tuần | Thứ 2, 7:00 AM | Import |
| Monthly Report | 1 tháng | Ngày 1, 8:00 AM | Import |

---

### Bảo Mật Power BI

#### 1. Row-Level Security (RLS)

Giới hạn dữ liệu theo vai trò người dùng:

```dax
// Trong Power BI Desktop → Modeling → Manage Roles

// Role: Sales Manager
[Region] = USERPRINCIPALNAME()

// Role: Branch Manager
[Branch] = LOOKUPVALUE(
    Users[Branch],
    Users[Email],
    USERPRINCIPALNAME()
)
```

#### 2. Data Gateway

- Cài đặt **On-premises data gateway** cho DirectQuery
- Kết nối encrypted qua HTTPS
- Scheduled refresh với credentials được mã hóa

#### 3. Sensitivity Labels

- Áp dụng **Microsoft Information Protection labels**
- Kiểm soát sharing và export
- Audit trail cho compliance

---

## 🚀 Triển Khai

### Option 1: Render.com (Khuyến nghị - đã cấu hình sẵn)

Dự án có sẵn `render.yaml` để deploy lên Render:

1. Kết nối GitHub repo với [Render](https://render.com)
2. Chọn **Blueprint** → file `render.yaml` sẽ tự động tạo services
3. Cấu hình environment variables
4. Deploy!

**Services được tạo:**
- `vierp-tpm-db` - PostgreSQL database
- `vierp-tpm-api` - NestJS backend (port 3000)
- `vierp-tpm-web` - Vite frontend

### Option 2: Docker

```bash
# Chạy toàn bộ stack
docker-compose -f docker/docker-compose.yml up -d

# Truy cập: http://localhost
```

### Option 3: Vercel (Frontend only)

```bash
cd apps/web
npx vercel --prod
```

---

## 🧪 Testing

### Chạy Tests

```bash
# Unit tests
npm run test

# E2E tests với Playwright
npm run test:e2e

# E2E tests với giao diện
npm run test:e2e -- --ui

# Xem báo cáo test
npm run test:report
```

### Kết Quả Test

| Test Suite | Số Tests | Tỷ Lệ Pass |
|------------|----------|------------|
| API Integration | 25 | 100% ✅ |
| E2E Playwright | 78 | 100% ✅ |
| Unit Tests | 150+ | 98%+ ✅ |

---

## 📝 Scripts Có Sẵn

```bash
# Development
npm run dev           # Chạy tất cả services
npm run dev:web       # Chỉ chạy web
npm run dev:api       # Chỉ chạy API

# Build
npm run build         # Build tất cả
npm run build:web     # Build web
npm run build:api     # Build API

# Database
npm run db:push       # Đẩy schema lên database
npm run db:migrate    # Chạy migrations
npm run db:seed       # Tạo dữ liệu mẫu
npm run db:studio     # Mở Prisma Studio

# Code Quality
npm run lint          # Kiểm tra lỗi
npm run format        # Format code
npm run typecheck     # Kiểm tra TypeScript
```

---

## 📞 Hỗ Trợ

- 📧 **Email**: support@your-domain.com
- 📖 **Tài liệu**: https://docs.promomaster.com
- 🐛 **Báo lỗi**: GitHub Issues

---

## 📄 Giấy Phép

MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

---

**⭐ Star repository này nếu bạn thấy hữu ích!**
