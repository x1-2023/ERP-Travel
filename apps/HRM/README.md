# VietERP-HRM — Hệ thống Quản lý Nhân sự

Ứng dụng quản lý nhân sự toàn diện cho Công ty CP VietERP Việt Nam, bao quát toàn bộ vòng đời nhân viên từ tuyển dụng đến nghỉ việc.

## Tổng quan

VietERP-HRM là hệ thống HRM nội bộ với phân quyền 6 vai trò (RBAC), tích hợp AI Copilot hỗ trợ nghiệp vụ HR. Hệ thống xử lý tuyển dụng, hợp đồng, chấm công, tính lương (thuế TNCN Việt Nam), KPI, đánh giá hiệu suất và xuất tài liệu tự động.

## Công nghệ

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | Next.js 14 (App Router) |
| Ngôn ngữ | TypeScript 5 |
| Database | PostgreSQL 16+ · Prisma 7 |
| Auth | NextAuth 5 (JWT) |
| UI | Tailwind CSS 3 · Radix UI · shadcn/ui |
| State | Zustand · React Query |
| AI | Claude API (HR Copilot) |
| Validation | Zod |

## Tính năng chính

- **Quản lý nhân viên** — Hồ sơ, người phụ thuộc, lịch sử thay đổi, phân quyền theo trường
- **Tuyển dụng** — Yêu cầu tuyển dụng, ứng viên, phỏng vấn, trang ứng tuyển công khai
- **Hợp đồng** — Quản lý hợp đồng, cảnh báo hết hạn tự động (cron hàng ngày)
- **Chấm công** — Nhập liệu hàng ngày, import Excel với AI mapping cột
- **Tính lương** — Theo kỳ, thuế TNCN, phiếu lương email, xuất file ngân hàng
- **KPI & Đánh giá** — Chấm điểm theo kỳ, quy trình đánh giá hiệu suất
- **Onboarding / Offboarding** — Checklist công việc với phân công nhiệm vụ
- **Sự kiện HR** — Bổ nhiệm, kỷ luật, điều chuyển với quy trình phê duyệt
- **Tạm ứng lương** — Yêu cầu và phê duyệt
- **Mẫu tài liệu** — Xuất văn bản tự động (docxtemplater)
- **HR Copilot** — Trợ lý AI hỗ trợ tra cứu nhân sự, báo cáo

## Cài đặt nhanh

> Yêu cầu: Node.js 20+, PostgreSQL 16+

```bash
npm ci
cp .env.example .env.local   # Điền DATABASE_URL, NEXTAUTH_SECRET
npx prisma generate && npx prisma db push
npm run seed:prod
npm run dev                   # http://localhost:3000
```

## Cấu trúc dự án

```
src/
├── app/
│   ├── (auth)/login/          # Đăng nhập
│   ├── (dashboard)/           # Các trang nghiệp vụ
│   │   ├── employees/         #   Nhân viên
│   │   ├── recruitment/       #   Tuyển dụng
│   │   ├── attendance/        #   Chấm công
│   │   ├── payroll/           #   Tính lương
│   │   ├── kpi/               #   KPI
│   │   ├── reviews/           #   Đánh giá
│   │   ├── copilot/           #   AI Copilot
│   │   └── admin/             #   Quản trị hệ thống
│   └── api/                   # 50+ API routes
├── components/                # UI components
├── lib/
│   ├── calculators/           # Thuế TNCN, BHXH, lương
│   ├── services/              # Email, audit, import
│   └── validations/           # Zod schemas
└── types/                     # TypeScript definitions
prisma/
├── schema.prisma              # 27 models, 20 enums
└── seed-prod.ts               # Seed dữ liệu production
```

## Tài khoản mặc định

| Email | Vai trò |
|-------|---------|
| `admin@vierp.com` | Super Admin |

> Đổi mật khẩu ngay sau lần đăng nhập đầu tiên.

## Tài liệu

Hướng dẫn triển khai chi tiết (cấu hình server, Nginx, backup, bảo mật): xem [DEPLOYMENT.md](./DEPLOYMENT.md).

## Giấy phép

Private — Chỉ sử dụng nội bộ tại VietERP Việt Nam.
