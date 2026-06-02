# Backend Implementation Checklist - Promo Master V3

> Track backend implementation progress for all 257 API endpoints.
> Generated from MSW handler audit on 2026-02-08.

## Progress Summary

| # | Module | Total | Done | % |
|---|--------|-------|------|---|
| 1 | Auth | 4 | 0 | 0% |
| 2 | Promotions | 10 | 0 | 0% |
| 3 | Claims | 9 | 0 | 0% |
| 4 | Customers | 2 | 0 | 0% |
| 5 | Products | 2 | 0 | 0% |
| 6 | Funds | 6 | 0 | 0% |
| 7 | Budgets | 9 | 0 | 0% |
| 8 | Targets | 10 | 0 | 0% |
| 9 | Geographic Units | 5 | 0 | 0% |
| 10 | Budget Allocations | 5 | 0 | 0% |
| 11 | Target Allocations | 5 | 0 | 0% |
| 12 | Baselines | 5 | 0 | 0% |
| 13 | Finance - Accruals | 9 | 0 | 0% |
| 14 | Finance - Deductions | 9 | 0 | 0% |
| 15 | Finance - Journals | 7 | 0 | 0% |
| 16 | Finance - Cheques | 6 | 0 | 0% |
| 17 | Notifications | 5 | 0 | 0% |
| 18 | Dashboard | 11 | 0 | 0% |
| 19 | Planning - Templates | 7 | 0 | 0% |
| 20 | Planning - Scenarios | 10 | 0 | 0% |
| 21 | Planning - Clashes | 5 | 0 | 0% |
| 22 | Operations - Delivery | 10 | 0 | 0% |
| 23 | Operations - Sell Tracking | 12 | 0 | 0% |
| 24 | Operations - Inventory | 11 | 0 | 0% |
| 25 | BI & Analytics | 12 | 0 | 0% |
| 26 | AI - Insights & Recommendations | 11 | 0 | 0% |
| 27 | Integration - Webhooks | 8 | 0 | 0% |
| 28 | Integration - Security | 7 | 0 | 0% |
| 29 | Integration - ERP & DMS | 5 | 0 | 0% |
| 30 | Users | 2 | 0 | 0% |
| 31 | Voice Commands | 2 | 0 | 0% |
| 32 | Contracts | 10 | 0 | 0% |
| 33 | Claims-AI | 5 | 0 | 0% |
| 34 | Fund Activities | 6 | 0 | 0% |
| 35 | Post-Analysis | 5 | 0 | 0% |
| 36 | Promo Suggestions | 7 | 0 | 0% |
| 37 | Monitoring | 3 | 0 | 0% |
| | **TOTAL** | **257** | **0** | **0%** |

---

## Implementation Priority

### P0 - Core (MVP) — 45 endpoints
Auth (4), Promotions (10), Claims (9), Customers (2), Products (2), Dashboard (11), Notifications (5), Users (2)

### P1 - Finance — 51 endpoints
Funds (6), Budgets (9), Targets (10), Baselines (5), Finance-Accruals (9), Finance-Deductions (9), Finance-Journals (7), Finance-Cheques (6)

### P2 - Planning & Operations — 54 endpoints
Planning-Templates (7), Planning-Scenarios (10), Planning-Clashes (5), Operations-Delivery (10), Operations-Sell Tracking (12), Operations-Inventory (11)

### P3 - Advanced — 107 endpoints
BI & Analytics (12), AI (11), Integration-Webhooks (8), Integration-Security (7), Integration-ERP/DMS (5), Contracts (10), Claims-AI (5), Fund Activities (6), Post-Analysis (5), Promo Suggestions (7), Monitoring (3), Voice Commands (2), Geographic Units (5), Budget Allocations (5), Target Allocations (5)

---

## Module 1: Auth (4 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 1 | [ ] | POST | `/api/auth/login` | [ ] | [ ] | [ ] | JWT + bcrypt, returns accessToken + refreshToken |
| 2 | [ ] | POST | `/api/auth/logout` | [ ] | [ ] | [ ] | Invalidate session |
| 3 | [ ] | GET | `/api/auth/me` | [ ] | [ ] | [ ] | Auth guard required |
| 4 | [ ] | POST | `/api/auth/refresh` | [ ] | [ ] | [ ] | Refresh token rotation |

---

