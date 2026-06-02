# PRISMY CRM - BÁO CÁO DỰ ÁN CHO NHÀ ĐẦU TƯ

**Ngày báo cáo:** 21/02/2026
**Phiên bản:** 0.1.0
**Trạng thái:** Đang phát triển (Pre-production)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mô tả

Prismy CRM là hệ thống quản lý quan hệ khách hàng (Customer Relationship Management) được xây dựng trên nền tảng công nghệ hiện đại, hướng đến thị trường doanh nghiệp vừa và nhỏ (SME) tại Việt Nam. Hệ thống cung cấp giải pháp toàn diện cho việc quản lý khách hàng, pipeline bán hàng, báo giá, đơn hàng, chiến dịch marketing và cổng khách hàng tự phục vụ.

### 1.2 Định hướng chiến lược

> **Quyết định quan trọng:** Dự án sẽ được phát triển độc lập thành sản phẩm CRM hoàn chỉnh trước khi tích hợp vào hệ sinh thái Prismy ERP (bao gồm các module MRP, OTB, HRM, TPM, Sheets, Mail). Điều này cho phép tập trung nguồn lực vào việc hoàn thiện sản phẩm CRM, đưa ra thị trường sớm và tạo doanh thu độc lập.

### 1.3 Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản |
|-----------|-----------|-----------|
| Framework | Next.js (App Router) | 14.2.35 |
| Ngôn ngữ | TypeScript | 5.9.3 |
| Giao diện | TailwindCSS + Shadcn/UI | 3.4.1 |
| Cơ sở dữ liệu | PostgreSQL + Prisma ORM | 5.22.0 |
| Xác thực | Supabase Auth | Latest |
| Quản lý state | TanStack React Query + Zustand | 5.90 / 5.0 |
| Biểu đồ | Recharts | 3.7.0 |
| Kéo thả | dnd-kit | 6.3.1 |
| Kiểm thử | Playwright (E2E) | 1.58.2 |
| PDF | React PDF Renderer | 4.3.2 |

---

## 2. TIẾN ĐỘ PHÁT TRIỂN

### 2.1 Tổng quan hoàn thành

```
Tổng tiến độ dự án: ████████████░░░░░░░░ 65%
```

| Module | Tiến độ | Trạng thái |
|--------|---------|------------|
| Quản lý Liên hệ (Contacts) | 95% | ✅ Hoàn thành |
| Quản lý Công ty (Companies) | 90% | ✅ Hoàn thành |
| Hoạt động & Timeline | 90% | ✅ Hoàn thành |
| Pipeline & Deals (Kanban) | 85% | ✅ Cơ bản hoàn thành |
| Báo giá (Quotes) | 85% | ⚠️ Thiếu PDF & email |
| Đơn hàng (Orders) | 85% | ⚠️ Thiếu workflow fulfillment |
| Dashboard & Analytics | 85% | ⚠️ Cần kết nối dữ liệu thực |
| Chiến dịch Marketing | 70% | ⚠️ Chưa tích hợp email provider |
| Đối tượng khách hàng (Audiences) | 70% | ⚠️ Chỉ có Static, thiếu Dynamic |
| Cổng khách hàng (Portal) | 60% | ⚠️ Cấu trúc có, nội dung thiếu |
| Tìm kiếm toàn cục | 50% | ⚠️ API có, chưa hiển thị trên UI |
| Cài đặt hệ thống | 40% | ⚠️ UI stub, chưa lưu được |
| Xác thực & Phân quyền | 30% | ❌ Chỉ có demo mode |
| Gửi Email | 0% | ❌ Chưa triển khai |
| Xuất PDF | 0% | ❌ Thư viện đã cài, chưa code |

### 2.2 Chi tiết từng module

#### 2.2.1 Quản lý Liên hệ (95%) ✅

**Đã hoàn thành:**
- CRUD đầy đủ: tạo, xem, sửa, xóa liên hệ
- Danh sách với phân trang, tìm kiếm, lọc theo trạng thái và công ty
- Trang chi tiết liên hệ với timeline hoạt động
- Theo dõi trạng thái: Active, Inactive, Lead, Customer, Churned
- Lead scoring (điểm tiềm năng 0-100)
- Hiển thị công ty, deals, activities liên quan
- Avatar với fallback chữ cái đầu

