# 📋 WEEK 3: PLANNING MODULE PACK

## 📁 CONTENTS

| File | Description |
|------|-------------|
| **WEEK-3-PLANNING.md** | Complete implementation plan với API specs, UI code, business logic |
| **QUICK-REFERENCE.md** | Daily checklist, endpoints, pages, formulas |
| **types/planning.ts** | TypeScript definitions cho Planning module |

---

## 🎯 WEEK 3 GOALS

| Module | Pages | Endpoints | Status |
|--------|-------|-----------|--------|
| Promotion Templates | 3 | 6 | ⬜ |
| Scenarios/What-If | 4 | 6 | ⬜ |
| Clash Detection | 2 | 4 | ⬜ |
| **Total** | **9** | **16** | |

---

## 📅 DAILY SCHEDULE

```
Day 1: Template API (6 endpoints)
Day 2: Template UI (3 pages, components, hooks)
Day 3: Scenario API (6 endpoints, simulation logic)
Day 4: Scenario UI (4 pages, comparison feature)
Day 5: Clash Detection (API + UI complete)
```

---

## 🚀 HOW TO USE

### 1. Copy Types
```bash
cp types/planning.ts apps/web/src/types/
```

### 2. Read the Plan
Open `WEEK-3-PLANNING.md` and follow day-by-day.

### 3. Use Quick Reference
Keep `QUICK-REFERENCE.md` open for checklists and formulas.

### 4. Implement & Test
```bash
# Start dev
npm run dev

# Test API
curl http://localhost:3000/api/planning/templates

# Commit daily
git commit -m "feat(planning): Day 1 - Template API"
```

---

## 📊 KEY BUSINESS LOGIC

### Template Application
```
Template + Overrides → New Promotion (DRAFT)
```

### Scenario Simulation
```
ROI = (Net Margin / Promotion Cost) × 100
Net Margin = Gross Margin - Promotion Cost
Gross Margin = Incremental Sales × Margin %
```

### Clash Severity
```
CRITICAL: >5 products OR >20% budget conflict
HIGH: Customer overlap OR Mechanic conflict
MEDIUM: 1-5 products overlap
LOW: Date overlap only
```

---

## 🔗 REFERENCES

- **Old Code:** `/Users/mac/TPM-TPO/vierp-tpm/apps/web/app/(dashboard)/planning/`
- **Prisma Schema:** `/Users/mac/TPM-TPO/vierp-tpm-web/apps/api/prisma/schema.prisma`
- **Shared Types:** `/Users/mac/TPM-TPO/vierp-tpm-web/packages/shared/`

---

## ❓ QUESTIONS?

If stuck:
1. Check old code in `vierp-tpm` for reference
2. Review Prisma schema for model structure
3. Test API with Prisma Studio

---

**Good luck with Week 3! 💪**