## Module 2: Promotions (10 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 5 | [ ] | GET | `/api/promotions` | [ ] | [ ] | [ ] | Paginated + filterItems(status,type,search,customerId) |
| 6 | [ ] | GET | `/api/promotions/stats` | [ ] | [ ] | [ ] | Aggregate counts + amounts |
| 7 | [ ] | GET | `/api/promotions/:id` | [ ] | [ ] | [ ] | 404 if not found |
| 8 | [ ] | POST | `/api/promotions` | [ ] | [ ] | [ ] | Returns 201 |
| 9 | [ ] | PUT | `/api/promotions/:id` | [ ] | [ ] | [ ] | Full update |
| 10 | [ ] | PATCH | `/api/promotions/:id` | [ ] | [ ] | [ ] | Partial update |
| 11 | [ ] | DELETE | `/api/promotions/:id` | [ ] | [ ] | [ ] | |
| 12 | [ ] | POST | `/api/promotions/:id/submit` | [ ] | [ ] | [ ] | status→PENDING |
| 13 | [ ] | POST | `/api/promotions/:id/approve` | [ ] | [ ] | [ ] | status→APPROVED, sets approvedAt/By |
| 14 | [ ] | POST | `/api/promotions/:id/reject` | [ ] | [ ] | [ ] | body: {reason}, status→REJECTED |

---

## Module 3: Claims (9 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 15 | [ ] | GET | `/api/claims` | [ ] | [ ] | [ ] | Paginated + filterItems |
| 16 | [ ] | GET | `/api/claims/stats` | [ ] | [ ] | [ ] | Aggregate counts + amounts |
| 17 | [ ] | GET | `/api/claims/:id` | [ ] | [ ] | [ ] | 404 if not found |
| 18 | [ ] | POST | `/api/claims` | [ ] | [ ] | [ ] | Returns 201 |
| 19 | [ ] | PATCH | `/api/claims/:id` | [ ] | [ ] | [ ] | Partial update |
| 20 | [ ] | DELETE | `/api/claims/:id` | [ ] | [ ] | [ ] | |
| 21 | [ ] | POST | `/api/claims/:id/submit` | [ ] | [ ] | [ ] | status→SUBMITTED |
| 22 | [ ] | POST | `/api/claims/:id/approve` | [ ] | [ ] | [ ] | status→APPROVED |
| 23 | [ ] | POST | `/api/claims/:id/reject` | [ ] | [ ] | [ ] | body: {reason} |

---

## Module 4: Customers (2 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 24 | [ ] | GET | `/api/customers` | [ ] | [ ] | [ ] | Paginated + filter(search,type,status,region,tier) |
| 25 | [ ] | GET | `/api/customers/:id` | [ ] | [ ] | [ ] | 404 if not found |

---

## Module 5: Products (2 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 26 | [ ] | GET | `/api/products` | [ ] | [ ] | [ ] | Paginated + filter(search,category,status,brand) |
| 27 | [ ] | GET | `/api/products/:id` | [ ] | [ ] | [ ] | 404 if not found |

---

## Module 6: Funds (6 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 28 | [ ] | GET | `/api/funds` | [ ] | [ ] | [ ] | Paginated |
| 29 | [ ] | GET | `/api/funds/:id` | [ ] | [ ] | [ ] | |
| 30 | [ ] | GET | `/api/funds/:id/utilization` | [ ] | [ ] | [ ] | Breakdown with allocations list |
| 31 | [ ] | POST | `/api/funds` | [ ] | [ ] | [ ] | Returns 201 |
| 32 | [ ] | PATCH | `/api/funds/:id` | [ ] | [ ] | [ ] | |
| 33 | [ ] | DELETE | `/api/funds/:id` | [ ] | [ ] | [ ] | |

---

## Module 7: Budgets (9 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 34 | [ ] | GET | `/api/budgets` | [ ] | [ ] | [ ] | Paginated |
| 35 | [ ] | GET | `/api/budgets/years` | [ ] | [ ] | [ ] | Returns array of years |
| 36 | [ ] | GET | `/api/budgets/:id` | [ ] | [ ] | [ ] | |
| 37 | [ ] | POST | `/api/budgets` | [ ] | [ ] | [ ] | Returns 201 |
| 38 | [ ] | PATCH | `/api/budgets/:id` | [ ] | [ ] | [ ] | |
| 39 | [ ] | DELETE | `/api/budgets/:id` | [ ] | [ ] | [ ] | |
| 40 | [ ] | GET | `/api/budgets/:id/approval-history` | [ ] | [ ] | [ ] | Workflow + timeline + summary |
| 41 | [ ] | GET | `/api/budgets/:id/health-score` | [ ] | [ ] | [ ] | Score, grade, factors, trend |
| 42 | [ ] | GET | `/api/budgets/:id/comparison` | [ ] | [ ] | [ ] | Period comparison |

---

