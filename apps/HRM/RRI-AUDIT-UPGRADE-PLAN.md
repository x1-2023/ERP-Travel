# RRI AUDIT & UPGRADE PLAN — VietERP HRM System

## Audit Summary

| Methodology | Personas | Issues Found |
|-------------|----------|-------------|
| RRI-UX (Speed Runner + Data Scanner) | 🏃📊 | 40 issues |
| RRI-UX (First-Timer + Field Worker) | 👁️📱 | 40 issues |
| RRI-UI (8-Point Inline Check) | 🔧 | 20 issues |
| **TOTAL** | | **~100 issues** |

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 15 | Critical — BROKEN or blocking daily workflow |
| **P1** | 45 | Important — significant FRICTION for users |
| **P2** | 40 | Nice-to-have — minor polish and enhancement |

---

## UPGRADE PLAN — Grouped by TIP

### TIP-U01: Table Infrastructure (P0 — Foundation)
**Impact:** Affects 6+ pages. Must fix first as foundation for other improvements.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | No sticky table headers anywhere | Global | Add `sticky top-0 z-10 bg-white` to ALL `<thead>` elements |
| 2 | No column sorting on any table | Employees, Payroll, KPI, Users | Add sortable columns (click header to sort) |
| 3 | Employee search no debounce | Employees | Add 300ms debounce to search input |
| 4 | Attendance grid header not sticky vertically | Attendance | Add vertical sticky to `<thead>` |

**Files:** employee-table.tsx, payroll/[periodId]/page.tsx, kpi/[periodId]/page.tsx, admin/users/page.tsx, attendance-grid.tsx
**Effort:** 1 day

---

### TIP-U02: Confirmation Dialogs & Feedback (P0 — Safety)
**Impact:** Prevents accidental destructive actions.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | No confirm before payroll Submit | Payroll Detail | Add dialog: "Nộp bảng lương? Sau khi nộp không thể chỉnh sửa." |
| 2 | No confirm before KPI Publish | KPI Detail | Add dialog: "Công bố KPI? Tất cả NV sẽ nhận thông báo." |
| 3 | No confirm before Kanban Accept (creates Employee) | Kanban Board | Add dialog: "Tạo nhân viên từ ứng viên này?" |
| 4 | No unsaved changes warning on KPI scoring | KPI Detail | Add `beforeunload` event when `isDirty=true` |
| 5 | No unsaved changes warning on Employee form | Employee Form | Add `beforeunload` event when form is dirty |
| 6 | Admin Settings save error silently fails | Admin Settings | Add `onError` handler to `saveMut` |
| 7 | Dashboard shows zeros on API error (no error state) | Dashboard | Check `isError` from useQuery, show error banner + retry |
| 8 | Native `confirm()` dialogs inconsistent | Admin Depts/Positions | Replace with shadcn AlertDialog |

**Files:** payroll/[periodId]/page.tsx, kpi/[periodId]/page.tsx, kanban-board.tsx, admin/settings/page.tsx, page.tsx (dashboard), employee-form.tsx
**Effort:** 1.5 days

---

### TIP-U03: Bulk Operations & Speed Runner UX (P0 — Daily Workflow)
**Impact:** Most critical for daily HR operations — saves hours per week.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | No bulk approve/reject on Approvals | Approvals | Add checkboxes + "Duyệt tất cả" / "Từ chối" bulk actions |
| 2 | No auto-advance after approve | Report Detail | After approve, auto-navigate to next pending report |
| 3 | Approval page uses cards (too sparse) | Approvals | Switch to dense table/list view for bulk processing |
| 4 | No filter on Approvals | Approvals | Add type + department filters |
| 5 | Payroll drawer no prev/next navigation | Payroll Drawer | Add "← Trước / Sau →" employee navigation inside drawer |
| 6 | KPI scoring table save button not visible after scroll | KPI Detail | Add sticky footer bar with Save/Publish |

**Files:** approvals/page.tsx, reports/[reportId]/page.tsx, employee-payroll-drawer.tsx, kpi/[periodId]/page.tsx
**Effort:** 2-3 days

---

