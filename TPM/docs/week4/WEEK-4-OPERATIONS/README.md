# 🚚 WEEK 4: OPERATIONS MODULE PACK

## 📁 CONTENTS

| File | Description |
|------|-------------|
| **WEEK-4-OPERATIONS.md** | Complete implementation plan với API specs, UI code, business logic |
| **QUICK-REFERENCE.md** | Daily checklist, formulas, workflows, status flow |
| **types/operations.ts** | TypeScript definitions cho Operations module |

---

## 🎯 WEEK 4 GOALS

| Module | Pages | Endpoints | Status |
|--------|-------|-----------|--------|
| Delivery & Logistics | 4 | 8 | ⬜ |
| Sell-in/Sell-out Tracking | 3 | 6 | ⬜ |
| Inventory Management | 2 | 5 | ⬜ |
| **Total** | **9** | **19** | |

---

## 📅 DAILY SCHEDULE

```
Day 1: Delivery API (8 endpoints, status transitions)
Day 2: Delivery UI (4 pages, timeline, calendar)
Day 3: Sell Tracking API (6 endpoints, import, alerts)
Day 4: Sell Tracking UI (3 pages, charts, comparison)
Day 5: Inventory (API + UI complete)
```

---

## 🚀 HOW TO USE

### 1. Copy Types
```bash
cp types/operations.ts apps/web/src/types/
```

### 2. Read the Plan
Open `WEEK-4-OPERATIONS.md` and follow day-by-day.

### 3. Use Quick Reference
Keep `QUICK-REFERENCE.md` open for:
- Delivery status flow diagram
- Sell tracking formulas
- Inventory thresholds

### 4. Implement & Test
```bash
# Start dev
npm run dev

# Test API
curl http://localhost:3000/api/operations/delivery

# Commit daily
git commit -m "feat(operations): Day 1 - Delivery API"
```

---

## 📊 KEY BUSINESS LOGIC

### Delivery Status Transitions
```
PENDING → CONFIRMED → SCHEDULED → PICKING → PACKED → IN_TRANSIT → DELIVERED
                                                                   ↘ PARTIAL
                                                                   ↘ RETURNED
```

### Sell Tracking Metrics
```
Sell-through Rate = Sell-out / Sell-in × 100
Days of Stock = Stock / Avg Daily Sell-out
```

### Inventory Alerts
```
LOW_STOCK: Coverage < 1 month
OVERSTOCK: Coverage > 6 months
NEAR_EXPIRY: < 30 days to expiry
```

---

## 🔗 REFERENCES

- **Old Code:** `/Users/mac/TPM-TPO/vierp-tpm/apps/web/app/(dashboard)/operations/`
- **Prisma Schema:** `/Users/mac/TPM-TPO/vierp-tpm-web/apps/api/prisma/schema.prisma`
- **Models:** DeliveryOrder, DeliveryLine, SellTracking, InventorySnapshot

---

## ❓ QUESTIONS?

If stuck:
1. Check old code in `vierp-tpm` for reference
2. Review Prisma schema for model structure
3. Test with Prisma Studio

---

**Good luck with Week 4! 💪**