## Module 8: Targets (10 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 43 | [ ] | GET | `/api/targets` | [ ] | [ ] | [ ] | Paginated |
| 44 | [ ] | GET | `/api/targets/:id` | [ ] | [ ] | [ ] | |
| 45 | [ ] | POST | `/api/targets` | [ ] | [ ] | [ ] | Returns 201 |
| 46 | [ ] | PATCH | `/api/targets/:id` | [ ] | [ ] | [ ] | |
| 47 | [ ] | DELETE | `/api/targets/:id` | [ ] | [ ] | [ ] | |
| 48 | [ ] | GET | `/api/targets/:id/progress` | [ ] | [ ] | [ ] | Progress breakdown |
| 49 | [ ] | GET | `/api/targets/:id/allocation` | [ ] | [ ] | [ ] | List allocations |
| 50 | [ ] | POST | `/api/targets/:id/allocation` | [ ] | [ ] | [ ] | Create allocation |
| 51 | [ ] | PUT | `/api/targets/:id/allocation/:allocId` | [ ] | [ ] | [ ] | Update allocation |
| 52 | [ ] | DELETE | `/api/targets/:id/allocation/:allocId` | [ ] | [ ] | [ ] | Delete allocation |

---

## Module 9: Geographic Units (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 53 | [ ] | GET | `/api/geographic-units` | [ ] | [ ] | [ ] | tree=true, level, parentId, search |
| 54 | [ ] | GET | `/api/geographic-units/:id` | [ ] | [ ] | [ ] | includeTree=true for children |
| 55 | [ ] | POST | `/api/geographic-units` | [ ] | [ ] | [ ] | Returns 201 |
| 56 | [ ] | PATCH | `/api/geographic-units/:id` | [ ] | [ ] | [ ] | |
| 57 | [ ] | DELETE | `/api/geographic-units/:id` | [ ] | [ ] | [ ] | |

---

## Module 10: Budget Allocations (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 58 | [ ] | GET | `/api/budget-allocations` | [ ] | [ ] | [ ] | budgetId, tree=true, parentId |
| 59 | [ ] | GET | `/api/budget-allocations/:id` | [ ] | [ ] | [ ] | includeTree=true |
| 60 | [ ] | POST | `/api/budget-allocations` | [ ] | [ ] | [ ] | Returns 201 |
| 61 | [ ] | PATCH | `/api/budget-allocations/:id` | [ ] | [ ] | [ ] | |
| 62 | [ ] | DELETE | `/api/budget-allocations/:id` | [ ] | [ ] | [ ] | |

---

## Module 11: Target Allocations (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 63 | [ ] | GET | `/api/target-allocations` | [ ] | [ ] | [ ] | targetId, tree=true, parentId |
| 64 | [ ] | GET | `/api/target-allocations/:id` | [ ] | [ ] | [ ] | includeTree=true |
| 65 | [ ] | POST | `/api/target-allocations` | [ ] | [ ] | [ ] | Returns 201 |
| 66 | [ ] | PATCH | `/api/target-allocations/:id` | [ ] | [ ] | [ ] | |
| 67 | [ ] | DELETE | `/api/target-allocations/:id` | [ ] | [ ] | [ ] | |

---

## Module 12: Baselines (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 68 | [ ] | GET | `/api/baselines` | [ ] | [ ] | [ ] | Paginated |
| 69 | [ ] | GET | `/api/baselines/:id` | [ ] | [ ] | [ ] | |
| 70 | [ ] | POST | `/api/baselines` | [ ] | [ ] | [ ] | Returns 201 |
| 71 | [ ] | PATCH | `/api/baselines/:id` | [ ] | [ ] | [ ] | |
| 72 | [ ] | DELETE | `/api/baselines/:id` | [ ] | [ ] | [ ] | |

---

## Module 13: Finance - Accruals (9 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 73 | [ ] | GET | `/api/finance/accruals` | [ ] | [ ] | [ ] | Paginated + filter(status,search) |
| 74 | [ ] | GET | `/api/finance/accruals/:id` | [ ] | [ ] | [ ] | Transformed shape with promotion obj |
| 75 | [ ] | POST | `/api/finance/accruals/calculate` | [ ] | [ ] | [ ] | body: {promotionId}, returns breakdown |
| 76 | [ ] | POST | `/api/finance/accruals/preview` | [ ] | [ ] | [ ] | Preview batch |
| 77 | [ ] | PUT | `/api/finance/accruals/:id` | [ ] | [ ] | [ ] | |
| 78 | [ ] | DELETE | `/api/finance/accruals/:id` | [ ] | [ ] | [ ] | |
| 79 | [ ] | POST | `/api/finance/accruals/:id/post` | [ ] | [ ] | [ ] | Post to GL, status→POSTED |
| 80 | [ ] | POST | `/api/finance/accruals/post-batch` | [ ] | [ ] | [ ] | body: {ids[]}, batch GL posting |
| 81 | [ ] | POST | `/api/finance/accruals/:id/reverse` | [ ] | [ ] | [ ] | status→REVERSED |

---

