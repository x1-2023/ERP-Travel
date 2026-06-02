# API SPECIFICATION - Promo Master V3

> Auto-generated from 257 MSW handlers in `src/mocks/handlers/index.ts`
> Date: 2026-02-08

## Overview

| Property | Value |
|----------|-------|
| Total Endpoints | **257** |
| Base URL | `/api` |
| Authentication | JWT Bearer Token |
| Content-Type | `application/json` |
| Response Wrapper | `{ success: boolean, data: T, pagination?: P }` |
| Error Format | `{ success: false, error: { message: string } }` |

## Common Patterns

### Pagination (GET list endpoints)
```
Query: ?page=1&pageSize=10 (or ?limit=10)
Response: { success: true, data: [...], pagination: { page, pageSize, total, totalPages } }
```

### Filtering (via `filterItems` helper)
```
Query: ?status=ACTIVE&type=DISCOUNT&search=keyword&customerId=cust-001
Fields searched: name, code, description (case-insensitive)
```

### Standard CRUD Response Codes
- `200` - Success (GET, PUT, PATCH, DELETE)
- `201` - Created (POST)
- `404` - Not Found
- `401` - Unauthorized

---

## Module 1: AUTH (4 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | POST | `/api/auth/login` | Login with email/password |
| 2 | POST | `/api/auth/logout` | Logout current session |
| 3 | GET | `/api/auth/me` | Get current authenticated user |
| 4 | POST | `/api/auth/refresh` | Refresh access token |

### POST /api/auth/login
**Request Body:**
```json
{ "email": "string", "password": "string" }
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id", "email", "name", "role", "avatar", "department", "phone", "status", "lastLogin", "createdAt" },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```
**Response 401:** `{ "success": false, "error": { "message": "Invalid credentials" } }`

### POST /api/auth/refresh
**Response 200:**
```json
{
  "success": true,
  "data": { "accessToken": "string", "refreshToken": "string" }
}
```

### GET /api/auth/me
**Response 200:** `{ "success": true, "data": User }`

---

## Module 2: PROMOTIONS (10 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 5 | GET | `/api/promotions` | List promotions (paginated, filtered) |
| 6 | GET | `/api/promotions/stats` | Promotion statistics |
| 7 | GET | `/api/promotions/:id` | Get promotion detail |
| 8 | POST | `/api/promotions` | Create promotion |
| 9 | PUT | `/api/promotions/:id` | Full update promotion |
| 10 | PATCH | `/api/promotions/:id` | Partial update promotion |
| 11 | DELETE | `/api/promotions/:id` | Delete promotion |
| 12 | POST | `/api/promotions/:id/submit` | Submit for approval |
| 13 | POST | `/api/promotions/:id/approve` | Approve promotion |
| 14 | POST | `/api/promotions/:id/reject` | Reject promotion |

### Promotion Entity Shape
```json
{
  "id": "promo-001",
  "code": "SUMMER-2026",
  "name": "Khuyến mãi Hè 2026",
  "description": "string",
  "type": "DISCOUNT|BUNDLE|GIFT|REBATE|DISPLAY|VOLUME",
  "status": "DRAFT|PENDING|APPROVED|ACTIVE|COMPLETED|CANCELLED|REJECTED",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "budget": 500000000,
  "spentAmount": 125000000,
  "targetRevenue": 2000000000,
  "actualRevenue": 580000000,
  "customerId": "cust-001",
  "customerName": "Siêu thị CoopMart",
  "products": ["prod-001", "prod-002"],
  "regions": ["HCM", "HN"],
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime",
  "createdById": "user-001",
  "approvedById": "user-002",
  "approvedAt": "ISO datetime"
}
```

### GET /api/promotions
**Query:** `page, pageSize|limit, status, type, search|q, customerId`
**Response:** Paginated list of Promotion entities

### GET /api/promotions/stats
**Response:**
```json
{
  "success": true,
  "data": {
    "total": 24, "active": 5, "pending": 3, "completed": 8, "draft": 4,
    "totalBudget": 5000000000, "totalSpent": 2500000000, "totalRevenue": 8000000000
  }
}
```

### POST /api/promotions/:id/reject
**Request Body:** `{ "reason": "string" }`
**Response:** Promotion with `status: "REJECTED"`, `rejectedAt`, `rejectionReason`

---

## Module 3: CLAIMS (9 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 15 | GET | `/api/claims` | List claims (paginated, filtered) |
| 16 | GET | `/api/claims/stats` | Claim statistics |
| 17 | GET | `/api/claims/:id` | Get claim detail |
| 18 | POST | `/api/claims` | Create/submit claim |
| 19 | PATCH | `/api/claims/:id` | Update claim |
| 20 | DELETE | `/api/claims/:id` | Delete claim |
| 21 | POST | `/api/claims/:id/submit` | Submit claim for review |
| 22 | POST | `/api/claims/:id/approve` | Approve claim |
| 23 | POST | `/api/claims/:id/reject` | Reject claim |

