# TASK GRAPH — PRISMY CRM PHASE 2: FEATURE COMPLETE
## Vibecode Kit v5.0 — Generated 22/02/2026

---

## PHASE 2 OBJECTIVES

**Mục tiêu:** Hoàn thiện tất cả tính năng đã scaffold, nâng cấp trải nghiệm người dùng, đảm bảo chất lượng qua E2E tests. Kết thúc Phase 2 = sản phẩm có thể demo cho khách hàng thực tế.

**Scope:**
1. Quick wins từ VERIFY report
2. Campaign scheduling UI (backend đã có)
3. E2E test suites (Playwright)
4. Dynamic Audiences (rule builder)
5. Import/Export (CSV contacts/companies)
6. Order Workflows (cancel, refund, fulfillment)
7. In-app Notifications
8. Reporting nâng cao

---

## DEPENDENCY MAP

```
TIP-P2-001: Quick Wins (Portal PDF + Quote VIEWED) ────┐
                                                         │
TIP-P2-002: Campaign Scheduling UI ─────────────────────┤
                                                         │
TIP-P2-003: E2E Test Infrastructure ────────────────┐   │
    │                                                │   │
    ▼                                                │   │
TIP-P2-004: E2E Auth + CRUD Tests                   │   │
    │                                                │   │
    ▼                                                │   │
TIP-P2-005: E2E Quote → Email → Portal Flow         │   │
                                                     │   │
TIP-P2-006: Dynamic Audiences ◄──────────────────────┘   │
                                                         │
TIP-P2-007: Import/Export (CSV) ◄────────────────────────┘
    │
    ▼
TIP-P2-008: Order Workflows (cancel/refund/fulfillment)
    │
    ▼
TIP-P2-009: In-app Notifications
    │
    ▼
TIP-P2-010: Reporting (advanced dashboard + export)
    │
    ▼
TIP-P2-011: VERIFY Phase 2
```

---

## TIP SUMMARY TABLE

| TIP | Tên | Priority | Depends On | Est. Effort | 
|-----|-----|----------|------------|-------------|
| P2-001 | Quick Wins (Portal PDF + Quote VIEWED) | P0 | None | 45-60 min |
| P2-002 | Campaign Scheduling UI | P1 | None | 45-60 min |
| P2-003 | E2E Test Infrastructure (Playwright setup) | P0 | None | 60-90 min |
| P2-004 | E2E Tests: Auth + Core CRUD | P0 | P2-003 | 90-120 min |
| P2-005 | E2E Tests: Quote → Email → Portal Flow | P1 | P2-004 | 90-120 min |
| P2-006 | Dynamic Audiences (rule builder) | P1 | None | 120-150 min |
| P2-007 | Import/Export (CSV contacts/companies) | P1 | None | 90-120 min |
| P2-008 | Order Workflows (cancel/refund/fulfillment) | P1 | None | 60-90 min |
| P2-009 | In-app Notifications | P2 | P2-008 | 90-120 min |
| P2-010 | Reporting (advanced dashboard + export) | P2 | P2-007 | 120-150 min |
| P2-011 | VERIFY Phase 2 | P0 | ALL | 90-120 min |

**Total Estimated: ~14-18 hours Claude Code time**
**Calendar time: 4-5 tuần (1 senior dev)**

---

## EXECUTION PLAN

### Tuần 1: Quick Wins + Test Foundation
```
Parallel: TIP-P2-001 + TIP-P2-002 + TIP-P2-003
Then: TIP-P2-004 (E2E auth + CRUD tests)
```

### Tuần 2: E2E + Campaign + Audiences
```
TIP-P2-005 (E2E quote flow)
Parallel: TIP-P2-006 (Dynamic Audiences)
```

### Tuần 3: Data Management
```
TIP-P2-007 (Import/Export)
TIP-P2-008 (Order Workflows)
```

### Tuần 4: UX Enhancement
```
TIP-P2-009 (Notifications)
TIP-P2-010 (Reporting)
```

### Tuần 5: Verify
```
TIP-P2-011 (Full verify)
```

---

## TIP BRIEFS

### TIP-P2-001: Quick Wins
```
SCOPE:
1. Portal PDF download button
   - Add "Tải PDF" button on /portal/quotes/[id] page
   - Reuse existing PDF endpoint with portal auth check
   - ~20 min

2. Quote VIEWED auto-tracking
   - When portal user opens quote detail → update status to VIEWED (new status)
   - Or: create Activity "Khách hàng đã xem báo giá"
   - Only first view triggers update
   - ~30 min

DEPENDENCIES: None
```

### TIP-P2-002: Campaign Scheduling UI
```
SCOPE:
- Backend already supports scheduledAt + /api/campaigns/process-scheduled
- Add to campaign create wizard (step 4):
  - Radio: "Gửi ngay" / "Lên lịch gửi"
  - Date picker + time picker (Vietnamese locale)
  - Save scheduledAt to campaign
  - Status → SCHEDULED
- Campaign detail: show "Sẽ gửi lúc {datetime}" badge
- Campaign list: SCHEDULED status badge
- Edit scheduled: change datetime or cancel schedule → back to DRAFT
- README: cron setup instructions (Vercel Cron / external)

DEPENDENCIES: None (backend from TIP-010)
```

### TIP-P2-003: E2E Test Infrastructure
```
SCOPE:
- Playwright config (already has playwright.config.ts?)
- Test utilities:
  - Auth helpers (login as ADMIN/MANAGER/MEMBER/VIEWER)
  - Database seed/cleanup for test isolation
  - Page object models for common pages
  - Test data factories (contact, company, deal, quote)
- CI-friendly setup (headless, test DB)
- Base test that verifies app loads + login works
- Directory structure: e2e/ or tests/ organized by module

DEPENDENCIES: None
```

