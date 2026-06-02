# TASK GRAPH — PRISMY CRM PHASE 1 MVP PRODUCTION
## Vibecode Kit v5.0 — Generated 21/02/2026

---

## DECISIONS LOG

| ID | Decision | Options | Chosen | Rationale |
|----|----------|---------|--------|-----------|
| D-001 | Auth Strategy | Supabase full / email-only / Custom JWT / Connect existing | Supabase email/password | Middleware đã config, đơn giản nhất cho MVP |
| D-002 | Email Provider | Resend / AWS SES / Sendgrid | Resend.dev | Developer-friendly, React Email support, free 100/ngày |
| D-003 | Post-core Priority | Campaign / Portal / Settings / Validation | Campaign → Portal → Settings → Validation | Marketing tạo doanh thu, Portal giữ khách |

---

## DEPENDENCY MAP

```
TIP-001: Auth System ──────────────────────────────────────────┐
    │                                                           │
    ▼                                                           │
TIP-002: RBAC Middleware ──────────────┐                        │
    │                                  │                        │
    ▼                                  ▼                        ▼
TIP-003: Email Service        TIP-004: API Security     TIP-005: Zod Validation
(Resend + React Email)        (JWT enforce all routes)   (Input validation layer)
    │                                  │                        │
    ├──────────────┬───────────────────┘                        │
    ▼              ▼                                            │
TIP-006: PDF   TIP-007: Quote                                  │
(React PDF)    Send + Expiry                                    │
    │              │                                            │
    └──────┬───────┘                                            │
           ▼                                                    │
    TIP-008: Settings Persistence                               │
           │                                                    │
           ▼                                                    │
    TIP-009: Global Search UI (cmdk)                            │
           │                                                    │
           ▼                                                    │
    TIP-010: Campaign Engine ◄──────────────────────────────────┘
    (Resend bulk + tracking)
           │
           ▼
    TIP-011: Portal Completion
    (Magic link + real pages)
           │
           ▼
    TIP-012: VERIFY & Polish
```

---

## TIP SUMMARY TABLE

| TIP | Tên | Priority | Depends On | Est. Effort | Critical Path? |
|-----|-----|----------|------------|-------------|----------------|
| 001 | Auth System (Supabase email/pwd) | P0 | None | 120-180 min | ✅ YES |
| 002 | RBAC Middleware & Role Enforcement | P0 | TIP-001 | 90-120 min | ✅ YES |
| 003 | Email Service (Resend + React Email) | P0 | TIP-001 | 90-120 min | ✅ YES |
| 004 | API Security Hardening | P0 | TIP-002 | 60-90 min | ✅ YES |
| 005 | Zod Validation Layer | P1 | TIP-001 | 90-120 min | No |
| 006 | PDF Generation (Quotes & Orders) | P1 | TIP-003 | 90-120 min | ✅ YES |
| 007 | Quote Email Send + Expiry Alerts | P1 | TIP-003, TIP-006 | 60-90 min | ✅ YES |
| 008 | Settings Persistence | P1 | TIP-004 | 60-90 min | No |
| 009 | Global Search UI (cmdk) | P2 | TIP-004 | 45-60 min | No |
| 010 | Campaign Engine (Resend bulk) | P1 | TIP-003, TIP-005 | 150-180 min | No |
| 011 | Portal Completion | P1 | TIP-003, TIP-004 | 120-150 min | No |
| 012 | VERIFY & Polish | P0 | ALL | 90-120 min | ✅ YES |

**Total Estimated: ~17-22 hours Claude Code time**
**Calendar time: 4-5 tuần (1 senior dev, accounting for review cycles)**

---

## TIP BRIEFS (Chi tiết sẽ generate khi đến lượt)

### TIP-001: Auth System ✅ READY — Đã generate đầy đủ
Xem file: `TIP-001-auth-system.md`

### TIP-002: RBAC Middleware & Role Enforcement
```
SCOPE:
- Tạo middleware checkRole(allowedRoles[]) cho API routes
- Enforce UserRole trên mọi API endpoint
- Admin: full access
- Manager: CRUD trên team data
- Member: CRUD trên own data
- Viewer: Read-only
- UI: Ẩn/disable actions theo role
- Settings > Team: Admin quản lý roles

DEPENDENCIES: TIP-001 (cần auth user với role)
```

### TIP-003: Email Service (Resend + React Email)
```
SCOPE:
- Setup Resend SDK + API key
- Tạo React Email templates:
  1. Welcome email (sau register)
  2. Quote sent email (đính kèm PDF link)
  3. Portal magic link email
  4. Password reset email (placeholder)
- Email service abstraction layer (dễ swap provider)
- Email queue / retry logic cơ bản
- Email log table (tracking sent/failed)

DEPENDENCIES: TIP-001 (cần user email)
```

### TIP-004: API Security Hardening
```
SCOPE:
- JWT validation trên mọi API route (via middleware)
- Rate limiting cơ bản (100 req/min per user)
- Input sanitization (XSS prevention)
- CORS configuration
- Request logging (structured, không console.log)
- Error response format chuẩn hóa

DEPENDENCIES: TIP-002 (cần RBAC middleware)
```

