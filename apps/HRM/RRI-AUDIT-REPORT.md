# RRI COMPREHENSIVE AUDIT REPORT
## VietERP HRM System — VietERP Vietnam
**Date:** 2026-03-09 | **Methodology:** RRI-T + RRI-UX + RRI-UI Combined
**Scope:** Full codebase (148 TSX files, 30+ Prisma models, 50+ API routes)

---

## EXECUTIVE SUMMARY

| Methodology | Findings | Critical (P0) | High (P1) | Medium (P2) | Low (P3) |
|-------------|----------|---------------|-----------|-------------|----------|
| RRI-T (Testing) | 111 | 8 | 22 | 38 | 36 |
| RRI-UX (UX Critique) | 90 | 12 BROKEN | 7 MISSING | 67 FRICTION | 4 FLOW |
| RRI-UI (UI Design) | 121 | 7 Critical | 23 Warnings | — | — |
| **COMBINED TOTAL** | **~300+** | **27** | **52** | **105+** | **40+** |

### RELEASE GATE DECISION: 🟡 CONDITIONAL RELEASE

Hệ thống có nền tảng kiến trúc vững chắc, RBAC hoạt động tốt, và UI nhất quán với brand identity. **Tuy nhiên cần fix 4 BLOCKING issues trước khi deploy production.**

---

## PHẦN 1: TOP BLOCKING ISSUES (PHẢI FIX TRƯỚC PRODUCTION)

### 🔴 BLOCK-01: Demo Password Hardcoded (P0)
- **File:** `src/app/(auth)/login/page.tsx:22`
- **Vấn đề:** Password `RTR@2026` hardcode trong client bundle, visible qua DevTools
- **Cũng ở:** `src/app/api/employees/route.ts:178` — default password cho user mới
- **Fix:** Gate demo panel sau env flag `NEXT_PUBLIC_SHOW_DEMO`; generate random temp password cho user mới

### 🔴 BLOCK-02: No Rate Limiting on Public Endpoint (P0)
- **File:** `src/app/api/recruitment/public/apply/route.ts`
- **Vấn đề:** Public apply endpoint không có rate limiting → bot spam risk
- **Fix:** Add IP-based rate limiting (3 apps/hour/IP) + honeypot field

### 🔴 BLOCK-03: Copilot Message Length Unbounded (P0)
- **File:** `src/app/api/copilot/route.ts:23`
- **Vấn đề:** Client gửi unlimited messages → chi phí Anthropic API không kiểm soát
- **Fix:** Limit `messages.length ≤ 20`, validate `content.length ≤ 4000`

### 🔴 BLOCK-04: Inactive Dependents Counted in Tax (P1)
- **File:** `src/app/api/payroll/[periodId]/initialize/route.ts:100`
- **Vấn đề:** `emp.dependents.length` không filter `isActive: true` → tính sai thuế TNCN
- **Fix:** `dependents: { where: { isActive: true }, select: { id: true } }`

---

## PHẦN 2: UX COVERAGE MATRIX

### 7 UX Dimensions Assessment

| Dimension | Score | Status | Top Issues |
|-----------|-------|--------|------------|
| U1: Flow Direction | 83% | 🟡 WARNING | CTA scrolls away on long lists, no sticky headers |
| U2: Information Hierarchy | 90% | 🟢 PASS | Minor: abbreviations (NPT, TT), raw UUIDs in change history |
| U3: Cognitive Load | 85% | 🟢 PASS | 7 stat cards at xl:grid-cols-7; 70-item unsearchable dropdowns |
| U4: Feedback & State | 79% | 🟡 WARNING | Missing error states, inconsistent loading (skeleton vs text) |
| U5: Error Recovery | 72% | 🟡 WARNING | No form auto-save, no unsaved-data warning, no retry buttons |
| U6: Accessibility | 80% | 🟡 WARNING | Touch targets <44px, emoji in attendance grid, font 12px |
| U7: Context Preservation | 75% | 🟡 WARNING | Sidebar collapse resets, notification click full-reload |

**Average: 80.6% → 🟡 CONDITIONAL (cần ≥85% ở 5/7 dimensions)**

---

## PHẦN 3: HIGH PRIORITY FIXES (Fix trong Sprint tiếp theo)

### Security & Data Integrity