### TIP-U04: Mobile Responsive & Field Worker (P1 — Touch)
**Impact:** Makes app usable on phones and tablets.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | Check-out button too small (< 44px) | Check-in Widget | Change to `size="lg" min-h-[48px]` |
| 2 | Sidebar nav links < 44px touch target | Sidebar | Increase `py-2.5` → `py-3` |
| 3 | Tables unreadable on mobile (Advances, Offboarding) | Multiple | Switch to card layout on mobile for data-heavy tables |
| 4 | Notification dropdown 320px on 375px screen | NotificationBell | Full-width on mobile or bottom sheet pattern |
| 5 | JR form grid-cols-2 no mobile breakpoint | JR Create | Change to `grid-cols-1 sm:grid-cols-2` |
| 6 | Topbar user info cramped on mobile | Topbar | Hide username/role text on mobile, show avatar only |
| 7 | No search on mobile | Topbar | Add search icon button visible on mobile |
| 8 | Employee detail tabs overflow on mobile | Employee Detail | Add `overflow-x-auto` with scroll hint |
| 9 | Employee form step indicator scrolls away | Employee Form | Make sticky below topbar |

**Files:** check-in-widget.tsx, sidebar.tsx, advances/page.tsx, offboarding/page.tsx, notification-bell.tsx, topbar.tsx, employees/[id]/page.tsx, employee-form.tsx, recruitment/requisitions/new/page.tsx
**Effort:** 2 days

---

### TIP-U05: Empty States & First-Timer Guidance (P1 — Onboarding)
**Impact:** Makes app discoverable for new users.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | Recruitment empty state wrong icon + no CTA | Recruitment | Use InboxIcon + "Tạo yêu cầu tuyển dụng đầu tiên" button |
| 2 | Advances empty state no explanation | Advances | Add rules explanation: "Tạm ứng tối đa 50% lương cơ bản..." |
| 3 | Profile unlinked account no guidance | Profile | Add: "Liên hệ phòng HR để được liên kết hồ sơ" |
| 4 | Notification empty state no context | NotificationBell | Add: "Thông báo về hợp đồng, báo cáo sẽ hiển thị tại đây" |
| 5 | Login page no "Forgot password" link | Login | Add "Quên mật khẩu?" → contact HR message |
| 6 | Report form buttons no explanation | Report Form | Add helper text explaining Lưu nháp vs Tạo & Nộp |
| 7 | Report type dropdown no descriptions | Report Form | Group/describe report types |
| 8 | Dashboard stats cards no tooltips | StatsGrid | Add tooltip explaining each metric |

**Files:** recruitment/page.tsx, advances/page.tsx, profile/page.tsx, notification-bell.tsx, login/page.tsx, report-form.tsx, stats-grid.tsx
**Effort:** 1 day

---

### TIP-U06: Navigation & Breadcrumbs (P1 — Wayfinding)
**Impact:** Users always know where they are.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | No breadcrumb anywhere in app | Global | Create `<Breadcrumb>` component, add to all detail/form pages |
| 2 | No global loading indicator | Layout | Add NProgress-style bar during route transitions |
| 3 | Report form missing back button | Report Create | Add ArrowLeft "Báo Cáo" back link |
| 4 | ExpiryAlerts "Xem" links to generic /employees | Dashboard | Link to specific `/employees/${id}` |
| 5 | Approval internal jargon "L1/L2" | Report Detail | Replace with "Phê duyệt" + explanation text |

**Files:** Create breadcrumb.tsx, layout.tsx, reports/new/page.tsx, expiry-alerts.tsx, reports/[reportId]/page.tsx
**Effort:** 1.5 days

---

### TIP-U07: Form Validation & Error Handling (P1 — Robustness)
**Impact:** Prevents user errors and data loss.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | Employee form no scroll-to-error | Employee Form | `scrollIntoView()` to first error field |
| 2 | Admin Depts/Settings no client-side validation | Admin | Add inline field validation |
| 3 | Report form generic validation message | Report Form | Per-field inline error highlighting |
| 4 | Employee create shows invalid status options | Employee Form | Restrict to "Thử việc" and "Đang làm việc" in create mode |
| 5 | Leave balance display broken (inverted conditional) | Reports | Fix `balanceData ? "---"` → show actual balance |
| 6 | Audit log only shows newData OR oldData | Audit Logs | Show diff view for UPDATE actions |

**Files:** employee-form.tsx, admin/departments/page.tsx, admin/settings/page.tsx, report-form.tsx, reports/page.tsx, audit-logs/page.tsx
**Effort:** 1.5 days

---

### TIP-U08: Data Visualization & Scanner UX (P1 — Analytics)
**Impact:** Helps managers scan data faster.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | Payroll no outlier highlighting | Payroll Detail | Color-code anomalies (low/high net salary, probation) |
| 2 | KPI no color coding during editing | KPI Detail | Apply score color to input borders during draft |
| 3 | Attendance grid icons too small | Attendance | Use cell background colors as heatmap |
| 4 | Attendance no department filter | Attendance | Add department dropdown filter |
| 5 | Attendance no sort by total hours | Attendance | Add sort by work hours/attendance rate |
| 6 | Payroll current month not highlighted | Payroll List | Pin current month + "Hiện tại" badge |
| 7 | No export on Employee list, Audit logs | Multiple | Add "Xuất CSV" button on data-heavy pages |