### TIP-005: Zod Validation Layer
```
SCOPE:
- Zod schemas cho mọi API input:
  - Contact: email format, phone format, required fields
  - Company: name required, industry enum
  - Deal: value >= 0, probability 0-100
  - Quote: line items validation, dates
  - Order: status transitions
  - Campaign: type enum, required fields per type
- Server-side validation (API routes)
- Client-side validation (forms — reuse Zod schemas)
- Error messages tiếng Việt
- Toast notifications cho validation errors

DEPENDENCIES: TIP-001 (cần auth context)
```

### TIP-006: PDF Generation
```
SCOPE:
- React PDF templates:
  1. Báo giá (Quote PDF):
     - Header: logo, company info, quote number
     - Customer info
     - Line items table: product, qty, price, discount, total
     - Subtotal, tax, discount, grand total
     - Terms & conditions
     - Valid until date
  2. Đơn hàng (Order PDF): tương tự quote + order status
- API endpoint: GET /api/quotes/[id]/pdf
- API endpoint: GET /api/orders/[id]/pdf
- Download button trên Quote/Order detail pages
- Vietnamese formatting: currency (VND), dates (dd/MM/yyyy)

DEPENDENCIES: TIP-003 (PDF attached trong email)
```

### TIP-007: Quote Email Send + Expiry
```
SCOPE:
- "Gửi báo giá" button trên Quote detail → thực sự gửi email
- Email chứa: summary + link download PDF + link view online
- Cập nhật quote status: DRAFT → SENT
- Expiry tracking:
  - Cron job hoặc on-access check: quotes hết hạn → status EXPIRED
  - Email nhắc nhở 3 ngày trước hết hạn
- Activity log: ghi nhận "Quote sent to [email]"

DEPENDENCIES: TIP-003 (email service), TIP-006 (PDF generation)
```

### TIP-008: Settings Persistence
```
SCOPE:
- Settings API: CRUD /api/settings
- Settings model trong DB (key-value hoặc JSON column)
- Pipeline settings: stages, colors, default probability
- Team settings: invite members, assign roles
- Company settings: name, logo, address (cho PDF header)
- Notification preferences
- UI: /settings page hoạt động thực tế (hiện chỉ stub)

DEPENDENCIES: TIP-004 (API security)
```

### TIP-009: Global Search UI
```
SCOPE:
- Command Palette (Ctrl+K / Cmd+K) dùng cmdk
- Kết nối với existing search API
- Search across: contacts, companies, deals, quotes, orders
- Recent searches
- Keyboard navigation
- Highlight matching text

DEPENDENCIES: TIP-004 (API security cho search endpoint)
```

### TIP-010: Campaign Engine
```
SCOPE:
- Kết nối campaign với Resend bulk send
- Real tracking: sent, delivered, opened (Resend webhooks), clicked
- Thay thế dữ liệu giả lập (60% random) bằng real data
- Template variables: {{firstName}}, {{company}}, {{email}}
- Unsubscribe link + tracking
- Schedule send (lên lịch gửi)
- A/B test: gửi variant A/B theo split percentage thực tế

DEPENDENCIES: TIP-003 (email service), TIP-005 (validation)
```

### TIP-011: Portal Completion
```
SCOPE:
- Magic link login thực tế (qua Resend email)
- Portal dashboard: real data từ API
- Quotes page: xem, accept/reject báo giá
- Orders page: xem trạng thái đơn hàng
- Tickets page: tạo + theo dõi support tickets
- Profile page: cập nhật thông tin
- Messaging: gửi message trong ticket (real-time optional)
- Security: CSRF protection, token signature

DEPENDENCIES: TIP-003 (magic link email), TIP-004 (API security)
```

### TIP-012: VERIFY & Polish
```
SCOPE:
- Requirement traceability check (mọi REQ đã implement?)
- Scenario walkthrough: End User persona
- Stress test scenarios: QA persona
- Technical health: build, TypeScript, lint
- Fix critical issues từ verify
- Final polish: loading states, error states, empty states
- README update: setup instructions, env vars

DEPENDENCIES: ALL previous TIPs
```

---

## EXECUTION PLAN

### Tuần 1-2: Foundation (Critical Path)
```
TIP-001 → TIP-002 → TIP-003 (parallel: TIP-004 + TIP-005)
```

### Tuần 3: Core Features
```
TIP-006 → TIP-007 (parallel: TIP-008 + TIP-009)
```

### Tuần 4: Marketing & Portal
```
TIP-010 → TIP-011
```

### Tuần 5: Verify & Ship
```
TIP-012 → Fixes → MVP LAUNCH 🚀
```

---

## WORKFLOW CHO CHỦ NHÀ

```
1. Chủ nhà lấy TIP-001 (file TIP-001-auth-system.md)
2. Paste toàn bộ nội dung vào Claude Code
3. Thợ implement + self-test
4. Thợ gửi Completion Report
5. Chủ nhà copy Completion Report → paste vào chat này cho Chủ thầu review
6. Chủ thầu review:
   - DONE → Generate TIP-002
   - PARTIAL → Tạo TIP bổ sung
   - BLOCKED → Giải quyết blocker
7. Lặp lại cho đến TIP-012
```

---

*Generated by Chủ thầu — Vibecode Kit v5.0*
*Project: Prismy CRM | Phase: 1 MVP Production*