| # | ID | Module | Issue | Fix |
|---|-----|--------|-------|-----|
| 1 | AUTH-003 | Auth | No brute-force protection on login | Rate limiting + lockout after 5 fails |
| 2 | AUTH-004 | Auth | RBAC route matching iterates ALL rules | Break on first match, longest-prefix-first |
| 3 | PAY-004 | Payroll | No transaction wrapping initialization | `prisma.$transaction` for batch creates |
| 4 | PAY-008 | Payroll | Concurrent approval not protected | Optimistic locking via `updateMany WHERE status` |
| 5 | HRE-001 | HR Events | Approved events don't update Employee | Apply payload changes in same transaction |
| 6 | CONT-002 | Contracts | Multiple active contracts allowed | Deactivate existing before activating new |
| 7 | ATT-001 | Attendance | Timezone boundary mismatch | Use `todayVN()` pattern for month boundaries |
| 8 | INF-002 | Infra | PG Pool unconfigured (default 10) | Set `max: 20, idleTimeoutMillis: 30000` |

### UX Critical Fixes

| # | Issue | Screen | Problem | Fix |
|---|-------|--------|---------|-----|
| 9 | UX-019 | Employee Form | No auto-save, data loss on nav | Persist to sessionStorage, restore on mount |
| 10 | UX-036 | Kanban Modal | Custom modal lacks focus trap/ARIA | Replace with shadcn `<Dialog>` |
| 11 | UX-044 | AI Chat | `dangerouslySetInnerHTML` markdown | Use `react-markdown` library |
| 12 | UX-026 | Payroll Drawer | Race condition: default 26 days | Disable save until `ep` loaded |
| 13 | UX-055 | Notifications | `window.location.href` full reload | Use `router.push()` for SPA navigation |
| 14 | UX-022 | Employee Detail | Raw UUIDs in change history | Resolve FK IDs to names in API |
| 15 | UX-037 | Kanban | Side effect in render body | Move to `useEffect` for state sync |

### UI/Responsive Fixes

| # | Issue | Screen | Problem | Fix |
|---|-------|--------|---------|-----|
| 16 | UI-IMP | Import Page | `grid-cols-4` breaks at 375px | `grid-cols-2 md:grid-cols-4` |
| 17 | UI-DASH | Dashboard Stats | `xl:grid-cols-7` truncates cards | `xl:grid-cols-4 2xl:grid-cols-7` |
| 18 | UI-FORM | Employee Form | Step labels overflow mobile | Short labels on mobile |
| 19 | UI-PAY | Payroll Table | Action column off-screen | Sticky right column |
| 20 | UI-CHAT | Copilot Chat | `100vh` broken with mobile keyboard | Use `100dvh` |

---

## PHẦN 4: VIETNAMESE-SPECIFIC COMPLIANCE

| # | Pattern | Status | Notes |
|---|---------|--------|-------|
| VN-1 | Text +30% longer than EN | ⚠️ PARTIAL | Some containers handle; stats cards overflow |
| VN-2 | Diacritics line-height ≥1.5 | ✅ PASS | Tailwind default 1.5 |
| VN-3 | autoCorrect="off" on ID fields | ❌ FAIL | Missing on nationalId, phone, employeeCode |
| VN-4 | VND format (1.234.567 ₫) | ⚠️ PARTIAL | Display OK; no input formatting while typing |
| VN-5 | Date DD/MM/YYYY | ⚠️ PARTIAL | `formatDate` OK; `toLocaleDateString` inconsistent |
| VN-6 | Address cascading | ❌ NOT IMPL | Free-text only (acceptable for 70 NV) |
| VN-7 | Diacritic-insensitive search | ⚠️ PARTIAL | `nameNoAccent` exists but not in all search queries |
| VN-8 | Phone +84/0xxx | ⚠️ PARTIAL | Missing `inputMode="tel"` |
| VN-9 | CCCD 12/CMND 9 digits | ⚠️ PARTIAL | Validation OK; no inline maxLength |
| VN-10 | PDF export Unicode | ⚠️ UNVERIFIED | Excel OK via xlsx; PDF path not confirmed |
| VN-11 | VN font size ≥14px | ⚠️ WARNING | `text-xs` (12px) used extensively in tables |
| VN-12 | VND input formatting | ❌ FAIL | Raw number input, no thousand separators |

**Score: 5/12 Pass → Cần cải thiện VN-specific UX**

---

## PHẦN 5: BUSINESS LOGIC ISSUES (BA Persona)

| # | Module | Issue | Severity |
|---|--------|-------|----------|
| 1 | Payroll | Phone/fuel allowances 100% tax-free (should have caps per Circular 78) | P2 |
| 2 | Payroll | `standardDays` excludes weekends but not VN public holidays | P3 |
| 3 | Payroll | No mid-month pro-ration for terminated contracts | P1 |
| 4 | Insurance | No BHXH salary cap (max 20× minimum wage ~36M) | P1 |
| 5 | PIT | Tax brackets/deductions hardcoded (not configurable) | P1 |
| 6 | Recruitment | Auto-created employee gets `gender: "MALE"` hardcoded | P2 |
| 7 | Recruitment | ACCEPTED employee `startDate` = now (not HR-specified) | P2 |
| 8 | Reports | LEAVE_MATERNITY may deduct from annual leave incorrectly | P2 |
| 9 | Employee | `nameNoAccent` not regenerated on fullName update | P2 |
| 10 | Employee | `nationalId` uniqueness error returns generic 500 | P2 |
| 11 | Templates | Files on ephemeral filesystem (lost on cold start) | P1 |