## Module 14: Finance - Deductions (9 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 82 | [ ] | GET | `/api/finance/deductions` | [ ] | [ ] | [ ] | Paginated + filter(status,search) |
| 83 | [ ] | GET | `/api/finance/deductions/:id` | [ ] | [ ] | [ ] | |
| 84 | [ ] | GET | `/api/finance/deductions/:id/suggestions` | [ ] | [ ] | [ ] | AI match suggestions with confidence |
| 85 | [ ] | POST | `/api/finance/deductions` | [ ] | [ ] | [ ] | Returns 201 |
| 86 | [ ] | PUT | `/api/finance/deductions/:id` | [ ] | [ ] | [ ] | |
| 87 | [ ] | DELETE | `/api/finance/deductions/:id` | [ ] | [ ] | [ ] | |
| 88 | [ ] | POST | `/api/finance/deductions/:id/match` | [ ] | [ ] | [ ] | body: {claimId}, status→MATCHED |
| 89 | [ ] | POST | `/api/finance/deductions/:id/dispute` | [ ] | [ ] | [ ] | status→DISPUTED |
| 90 | [ ] | POST | `/api/finance/deductions/:id/resolve` | [ ] | [ ] | [ ] | body: {resolution,amount}, status→RESOLVED |

---

## Module 15: Finance - Journals (7 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 91 | [ ] | GET | `/api/finance/journals` | [ ] | [ ] | [ ] | Paginated + filter(status,search) |
| 92 | [ ] | GET | `/api/finance/journals/:id` | [ ] | [ ] | [ ] | Includes journal lines |
| 93 | [ ] | POST | `/api/finance/journals` | [ ] | [ ] | [ ] | Returns 201 |
| 94 | [ ] | PUT | `/api/finance/journals/:id` | [ ] | [ ] | [ ] | |
| 95 | [ ] | DELETE | `/api/finance/journals/:id` | [ ] | [ ] | [ ] | |
| 96 | [ ] | POST | `/api/finance/journals/:id/post` | [ ] | [ ] | [ ] | Post to GL, status→POSTED |
| 97 | [ ] | POST | `/api/finance/journals/:id/reverse` | [ ] | [ ] | [ ] | status→REVERSED |

---

## Module 16: Finance - Cheques (6 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 98 | [ ] | GET | `/api/finance/cheques` | [ ] | [ ] | [ ] | Paginated + filter |
| 99 | [ ] | GET | `/api/finance/cheques/:id` | [ ] | [ ] | [ ] | |
| 100 | [ ] | POST | `/api/finance/cheques` | [ ] | [ ] | [ ] | Returns 201 |
| 101 | [ ] | PUT | `/api/finance/cheques/:id` | [ ] | [ ] | [ ] | Actions: CLEAR/VOID/STALE |
| 102 | [ ] | DELETE | `/api/finance/cheques/:id` | [ ] | [ ] | [ ] | |
| 103 | [ ] | GET | `/api/finance/stats` | [ ] | [ ] | [ ] | Finance summary across all sub-modules |

---

## Module 17: Notifications (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 104 | [ ] | GET | `/api/notifications` | [ ] | [ ] | [ ] | Not paginated, returns all |
| 105 | [ ] | GET | `/api/notifications/unread-count` | [ ] | [ ] | [ ] | Returns {count} |
| 106 | [ ] | PATCH | `/api/notifications/:id/read` | [ ] | [ ] | [ ] | Mark single as read |
| 107 | [ ] | PATCH | `/api/notifications/mark-all-read` | [ ] | [ ] | [ ] | Bulk mark read |
| 108 | [ ] | DELETE | `/api/notifications/:id` | [ ] | [ ] | [ ] | |

---

## Module 18: Dashboard (11 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 109 | [ ] | GET | `/api/dashboard/stats` | [ ] | [ ] | [ ] | KPI aggregation |
| 110 | [ ] | GET | `/api/dashboard/kpi` | [ ] | [ ] | [ ] | Alias for /stats |
| 111 | [ ] | GET | `/api/dashboard/kpis` | [ ] | [ ] | [ ] | Alias for /stats |
| 112 | [ ] | GET | `/api/dashboard/activity` | [ ] | [ ] | [ ] | Recent activity feed |
| 113 | [ ] | GET | `/api/dashboard/charts` | [ ] | [ ] | [ ] | All chart data combined |
| 114 | [ ] | GET | `/api/dashboard/charts/promotions-by-status` | [ ] | [ ] | [ ] | Pie chart data |
| 115 | [ ] | GET | `/api/dashboard/charts/budget-utilization` | [ ] | [ ] | [ ] | Bar chart data |
| 116 | [ ] | GET | `/api/dashboard/charts/claims-trend` | [ ] | [ ] | [ ] | Line chart data |
| 117 | [ ] | GET | `/api/dashboard/charts/spend-trend` | [ ] | [ ] | [ ] | Line chart data |
| 118 | [ ] | GET | `/api/dashboard/charts/status-distribution` | [ ] | [ ] | [ ] | Pie chart data |
| 119 | [ ] | GET | `/api/dashboard/charts/top-customers` | [ ] | [ ] | [ ] | Bar chart data |

---

