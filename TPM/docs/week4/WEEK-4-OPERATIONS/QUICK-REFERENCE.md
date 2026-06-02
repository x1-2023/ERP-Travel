# 📋 WEEK 4 OPERATIONS - QUICK REFERENCE

## 🗓️ DAILY TASKS

| Day | Focus | Deliverables |
|-----|-------|--------------|
| **Day 1** | Delivery API | 8 endpoints + status transitions |
| **Day 2** | Delivery UI | 4 pages + timeline + calendar |
| **Day 3** | Sell Tracking API | 6 endpoints + import + alerts |
| **Day 4** | Sell Tracking UI | 3 pages + charts + comparison |
| **Day 5** | Inventory | 5 endpoints + 2 pages |

---

## 🔌 API ENDPOINTS CHECKLIST

### Delivery (8)
```
[ ] GET    /api/operations/delivery
[ ] POST   /api/operations/delivery
[ ] GET    /api/operations/delivery/:id
[ ] PUT    /api/operations/delivery/:id
[ ] DELETE /api/operations/delivery/:id
[ ] PUT    /api/operations/delivery/:id/status
[ ] GET    /api/operations/delivery/:id/tracking
[ ] GET    /api/operations/delivery/calendar
[ ] GET    /api/operations/delivery/stats
```

### Sell Tracking (6)
```
[ ] GET    /api/operations/sell-tracking
[ ] POST   /api/operations/sell-tracking
[ ] GET    /api/operations/sell-tracking/sell-in
[ ] GET    /api/operations/sell-tracking/sell-out
[ ] GET    /api/operations/sell-tracking/comparison
[ ] POST   /api/operations/sell-tracking/import
[ ] GET    /api/operations/sell-tracking/alerts
```

### Inventory (5)
```
[ ] GET    /api/operations/inventory
[ ] GET    /api/operations/inventory/snapshots
[ ] POST   /api/operations/inventory/snapshots
[ ] POST   /api/operations/inventory/snapshots/bulk
[ ] GET    /api/operations/inventory/alerts
```

---

## 📄 PAGES CHECKLIST

### Delivery (4)
```
[ ] /operations/delivery           → List page (table + calendar)
[ ] /operations/delivery/:id       → Detail page with timeline
[ ] /operations/delivery/new       → Create order form
[ ] /operations/delivery/calendar  → Calendar view
```

### Sell Tracking (3)
```
[ ] /operations/sell-tracking      → Dashboard with comparison
[ ] /operations/sell-tracking/sell-in  → Sell-in analysis
[ ] /operations/sell-tracking/sell-out → Sell-out analysis
```

### Inventory (2)
```
[ ] /operations/inventory          → Dashboard with alerts
[ ] /operations/inventory/snapshots → Historical snapshots
```

---

## 🧩 COMPONENTS CHECKLIST

### Delivery
```
[ ] DeliveryCard.tsx
[ ] DeliveryForm.tsx
[ ] DeliveryTimeline.tsx
[ ] DeliveryStatusBadge.tsx
[ ] DeliveryCalendar.tsx
```

### Sell Tracking
```
[ ] SellComparisonChart.tsx
[ ] SellComparisonTable.tsx
[ ] SellTrendChart.tsx
[ ] SellImportDialog.tsx
[ ] SellAlertCard.tsx
```

### Inventory
```
[ ] InventoryCard.tsx
[ ] InventoryTable.tsx
[ ] StockAlertBadge.tsx
[ ] StockDistributionChart.tsx
[ ] SnapshotImportDialog.tsx
```

### Shared
```
[ ] OperationsStats.tsx
[ ] OperationsDashboard.tsx
```

---

## 🪝 HOOKS CHECKLIST

```
[ ] useDelivery.ts
    - useDeliveryOrders(params)
    - useDeliveryOrder(id)
    - useCreateDelivery()
    - useUpdateDelivery()
    - useUpdateDeliveryStatus()
    - useDeliveryTracking(id)
    - useDeliveryCalendar(month, year)
    - useDeliveryStats()

[ ] useSellTracking.ts
    - useSellTracking(params)
    - useSellIn(params)
    - useSellOut(params)
    - useSellComparison(params)
    - useImportSellData()
    - useSellAlerts()

[ ] useInventory.ts
    - useInventory(params)
    - useInventorySnapshots(params)
    - useCreateSnapshot()
    - useBulkSnapshot()
    - useInventoryAlerts()
```

---

## 🚚 DELIVERY STATUS FLOW