**Cần bổ sung:**
- Kiểm tra trùng lặp email
- Validate dữ liệu chặt chẽ hơn
- Import/Export danh bạ (CSV/Excel)

#### 2.2.2 Quản lý Công ty (90%) ✅

**Đã hoàn thành:**
- CRUD đầy đủ với giao diện card view
- Tìm kiếm, lọc theo ngành nghề
- Phân loại quy mô: Solo, Small, Medium, Large, Enterprise
- Trang chi tiết với tabs: Contacts, Deals, Activities
- Badge hiển thị số lượng contacts và deals

**Cần bổ sung:**
- Quản lý ngành nghề động (hiện đang hardcode)
- Thao tác hàng loạt (bulk operations)

#### 2.2.3 Pipeline & Deals (85%) ✅

**Đã hoàn thành:**
- Kanban board kéo thả giữa các giai đoạn
- Tạo deal gắn với contact/company
- Hiển thị giá trị, xác suất thắng, người phụ trách
- Theo dõi Won/Lost
- Trang chi tiết deal với quotes/orders liên quan

**Cần bổ sung:**
- Chỉnh sửa cấu hình pipeline trong Settings
- Chỉ báo thời gian deal nằm tại stage
- Tính giá trị pipeline có trọng số xác suất
- Cải thiện UX drag-drop (visual feedback)

#### 2.2.4 Báo giá & Đơn hàng (85%) ⚠️

**Đã hoàn thành:**
- Tạo báo giá với line items, sản phẩm, chiết khấu, thuế
- Danh sách báo giá với lọc theo trạng thái
- Chuyển đổi báo giá → đơn hàng
- Đơn hàng với timeline fulfillment
- Số tự động: QUO-2024-0001

**Chưa hoàn thành (quan trọng):**
- ❌ Xuất PDF báo giá (thư viện đã cài nhưng chưa implement)
- ❌ Gửi báo giá qua email (chỉ cập nhật trạng thái)
- ❌ Nhắc nhở hết hạn báo giá
- ❌ Workflow hủy/hoàn đơn hàng
- ❌ Quản lý tồn kho sản phẩm

#### 2.2.5 Chiến dịch Marketing (70%) ⚠️

**Đã hoàn thành:**
- CRUD chiến dịch với wizard 4 bước
- Hỗ trợ loại: Email, SMS, Push
- A/B testing với phân chia tỷ lệ
- Theo dõi trạng thái: Draft → Sent
- Thống kê: sent, opened, clicked, bounced

**Chưa hoàn thành (quan trọng):**
- ❌ Tích hợp email provider (Sendgrid/Resend/AWS SES)
- ❌ SMS/Push chưa có backend
- ❌ Dữ liệu thống kê đang giả lập (60% random)
- ❌ Chức năng hủy đăng ký (unsubscribe)
- ❌ Template variables chưa hoạt động
- ❌ Lên lịch gửi chiến dịch

#### 2.2.6 Cổng Khách hàng - Portal (60%) ⚠️

**Đã hoàn thành:**
- Layout riêng (light theme)
- Đăng nhập bằng magic link
- Dashboard hiển thị orders, quotes, tickets
- Quản lý session

**Chưa hoàn thành:**
- ❌ Gửi email magic link thực tế (chỉ console.log)
- ❌ Trang quotes/orders trong portal là placeholder
- ❌ Messaging giữa khách hàng và nhân viên
- ❌ Trang profile chưa có nội dung
- ❌ Bảo mật token yếu (không CSRF, không signature)

#### 2.2.7 Xác thực & Phân quyền (30%) ❌

**Tình trạng nghiêm trọng:**
- Toàn bộ hệ thống sử dụng hardcoded demo user (`demo-user-001`)
- Middleware Supabase đã cấu hình nhưng chưa kết nối với API routes
- Schema có UserRole (ADMIN, MANAGER, MEMBER, VIEWER) nhưng chưa enforce
- Không có trang đăng nhập/đăng ký thực tế
- Không có cơ chế refresh token

---

## 3. ĐÁNH GIÁ CHẤT LƯỢNG

### 3.1 Điểm mạnh