## Module 19: Planning - Templates (7 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 120 | [ ] | GET | `/api/planning/templates` | [ ] | [ ] | [ ] | Paginated |
| 121 | [ ] | GET | `/api/planning/templates/:id` | [ ] | [ ] | [ ] | |
| 122 | [ ] | GET | `/api/planning/templates/:id/versions` | [ ] | [ ] | [ ] | Version history |
| 123 | [ ] | POST | `/api/planning/templates` | [ ] | [ ] | [ ] | Returns 201 |
| 124 | [ ] | PUT | `/api/planning/templates/:id` | [ ] | [ ] | [ ] | |
| 125 | [ ] | DELETE | `/api/planning/templates/:id` | [ ] | [ ] | [ ] | |
| 126 | [ ] | POST | `/api/planning/templates/:id/apply` | [ ] | [ ] | [ ] | body: {promotionId} |

---

## Module 20: Planning - Scenarios (10 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 127 | [ ] | GET | `/api/planning/scenarios` | [ ] | [ ] | [ ] | Paginated |
| 128 | [ ] | GET | `/api/planning/scenarios/:id` | [ ] | [ ] | [ ] | Detail + promotions list |
| 129 | [ ] | GET | `/api/planning/scenarios/:id/versions` | [ ] | [ ] | [ ] | Version history |
| 130 | [ ] | POST | `/api/planning/scenarios` | [ ] | [ ] | [ ] | Returns 201 |
| 131 | [ ] | PUT | `/api/planning/scenarios/:id` | [ ] | [ ] | [ ] | |
| 132 | [ ] | DELETE | `/api/planning/scenarios/:id` | [ ] | [ ] | [ ] | |
| 133 | [ ] | POST | `/api/planning/scenarios/:id/run` | [ ] | [ ] | [ ] | Simulation engine, returns ROI/projections |
| 134 | [ ] | POST | `/api/planning/scenarios/:id/clone` | [ ] | [ ] | [ ] | Deep clone |
| 135 | [ ] | POST | `/api/planning/scenarios/:id/versions` | [ ] | [ ] | [ ] | Restore version |
| 136 | [ ] | POST | `/api/planning/scenarios/compare` | [ ] | [ ] | [ ] | body: {scenarioIds[]} |

---

## Module 21: Planning - Clashes (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 137 | [ ] | GET | `/api/planning/clashes/stats` | [ ] | [ ] | [ ] | Clash statistics |
| 138 | [ ] | GET | `/api/planning/clashes` | [ ] | [ ] | [ ] | Paginated |
| 139 | [ ] | GET | `/api/planning/clashes/:id` | [ ] | [ ] | [ ] | Enriched with analysis |
| 140 | [ ] | PATCH | `/api/planning/clashes/:id` | [ ] | [ ] | [ ] | |
| 141 | [ ] | POST | `/api/planning/clashes/:id/resolve` | [ ] | [ ] | [ ] | body: {resolution}, status→RESOLVED |

---

## Module 22: Operations - Delivery (10 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 142 | [ ] | GET | `/api/operations/delivery` | [ ] | [ ] | [ ] | Paginated |
| 143 | [ ] | GET | `/api/operations/deliveries` | [ ] | [ ] | [ ] | Alias for /delivery |
| 144 | [ ] | GET | `/api/operations/delivery/:id` | [ ] | [ ] | [ ] | |
| 145 | [ ] | GET | `/api/operations/delivery/:id/tracking` | [ ] | [ ] | [ ] | Tracking history array |
| 146 | [ ] | GET | `/api/operations/delivery/calendar` | [ ] | [ ] | [ ] | Calendar view format |
| 147 | [ ] | GET | `/api/operations/delivery/stats` | [ ] | [ ] | [ ] | Aggregate stats |
| 148 | [ ] | POST | `/api/operations/delivery` | [ ] | [ ] | [ ] | Returns 201 |
| 149 | [ ] | PUT | `/api/operations/delivery/:id` | [ ] | [ ] | [ ] | |
| 150 | [ ] | PUT | `/api/operations/delivery/:id/status` | [ ] | [ ] | [ ] | Status-only update |
| 151 | [ ] | DELETE | `/api/operations/delivery/:id` | [ ] | [ ] | [ ] | |

---