### TIP-P2-004: E2E Tests — Auth + Core CRUD
```
SCOPE:
Test suites:
1. auth.spec.ts
   - Register new user
   - Login with valid credentials
   - Login with invalid credentials → error
   - Logout → redirect
   - Protected route redirect

2. contacts.spec.ts
   - List contacts (pagination)
   - Create contact → appears in list
   - Edit contact → changes saved
   - Delete contact → removed from list
   - Search contacts
   - Validation errors on create

3. companies.spec.ts — same pattern

4. deals.spec.ts
   - Create deal
   - Kanban drag (if testable)
   - Deal detail

5. rbac.spec.ts
   - VIEWER cannot create
   - MEMBER sees only own data
   - ADMIN sees all

Target: 15-20 test cases covering critical paths

DEPENDENCIES: TIP-P2-003
```

### TIP-P2-005: E2E Tests — Quote → Email → Portal
```
SCOPE:
Test suites:
1. quote-flow.spec.ts
   - Create quote with items
   - Generate PDF → verify download
   - Send quote email → verify status SENT
   - Expiry indicator shows

2. portal-flow.spec.ts
   - Portal login (magic link — may need test bypass)
   - Dashboard shows data
   - View quote in portal
   - Accept/reject quote
   - Create ticket
   - Reply to ticket

3. campaign-flow.spec.ts
   - Create campaign
   - Send to audience
   - Verify stats page shows real data

Target: 10-15 test cases for business flows

DEPENDENCIES: TIP-P2-004
```

### TIP-P2-006: Dynamic Audiences
```
SCOPE:
- Currently: only static audiences (manually add contacts)
- Add: Dynamic audiences with rule builder
- Rules: contact.status = X, contact.leadScore > Y, company.industry = Z, 
  contact.createdAt > date, etc.
- Rule builder UI: condition groups (AND/OR), field + operator + value
- Auto-sync: when campaign sends, resolve contacts matching rules at send time
- API: CRUD for audience rules
- Zod validation for rules
- Preview: "X contacts match these rules" count

DEPENDENCIES: None (can parallel with tests)
```

### TIP-P2-007: Import/Export
```
SCOPE:
Import:
- Upload CSV/Excel for contacts and companies
- Column mapping UI: match CSV columns to CRM fields
- Preview first 5 rows before import
- Validation: skip invalid rows, report errors
- Duplicate detection: skip or update existing (by email)
- Progress indicator for large files

Export:
- Export contacts/companies/deals to CSV
- Filter before export (current view)
- Include related data option (contacts with company name)
- Button on list pages: "Xuất CSV"

Libraries: papaparse (CSV), xlsx (Excel)

DEPENDENCIES: None
```

### TIP-P2-008: Order Workflows
```
SCOPE:
- Cancel order: PENDING/CONFIRMED → CANCELLED (with reason)
- Refund: DELIVERED → REFUNDED (partial or full, amount input)
- Fulfillment updates:
  - PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
  - Each transition: timestamp + optional note
  - Timeline UI showing all status changes
- Order status change triggers Activity log
- Validation: only valid transitions allowed (state machine)
- Portal: customer sees status timeline (read-only)

DEPENDENCIES: None
```

### TIP-P2-009: In-app Notifications
```
SCOPE:
- Notification model: userId, type, title, message, read, link, createdAt
- Types: quote_accepted, quote_rejected, ticket_new, ticket_reply,
  deal_stale, quote_expiring, order_status_changed
- Bell icon in header with unread count badge
- Dropdown panel: list notifications, mark as read
- Click → navigate to relevant page
- API: GET /api/notifications, PATCH /api/notifications/[id]/read,
  POST /api/notifications/mark-all-read
- Triggers: create notifications when relevant events happen
  (quote accept in portal → notify CRM user, etc.)

DEPENDENCIES: TIP-P2-008 (order status triggers)
```

### TIP-P2-010: Reporting (Advanced Dashboard + Export)
```
SCOPE:
- Dashboard date range selector (last 7d, 30d, 90d, custom)
- Metrics with comparison to previous period (↑12% vs last month)
- Charts:
  - Revenue pipeline (funnel: stages → values)
  - Deals won/lost over time (line chart)
  - Top contacts by deal value (bar chart)
  - Campaign performance comparison (bar chart)
  - Quote acceptance rate (donut chart)
- Export dashboard as CSV/Excel
- Sales report page: filterable table of deals with totals
- Real data from DB (replace any remaining mock data)

DEPENDENCIES: TIP-P2-007 (export utilities reusable)
```

### TIP-P2-011: VERIFY Phase 2
```
SCOPE:
- Run all E2E tests → pass rate
- Feature completeness check (new features)
- Scenario walkthroughs with new features
- Performance spot check (page load times)
- Mobile responsiveness check (key pages)
- Fix quick issues
- Final report

DEPENDENCIES: ALL
```

---

## MILESTONES

| Milestone | Target | Criteria |
|-----------|--------|----------|
| M4: E2E Green | Tuần 2 | 25+ E2E tests passing, CI-ready |
| M5: Feature Complete | Tuần 4 | All Phase 2 features implemented |
| M6: Phase 2 Verified | Tuần 5 | Verify report READY, E2E >90% pass |

---

*Generated by Chủ thầu — Vibecode Kit v5.0*
*Project: Prismy CRM | Phase: 2 Feature Complete*