| Tiêu chí | Đánh giá |
|----------|---------|
| Kiến trúc code | ⭐⭐⭐⭐ Tách biệt rõ ràng, component có tổ chức |
| Database schema | ⭐⭐⭐⭐⭐ Enterprise-grade, quan hệ đầy đủ |
| Type safety | ⭐⭐⭐⭐ TypeScript xuyên suốt |
| UI/UX | ⭐⭐⭐⭐ Giao diện đẹp, dark mode, glass-morphism |
| Data fetching | ⭐⭐⭐⭐ React Query pattern tốt |
| Loading states | ⭐⭐⭐⭐ Skeleton loading, Suspense boundaries |

### 3.2 Điểm yếu cần cải thiện

| Tiêu chí | Đánh giá | Ghi chú |
|----------|---------|---------|
| Bảo mật | ⭐ | Không có auth thực tế |
| Xử lý lỗi | ⭐⭐ | Chỉ catch generic 500 |
| Validation | ⭐⭐ | Phụ thuộc Prisma schema |
| Testing | ⭐⭐ | 5 smoke test E2E, 0 unit test |
| Rate limiting | ⭐ | Chưa có |
| Logging | ⭐ | Chỉ console.error |

---

## 4. CƠ SỞ DỮ LIỆU

### 4.1 Mô hình dữ liệu

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Company    │────<│   Contact   │────<│   Activity  │
│             │     │             │     │             │
│ name        │     │ firstName   │     │ type        │
│ domain      │     │ lastName    │     │ subject     │
│ industry    │     │ email       │     │ dueDate     │
│ size        │     │ status      │     │ completed   │
│ phone/email │     │ leadScore   │     │ duration    │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │    ┌──────────────┘
       │    │
       ▼    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Deal     │────>│   Quote     │────>│ SalesOrder  │
│             │     │             │     │             │
│ title       │     │ quoteNumber │     │ orderNumber │
│ value       │     │ subtotal    │     │ status      │
│ probability │     │ tax/discount│     │ paidAt      │
│ stage       │     │ validUntil  │     │ shippedAt   │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                    ┌──────┴──────┐     ┌──────┴──────┐
                    │  QuoteItem  │     │  OrderItem  │
                    │             │     │             │
                    │ product     │     │ product     │
                    │ quantity    │     │ quantity    │
                    │ unitPrice   │     │ unitPrice   │
                    │ discount    │     │ total       │
                    └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Campaign   │────<│  Variant    │     │  Audience   │
│             │     │             │     │             │
│ name        │     │ name        │     │ name        │
│ type        │     │ subject     │     │ type        │
│ status      │     │ splitPct    │     │ rules       │
│ stats       │     │ content     │     │ memberCount │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ PortalUser  │────<│   Ticket    │────<│  Message    │
│             │     │             │     │             │
│ email       │     │ subject     │     │ content     │
│ company     │     │ status      │     │ isInternal  │
│ sessions    │     │ priority    │     │ sender      │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 4.2 Thống kê Schema

- **13 model chính** + 6 bảng trung gian (junction tables)
- **5 enum types**: UserRole, CompanySize, ContactStatus, LeadSource, ActivityType
- **Cascading deletes** được cấu hình đúng
- **Full-text search** preview feature được bật
- **Audit log** cho compliance

---

## 5. HƯỚNG PHÁT TRIỂN

### 5.1 Giai đoạn 1: MVP Production (4-6 tuần)

**Mục tiêu:** Đưa CRM lên production với các tính năng cốt lõi hoạt động thực tế.

| # | Công việc | Ưu tiên | Ước lượng |
|---|----------|---------|-----------|
| 1 | **Xác thực thực tế** - Kết nối Supabase Auth, trang login/register, JWT validation trên API routes | P0 - Critical | 1 tuần |
| 2 | **Phân quyền RBAC** - Enforce UserRole trên API, phân quyền theo vai trò (Admin/Manager/Member/Viewer) | P0 - Critical | 1 tuần |
| 3 | **Tích hợp Email** - Setup Resend.dev hoặc Sendgrid, gửi báo giá, magic link portal, thông báo | P0 - Critical | 1 tuần |
| 4 | **Xuất PDF** - Implement React PDF cho báo giá và đơn hàng | P1 - High | 3-4 ngày |
| 5 | **Validation & Error handling** - Input validation (Zod), error messages rõ ràng, toast notifications | P1 - High | 1 tuần |
| 6 | **Settings persistence** - Lưu cấu hình pipeline, team, hệ thống vào database | P1 - High | 3-4 ngày |
| 7 | **Global search UI** - Kết nối Command Palette (cmdk) với search API | P2 - Medium | 2-3 ngày |

