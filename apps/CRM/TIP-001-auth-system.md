# Vibecode Kit v5.0 — Task Instruction Pack

## VAI TRÒ
Bạn là THỢ THI CÔNG trong hệ thống Vibecode Kit v5.0.
Chủ thầu (Claude Chat) và Chủ nhà đã THỐNG NHẤT bản thiết kế.

## QUY TẮC TUYỆT ĐỐI
1. IMPLEMENT ĐÚNG TIP specification bên dưới
2. KHÔNG thay đổi kiến trúc / structure
3. KHÔNG thêm features ngoài TIP
4. KHÔNG đổi tech stack / dependencies (trừ khi TIP yêu cầu)
5. SELF-TEST theo acceptance criteria
6. BÁO CÁO theo Completion Report format
7. Gặp conflict → BÁO CÁO chi tiết, KHÔNG tự quyết định

## PROJECT CONTEXT

**Project:** Prismy CRM
**Tech Stack:** Next.js 14 (App Router) + TypeScript + TailwindCSS/Shadcn + PostgreSQL/Prisma 5.22 + Supabase Auth
**Current State:** Auth đang hardcoded `demo-user-001`, middleware Supabase đã config nhưng chưa kết nối API routes
**Database:** Prisma schema đã có UserRole enum (ADMIN, MANAGER, MEMBER, VIEWER) nhưng chưa enforce

---

# TIP-001: Authentication System — Supabase Auth Email/Password

## HEADER
- **TIP-ID:** TIP-001
- **Project:** Prismy CRM
- **Module:** Authentication
- **Depends on:** None (first task)
- **Priority:** P0 — Critical
- **Estimated effort:** 120-180 minutes

## CONTEXT
- Working directory: project root (Prismy CRM)
- Key files to reference:
  - `middleware.ts` (Supabase middleware đã config)
  - `prisma/schema.prisma` (User model, UserRole enum)
  - `src/lib/supabase/` (nếu có — client/server setup)
  - `src/app/api/` (existing API routes dùng hardcoded user)
  - `.env.example` hoặc `.env.local` (Supabase keys)
- Patterns to follow: existing App Router patterns, Shadcn/UI components

## TASK

Thay thế toàn bộ hardcoded demo authentication bằng Supabase Auth thực tế với email/password. Tạo trang Login, Register, và kết nối auth state xuyên suốt ứng dụng.

## SPECIFICATIONS

### 1. Supabase Auth Setup

```
SỬ DỤNG:
- @supabase/supabase-js (đã cài hoặc cài mới)
- @supabase/ssr (cho App Router server-side auth)

CẤU HÌNH:
- NEXT_PUBLIC_SUPABASE_URL → .env.local
- NEXT_PUBLIC_SUPABASE_ANON_KEY → .env.local
- Tạo 2 clients:
  1. Browser client (cho client components)
  2. Server client (cho server components + API routes)
```

### 2. Auth Pages

```
/login
├── Email + Password fields
├── "Đăng nhập" button
├── Link "Chưa có tài khoản? Đăng ký"
├── Link "Quên mật khẩu?" (placeholder — chỉ UI, chưa implement)
├── Error display (sai email/password, account not found)
├── Loading state khi submit
└── Redirect to /dashboard sau khi login thành công

/register
├── Họ tên (firstName, lastName)
├── Email
├── Password (min 8 ký tự)
├── Confirm Password
├── "Đăng ký" button
├── Link "Đã có tài khoản? Đăng nhập"
├── Error display (email đã tồn tại, password yếu)
├── Loading state khi submit
└── Sau register:
    ├── Tạo Supabase auth user
    ├── Tạo User record trong Prisma DB (sync)
    │   ├── id = Supabase auth user id
    │   ├── email = từ form
    │   ├── firstName, lastName = từ form
    │   ├── role = MEMBER (default)
    │   └── isActive = true
    └── Redirect to /dashboard
```

### 3. Auth State Management

```
TẠO: src/hooks/useAuth.ts (hoặc tương đương)
├── currentUser: User | null
├── isLoading: boolean
├── isAuthenticated: boolean
├── login(email, password): Promise
├── register(email, password, metadata): Promise
├── logout(): Promise
└── Sync với Supabase onAuthStateChange

TẠO: src/components/auth-provider.tsx
├── Wrap toàn bộ app
├── Cung cấp auth context
└── Handle auth state changes
```

### 4. Middleware Protection

```
CẬP NHẬT: middleware.ts
├── Route protection:
│   ├── /login, /register → Public (redirect to /dashboard nếu đã login)
│   ├── /portal/* → Riêng (portal auth — KHÔNG THAY ĐỔI portal auth hiện tại)
│   ├── /api/* → Kiểm tra Supabase session (trừ /api/auth/*)
│   └── Tất cả route khác → Redirect to /login nếu chưa auth
├── Session refresh trên mỗi request
└── Set user info vào request headers cho API routes
```

### 5. API Routes Update