## Module 23: Operations - Sell Tracking (12 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 152 | [ ] | GET | `/api/operations/sell-tracking/sell-in` | [ ] | [ ] | [ ] | Totals + trends + grouped data |
| 153 | [ ] | GET | `/api/operations/sell-tracking/sell-out` | [ ] | [ ] | [ ] | Same shape as sell-in |
| 154 | [ ] | GET | `/api/operations/sell-tracking` | [ ] | [ ] | [ ] | Paginated records |
| 155 | [ ] | GET | `/api/operations/sell-tracking/:id` | [ ] | [ ] | [ ] | |
| 156 | [ ] | GET | `/api/operations/sell-tracking/summary` | [ ] | [ ] | [ ] | Summary totals |
| 157 | [ ] | GET | `/api/operations/sell-tracking/trends` | [ ] | [ ] | [ ] | Weekly trends |
| 158 | [ ] | POST | `/api/operations/sell-tracking` | [ ] | [ ] | [ ] | |
| 159 | [ ] | PUT | `/api/operations/sell-tracking/:id` | [ ] | [ ] | [ ] | |
| 160 | [ ] | DELETE | `/api/operations/sell-tracking/:id` | [ ] | [ ] | [ ] | |
| 161 | [ ] | POST | `/api/operations/sell-tracking/bulk` | [ ] | [ ] | [ ] | Bulk action |
| 162 | [ ] | POST | `/api/operations/sell-tracking/import` | [ ] | [ ] | [ ] | File import |
| 163 | [ ] | GET | `/api/operations/sell-tracking/export` | [ ] | [ ] | [ ] | File export |

---

## Module 24: Operations - Inventory (11 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 164 | [ ] | GET | `/api/operations/inventory` | [ ] | [ ] | [ ] | Paginated |
| 165 | [ ] | GET | `/api/operations/inventory/:id` | [ ] | [ ] | [ ] | |
| 166 | [ ] | GET | `/api/operations/inventory/summary` | [ ] | [ ] | [ ] | Summary stats |
| 167 | [ ] | GET | `/api/operations/inventory/history` | [ ] | [ ] | [ ] | Change history |
| 168 | [ ] | POST | `/api/operations/inventory` | [ ] | [ ] | [ ] | |
| 169 | [ ] | PUT | `/api/operations/inventory/:id` | [ ] | [ ] | [ ] | |
| 170 | [ ] | DELETE | `/api/operations/inventory/:id` | [ ] | [ ] | [ ] | |
| 171 | [ ] | POST | `/api/operations/inventory/bulk` | [ ] | [ ] | [ ] | Bulk action |
| 172 | [ ] | POST | `/api/operations/inventory/import` | [ ] | [ ] | [ ] | File import |
| 173 | [ ] | GET | `/api/operations/inventory/export` | [ ] | [ ] | [ ] | File export |
| 174 | [ ] | GET | `/api/operations/inventory/snapshots` | [ ] | [ ] | [ ] | Warehouse snapshots |

---

## Module 25: BI & Analytics (12 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 175 | [ ] | GET | `/api/bi/analytics/dashboard` | [ ] | [ ] | [ ] | Full BI dashboard |
| 176 | [ ] | GET | `/api/bi/analytics/kpis` | [ ] | [ ] | [ ] | KPI metrics |
| 177 | [ ] | GET | `/api/bi/analytics/trends` | [ ] | [ ] | [ ] | Trend data |
| 178 | [ ] | GET | `/api/bi/analytics` | [ ] | [ ] | [ ] | Combined overview |
| 179 | [ ] | POST | `/api/bi/export` | [ ] | [ ] | [ ] | body: {reportId,format}, returns downloadUrl |
| 180 | [ ] | GET | `/api/bi/reports` | [ ] | [ ] | [ ] | List saved reports |
| 181 | [ ] | GET | `/api/bi/reports/:id` | [ ] | [ ] | [ ] | |
| 182 | [ ] | POST | `/api/bi/reports` | [ ] | [ ] | [ ] | Create report definition |
| 183 | [ ] | PUT | `/api/bi/reports/:id` | [ ] | [ ] | [ ] | |
| 184 | [ ] | DELETE | `/api/bi/reports/:id` | [ ] | [ ] | [ ] | |
| 185 | [ ] | GET | `/api/bi/reports/:id/execute` | [ ] | [ ] | [ ] | Execute and return results |
| 186 | [ ] | POST | `/api/bi/reports/generate` | [ ] | [ ] | [ ] | Async generation |

---

## Module 26: AI - Insights & Recommendations (11 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 187 | [ ] | GET | `/api/ai/insights` | [ ] | [ ] | [ ] | Filter: type, severity. Not paginated |
| 188 | [ ] | GET | `/api/ai/insights/:id` | [ ] | [ ] | [ ] | |
| 189 | [ ] | POST | `/api/ai/insights/generate` | [ ] | [ ] | [ ] | AI engine trigger |
| 190 | [ ] | POST | `/api/ai/insights/:id/dismiss` | [ ] | [ ] | [ ] | |
| 191 | [ ] | POST | `/api/ai/insights/:id/action` | [ ] | [ ] | [ ] | Take action on insight |
| 192 | [ ] | GET | `/api/ai/recommendations` | [ ] | [ ] | [ ] | |
| 193 | [ ] | GET | `/api/ai/recommendations/:id` | [ ] | [ ] | [ ] | |
| 194 | [ ] | POST | `/api/ai/recommendations/generate` | [ ] | [ ] | [ ] | AI engine trigger |
| 195 | [ ] | POST | `/api/ai/recommendations/:id/accept` | [ ] | [ ] | [ ] | |
| 196 | [ ] | POST | `/api/ai/recommendations/:id/reject` | [ ] | [ ] | [ ] | |
| 197 | [ ] | POST | `/api/ai/predict` | [ ] | [ ] | [ ] | body: {type:"SALES"}, returns predictions |