### 5.2 Giai đoạn 2: Feature Complete (4-6 tuần)

**Mục tiêu:** Hoàn thiện tất cả tính năng đã scaffold, nâng cấp trải nghiệm người dùng.

| # | Công việc | Ưu tiên | Ước lượng |
|---|----------|---------|-----------|
| 8 | **Hoàn thiện Portal** - Trang quotes/orders thực tế, messaging ticket, profile management | P1 - High | 1.5 tuần |
| 9 | **Campaign Engine** - Tích hợp email thực tế, tracking pixel, unsubscribe, scheduling | P1 - High | 2 tuần |
| 10 | **Dynamic Audiences** - Rule builder UI, auto-sync contacts theo điều kiện | P2 - Medium | 1 tuần |
| 11 | **Reporting nâng cao** - Chọn khoảng thời gian, export CSV/Excel, so sánh giai đoạn | P2 - Medium | 1 tuần |
| 12 | **Import/Export** - Import contacts/companies từ CSV, export danh sách | P2 - Medium | 3-4 ngày |
| 13 | **Notifications** - Thông báo in-app, nhắc nhở hoạt động, deal aging alerts | P2 - Medium | 1 tuần |
| 14 | **Order Workflows** - Hủy đơn, hoàn tiền, cập nhật trạng thái fulfillment | P2 - Medium | 3-4 ngày |

### 5.3 Giai đoạn 3: Production Hardening (3-4 tuần)

**Mục tiêu:** Sẵn sàng cho deployment thương mại, bảo mật và ổn định.

| # | Công việc | Ưu tiên | Ước lượng |
|---|----------|---------|-----------|
| 15 | **Unit & Integration Tests** - Viết test cho API routes, hooks, components quan trọng | P1 - High | 2 tuần |
| 16 | **Rate Limiting & Security** - API rate limiting, CSRF protection, input sanitization | P1 - High | 3-4 ngày |
| 17 | **Logging & Monitoring** - Structured logging, error tracking (Sentry), APM | P1 - High | 3-4 ngày |
| 18 | **Performance** - Database indexing, query optimization, caching strategy | P2 - Medium | 1 tuần |
| 19 | **CI/CD Pipeline** - Automated testing, staging environment, deployment automation | P2 - Medium | 3-4 ngày |
| 20 | **Database Migration** - Seed data, migration scripts, backup strategy | P2 - Medium | 2-3 ngày |

### 5.4 Giai đoạn 4: Mở rộng & Tăng trưởng (Liên tục)

**Mục tiêu:** Tính năng nâng cao, mở rộng thị trường.

| # | Công việc | Ưu tiên |
|---|----------|---------|
| 21 | **Multi-tenant** - Hỗ trợ nhiều tổ chức trên cùng hệ thống |
| 22 | **AI/ML Features** - Lead scoring tự động, gợi ý hành động, predictive analytics |
| 23 | **Mobile Responsive** - Tối ưu trải nghiệm mobile |
| 24 | **Webhook & API Public** - Cho phép tích hợp bên thứ ba |
| 25 | **Đa ngôn ngữ** - Hỗ trợ English bên cạnh Vietnamese |
| 26 | **Tích hợp Prismy ERP** - Kết nối MRP, OTB, HRM, TPM khi sẵn sàng |

---

## 6. ĐÁNH GIÁ RỦI RO

### 6.1 Rủi ro cao

| Rủi ro | Ảnh hưởng | Giải pháp |
|--------|-----------|-----------|
| Không có authentication | Toàn bộ hệ thống là demo, không thể deploy | Ưu tiên #1 trong Phase 1 |
| Không gửi được email | Báo giá, portal, campaign không hoạt động | Tích hợp email provider trong Phase 1 |
| Hardcoded demo user | Không test được multi-user, không phân quyền | Thay thế bằng auth thực tế |

### 6.2 Rủi ro trung bình

| Rủi ro | Ảnh hưởng | Giải pháp |
|--------|-----------|-----------|
| Test coverage thấp | Regression bugs khi phát triển thêm | Unit test trong Phase 3 |
| Error handling yếu | UX kém khi có lỗi | Cải thiện trong Phase 1 |
| Portal chưa hoàn thiện | Khách hàng không tự phục vụ được | Hoàn thiện trong Phase 2 |

### 6.3 Rủi ro thấp