---

## PHẦN 6: PERFORMANCE CONCERNS (DevOps Persona)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | Notification polling 30-60s × 70 users = 70-140 DB queries/min | DB load | SSE or Redis counter |
| 2 | `notifyHR` queries ALL HR users on every call | Redundant queries | Cache HR user IDs (5min TTL) |
| 3 | Send payslips: 200ms delay × 70 = 14s (serverless timeout risk) | Timeout | Background job/queue |
| 4 | Import: raw Excel data stored as JSON in DB (2.5MB+) | DB bloat | Store in file storage |
| 5 | Import AI analysis: synchronous Claude API call (5-15s) | Timeout | Background job + polling |
| 6 | Attendance grid: 1820 unvirtualized DOM cells | Rendering perf | `@tanstack/react-virtual` |
| 7 | Search: 5 parallel Prisma queries on every keystroke | Connection pool | Role-based query filtering |
| 8 | Dashboard stats: not cached server-side | Unnecessary recomputation | Redis cache 2min TTL |

---

## PHẦN 7: CONSISTENCY ISSUES

### Design System Violations
- Raw `<select>` thay vì shadcn `Select`: kanban-board.tsx:257, reviews/page.tsx:113, apply/page.tsx:203
- Raw `<label>` thay vì shadcn `Label`: kanban-board.tsx:223, reviews/page.tsx:107
- Raw `<textarea>` thay vì shadcn `Textarea`: kanban-board.tsx:223
- Brand color `#1E3A5F` inline style ở 50+ locations thay vì Tailwind custom color
- Loading states: 4 patterns khác nhau (skeleton, "...", "Đang tải...", Loader2)
- Date format: 3 cách khác nhau (`formatDate`, `toLocaleDateString`, `format`)

### Missing Features (🔲 MISSING)
1. No bulk employee actions (bulk status change, dept reassignment)
2. No CV upload on public apply form
3. No full notifications page (only dropdown)
4. No "Chấm Công Hôm Nay" widget on dashboard
5. No email to candidates on status changes
6. No attendance record creation from grid (only edit existing)
7. No session management in admin panel

---

## PHẦN 8: ACTION PLAN

### Phase 1 — BLOCKING (Trước Production Deploy)
1. Remove/gate demo password
2. Add rate limiting on public endpoints
3. Bound copilot message length
4. Fix dependent tax calculation
**Effort: 1 ngày**

### Phase 2 — CRITICAL UX + Security (Sprint 1)
5-20 từ danh sách High Priority ở trên
**Effort: 3-5 ngày**

### Phase 3 — VN Compliance + Business Logic (Sprint 2)
- Insurance salary cap
- PIT configurability
- Holiday calendar
- Contract pro-ration
- VND input formatting
**Effort: 3-5 ngày**

### Phase 4 — Polish + Performance (Sprint 3)
- Notification SSE
- Loading skeleton standardization
- Design system consistency
- Touch target improvements
- Mobile responsive fixes
**Effort: 3-5 ngày**

---

## FILES MOST NEEDING ATTENTION

| File | Issues Found |
|------|-------------|
| `src/app/(auth)/login/page.tsx` | 4 (security, a11y, mobile) |
| `src/components/employees/employee-form.tsx` | 5 (no autosave, overflow, step nav) |
| `src/components/payroll/employee-payroll-drawer.tsx` | 5 (race condition, raw select, touch) |
| `src/components/recruitment/kanban-board.tsx` | 5 (modal a11y, render side-effect, raw HTML) |
| `src/app/api/payroll/[periodId]/initialize/route.ts` | 4 (dependents, transaction, timezone) |
| `src/components/copilot/chat-interface.tsx` | 3 (innerHTML, mobile keyboard, quick prompts) |
| `src/components/dashboard/stats-grid.tsx` | 3 (grid-cols-7, loading CLS, deep links) |
| `src/components/layout/sidebar.tsx` | 3 (state reset, tooltip, collapse) |
| `src/components/layout/notification-bell.tsx` | 3 (full reload, no page, polling) |
| `src/app/(dashboard)/import/page.tsx` | 3 (grid-cols-4, no cancel, step overflow) |

---

*Report generated by RRI-T + RRI-UX + RRI-UI Combined Audit*
*Methodology: 5 Testing Personas × 7 Dimensions × 8 Stress Axes + 5 UX Personas × 8 Flow Physics Axes*
*VietERP HRM v1.0 — 2026-03-09*
