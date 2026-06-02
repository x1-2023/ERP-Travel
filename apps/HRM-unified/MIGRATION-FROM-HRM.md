# HRM Merge Migration Guide

## TIP-005: Merge HRM + HRM-AI → HRM-Unified

### Strategy
- **Base**: HRM-AI (176 models, 300+ routes, 226K LOC)
- **Migrated from HRM**: 7 unique features, 8 Prisma models, 6 enums
- **Result**: HRM-Unified (184+ models, 300+ routes)

### Migrated Features from HRM

| Feature | Models Added | Status |
|---------|-------------|--------|
| KPI Management | KPIPeriod, KPIScore | Schema added |
| Disciplinary Records | DisciplinaryRecord | Schema added |
| Salary Advance | SalaryAdvance | Schema added |
| Data Import/Rollback | ImportSession | Schema added |
| System Settings | SystemSetting | Schema added |
| Document Templates | (use existing HRM-AI) | Already exists |
| Reports Hub | (use existing analytics) | Already exists |

### New Enums Added
- KPIStatus (DRAFT, PUBLISHED, LOCKED)
- AdvanceStatus (PENDING, APPROVED, REJECTED, DEDUCTED)
- ImportType (EMPLOYEES, ATTENDANCE, PAYROLL, DEPARTMENTS, POSITIONS)
- ImportStatus (DRY_RUN, PREVIEWING, EXECUTING, COMPLETED, FAILED, ROLLED_BACK)

### ERP Integration Added
- `src/lib/erp-integration/events.ts` — NATS event publishing/subscribing
- `src/lib/erp-integration/features.ts` — Tier-based feature flags
- `src/lib/erp-integration/master-data.ts` — Employee data sync

### TODO (Pending Implementation)
- [ ] API routes for KPI: /api/kpi/*, /api/kpi/[periodId]/*
- [ ] API routes for Salary Advance: /api/salary-advance/*
- [ ] API routes for Import: /api/import/*
- [ ] Pages for KPI: /(dashboard)/kpi/*, /(dashboard)/kpi/[periodId]
- [ ] Pages for Reports Hub: /(dashboard)/reports-hub/*
- [ ] Migrate help guide content from HRM
- [ ] Update Tenant relation in schema for new models
- [ ] Run prisma migrate to create new tables