| Rủi ro | Ảnh hưởng | Giải pháp |
|--------|-----------|-----------|
| Database schema thay đổi | Migration phức tạp | Schema đã thiết kế tốt, ít thay đổi |
| Tech stack lỗi thời | Khó bảo trì | Stack hiện đại, cộng đồng lớn |

---

## 7. NGUỒN LỰC CẦN THIẾT

### 7.1 Nhân sự đề xuất

| Vai trò | Số lượng | Ghi chú |
|---------|----------|---------|
| Full-stack Developer (Senior) | 1 | Lead development, architecture decisions |
| Full-stack Developer (Mid) | 1-2 | Feature development, testing |
| UI/UX Designer | 0.5 | Part-time, review & improve design |
| QA Engineer | 0.5 | Part-time từ Phase 3 |

### 7.2 Timeline dự kiến

```
Phase 1: MVP Production      ████████████                    (Tuần 1-6)
Phase 2: Feature Complete              ████████████          (Tuần 7-12)
Phase 3: Production Hardening                    ████████    (Tuần 13-16)
Phase 4: Mở rộng                                        ──> (Liên tục)
                              |         |         |         |
                           Tháng 1   Tháng 2   Tháng 3   Tháng 4
```

### 7.3 Milestones

| Milestone | Thời điểm | Tiêu chí hoàn thành |
|-----------|-----------|---------------------|
| **M1: Auth & Security** | Tuần 2 | Login/register hoạt động, RBAC enforce |
| **M2: Email & PDF** | Tuần 4 | Gửi báo giá qua email, xuất PDF |
| **M3: MVP Launch** | Tuần 6 | Deploy lên staging, demo cho khách hàng đầu tiên |
| **M4: Portal Live** | Tuần 9 | Khách hàng truy cập portal, tạo ticket |
| **M5: Campaign Live** | Tuần 11 | Gửi email campaign thực tế |
| **M6: Production Ready** | Tuần 16 | Test coverage >70%, monitoring, CI/CD |

---

## 8. GIÁ TRỊ SẢN PHẨM

### 8.1 Thế mạnh cạnh tranh

1. **Thiết kế cho thị trường Việt Nam** - Giao diện tiếng Việt, workflow phù hợp SME Việt Nam
2. **Tech stack hiện đại** - Next.js 14, TypeScript, Tailwind - dễ tuyển dụng developer, dễ mở rộng
3. **Database schema enterprise-grade** - 13+ model, quan hệ đầy đủ, audit log, sẵn sàng scale
4. **All-in-one** - CRM + Marketing + Portal + Orders trong cùng 1 sản phẩm
5. **Khả năng mở rộng** - Kiến trúc sẵn sàng cho multi-tenant và tích hợp ERP

### 8.2 Tài sản kỹ thuật hiện có

- **~120+ files source code** đã viết
- **26 UI components** (Shadcn/UI) tái sử dụng
- **15+ API endpoints** CRUD đầy đủ
- **5 E2E test suites** với Playwright
- **13 React Query hooks** cho data fetching
- **Customer Portal** framework sẵn sàng

### 8.3 Thị trường mục tiêu

- Doanh nghiệp SME Việt Nam (50-500 nhân viên)
- Các công ty cần CRM tiếng Việt với giá cả phải chăng
- Doanh nghiệp muốn tự host (on-premise) hoặc cloud

---

## 9. KẾT LUẬN

Prismy CRM đã hoàn thành **65-70% khối lượng công việc** với nền tảng kỹ thuật vững chắc. Các tính năng cốt lõi CRM (contacts, companies, deals, activities) hoạt động tốt với giao diện người dùng chất lượng cao. Tuy nhiên, cần **4-6 tuần tập trung** để đạt trạng thái MVP production-ready, chủ yếu ở mảng xác thực, email, và bảo mật.

**Điểm mấu chốt:**
- Database schema và kiến trúc code là tài sản có giá trị cao
- Cần ưu tiên authentication và email integration trước mọi tính năng khác
- Với 2-3 developer, có thể đạt MVP trong 6 tuần và production-ready trong 16 tuần
- Sản phẩm có tiềm năng thương mại hóa sau Phase 2

---

*Báo cáo được tạo dựa trên phân tích chi tiết toàn bộ codebase.*
*Liên hệ team phát triển để biết thêm chi tiết kỹ thuật.*
