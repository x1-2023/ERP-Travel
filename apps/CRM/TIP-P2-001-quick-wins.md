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

**Project:** Prismy CRM — Phase 2
**Tech Stack:** Next.js 14 (App Router) + TypeScript + TailwindCSS/Shadcn + PostgreSQL/Prisma 5.22 + Supabase Auth + Resend
**Phase 1 Status:** COMPLETE (12/12 TIPs, VERIFY PASSED)

**Relevant completed work:**
  - TIP-006: PDF Generation — generateQuotePDF(quoteId) returns Buffer, /api/quotes/[id]/pdf endpoint
  - TIP-007: Quote status flow — DRAFT → SENT → ACCEPTED/REJECTED/EXPIRED
  - TIP-011: Portal — magic link auth, /portal/quotes/[id] page, verifyPortalSession()
  - src/lib/pdf/generate.ts — generateQuotePDF(), generateOrderPDF()
  - src/app/api/quotes/[id]/pdf/route.ts — PDF download with CRM auth
  - src/app/portal/quotes/[id]/ — portal quote detail page
  - src/lib/portal/auth.ts — verifyPortalSession()
  - src/components/pdf-download-button.tsx — reusable download button component

---

# TIP-P2-001: Quick Wins — Portal PDF Download + Quote VIEWED Tracking

## HEADER
- **TIP-ID:** TIP-P2-001
- **Project:** Prismy CRM Phase 2
- **Module:** Portal + Quotes
- **Depends on:** None (Phase 1 complete)
- **Priority:** P0 — Quick Win
- **Estimated effort:** 45-60 minutes

## TASK

Hai quick wins phát hiện trong VERIFY Phase 1: (1) thêm nút tải PDF trên portal quote detail, (2) tự động track khi khách hàng xem báo giá qua portal.

## SPECIFICATIONS

### 1. Portal PDF Download

```
TẠO: src/app/api/portal/quotes/[id]/pdf/route.ts

GET /api/portal/quotes/[id]/pdf
├── Auth: verifyPortalSession() (portal auth, NOT CRM auth)
├── Verify: quote belongs to portal user's contact/company
├── Generate PDF: reuse generateQuotePDF(id)
├── Return: PDF binary response
│   Content-Type: application/pdf
│   Content-Disposition: attachment; filename="QUO-{number}.pdf"
├── Error: 403 nếu quote không thuộc về portal user, 404 nếu không tồn tại

GHI CHÚ: 
- KHÔNG reuse /api/quotes/[id]/pdf trực tiếp (nó yêu cầu CRM auth)
- Tạo endpoint riêng cho portal với portal auth
- Logic generate PDF giống nhau (gọi generateQuotePDF)
```

```
CẬP NHẬT: /portal/quotes/[id] page

THÊM: Nút "Tải PDF" (Download icon)
├── Vị trí: Cạnh tiêu đề hoặc ở actions area
├── Click → fetch /api/portal/quotes/[id]/pdf → browser download
├── Reuse PdfDownloadButton component nếu compatible
├── HOẶC: tạo inline download handler nếu component khác pattern
├── Loading state khi generating
├── Error toast nếu fail
├── Hiển thị cho TẤT CẢ quote statuses (SENT, ACCEPTED, REJECTED, EXPIRED)
```

### 2. Quote VIEWED Auto-Tracking