**Files:** payroll/[periodId]/page.tsx, kpi/[periodId]/page.tsx, attendance-grid.tsx, payroll/page.tsx, employees/page.tsx, audit-logs/page.tsx
**Effort:** 2 days

---

### TIP-U09: Vietnamese Localization Polish (P2 — Consistency)
**Impact:** Professional Vietnamese enterprise app feel.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | Mixed English/Vietnamese in sidebar | Nav Items | "Dashboard"→"Tổng Quan", "Offboarding"→"Nghỉ Việc" |
| 2 | Mixed English on login page | Login | "Demo Accounts"→"Tài khoản demo" |
| 3 | Currency formatting inconsistent across pages | Global | Standardize single `formatCurrency()` utility |
| 4 | Role labels in English (Admin users) | Admin Users | Map SUPER_ADMIN→"Quản trị viên" etc. |
| 5 | Phone placeholder no spacing | Employee Form | "0901 234 567" format |
| 6 | Address fields no structure guidance | Employee Form | Add placeholder: "Số nhà, Đường, Phường..." |
| 7 | VND inputs no formatting while typing | JR Create, Settings | Add number input mask with dot separators |
| 8 | "Offboarding" page title in English | Offboarding | Change to "Quy Trình Nghỉ Việc" |

**Files:** nav-items.ts, login/page.tsx, lib/utils/format.ts, admin/users/page.tsx, employee-form.tsx, offboarding/page.tsx
**Effort:** 1 day

---

### TIP-U10: Keyboard Shortcuts & Power User (P2 — Efficiency)
**Impact:** Speed up daily operations for power users.

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 1 | No Ctrl+S/Cmd+S to save | Global | Add keyboard shortcut on all edit pages |
| 2 | No Escape to close drawers/dialogs | Global | Add `onKeyDown` Escape handler |
| 3 | KPI scoring no arrow key navigation | KPI Detail | Enter/Down Arrow → next employee's score field |
| 4 | Tables no row selection with arrows | Global | Arrow keys to navigate table rows, Enter to open |

**Files:** Global keyboard hook, payroll drawer, KPI detail
**Effort:** 1 day

---

## PRIORITY MATRIX & TIMELINE

```
Week 1 (Foundation):
├── TIP-U01: Table Infrastructure        [P0] [1 day]
├── TIP-U02: Confirmation & Feedback     [P0] [1.5 days]
└── TIP-U07: Form Validation             [P1] [1.5 days]

Week 2 (Core UX):
├── TIP-U03: Bulk Operations             [P0] [2-3 days]
└── TIP-U06: Navigation & Breadcrumbs    [P1] [1.5 days]

Week 3 (Polish):
├── TIP-U04: Mobile Responsive           [P1] [2 days]
├── TIP-U05: Empty States & Guidance     [P1] [1 day]
└── TIP-U08: Data Visualization          [P1] [2 days]

Week 4 (Final):
├── TIP-U09: Vietnamese Localization     [P2] [1 day]
├── TIP-U10: Keyboard Shortcuts          [P2] [1 day]
└── QA & Release Gate Testing            [--] [2 days]
```

**Total Estimated Effort: ~18-20 days**

---

## RELEASE GATE (per RRI-UX/RRI-UI/RRI-T)

### Criteria:
- [ ] All 7 UX dimensions ≥ 70%
- [ ] At least 5/7 UX dimensions ≥ 85%
- [ ] 0 items P0 at BROKEN/FAIL status
- [ ] Vietnamese-specific checklist: 12/12 pass
- [ ] Responsive: 3 breakpoints verified (375px, 768px, 1440px)
- [ ] Anti-pattern checklist: 0/12 violations

### Current Status (Pre-Upgrade):
| Dimension | Score | Status |
|-----------|-------|--------|
| U1: Flow Direction | ~60% | 🔴 Block |
| U2: Info Hierarchy | ~75% | 🟡 Warning |
| U3: Cognitive Load | ~80% | 🟡 Warning |
| U4: Feedback & State | ~65% | 🔴 Block |
| U5: Error Recovery | ~55% | 🔴 Block |
| U6: Accessibility | ~70% | 🟡 Warning |
| U7: Context Preservation | ~50% | 🔴 Block |

**Current UX Score: ~65% — 🔴 No Release**
**Target after TIP-U01→U10: ≥85% — 🟢 Release Approved**