### Claim Entity Shape
```json
{
  "id": "claim-001",
  "code": "CLM-2026-001",
  "promotionId": "promo-001",
  "promotionCode": "SUMMER-2026",
  "promotionName": "Khuyến mãi Hè 2026",
  "customerId": "cust-001",
  "customerName": "Siêu thị CoopMart",
  "type": "DISCOUNT|REBATE|DISPLAY|DAMAGE|RETURN|OTHER",
  "status": "DRAFT|SUBMITTED|UNDER_REVIEW|APPROVED|REJECTED|PAID|CANCELLED",
  "amount": 25000000,
  "approvedAmount": 25000000,
  "paidAmount": 25000000,
  "description": "string",
  "evidenceUrls": ["/uploads/invoice.pdf"],
  "submittedAt": "ISO datetime",
  "reviewedAt": "ISO datetime",
  "approvedAt": "ISO datetime",
  "paidAt": "ISO datetime",
  "rejectedAt": "ISO datetime",
  "rejectionReason": "string",
  "paymentRef": "PAY-2026-0052",
  "notes": "string",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime",
  "createdById": "user-001",
  "reviewedById": "user-002",
  "approvedById": "user-003"
}
```

### GET /api/claims/stats
**Response:**
```json
{
  "total": 12, "submitted": 2, "underReview": 3, "approved": 2,
  "paid": 2, "rejected": 1, "totalAmount": 250000000,
  "approvedAmount": 120000000, "paidAmount": 70000000
}
```

---

## Module 4: CUSTOMERS (2 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 24 | GET | `/api/customers` | List customers (paginated, filtered) |
| 25 | GET | `/api/customers/:id` | Get customer detail |

