# 🚀 PROMO MASTER - FULL MIGRATION PACK

## 📋 OVERVIEW

This pack contains everything needed to migrate from `vierp-tpm` (old) to `vierp-tpm-web` (new).

| Item | Value |
|------|-------|
| **Duration** | 6 weeks |
| **Source** | vierp-tpm (Next.js + NestJS, 867 files) |
| **Target** | vierp-tpm-web (Vite + Vercel, 140 files) |
| **Features to Migrate** | 20+ modules, 36 API controllers |
| **New Models** | 16 Prisma models |

---

## 📁 PACK CONTENTS

```
MIGRATION-PLAN/
├── FULL-MIGRATION-PLAN.md    # Complete 6-week plan
├── WEEK-1-SETUP.md           # Week 1 detailed tasks
├── cleanup.sh                # Script to archive/delete unused dirs
├── schema-additions.prisma   # 16 new database models
└── README.md                 # This file
```

---

## 🚀 QUICK START

### Step 1: Run Cleanup (Day 1)
```bash
# Navigate to TPM-TPO
cd /Users/mac/TPM-TPO

# Copy cleanup script
cp MIGRATION-PLAN/cleanup.sh .
chmod +x cleanup.sh

# Run cleanup
./cleanup.sh
```

**This will:**
- ✅ KEEP: `vierp-tpm` (reference)
- ✅ KEEP: `vierp-tpm-web` (main development)
- 📦 ARCHIVE: `vierp-tpm-lambda` → `_archive/`
- 🗑️ DELETE: `vierp-tpm-web` (duplicate)

### Step 2: Create Migration Branch
```bash
cd /Users/mac/TPM-TPO/vierp-tpm-web
git checkout -b feature/full-migration
```

### Step 3: Update Database Schema
```bash
cd apps/api

# Append new models to schema.prisma
cat ../../../MIGRATION-PLAN/schema-additions.prisma >> prisma/schema.prisma

# Push to database
npx prisma db push

# Generate client
npx prisma generate
```

### Step 4: Follow Weekly Plan
See `FULL-MIGRATION-PLAN.md` for detailed weekly tasks.

---

## 📅 TIMELINE

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Setup & Infrastructure | Clean workspace, schema sync |
| 2 | Finance Module | Accrual, Deductions, GL, Chequebook |
| 3 | Planning Module | Templates, Scenarios, Clash Detection |
| 4 | Operations Module | Delivery, Sell Tracking, Inventory |
| 5 | Integration Module | ERP, DMS, Webhooks, Security |
| 6 | Advanced & Testing | AI, Voice, BI, Full E2E |

---

## 📊 FEATURES TO MIGRATE

### 🔴 HIGH PRIORITY (Week 2-3)
- Accrual Engine
- Deductions Management
- GL Journals
- Chequebook
- Promotion Templates
- Scenarios/What-If
- Clash Detection

### 🟡 MEDIUM PRIORITY (Week 4-5)
- Delivery/Logistics
- Sell-in/Sell-out
- Inventory
- ERP Integration
- DMS Integration
- Webhooks
- MFA/SSO

### 🟢 LOW PRIORITY (Week 6)
- AI Insights
- Voice Input
- BI Report Builder
- Excel Import

---

## 📁 FILE MAPPING

| Old Location | New Location |
|--------------|--------------|
| `vierp-tpm/apps/web/app/(dashboard)/finance/` | `vierp-tpm-web/apps/web/src/pages/finance/` |
| `vierp-tpm/apps/web/app/(dashboard)/planning/` | `vierp-tpm-web/apps/web/src/pages/planning/` |
| `vierp-tpm/apps/web/app/(dashboard)/operations/` | `vierp-tpm-web/apps/web/src/pages/operations/` |
| `vierp-tpm/apps/api/src/modules/` | `vierp-tpm-web/apps/api/api/` |

---

## 🔌 API ENDPOINTS TO ADD

| Module | Endpoints | Count |
|--------|-----------|-------|
| Accruals | CRUD + calculate + post | 6 |
| Deductions | CRUD + match + dispute | 5 |
| GL Journals | CRUD + post + reverse | 5 |
| Templates | CRUD + apply | 5 |
| Scenarios | CRUD + run + compare | 5 |
| Clash Detection | check + report + resolve | 3 |
| Delivery | CRUD + track + status | 6 |
| Sell Tracking | get + import | 3 |
| ERP | connect + sync + mapping | 5 |
| Webhooks | CRUD + logs + test | 5 |
| AI | insights + analyze | 3 |
| Voice | command + process | 3 |
| **TOTAL** | | **54** |

---

## ✅ SUCCESS CRITERIA

### Per Week
- [ ] All planned features implemented
- [ ] Unit tests written
- [ ] E2E tests passing
- [ ] No regression in existing features
- [ ] Code review approved

### Final (Week 6)
- [ ] All 20+ features migrated
- [ ] E2E test pass rate > 95%
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Production ready

---

## 🆘 TROUBLESHOOTING

### Schema Migration Errors
```bash
# Reset database (dev only!)
npx prisma migrate reset

# Or push force
npx prisma db push --force-reset
```

### Type Errors
```bash
# Regenerate Prisma client
npx prisma generate

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

---

## 📞 SUPPORT

For issues during migration:
1. Check `vierp-tpm` source code for reference
2. Review Prisma Studio for data structure
3. Run tests frequently to catch regressions

---

**Ready to start? Run `cleanup.sh` first! 🚀**