---

## Module 27: Integration - Webhooks (8 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 198 | [ ] | GET | `/api/integration/webhooks` | [ ] | [ ] | [ ] | |
| 199 | [ ] | GET | `/api/integration/webhooks/:id` | [ ] | [ ] | [ ] | |
| 200 | [ ] | POST | `/api/integration/webhooks` | [ ] | [ ] | [ ] | Returns 201 |
| 201 | [ ] | PUT | `/api/integration/webhooks/:id` | [ ] | [ ] | [ ] | |
| 202 | [ ] | DELETE | `/api/integration/webhooks/:id` | [ ] | [ ] | [ ] | |
| 203 | [ ] | POST | `/api/integration/webhooks/:id/test` | [ ] | [ ] | [ ] | Test webhook delivery |
| 204 | [ ] | GET | `/api/integration/webhooks/:id/deliveries` | [ ] | [ ] | [ ] | Delivery log |
| 205 | [ ] | POST | `/api/integration/webhooks/:id/retry` | [ ] | [ ] | [ ] | Retry failed |

---

## Module 28: Integration - Security (7 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 206 | [ ] | GET | `/api/integration/security/api-keys` | [ ] | [ ] | [ ] | |
| 207 | [ ] | GET | `/api/integration/security/api-keys/:id` | [ ] | [ ] | [ ] | |
| 208 | [ ] | POST | `/api/integration/security/api-keys` | [ ] | [ ] | [ ] | Returns 201, show key once |
| 209 | [ ] | DELETE | `/api/integration/security/api-keys/:id` | [ ] | [ ] | [ ] | Revoke key |
| 210 | [ ] | GET | `/api/integration/security/audit-logs` | [ ] | [ ] | [ ] | Paginated |
| 211 | [ ] | GET | `/api/integration/security/audit-logs/:entityType/:entityId` | [ ] | [ ] | [ ] | Entity trail |
| 212 | [ ] | GET | `/api/integration/security/dashboard` | [ ] | [ ] | [ ] | Security overview |

---

## Module 29: Integration - ERP & DMS (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 213 | [ ] | GET | `/api/integration/erp/syncs` | [ ] | [ ] | [ ] | Sync history |
| 214 | [ ] | GET | `/api/integration/erp/:id` | [ ] | [ ] | [ ] | Sync detail |
| 215 | [ ] | POST | `/api/integration/erp/sync` | [ ] | [ ] | [ ] | Trigger sync |
| 216 | [ ] | GET | `/api/integration/dms/syncs` | [ ] | [ ] | [ ] | DMS sync history |
| 217 | [ ] | GET | `/api/integration/dms/:id` | [ ] | [ ] | [ ] | DMS sync detail |

---

## Module 30: Users (2 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 218 | [ ] | GET | `/api/users` | [ ] | [ ] | [ ] | List all users |
| 219 | [ ] | GET | `/api/users/:id` | [ ] | [ ] | [ ] | |

---

## Module 31: Voice Commands (2 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 220 | [ ] | POST | `/api/voice/command` | [ ] | [ ] | [ ] | NLP processing |
| 221 | [ ] | GET | `/api/voice/history` | [ ] | [ ] | [ ] | |

---

## Module 32: Contracts (10 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 222 | [ ] | GET | `/api/contracts/dashboard` | [ ] | [ ] | [ ] | Overview dashboard |
| 223 | [ ] | GET | `/api/contracts` | [ ] | [ ] | [ ] | Paginated + filtered |
| 224 | [ ] | GET | `/api/contracts/:id` | [ ] | [ ] | [ ] | Detail + milestones + monthly progress |
| 225 | [ ] | POST | `/api/contracts` | [ ] | [ ] | [ ] | Returns 201 |
| 226 | [ ] | PUT | `/api/contracts/:id` | [ ] | [ ] | [ ] | |
| 227 | [ ] | DELETE | `/api/contracts/:id` | [ ] | [ ] | [ ] | |
| 228 | [ ] | GET | `/api/contracts/:id/progress` | [ ] | [ ] | [ ] | Monthly volume progress |
| 229 | [ ] | POST | `/api/contracts/:id/progress` | [ ] | [ ] | [ ] | Record progress entry |
| 230 | [ ] | GET | `/api/contracts/:id/gap-analysis` | [ ] | [ ] | [ ] | Projections + risk + recommendations |
| 231 | [ ] | POST | `/api/contracts/:contractId/milestones/:milestoneId/achieve` | [ ] | [ ] | [ ] | Mark milestone achieved |