### Customer Entity Shape
```json
{
  "id": "cust-001",
  "code": "KA-001",
  "name": "Siêu thị CoopMart",
  "type": "KEY_ACCOUNT|RETAILER|DISTRIBUTOR|WHOLESALER",
  "status": "ACTIVE|INACTIVE|SUSPENDED",
  "email": "string",
  "phone": "string",
  "address": "string",
  "taxCode": "string",
  "contactPerson": "string",
  "contactPhone": "string",
  "creditLimit": 5000000000,
  "currentDebt": 1200000000,
  "paymentTerms": 30,
  "region": "HCM|HN|DN|CT",
  "tier": "BRONZE|SILVER|GOLD|PLATINUM",
  "totalOrders": 156,
  "totalRevenue": 25000000000,
  "lastOrderDate": "2026-01-25",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

---

## Module 5: PRODUCTS (2 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 26 | GET | `/api/products` | List products (paginated, filtered) |
| 27 | GET | `/api/products/:id` | Get product detail |

### Product Entity Shape
```json
{
  "id": "prod-001",
  "sku": "BEV-001",
  "name": "Nước ngọt Cola 330ml",
  "category": "BEVERAGES|SNACKS|DAIRY|PERSONAL_CARE|HOUSEHOLD",
  "brand": "string",
  "unit": "Lon|Chai|Gói|Hộp|Túi",
  "unitPrice": 12000,
  "costPrice": 8500,
  "status": "ACTIVE|INACTIVE|DISCONTINUED",
  "description": "string",
  "barcode": "string",
  "weight": 350,
  "dimensions": "string",
  "imageUrl": "string",
  "minStock": 1000,
  "currentStock": 5420,
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

---

## Module 6: FUNDS (6 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 28 | GET | `/api/funds` | List funds (paginated) |
| 29 | GET | `/api/funds/:id` | Get fund detail |
| 30 | GET | `/api/funds/:id/utilization` | Fund utilization breakdown |
| 31 | POST | `/api/funds` | Create fund |
| 32 | PATCH | `/api/funds/:id` | Update fund |
| 33 | DELETE | `/api/funds/:id` | Delete fund |

### Fund Entity Shape
```json
{
  "id": "fund-1",
  "code": "MKT-001",
  "name": "Marketing Fund 2026",
  "type": "MARKETING|TRADE|PROMOTIONAL",
  "totalAmount": 1000000000,
  "allocatedAmount": 600000000,
  "availableAmount": 400000000,
  "status": "ACTIVE",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

### GET /api/funds/:id/utilization
**Response:**
```json
{
  "fundId": "string", "totalAmount": 1000000000, "allocatedAmount": 600000000,
  "availableAmount": 400000000, "utilizationRate": "60.0",
  "allocations": [{ "promotionId", "promotionName", "amount", "date" }]
}
```

---

## Module 7: BUDGETS (9 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 34 | GET | `/api/budgets` | List budgets (paginated) |
| 35 | GET | `/api/budgets/years` | Available fiscal years |
| 36 | GET | `/api/budgets/:id` | Get budget detail |
| 37 | POST | `/api/budgets` | Create budget |
| 38 | PATCH | `/api/budgets/:id` | Update budget |
| 39 | DELETE | `/api/budgets/:id` | Delete budget |
| 40 | GET | `/api/budgets/:id/approval-history` | Budget approval workflow history |
| 41 | GET | `/api/budgets/:id/health-score` | Budget health analytics |
| 42 | GET | `/api/budgets/:id/comparison` | Budget period comparison |

### GET /api/budgets/:id/approval-history
**Response:**
```json
{
  "budget": { "id", "code", "name", "totalAmount" },
  "workflow": { "status", "currentLevel", "requiredLevels", "progress", "levels": [] },
  "timeline": [{ "id", "step", "level", "role", "status", "reviewer", "comments", "submittedAt", "reviewedAt", "duration" }],
  "summary": { "totalSteps", "approved", "pending", "rejected", "avgReviewTimeHours" }
}
```

### GET /api/budgets/:id/health-score
**Response:**
```json
{
  "score": 78, "grade": "B+",
  "factors": [{ "name", "score", "weight" }],
  "trend": "IMPROVING|DECLINING|STABLE",
  "recommendations": ["string"]
}
```

---

## Module 8: TARGETS (8 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 43 | GET | `/api/targets` | List targets (paginated) |
| 44 | GET | `/api/targets/:id` | Get target detail |
| 45 | POST | `/api/targets` | Create target |
| 46 | PATCH | `/api/targets/:id` | Update target |
| 47 | DELETE | `/api/targets/:id` | Delete target |
| 48 | GET | `/api/targets/:id/progress` | Target progress breakdown |
| 49 | GET | `/api/targets/:id/allocation` | Target allocations list |
| 50 | POST | `/api/targets/:id/allocation` | Create allocation |
| 51 | PUT | `/api/targets/:id/allocation/:allocId` | Update allocation |
| 52 | DELETE | `/api/targets/:id/allocation/:allocId` | Delete allocation |

---

## Module 9: GEOGRAPHIC UNITS (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 53 | GET | `/api/geographic-units` | List units (flat or tree) |
| 54 | GET | `/api/geographic-units/:id` | Get unit (optionally with children) |
| 55 | POST | `/api/geographic-units` | Create unit |
| 56 | PATCH | `/api/geographic-units/:id` | Update unit |
| 57 | DELETE | `/api/geographic-units/:id` | Delete unit |

**Special Query Params:**
- `?tree=true` - Returns hierarchical tree structure
- `?level=REGION` - Filter by level (COUNTRY, REGION, PROVINCE, DISTRICT)
- `?parentId=geo-1` - Filter by parent
- `?includeTree=true` (on /:id) - Include children in response

---

## Module 10: BUDGET ALLOCATIONS (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 58 | GET | `/api/budget-allocations` | List allocations (flat or tree) |
| 59 | GET | `/api/budget-allocations/:id` | Get allocation detail |
| 60 | POST | `/api/budget-allocations` | Create allocation |
| 61 | PATCH | `/api/budget-allocations/:id` | Update allocation |
| 62 | DELETE | `/api/budget-allocations/:id` | Delete allocation |

**Query Params:** `budgetId, tree=true, parentId, includeTree`

---

## Module 11: TARGET ALLOCATIONS (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 63 | GET | `/api/target-allocations` | List allocations (flat or tree) |
| 64 | GET | `/api/target-allocations/:id` | Get allocation detail |
| 65 | POST | `/api/target-allocations` | Create allocation |
| 66 | PATCH | `/api/target-allocations/:id` | Update allocation |
| 67 | DELETE | `/api/target-allocations/:id` | Delete allocation |

**Query Params:** `targetId, tree=true, parentId, includeTree`

---

## Module 12: BASELINES (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 68 | GET | `/api/baselines` | List baselines (paginated) |
| 69 | GET | `/api/baselines/:id` | Get baseline detail |
| 70 | POST | `/api/baselines` | Create baseline |
| 71 | PATCH | `/api/baselines/:id` | Update baseline |
| 72 | DELETE | `/api/baselines/:id` | Delete baseline |

### Baseline Entity Shape
```json
{
  "id": "bsl-1", "name": "2025 Q4 Baseline",
  "type": "QUARTERLY|ANNUAL", "period": "Q4-2025",
  "salesVolume": 4500000000, "margin": 18.5,
  "status": "APPROVED|DRAFT",
  "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
}
```

---

## Module 13: FINANCE - ACCRUALS (9 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 73 | GET | `/api/finance/accruals` | List accruals (paginated, filtered) |
| 74 | GET | `/api/finance/accruals/:id` | Get accrual detail |
| 75 | POST | `/api/finance/accruals/calculate` | Calculate accrual for promotion |
| 76 | POST | `/api/finance/accruals/preview` | Preview accrual batch |
| 77 | PUT | `/api/finance/accruals/:id` | Update accrual |
| 78 | DELETE | `/api/finance/accruals/:id` | Delete accrual |
| 79 | POST | `/api/finance/accruals/:id/post` | Post accrual to GL |
| 80 | POST | `/api/finance/accruals/post-batch` | Batch post accruals |
| 81 | POST | `/api/finance/accruals/:id/reverse` | Reverse posted accrual |

### Accrual Entity Shape (transformed for API response)
```json
{
  "id": "acc-001", "code": "ACC-2026-001",
  "amount": 45000000,
  "promotion": { "id": "promo-001", "code": "SUMMER-2026", "name": "Khuyến mãi Hè 2026" },
  "period": "2026-01",
  "status": "PENDING|CALCULATED|POSTED|REVERSED",
  "estimatedAmount": 45000000, "actualAmount": 42500000,
  "variance": -2500000, "variancePercent": -5.56,
  "glAccountCode": "6410", "glAccountName": "Chi phí khuyến mãi",
  "glJournalId": "jnl-001",
  "calculatedAt": "ISO datetime", "postedAt": "ISO datetime",
  "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
}
```

### POST /api/finance/accruals/calculate
**Request:** `{ "promotionId": "string" }`
**Response:**
```json
{
  "promotionId": "string", "calculatedAmount": 15000000, "previousAmount": 10000000,
  "difference": 5000000,
  "breakdown": [{ "customerId", "customerName", "amount" }]
}
```

### POST /api/finance/accruals/post-batch
**Request:** `{ "ids": ["acc-001", "acc-002"] }`
**Response:** `{ "posted": 2, "failed": 0, "journalId": "jnl-batch-xxx" }`

---

## Module 14: FINANCE - DEDUCTIONS (9 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 82 | GET | `/api/finance/deductions` | List deductions (paginated, filtered) |
| 83 | GET | `/api/finance/deductions/:id` | Get deduction detail |
| 84 | GET | `/api/finance/deductions/:id/suggestions` | AI match suggestions for claims |
| 85 | POST | `/api/finance/deductions` | Create deduction |
| 86 | PUT | `/api/finance/deductions/:id` | Update deduction |
| 87 | DELETE | `/api/finance/deductions/:id` | Delete deduction |
| 88 | POST | `/api/finance/deductions/:id/match` | Match deduction to claim |
| 89 | POST | `/api/finance/deductions/:id/dispute` | Dispute deduction |
| 90 | POST | `/api/finance/deductions/:id/resolve` | Resolve deduction |

### GET /api/finance/deductions/:id/suggestions
**Response:**
```json
[{
  "claimId": "string",
  "claim": { "id", "code", "amount", "claimDate", "status", "promotion": { "id", "code", "name" } },
  "confidence": 0.95,
  "matchReasons": ["Amount match", "Date proximity", "Customer match"]
}]
```

### POST /api/finance/deductions/:id/match
**Request:** `{ "claimId": "string" }`
**Response:** `{ "id", "status": "MATCHED", "matchedClaimId", "matchedAt" }`

### POST /api/finance/deductions/:id/resolve
**Request:** `{ "resolution": "string", "amount": number }`
**Response:** `{ "id", "status": "RESOLVED", "resolution", "resolvedAmount", "resolvedAt" }`

---

## Module 15: FINANCE - JOURNALS (7 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 91 | GET | `/api/finance/journals` | List journals (paginated, filtered) |
| 92 | GET | `/api/finance/journals/:id` | Get journal detail |
| 93 | POST | `/api/finance/journals` | Create journal entry |
| 94 | PUT | `/api/finance/journals/:id` | Update journal |
| 95 | DELETE | `/api/finance/journals/:id` | Delete journal |
| 96 | POST | `/api/finance/journals/:id/post` | Post journal to GL |
| 97 | POST | `/api/finance/journals/:id/reverse` | Reverse journal |

### Journal Entity Shape
```json
{
  "id": "jnl-001", "code": "JNL-2026-001",
  "description": "string",
  "status": "DRAFT|PENDING|POSTED|REVERSED",
  "postingDate": "2026-01-25", "period": "2026-01",
  "totalDebit": 42500000, "totalCredit": 42500000,
  "lines": [{ "accountCode", "accountName", "debit", "credit" }],
  "reference": "ACC-2026-001", "referenceType": "ACCRUAL|CLAIM_PAYMENT",
  "postedAt": "ISO datetime",
  "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
}
```

---

## Module 16: FINANCE - CHEQUES (6 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 98 | GET | `/api/finance/cheques` | List cheques (paginated, filtered) |
| 99 | GET | `/api/finance/cheques/:id` | Get cheque detail |
| 100 | POST | `/api/finance/cheques` | Create cheque |
| 101 | PUT | `/api/finance/cheques/:id` | Update cheque (action: CLEAR/VOID/STALE) |
| 102 | DELETE | `/api/finance/cheques/:id` | Delete cheque |
| 103 | GET | `/api/finance/stats` | Finance summary stats |

### Cheque Entity Shape
```json
{
  "id": "chq-001", "code": "CHQ-2026-001",
  "chequeNumber": "0012345678", "bankName": "Vietcombank",
  "bankAccount": "string", "payee": "string",
  "customerId": "cust-001", "amount": 35000000,
  "issueDate": "2026-01-25", "dueDate": "2026-02-10",
  "status": "DRAFT|ISSUED|DELIVERED|CASHED|CANCELLED|BOUNCED",
  "claimId": "claim-002", "claimCode": "CLM-2026-002",
  "journalId": "jnl-003"
}
```

### GET /api/finance/stats
**Response:**
```json
{
  "totalAccruals": 450000000, "postedAccruals": 134500000,
  "pendingDeductions": 8500000, "processedDeductions": 35000000,
  "outstandingCheques": 35000000, "totalJournalEntries": 3
}
```

---

## Module 17: NOTIFICATIONS (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 104 | GET | `/api/notifications` | List all notifications |
| 105 | GET | `/api/notifications/unread-count` | Get unread count |
| 106 | PATCH | `/api/notifications/:id/read` | Mark as read |
| 107 | PATCH | `/api/notifications/mark-all-read` | Mark all as read |
| 108 | DELETE | `/api/notifications/:id` | Delete notification |

### Notification Entity Shape
```json
{
  "id": "n1", "type": "INFO|SUCCESS|WARNING|ERROR",
  "title": "string", "message": "string",
  "read": false, "createdAt": "ISO datetime"
}
```

---

## Module 18: DASHBOARD (11 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 109 | GET | `/api/dashboard/stats` | Dashboard KPIs |
| 110 | GET | `/api/dashboard/kpi` | Dashboard KPIs (alias) |
| 111 | GET | `/api/dashboard/kpis` | Dashboard KPIs (alias) |
| 112 | GET | `/api/dashboard/activity` | Recent activity feed |
| 113 | GET | `/api/dashboard/charts` | All chart data |
| 114 | GET | `/api/dashboard/charts/promotions-by-status` | Promotions by status chart |
| 115 | GET | `/api/dashboard/charts/budget-utilization` | Budget utilization chart |
| 116 | GET | `/api/dashboard/charts/claims-trend` | Claims trend chart |
| 117 | GET | `/api/dashboard/charts/spend-trend` | Spend trend chart |
| 118 | GET | `/api/dashboard/charts/status-distribution` | Status distribution chart |
| 119 | GET | `/api/dashboard/charts/top-customers` | Top customers chart |

### GET /api/dashboard/activity
**Response:**
```json
[{
  "id": "act-1", "type": "PROMOTION_CREATED|CLAIM_APPROVED|BUDGET_UPDATED",
  "description": "string", "userId": "string", "userName": "string",
  "timestamp": "ISO datetime"
}]
```

---

## Module 19: PLANNING - TEMPLATES (7 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 120 | GET | `/api/planning/templates` | List templates (paginated) |
| 121 | GET | `/api/planning/templates/:id` | Get template detail |
| 122 | GET | `/api/planning/templates/:id/versions` | Template version history |
| 123 | POST | `/api/planning/templates` | Create template |
| 124 | PUT | `/api/planning/templates/:id` | Update template |
| 125 | DELETE | `/api/planning/templates/:id` | Delete template |
| 126 | POST | `/api/planning/templates/:id/apply` | Apply template to promotion |

### Template Entity Shape
```json
{
  "id": "tpl-1", "name": "Summer Sale Template",
  "description": "string", "type": "DISCOUNT|BOGO|REBATE",
  "status": "ACTIVE|DRAFT",
  "config": { "discountType": "PERCENTAGE", "discountValue": 15 },
  "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
}
```

---

## Module 20: PLANNING - SCENARIOS (10 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 127 | GET | `/api/planning/scenarios` | List scenarios (paginated) |
| 128 | GET | `/api/planning/scenarios/:id` | Get scenario detail + promotions |
| 129 | GET | `/api/planning/scenarios/:id/versions` | Version history |
| 130 | POST | `/api/planning/scenarios` | Create scenario |
| 131 | PUT | `/api/planning/scenarios/:id` | Update scenario |
| 132 | DELETE | `/api/planning/scenarios/:id` | Delete scenario |
| 133 | POST | `/api/planning/scenarios/:id/run` | Run scenario simulation |
| 134 | POST | `/api/planning/scenarios/:id/clone` | Clone scenario |
| 135 | POST | `/api/planning/scenarios/:id/versions` | Restore version |
| 136 | POST | `/api/planning/scenarios/compare` | Compare multiple scenarios |

### Scenario Results Shape (from /run)
```json
{
  "roi": 12.5, "netMargin": 75000000, "salesLiftPercent": 18.2,
  "paybackDays": 45, "baselineSales": 2500000000, "projectedSales": 2955000000,
  "incrementalSales": 455000000, "promotionCost": 380000000,
  "fundingRequired": 418000000, "costPerIncrementalUnit": 25000,
  "grossMargin": 590000000, "projectedUnits": 118200,
  "incrementalUnits": 18200, "redemptions": 76830,
  "dailyProjections": [{ "day", "date", "baselineSales", "projectedSales", "promotionCost", "cumulativeROI", "cumulativeNetMargin" }]
}
```

---

## Module 21: PLANNING - CLASHES (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 137 | GET | `/api/planning/clashes/stats` | Clash statistics |
| 138 | GET | `/api/planning/clashes` | List clashes (paginated) |
| 139 | GET | `/api/planning/clashes/:id` | Get clash detail (enriched) |
| 140 | PATCH | `/api/planning/clashes/:id` | Update clash |
| 141 | POST | `/api/planning/clashes/:id/resolve` | Resolve clash |

### Clash Entity Shape
```json
{
  "id": "clash-1",
  "clashType": "PRODUCT_OVERLAP|BUDGET_EXCEEDED|TIMING_CONFLICT",
  "severity": "HIGH|MEDIUM|LOW",
  "status": "PENDING|RESOLVED",
  "promotionA": { "id", "name", "code", "startDate", "endDate", "customer", "products" },
  "promotionB": { "id", "name", "code", "startDate", "endDate", "customer", "products" },
  "description": "string",
  "overlapStart": "ISO datetime", "overlapEnd": "ISO datetime",
  "affectedCustomers": ["cust-001"], "affectedProducts": ["prod-001"],
  "potentialImpact": 150000000,
  "analysis": { "overlapDays", "affectedCustomersCount", "affectedProductsCount", "recommendations": [] }
}
```

---

## Module 22: OPERATIONS - DELIVERY (10 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 142 | GET | `/api/operations/delivery` | List deliveries (paginated) |
| 143 | GET | `/api/operations/deliveries` | List deliveries (alias) |
| 144 | GET | `/api/operations/delivery/:id` | Get delivery detail |
| 145 | GET | `/api/operations/delivery/:id/tracking` | Delivery tracking history |
| 146 | GET | `/api/operations/delivery/calendar` | Delivery calendar view |
| 147 | GET | `/api/operations/delivery/stats` | Delivery statistics |
| 148 | POST | `/api/operations/delivery` | Create delivery order |
| 149 | PUT | `/api/operations/delivery/:id` | Update delivery |
| 150 | PUT | `/api/operations/delivery/:id/status` | Update delivery status |
| 151 | DELETE | `/api/operations/delivery/:id` | Delete delivery |

---

## Module 23: OPERATIONS - SELL TRACKING (12 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 152 | GET | `/api/operations/sell-tracking/sell-in` | Sell-in data + trends |
| 153 | GET | `/api/operations/sell-tracking/sell-out` | Sell-out data + trends |
| 154 | GET | `/api/operations/sell-tracking` | Detailed sell tracking records |
| 155 | GET | `/api/operations/sell-tracking/:id` | Get tracking record detail |
| 156 | GET | `/api/operations/sell-tracking/summary` | Summary totals |
| 157 | GET | `/api/operations/sell-tracking/trends` | Weekly trends |
| 158 | POST | `/api/operations/sell-tracking` | Create record |
| 159 | PUT | `/api/operations/sell-tracking/:id` | Update record |
| 160 | DELETE | `/api/operations/sell-tracking/:id` | Delete record |
| 161 | POST | `/api/operations/sell-tracking/bulk` | Bulk action |
| 162 | POST | `/api/operations/sell-tracking/import` | Import from file |
| 163 | GET | `/api/operations/sell-tracking/export` | Export to file |

### GET /api/operations/sell-tracking/sell-in (and sell-out)
**Response:**
```json
{
  "totals": { "quantity": 125000, "value": 18750000000 },
  "analysis": { "uniqueCustomers": 48, "uniqueProducts": 156 },
  "trend": [{ "period", "quantity", "value" }],
  "data": [{ "groupKey", "groupName", "quantity", "value", "recordCount", "growthPercent" }]
}
```

---

## Module 24: OPERATIONS - INVENTORY (11 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 164 | GET | `/api/operations/inventory` | List inventory items |
| 165 | GET | `/api/operations/inventory/:id` | Get inventory item |
| 166 | GET | `/api/operations/inventory/summary` | Inventory summary stats |
| 167 | GET | `/api/operations/inventory/history` | Inventory change history |
| 168 | POST | `/api/operations/inventory` | Create inventory record |
| 169 | PUT | `/api/operations/inventory/:id` | Update inventory |
| 170 | DELETE | `/api/operations/inventory/:id` | Delete inventory |
| 171 | POST | `/api/operations/inventory/bulk` | Bulk action |
| 172 | POST | `/api/operations/inventory/import` | Import from file |
| 173 | GET | `/api/operations/inventory/export` | Export to file |
| 174 | GET | `/api/operations/inventory/snapshots` | Warehouse inventory snapshots |

---

## Module 25: BI & ANALYTICS (12 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 175 | GET | `/api/bi/analytics/dashboard` | BI dashboard (KPIs + charts + summary) |
| 176 | GET | `/api/bi/analytics/kpis` | KPI metrics list |
| 177 | GET | `/api/bi/analytics/trends` | Trend data |
| 178 | GET | `/api/bi/analytics` | Combined analytics overview |
| 179 | POST | `/api/bi/export` | Export report to file |
| 180 | GET | `/api/bi/reports` | List saved reports |
| 181 | GET | `/api/bi/reports/:id` | Get report detail |
| 182 | POST | `/api/bi/reports` | Create report definition |
| 183 | PUT | `/api/bi/reports/:id` | Update report |
| 184 | DELETE | `/api/bi/reports/:id` | Delete report |
| 185 | GET | `/api/bi/reports/:id/execute` | Execute report and get results |
| 186 | POST | `/api/bi/reports/generate` | Generate new report async |

---

## Module 26: AI - INSIGHTS & RECOMMENDATIONS (11 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 187 | GET | `/api/ai/insights` | List AI insights (filterable) |
| 188 | GET | `/api/ai/insights/:id` | Get insight detail |
| 189 | POST | `/api/ai/insights/generate` | Generate new AI insights |
| 190 | POST | `/api/ai/insights/:id/dismiss` | Dismiss insight |
| 191 | POST | `/api/ai/insights/:id/action` | Take action on insight |
| 192 | GET | `/api/ai/recommendations` | List recommendations |
| 193 | GET | `/api/ai/recommendations/:id` | Get recommendation detail |
| 194 | POST | `/api/ai/recommendations/generate` | Generate recommendations |
| 195 | POST | `/api/ai/recommendations/:id/accept` | Accept recommendation |
| 196 | POST | `/api/ai/recommendations/:id/reject` | Reject recommendation |
| 197 | POST | `/api/ai/predict` | Run prediction model |

### GET /api/ai/insights
**Query:** `?type=ANOMALY&severity=HIGH`
**Response:** Array of insights (not paginated)

### POST /api/ai/predict
**Request:** `{ "type": "SALES" }`
**Response:**
```json
{
  "predictionType": "SALES",
  "predictions": [{ "period": "Q2-2026", "value": 5500000000, "confidence": 0.85 }],
  "generatedAt": "ISO datetime"
}
```

---

## Module 27: INTEGRATION - WEBHOOKS (8 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 198 | GET | `/api/integration/webhooks` | List webhooks |
| 199 | GET | `/api/integration/webhooks/:id` | Get webhook detail |
| 200 | POST | `/api/integration/webhooks` | Create webhook |
| 201 | PUT | `/api/integration/webhooks/:id` | Update webhook |
| 202 | DELETE | `/api/integration/webhooks/:id` | Delete webhook |
| 203 | POST | `/api/integration/webhooks/:id/test` | Test webhook delivery |
| 204 | GET | `/api/integration/webhooks/:id/deliveries` | Webhook delivery history |
| 205 | POST | `/api/integration/webhooks/:id/retry` | Retry failed delivery |

---

## Module 28: INTEGRATION - SECURITY (7 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 206 | GET | `/api/integration/security/api-keys` | List API keys |
| 207 | GET | `/api/integration/security/api-keys/:id` | Get API key detail |
| 208 | POST | `/api/integration/security/api-keys` | Create API key |
| 209 | DELETE | `/api/integration/security/api-keys/:id` | Revoke API key |
| 210 | GET | `/api/integration/security/audit-logs` | List audit logs (paginated) |
| 211 | GET | `/api/integration/security/audit-logs/:entityType/:entityId` | Entity audit trail |
| 212 | GET | `/api/integration/security/dashboard` | Security dashboard |

---

## Module 29: INTEGRATION - ERP & DMS (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 213 | GET | `/api/integration/erp/syncs` | List ERP sync history |
| 214 | GET | `/api/integration/erp/:id` | Get ERP sync detail |
| 215 | POST | `/api/integration/erp/sync` | Trigger ERP sync |
| 216 | GET | `/api/integration/dms/syncs` | List DMS sync history |
| 217 | GET | `/api/integration/dms/:id` | Get DMS sync detail |

---

## Module 30: USERS (2 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 218 | GET | `/api/users` | List all users |
| 219 | GET | `/api/users/:id` | Get user detail |

### User Entity Shape
```json
{
  "id": "user-001", "email": "admin@tpm.com", "name": "Admin User",
  "role": "ADMIN|MANAGER|SALES|FINANCE|VIEWER",
  "avatar": "string", "department": "string", "phone": "string",
  "status": "ACTIVE", "lastLogin": "ISO datetime", "createdAt": "ISO datetime"
}
```

---

## Module 31: VOICE COMMANDS (2 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 220 | POST | `/api/voice/command` | Process voice command |
| 221 | GET | `/api/voice/history` | Voice command history |

---

## Module 32: CONTRACTS - Volume Contracts (10 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 222 | GET | `/api/contracts/dashboard` | Contracts dashboard overview |
| 223 | GET | `/api/contracts` | List contracts (paginated, filtered) |
| 224 | GET | `/api/contracts/:id` | Get contract detail (with milestones + monthly progress) |
| 225 | POST | `/api/contracts` | Create contract |
| 226 | PUT | `/api/contracts/:id` | Update contract |
| 227 | DELETE | `/api/contracts/:id` | Delete contract |
| 228 | GET | `/api/contracts/:id/progress` | Monthly volume progress |
| 229 | POST | `/api/contracts/:id/progress` | Record progress entry |
| 230 | GET | `/api/contracts/:id/gap-analysis` | Gap analysis + projections |
| 231 | POST | `/api/contracts/:contractId/milestones/:milestoneId/achieve` | Mark milestone achieved |

### Contract Entity Shape (detail)
```json
{
  "id": "vc-1", "code": "VC-2026-001", "name": "Annual Volume Agreement - Metro",
  "customerId": "cust-001", "customerName": "Metro Cash & Carry",
  "status": "ACTIVE|DRAFT|COMPLETED", "type": "ANNUAL|QUARTERLY",
  "startDate": "2026-01-01", "endDate": "2026-12-31",
  "targetVolume": 100000, "achievedVolume": 45000, "progress": 45,
  "riskLevel": "LOW|MEDIUM|HIGH", "totalValue": 500000000,
  "milestones": [{ "id", "name", "targetVolume", "achievedVolume", "rebatePercent", "rebateAmount", "achieved", "achievedAt" }],
  "monthlyProgress": [{ "month", "volume", "value" }]
}
```

### GET /api/contracts/:id/gap-analysis
**Response:**
```json
{
  "targetVolume": 100000, "achievedVolume": 45000, "remainingVolume": 55000,
  "daysRemaining": 245, "requiredDailyRate": 224, "currentDailyRate": 375,
  "projectedFinalVolume": 112000, "onTrack": true,
  "riskFactors": [], "recommendations": ["string"]
}
```

---

## Module 33: CLAIMS-AI (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 232 | GET | `/api/claims-ai/stats` | AI claims processing stats |
| 233 | GET | `/api/claims-ai/pending` | Pending claims for AI review |
| 234 | GET | `/api/claims-ai/match/:claimId` | Get AI match result for claim |
| 235 | POST | `/api/claims-ai/process` | Process single claim with AI |
| 236 | POST | `/api/claims-ai/batch-process` | Batch process claims |

### GET /api/claims-ai/stats
**Response:**
```json
{
  "totalPending": 15, "autoMatchRate": 78.5, "avgProcessingTime": 2.3,
  "processedToday": 12, "accuracy": 94.2, "totalProcessed": 245, "rejectionRate": 5.8
}
```

---

## Module 34: FUND ACTIVITIES (6 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 237 | GET | `/api/fund-activities` | List activities (paginated) |
| 238 | GET | `/api/fund-activities/summary` | Activities summary + ROI by type |
| 239 | GET | `/api/fund-activities/:id` | Get activity detail |
| 240 | POST | `/api/fund-activities` | Create activity |
| 241 | PATCH | `/api/fund-activities/:id` | Update activity |
| 242 | DELETE | `/api/fund-activities/:id` | Delete activity |

**Note:** List response uses `metadata` instead of `pagination` for the pagination object.

### Fund Activity Entity Shape
```json
{
  "id": "fa-1", "budgetId": "fund-1",
  "activityType": "promotion|display|sampling|event",
  "activityName": "string", "activityCode": "FA-001",
  "allocatedAmount": 200000000, "spentAmount": 150000000,
  "revenueGenerated": 450000000, "unitsImpacted": 15000, "roi": 2.0,
  "startDate": "2026-01-01", "endDate": "2026-03-31",
  "status": "PLANNED|ACTIVE|COMPLETED|CANCELLED"
}
```

---

## Module 35: POST-ANALYSIS (5 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 243 | GET | `/api/post-analysis/summary` | Post-analysis overview |
| 244 | GET | `/api/post-analysis/learnings` | Extracted learnings |
| 245 | GET | `/api/post-analysis/:promotionId` | Analysis for specific promotion |
| 246 | POST | `/api/post-analysis/generate/:promotionId` | Generate analysis |
| 247 | POST | `/api/post-analysis/:id/apply-baseline` | Apply findings to baseline |

---

## Module 36: PROMO SUGGESTIONS (7 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 248 | GET | `/api/promo-suggestions` | List suggestions (paginated) |
| 249 | GET | `/api/promo-suggestions/contract/:contractId` | Suggestions for contract |
| 250 | GET | `/api/promo-suggestions/:id` | Get suggestion detail |
| 251 | POST | `/api/promo-suggestions` | Create suggestion |
| 252 | PUT | `/api/promo-suggestions/:id/approve` | Approve suggestion |
| 253 | PUT | `/api/promo-suggestions/:id/reject` | Reject suggestion |
| 254 | POST | `/api/promo-suggestions/:id/apply` | Apply suggestion |

---

## Module 37: MONITORING - Live Dashboard (3 endpoints)

| # | Method | Path | Description |
|---|--------|------|-------------|
| 255 | GET | `/api/monitoring/dashboard` | Live monitoring overview |
| 256 | GET | `/api/monitoring/live/:promotionId` | Live promotion metrics |
| 257 | GET | `/api/monitoring/stores/:promotionId` | Store-level performance |

### GET /api/monitoring/live/:promotionId
**Response:**
```json
{
  "promotionId": "string",
  "currentRedemptions": 1250, "targetRedemptions": 2000,
  "currentSpend": 45000000, "budgetRemaining": 55000000,
  "redemptionRate": 62.5,
  "hourlyTrend": [{ "hour": 0, "redemptions": 50, "spend": 2500000 }],
  "lastUpdated": "ISO datetime"
}
```

---

## Enums Summary

| Enum | Values |
|------|--------|
| Promotion Type | DISCOUNT, BUNDLE, GIFT, REBATE, DISPLAY, VOLUME |
| Promotion Status | DRAFT, PENDING, APPROVED, ACTIVE, COMPLETED, CANCELLED, REJECTED |
| Claim Type | DISCOUNT, REBATE, DISPLAY, DAMAGE, RETURN, OTHER |
| Claim Status | DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID, CANCELLED |
| Customer Type | KEY_ACCOUNT, RETAILER, DISTRIBUTOR, WHOLESALER |
| Customer Tier | BRONZE, SILVER, GOLD, PLATINUM |
| Product Category | BEVERAGES, SNACKS, DAIRY, PERSONAL_CARE, HOUSEHOLD |
| User Role | ADMIN, MANAGER, SALES, FINANCE, VIEWER |
| Fund Type | MARKETING, TRADE, PROMOTIONAL |
| Accrual Status | PENDING, CALCULATED, POSTED, REVERSED |
| Deduction Status | PENDING, APPROVED, REJECTED, PROCESSED, OPEN, MATCHED, DISPUTED, RESOLVED |
| Journal Status | DRAFT, PENDING, POSTED, REVERSED |
| Cheque Status | DRAFT, ISSUED, DELIVERED, CASHED, CANCELLED, BOUNCED |
| Contract Type | ANNUAL, QUARTERLY |
| Contract Status | ACTIVE, DRAFT, COMPLETED |
| Clash Type | PRODUCT_OVERLAP, BUDGET_EXCEEDED, TIMING_CONFLICT |
| Clash Severity | HIGH, MEDIUM, LOW |
| Delivery Status | PENDING, DISPATCHED, IN_TRANSIT, DELIVERED |
| Activity Type | promotion, display, sampling, event |
| Activity Status | PLANNED, ACTIVE, COMPLETED, CANCELLED |
