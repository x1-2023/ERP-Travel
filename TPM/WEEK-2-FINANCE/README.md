# 💰 WEEK 2: FINANCE MODULE PACK

## 📁 CONTENTS

| File | Description |
|------|-------------|
| **WEEK-2-FINANCE.md** | Complete implementation plan với API specs, UI mockups, business logic |
| **QUICK-REFERENCE.md** | Daily checklist, endpoints, pages, components |
| **types/finance.ts** | TypeScript definitions cho Finance module |

---

## 🎯 WEEK 2 GOALS

| Module | Pages | Endpoints | Status |
|--------|-------|-----------|--------|
| Accrual Engine | 3 | 6 | ⬜ |
| Deductions | 3 | 5 | ⬜ |
| GL Journals | 2 | 5 | ⬜ |
| Chequebook | 2 | 4 | ⬜ |
| **Total** | **10** | **20** | |

---

## 📅 DAILY SCHEDULE

```
Day 1: Accrual API (6 endpoints)
Day 2: Accrual UI (3 pages, components, hooks)
Day 3: Deduction API (5 endpoints, matching logic)
Day 4: Deduction UI (3 pages, matcher component)
Day 5: GL Journals + Chequebook (complete)
```

---

## 🚀 HOW TO USE

### 1. Copy Types
```bash
cp types/finance.ts apps/web/src/types/
```

### 2. Read the Plan
Open `WEEK-2-FINANCE.md` and follow day-by-day.

### 3. Use Quick Reference
Keep `QUICK-REFERENCE.md` open for checklists.

### 4. Implement & Test
```bash
# Start dev
npm run dev

# Test API
curl http://localhost:3000/api/finance/accruals

# Commit daily
git commit -m "feat(finance): Day 1 - Accrual API"
```

---

## 📊 KEY BUSINESS LOGIC

### Accrual Calculation
```
Accrual = (Budget × % Complete) - Already Spent
```

### Deduction Matching
```
Match Confidence = f(amount_similarity, customer_match, date_proximity)
```

### GL Posting
```
Debit:  Promotion Expense (6100)
Credit: Accrued Liabilities (2100)
```

---

## 🔗 REFERENCES

- **Old Code Reference:** `/Users/mac/TPM-TPO/vierp-tpm/apps/web/app/(dashboard)/finance/`
- **Prisma Schema:** `/Users/mac/TPM-TPO/vierp-tpm-web/apps/api/prisma/schema.prisma`
- **Shared Types:** `/Users/mac/TPM-TPO/vierp-tpm-web/packages/shared/`

---

## ❓ QUESTIONS?

If stuck:
1. Check old code in `vierp-tpm` for reference
2. Review Prisma schema for model structure
3. Test API with Prisma Studio

---

**Good luck with Week 2! 💪**