---

## Module 33: Claims-AI (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 232 | [ ] | GET | `/api/claims-ai/stats` | [ ] | [ ] | [ ] | AI processing stats |
| 233 | [ ] | GET | `/api/claims-ai/pending` | [ ] | [ ] | [ ] | Pending for AI review |
| 234 | [ ] | GET | `/api/claims-ai/match/:claimId` | [ ] | [ ] | [ ] | AI match result |
| 235 | [ ] | POST | `/api/claims-ai/process` | [ ] | [ ] | [ ] | Process single claim |
| 236 | [ ] | POST | `/api/claims-ai/batch-process` | [ ] | [ ] | [ ] | Batch process |

---

## Module 34: Fund Activities (6 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 237 | [ ] | GET | `/api/fund-activities` | [ ] | [ ] | [ ] | Paginated (uses `metadata` key) |
| 238 | [ ] | GET | `/api/fund-activities/summary` | [ ] | [ ] | [ ] | Summary + ROI by type |
| 239 | [ ] | GET | `/api/fund-activities/:id` | [ ] | [ ] | [ ] | |
| 240 | [ ] | POST | `/api/fund-activities` | [ ] | [ ] | [ ] | Returns 201 |
| 241 | [ ] | PATCH | `/api/fund-activities/:id` | [ ] | [ ] | [ ] | |
| 242 | [ ] | DELETE | `/api/fund-activities/:id` | [ ] | [ ] | [ ] | |

---

## Module 35: Post-Analysis (5 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 243 | [ ] | GET | `/api/post-analysis/summary` | [ ] | [ ] | [ ] | Overview |
| 244 | [ ] | GET | `/api/post-analysis/learnings` | [ ] | [ ] | [ ] | Extracted learnings |
| 245 | [ ] | GET | `/api/post-analysis/:promotionId` | [ ] | [ ] | [ ] | Per-promotion analysis |
| 246 | [ ] | POST | `/api/post-analysis/generate/:promotionId` | [ ] | [ ] | [ ] | Generate analysis |
| 247 | [ ] | POST | `/api/post-analysis/:id/apply-baseline` | [ ] | [ ] | [ ] | Apply findings to baseline |

---

## Module 36: Promo Suggestions (7 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 248 | [ ] | GET | `/api/promo-suggestions` | [ ] | [ ] | [ ] | Paginated |
| 249 | [ ] | GET | `/api/promo-suggestions/contract/:contractId` | [ ] | [ ] | [ ] | Suggestions for contract |
| 250 | [ ] | GET | `/api/promo-suggestions/:id` | [ ] | [ ] | [ ] | |
| 251 | [ ] | POST | `/api/promo-suggestions` | [ ] | [ ] | [ ] | Returns 201 |
| 252 | [ ] | PUT | `/api/promo-suggestions/:id/approve` | [ ] | [ ] | [ ] | |
| 253 | [ ] | PUT | `/api/promo-suggestions/:id/reject` | [ ] | [ ] | [ ] | |
| 254 | [ ] | POST | `/api/promo-suggestions/:id/apply` | [ ] | [ ] | [ ] | Apply to promotion |

---

## Module 37: Monitoring (3 endpoints)

| # | Done | Method | Path | Controller | Service | Test | Notes |
|---|------|--------|------|------------|---------|------|-------|
| 255 | [ ] | GET | `/api/monitoring/dashboard` | [ ] | [ ] | [ ] | Live monitoring overview |
| 256 | [ ] | GET | `/api/monitoring/live/:promotionId` | [ ] | [ ] | [ ] | Real-time metrics + hourlyTrend |
| 257 | [ ] | GET | `/api/monitoring/stores/:promotionId` | [ ] | [ ] | [ ] | Store-level performance |

---

## Cross-Cutting Concerns Checklist

| # | Item | Done | Notes |
|---|------|------|-------|
| 1 | [ ] JWT Authentication middleware | | Guards on all endpoints except login |
| 2 | [ ] Role-based authorization (RBAC) | | ADMIN, MANAGER, SALES, FINANCE, VIEWER |
| 3 | [ ] Standard response wrapper | | `{ success, data, pagination? }` |
| 4 | [ ] Error response format | | `{ success: false, error: { message } }` |
| 5 | [ ] Pagination helper | | `page, pageSize, total, totalPages` |
| 6 | [ ] FilterItems helper | | status, type, search, customerId filters |
| 7 | [ ] Request validation (Zod/class-validator) | | All POST/PUT/PATCH bodies |
| 8 | [ ] Multi-tenant company scoping | | companyId on all queries |
| 9 | [ ] Audit logging middleware | | Track all mutations |
| 10 | [ ] Rate limiting | | Protect auth + AI endpoints |
| 11 | [ ] CORS configuration | | Allow frontend origins |
| 12 | [ ] Health check endpoint | | GET /api/health |