```
TẠO: src/lib/auth/get-current-user.ts
├── Helper function dùng trong API routes
├── Đọc Supabase session từ cookies
├── Return User từ Prisma DB (với role)
├── Throw 401 nếu không có session

CẬP NHẬT: TẤT CẢ existing API routes
├── Thay thế hardcoded "demo-user-001"
├── Sử dụng getCurrentUser() helper
├── Return 401 nếu chưa auth
├── Gắn userId vào các operations (create, update)
└── QUAN TRỌNG: Giữ nguyên toàn bộ business logic, chỉ thay auth
```

### 6. UI Updates

```
CẬP NHẬT: Layout / Header
├── Hiển thị tên user đang đăng nhập
├── Avatar (dùng initials từ firstName + lastName)
├── Dropdown menu:
│   ├── Profile (placeholder link)
│   ├── Settings (link đến /settings)
│   └── Đăng xuất
└── Loading skeleton khi đang check auth

XÓA / THAY THẾ:
├── Mọi reference đến "demo-user-001"
├── Mọi hardcoded user info trong UI
└── Demo mode indicators (nếu có)
```

### 7. Seed Data

```
TẠO HOẶC CẬP NHẬT: prisma/seed.ts
├── Tạo admin user mặc định:
│   ├── email: admin@your-domain.com
│   ├── firstName: Admin
│   ├── lastName: Prismy
│   ├── role: ADMIN
│   └── NOTE: Password tạo qua Supabase dashboard hoặc register page
└── GHI CHÚ trong README cách tạo user đầu tiên
```

## ACCEPTANCE CRITERIA

### AC-1: Register Flow
```
Given: User chưa có tài khoản
When: Truy cập /register, điền đầy đủ thông tin, nhấn "Đăng ký"
Then: 
  - Tạo auth user trong Supabase
  - Tạo User record trong Prisma DB
  - Redirect đến /dashboard
  - Header hiển thị tên user
```

### AC-2: Login Flow
```
Given: User đã có tài khoản
When: Truy cập /login, điền email + password, nhấn "Đăng nhập"
Then:
  - Xác thực thành công qua Supabase
  - Redirect đến /dashboard
  - Session được duy trì (refresh page vẫn logged in)
```

### AC-3: Login Error
```
Given: User điền sai email hoặc password
When: Nhấn "Đăng nhập"
Then:
  - Hiển thị error message rõ ràng (không lộ thông tin user tồn tại hay không)
  - Không redirect
  - Form không bị clear (user có thể sửa và thử lại)
```

### AC-4: Route Protection
```
Given: User CHƯA đăng nhập
When: Truy cập /dashboard hoặc bất kỳ protected route
Then: Redirect về /login

Given: User ĐÃ đăng nhập
When: Truy cập /login hoặc /register
Then: Redirect về /dashboard
```

### AC-5: Logout
```
Given: User đang đăng nhập
When: Click "Đăng xuất" từ header dropdown
Then:
  - Clear Supabase session
  - Redirect về /login
  - Không thể truy cập protected routes
```

### AC-6: API Protection
```
Given: Request đến /api/* KHÔNG có valid session
When: API được gọi
Then: Return 401 Unauthorized

Given: Request đến /api/* CÓ valid session
When: API được gọi
Then: Business logic chạy bình thường với userId từ session
```

### AC-7: Existing Features Intact
```
Given: Auth đã được implement
When: Sử dụng các features hiện có (contacts, companies, deals, quotes, etc.)
Then: 
  - Tất cả CRUD operations hoạt động bình thường
  - Data được gắn với userId đúng
  - Không có regression bugs
```

## CONSTRAINTS

1. **KHÔNG thay đổi Prisma schema** (User model + UserRole enum đã có) — chỉ sync data
2. **KHÔNG implement OAuth** (Google, GitHub, etc.) — chỉ email/password cho MVP
3. **KHÔNG implement "Quên mật khẩu"** thực tế — chỉ tạo UI placeholder
4. **KHÔNG thay đổi Portal auth** (/portal/*) — portal có auth riêng, giữ nguyên
5. **PHẢI giữ nguyên** toàn bộ business logic hiện có — chỉ thay source of user identity
6. **PHẢI dùng Shadcn/UI components** cho Login/Register pages (Input, Button, Card, Label, etc.)
7. **Design phải match** với existing dark mode / glass-morphism style của app

## REPORT FORMAT SAU KHI XONG

```markdown
### COMPLETION REPORT — TIP-001

**STATUS:** DONE / PARTIAL / BLOCKED

**FILES CHANGED:**
- Created: [list + purpose]
- Modified: [list + change description]

**TEST RESULTS:**
- AC-1 Register Flow: PASS / FAIL — [details]
- AC-2 Login Flow: PASS / FAIL — [details]
- AC-3 Login Error: PASS / FAIL — [details]
- AC-4 Route Protection: PASS / FAIL — [details]
- AC-5 Logout: PASS / FAIL — [details]
- AC-6 API Protection: PASS / FAIL — [details]
- AC-7 Existing Features: PASS / FAIL — [details]

**ISSUES DISCOVERED:**
- [Issue]: [severity] — [description] — [suggestion]

**DEVIATIONS FROM SPEC:**
- [Deviation]: [what] — [why] — [impact]

**SUGGESTIONS FOR CHỦ THẦU:**
- [Suggestion]: [observation] — [recommendation]

**ENV VARIABLES NEEDED:**
- [list biến môi trường cần cấu hình]
```