```
PENDING → CONFIRMED → SCHEDULED → PICKING → PACKED → IN_TRANSIT → DELIVERED
    ↓          ↓           ↓          ↓         ↓                    ↓
CANCELLED  CANCELLED   CANCELLED  CANCELLED  CANCELLED            PARTIAL
                                                                     ↓
                                                                 DELIVERED
                                                   IN_TRANSIT → RETURNED
```

**Status Colors:**
| Status | Color | Description |
|--------|-------|-------------|
| PENDING | Gray | Awaiting confirmation |
| CONFIRMED | Blue | Order confirmed |
| SCHEDULED | Blue | Delivery scheduled |
| PICKING | Yellow | Items being picked |
| PACKED | Yellow | Items packed |
| IN_TRANSIT | Orange | On the way |
| DELIVERED | Green | Completed |
| PARTIAL | Yellow | Partially delivered |
| RETURNED | Red | Returned |
| CANCELLED | Gray | Cancelled |

---

## 📊 SELL TRACKING FORMULAS

### Key Metrics
```
Sell-through Rate = (Sell-out / Sell-in) × 100

Days of Stock = Stock Qty / Avg Daily Sell-out

Stock Coverage (months) = Stock Qty / Avg Monthly Sell-out

Growth % = ((Current - Previous) / Previous) × 100
```

### Alert Thresholds
| Alert | Condition | Severity |
|-------|-----------|----------|
| Low Sell-through | < 50% | WARNING |
| Very Low Sell-through | < 30% | CRITICAL |
| High Stock | > 60 days supply | WARNING |
| Stockout Risk | < 7 days supply | CRITICAL |

---

## 📦 INVENTORY THRESHOLDS

| Metric | Threshold | Status |
|--------|-----------|--------|
| Stock Coverage | < 1 month | LOW_STOCK |
| Stock Coverage | > 6 months | OVERSTOCK |
| Days to Expiry | < 30 days | NEAR_EXPIRY |
| Quantity | = 0 | OUT_OF_STOCK |

---

## 🔄 WORKFLOWS

### Create Delivery Order
```
1. Select customer
2. Link to promotion (optional)
3. Add line items (products + qty)
4. Set scheduled date
5. Enter delivery address
6. Create order (PENDING)
```

### Delivery Status Update
```
1. View order detail
2. Click "Update Status"
3. Select next valid status
4. For DELIVERED: enter delivered quantities
5. Add notes (optional)
6. Confirm status change
7. Tracking entry created
```

### Import Sell Data
```
1. Select import type (Sell-in/Sell-out/Stock)
2. Select period (YYYY-MM)
3. Upload CSV/Excel file
4. Map columns (Customer, Product, Qty, Value)
5. Preview data
6. Confirm import
7. View results (created/updated/errors)
```

### Take Inventory Snapshot
```
1. Bulk import or manual entry
2. Select snapshot date
3. Enter quantities by customer + product
4. Include batch/expiry info (optional)
5. Save snapshot
6. Compare with previous
```

---

## 📁 FILE STRUCTURE

```
apps/web/src/
├── pages/operations/
│   ├── index.tsx
│   ├── delivery/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   ├── new.tsx
│   │   └── calendar.tsx
│   ├── sell-tracking/
│   │   ├── index.tsx
│   │   ├── sell-in.tsx
│   │   └── sell-out.tsx
│   └── inventory/
│       ├── index.tsx
│       └── snapshots.tsx
├── components/operations/
│   └── [components]
├── hooks/operations/
│   └── [hooks]
└── types/
    └── operations.ts

apps/api/api/operations/
├── delivery.ts
├── sell-tracking.ts
└── inventory.ts
```

---

## 🚀 COMMANDS

```bash
# Start dev
npm run dev

# Generate Prisma client
cd apps/api && npx prisma generate

# Open Prisma Studio
cd apps/api && npx prisma studio

# Commit progress
git add .
git commit -m "feat(operations): Day X - [description]"
```

---

## ✅ END OF WEEK 4 GOALS

- [ ] All 19 API endpoints working
- [ ] All 9 pages implemented
- [ ] Delivery timeline tracks all status changes
- [ ] Calendar view shows scheduled deliveries
- [ ] Sell comparison chart shows trends
- [ ] Import data from CSV/Excel works
- [ ] Inventory alerts generated
- [ ] Tests passing
- [ ] Code committed

---

## 📊 WEEK 4 METRICS TARGET

| Metric | Target |
|--------|--------|
| API Endpoints | 19 |
| Pages | 9 |
| Components | ~15 |
| Hooks | ~20 |
| Test Coverage | >80% |