```
APPROACH: Khi portal user mở quote detail lần đầu → ghi nhận

OPTION A — Activity Log (Recommended):
Khi portal user mở /portal/quotes/[id]:
├── Check: đã có Activity "quote.viewed" cho quote này từ portal chưa?
├── Nếu CHƯA:
│   ├── Create Activity:
│   │   type: "NOTE" (hoặc "VIEW" nếu enum có)
│   │   subject: "Khách hàng đã xem báo giá {quoteNumber}"
│   │   description: "Xem qua Customer Portal bởi {portalUser.email}"
│   │   contactId: quote.contactId
│   │   quoteId: quote.id
│   │   userId: null (portal action, not CRM user)
│   ├── Fire-and-forget (đừng block page load)
│   └── Log once only (subsequent views don't create new activities)
├── Nếu ĐÃ CÓ: skip (idempotent)

OPTION B — Quote Status Update (Alternative):
├── Thêm status VIEWED vào QuoteStatus enum (DRAFT → SENT → VIEWED → ACCEPTED/REJECTED/EXPIRED)
├── Khi portal user mở quote lần đầu, nếu status = SENT → update to VIEWED
├── Ưu điểm: trạng thái rõ ràng hơn
├── Nhược: thay đổi enum = migration + cập nhật UI badges

CHỦ THẦU RECOMMENDATION: Dùng OPTION A (Activity Log).
- Không cần thay đổi schema/enum
- CRM user thấy trong activity timeline
- Đơn giản và idempotent
- Nếu Thợ thấy Option B dễ hơn (enum đã có VIEWED), thì dùng B

IMPLEMENTATION:
CẬP NHẬT: /api/portal/quotes/[id] route (GET)
├── Sau khi trả quote data, fire-and-forget:
│   ├── Check existing viewed activity
│   └── Create if not exists
├── KHÔNG block response — dùng Promise (no await) hoặc after-response pattern

HOẶC:
CẬP NHẬT: /portal/quotes/[id] page (client-side)
├── useEffect on mount → POST /api/portal/quotes/[id]/viewed
├── Endpoint creates activity if not exists
├── Return 200 always (don't show errors for tracking)

TẠO (nếu client approach): src/app/api/portal/quotes/[id]/viewed/route.ts
POST /api/portal/quotes/[id]/viewed
├── Auth: verifyPortalSession()
├── Create Activity if not exists (idempotent)
├── Return: { success: true }
├── No error display to user
```

## ACCEPTANCE CRITERIA

### AC-1: Portal PDF Download
```
Given: Portal user viewing a quote at /portal/quotes/[id]
When: Click "Tải PDF" button
Then:
  - PDF file downloads with filename QUO-{number}.pdf
  - PDF content matches CRM-generated PDF (same template)
  - Vietnamese diacritics correct
```

### AC-2: Portal PDF Auth
```
Given: Portal user A viewing quote belonging to company B
When: Try to download PDF
Then: 403 Forbidden (quote doesn't belong to portal user)

Given: No portal session
When: GET /api/portal/quotes/[id]/pdf
Then: 401 or redirect to login
```

### AC-3: Quote VIEWED Tracking
```
Given: Portal user opens /portal/quotes/[id] for FIRST time
When: Page loads
Then:
  - Activity created: "Khách hàng đã xem báo giá QUO-xxxx"
  - Activity visible in CRM quote detail activity timeline
  - No error shown to portal user

Given: Portal user opens SAME quote AGAIN
When: Page loads
Then: NO duplicate activity created (idempotent)
```

### AC-4: VIEWED Doesn't Block Page
```
Given: Activity creation fails (DB error, etc.)
When: Portal user opens quote
Then: 
  - Quote page loads normally (tracking failure is silent)
  - No error shown to user
```

### AC-5: Build & No Regression
```
When: tsc --noEmit && next build
Then: PASS
```

## CONSTRAINTS

1. **Reuse generateQuotePDF()** — Không tạo mới PDF generation logic
2. **Portal auth only** — Endpoint mới dùng verifyPortalSession(), không CRM auth
3. **Fire-and-forget tracking** — Không block page load
4. **Idempotent** — Multiple views = 1 activity record
5. **Schema changes minimal** — Prefer Activity log over enum changes

## REPORT FORMAT SAU KHI XONG

```markdown
### COMPLETION REPORT — TIP-P2-001

**STATUS:** DONE / PARTIAL / BLOCKED

**FILES CHANGED:**
- Created: [list + purpose]
- Modified: [list + change description]

**VIEWED APPROACH:** [Option A Activity / Option B Status enum]

**TEST RESULTS:**
- AC-1 Portal PDF Download: PASS / FAIL
- AC-2 Portal PDF Auth: PASS / FAIL
- AC-3 Quote VIEWED Tracking: PASS / FAIL
- AC-4 Silent Failure: PASS / FAIL
- AC-5 Build: PASS / FAIL

**ISSUES DISCOVERED:**
- [Issue]: [severity] — [description] — [suggestion]

**DEVIATIONS FROM SPEC:**
- [Deviation]: [what] — [why] — [impact]
```
