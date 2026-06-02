# ══════════════════════════════════════════════════════════════════════════════
#                    🚀 PROMO MASTER - FULL MIGRATION PLAN
#                         vierp-tpm → vierp-tpm-web
#                              Duration: 6 Weeks
# ══════════════════════════════════════════════════════════════════════════════

## 📋 EXECUTIVE SUMMARY

| Item | Details |
|------|---------|
| **Source** | vierp-tpm (Next.js + NestJS) |
| **Target** | vierp-tpm-web (Vite + Vercel Serverless) |
| **Duration** | 6 weeks |
| **Features to Migrate** | 20+ modules, 36 API controllers |
| **Estimated Effort** | 240 hours |

---

## 🗓️ TIMELINE OVERVIEW

```
Week 1: Setup & Core Infrastructure
Week 2: Finance Module (Accrual, Deductions, GL)
Week 3: Planning Module (Templates, Scenarios, Clash)
Week 4: Operations Module (Delivery, Tracking, Inventory)
Week 5: Integration Module (ERP, DMS, Webhooks)
Week 6: Advanced Features (AI, Voice, BI) + Testing
```

---

## 📅 WEEK 1: SETUP & CORE INFRASTRUCTURE

### Goals
- [x] Cleanup unused directories
- [ ] Setup migration workspace
- [ ] Database schema sync
- [ ] API structure preparation

### Tasks

#### Day 1-2: Cleanup & Preparation
```bash
# 1. Archive vierp-tpm-lambda
mv /Users/mac/TPM-TPO/vierp-tpm-lambda /Users/mac/TPM-TPO/_archive/

# 2. Delete vierp-tpm-web (duplicate)
rm -rf /Users/mac/TPM-TPO/vierp-tpm-web

# 3. Create migration branch in v2
cd /Users/mac/TPM-TPO/vierp-tpm-web
git checkout -b feature/full-migration
```

#### Day 3-4: Database Schema Sync
- [ ] Compare schemas (86 models vs 70 models)
- [ ] Identify missing models (16 models)
- [ ] Create migration scripts
- [ ] Run db:push

**Missing Models to Add:**
```
- AccrualEntry
- Deduction
- DeductionLine
- GLJournal
- ChequebookEntry
- Scenario
- ScenarioVersion
- ClashDetection
- PromotionTemplate
- TemplateVersion
- DeliveryOrder
- DeliveryLine
- SellTracking
- InventorySnapshot
- AIInsight
- VoiceCommand
```

#### Day 5: API Structure Setup
- [ ] Create folder structure for new controllers
- [ ] Setup shared utilities
- [ ] Configure middleware

### Deliverables Week 1
- [x] Clean workspace (2 directories only)
- [ ] Database schema 100% synced
- [ ] API folder structure ready
- [ ] Migration branch created

---

## 📅 WEEK 2: FINANCE MODULE

### Goals
- [ ] Accrual Engine
- [ ] Deductions Management
- [ ] GL Journals
- [ ] Chequebook

### Tasks

#### Accrual Engine (Day 1-2)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/finance/accrual/
NEW: vierp-tpm-web/apps/web/src/pages/finance/accrual/

Components:
- AccrualList.tsx
- AccrualForm.tsx
- AccrualDetail.tsx
- AccrualReport.tsx

API:
- GET /api/accruals
- POST /api/accruals
- GET /api/accruals/:id
- PUT /api/accruals/:id
- POST /api/accruals/calculate
- POST /api/accruals/post-to-gl
```

#### Deductions (Day 3-4)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/finance/deductions/
NEW: vierp-tpm-web/apps/web/src/pages/finance/deductions/

Components:
- DeductionList.tsx
- DeductionForm.tsx
- DeductionMatching.tsx
- DeductionDispute.tsx

API:
- GET /api/deductions
- POST /api/deductions
- POST /api/deductions/match
- POST /api/deductions/dispute
```

#### GL Journals & Chequebook (Day 5)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/finance/gl-journals/
OLD: vierp-tpm/apps/web/app/(dashboard)/finance/chequebook/
NEW: vierp-tpm-web/apps/web/src/pages/finance/

Components:
- GLJournalList.tsx
- GLJournalEntry.tsx
- ChequebookList.tsx
- ChequebookEntry.tsx
```

### Deliverables Week 2
- [ ] Accrual Engine fully functional
- [ ] Deductions with matching
- [ ] GL Journal posting
- [ ] Chequebook management
- [ ] Finance dashboard integration

---

## 📅 WEEK 3: PLANNING MODULE

### Goals
- [ ] Promotion Templates
- [ ] Scenarios/What-If
- [ ] Clash Detection
- [ ] Business Planning Enhancement

### Tasks

#### Promotion Templates (Day 1-2)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/planning/templates/
NEW: vierp-tpm-web/apps/web/src/pages/planning/templates/

Pages:
- TemplateList.tsx (browse templates)
- TemplateBuilder.tsx (create/edit)
- TemplatePreview.tsx (preview)

API:
- GET /api/templates
- POST /api/templates
- GET /api/templates/:id
- PUT /api/templates/:id
- POST /api/templates/:id/apply (create promotion from template)
```

#### Scenarios/What-If (Day 3-4)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/planning/scenarios/
NEW: vierp-tpm-web/apps/web/src/pages/planning/scenarios/

Pages:
- ScenarioList.tsx
- ScenarioBuilder.tsx
- ScenarioComparison.tsx
- ScenarioResults.tsx

API:
- GET /api/scenarios
- POST /api/scenarios
- POST /api/scenarios/:id/run
- GET /api/scenarios/:id/results
- POST /api/scenarios/compare
```

#### Clash Detection (Day 5)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/planning/clash-detection/
NEW: vierp-tpm-web/apps/web/src/pages/planning/clash-detection/

Components:
- ClashDetector.tsx
- ClashReport.tsx
- ClashResolution.tsx

API:
- POST /api/clash-detection/check
- GET /api/clash-detection/report
- POST /api/clash-detection/resolve
```

### Deliverables Week 3
- [ ] Template management system
- [ ] Scenario planning with comparison
- [ ] Clash detection working
- [ ] Integration with promotions

---

## 📅 WEEK 4: OPERATIONS MODULE

### Goals
- [ ] Delivery/Logistics (5 pages)
- [ ] Sell-in/Sell-out Tracking
- [ ] Inventory Management
- [ ] POS/POP Materials

### Tasks

#### Delivery & Logistics (Day 1-3)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/operations/delivery/
NEW: vierp-tpm-web/apps/web/src/pages/operations/delivery/

Pages:
- DeliveryDashboard.tsx
- DeliveryOrderList.tsx
- DeliveryOrderDetail.tsx
- DeliveryTracking.tsx
- DeliveryReport.tsx

API:
- GET /api/delivery/orders
- POST /api/delivery/orders
- PUT /api/delivery/orders/:id/status
- GET /api/delivery/tracking/:id
- GET /api/delivery/report
```

#### Sell Tracking (Day 4)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/operations/sell-tracking/
NEW: vierp-tpm-web/apps/web/src/pages/operations/sell-tracking/

Components:
- SellInDashboard.tsx
- SellOutDashboard.tsx
- SellComparison.tsx

API:
- GET /api/sell-tracking/sell-in
- GET /api/sell-tracking/sell-out
- POST /api/sell-tracking/import
```

#### Inventory (Day 5)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/operations/inventory/
NEW: vierp-tpm-web/apps/web/src/pages/operations/inventory/

Components:
- InventoryDashboard.tsx
- InventorySnapshot.tsx
- StockAlert.tsx
```

### Deliverables Week 4
- [ ] Delivery management system
- [ ] Real-time tracking
- [ ] Sell-in/Sell-out analytics
- [ ] Inventory monitoring

---

## 📅 WEEK 5: INTEGRATION MODULE

### Goals
- [ ] ERP Connector
- [ ] DMS Integration
- [ ] API Keys Management
- [ ] Webhooks
- [ ] Security (MFA, SSO, SOX)

### Tasks

#### ERP Integration (Day 1-2)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/integrations/erp/
NEW: vierp-tpm-web/apps/web/src/pages/integrations/erp/

Components:
- ERPConnectorSetup.tsx
- ERPSyncStatus.tsx
- ERPMappingConfig.tsx

API:
- GET /api/erp/status
- POST /api/erp/connect
- POST /api/erp/sync
- GET /api/erp/mapping
- PUT /api/erp/mapping
```

#### DMS Integration (Day 3)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/integrations/dms/
NEW: vierp-tpm-web/apps/web/src/pages/integrations/dms/

Components:
- DMSConnector.tsx
- DMSSync.tsx
```

#### API Keys & Webhooks (Day 4)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/settings/api-keys/
OLD: vierp-tpm/apps/web/app/(dashboard)/settings/webhooks/
NEW: vierp-tpm-web/apps/web/src/pages/settings/

Components:
- APIKeyList.tsx
- APIKeyForm.tsx
- WebhookList.tsx
- WebhookForm.tsx
- WebhookLogs.tsx
```

#### Security Features (Day 5)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/settings/security/
NEW: vierp-tpm-web/apps/web/src/pages/settings/security/

Components:
- MFASetup.tsx
- SSOConfig.tsx
- SOXCompliance.tsx
- AuditLogs.tsx
```

### Deliverables Week 5
- [ ] ERP connector working
- [ ] DMS sync functional
- [ ] API key management
- [ ] Webhook system
- [ ] Security features

---

## 📅 WEEK 6: ADVANCED FEATURES & TESTING

### Goals
- [ ] AI Insights
- [ ] Voice Input
- [ ] BI Report Builder
- [ ] Excel Import
- [ ] Full E2E Testing
- [ ] Performance Testing

### Tasks

#### AI Features (Day 1-2)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/ai/
NEW: vierp-tpm-web/apps/web/src/pages/ai/

Components:
- AIInsightsDashboard.tsx
- InsightCard.tsx
- RecommendationList.tsx

API:
- GET /api/ai/insights
- POST /api/ai/analyze
- GET /api/ai/recommendations
```

#### Voice Input (Day 2)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/components/voice/
NEW: vierp-tpm-web/apps/web/src/components/voice/

Components:
- VoiceInput.tsx
- VoiceCommand.tsx
- WhisperIntegration.tsx
```

#### BI Report Builder (Day 3)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/app/(dashboard)/reports/builder/
NEW: vierp-tpm-web/apps/web/src/pages/reports/builder/

Components:
- ReportBuilder.tsx
- ReportDesigner.tsx
- ReportPreview.tsx
- ReportScheduler.tsx
```

#### Excel Import (Day 3)
**Files to Migrate:**
```
OLD: vierp-tpm/apps/web/components/excel/
NEW: vierp-tpm-web/apps/web/src/components/excel/

Components:
- ExcelImporter.tsx
- ColumnMapper.tsx
- ImportPreview.tsx
```

#### Testing & QA (Day 4-5)
- [ ] Update E2E tests for new features
- [ ] Add unit tests for critical functions
- [ ] Performance testing
- [ ] Security audit
- [ ] UAT preparation

### Deliverables Week 6
- [ ] AI insights working
- [ ] Voice commands functional
- [ ] Report builder complete
- [ ] Excel import working
- [ ] Full test coverage
- [ ] Production ready

---

## 📊 FEATURE MIGRATION CHECKLIST

### Core (Week 1) ✅
- [ ] Database schema synced
- [ ] API structure ready
- [ ] Auth enhanced

### Finance (Week 2)
- [ ] Accrual Engine
- [ ] Deductions
- [ ] GL Journals
- [ ] Chequebook

### Planning (Week 3)
- [ ] Templates
- [ ] Scenarios
- [ ] Clash Detection

### Operations (Week 4)
- [ ] Delivery
- [ ] Sell Tracking
- [ ] Inventory

### Integration (Week 5)
- [ ] ERP
- [ ] DMS
- [ ] API Keys
- [ ] Webhooks
- [ ] Security

### Advanced (Week 6)
- [ ] AI Insights
- [ ] Voice Input
- [ ] Report Builder
- [ ] Excel Import

---

## 📁 FILE MAPPING SUMMARY

| Module | Old Path | New Path | Files |
|--------|----------|----------|-------|
| Finance | app/(dashboard)/finance/ | src/pages/finance/ | 12 |
| Planning | app/(dashboard)/planning/ | src/pages/planning/ | 10 |
| Operations | app/(dashboard)/operations/ | src/pages/operations/ | 8 |
| Integration | app/(dashboard)/integrations/ | src/pages/integrations/ | 6 |
| AI | app/(dashboard)/ai/ | src/pages/ai/ | 4 |
| Reports | app/(dashboard)/reports/ | src/pages/reports/ | 5 |
| Settings | app/(dashboard)/settings/ | src/pages/settings/ | 8 |
| **TOTAL** | | | **53** |

---

## 🔌 API MIGRATION SUMMARY

| Module | Controllers | Endpoints | Priority |
|--------|-------------|-----------|----------|
| Accrual | 1 | 6 | HIGH |
| Deduction | 1 | 5 | HIGH |
| GL Journal | 1 | 4 | HIGH |
| Templates | 1 | 5 | HIGH |
| Scenarios | 1 | 5 | HIGH |
| Clash | 1 | 3 | HIGH |
| Delivery | 1 | 6 | MEDIUM |
| Sell Tracking | 1 | 4 | MEDIUM |
| Inventory | 1 | 3 | MEDIUM |
| ERP | 1 | 5 | MEDIUM |
| DMS | 1 | 3 | MEDIUM |
| Webhooks | 1 | 4 | MEDIUM |
| AI | 1 | 4 | LOW |
| Voice | 1 | 3 | LOW |
| Reports | 1 | 5 | LOW |
| **TOTAL** | **15** | **65** | |

---

## ✅ SUCCESS CRITERIA

### Week 1
- [ ] Workspace clean (2 directories only)
- [ ] Database 100% synced
- [ ] Zero migration errors

### Week 2-5
- [ ] Each module: UI + API + Tests
- [ ] No regression in existing features
- [ ] Code review passed

### Week 6
- [ ] All features migrated
- [ ] E2E test pass rate > 95%
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete

---

## 🚨 RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema conflicts | HIGH | Run migrations in dev first |
| API breaking changes | HIGH | Version APIs, backward compat |
| Missing dependencies | MEDIUM | Check package.json diff |
| Performance regression | MEDIUM | Benchmark before/after |
| Timeline slip | MEDIUM | Buffer days built in |

---

## 📝 DAILY STANDUP TEMPLATE

```
Date: ___________
Module: ___________

Done Yesterday:
- [ ] ...

Doing Today:
- [ ] ...

Blockers:
- [ ] ...

Migration Progress: ___%
```

---

## 🎯 POST-MIGRATION

After 6 weeks:
1. Archive vierp-tpm to _archive/
2. Delete migration branch, merge to main
3. Update documentation
4. Deploy to staging
5. UAT with stakeholders
6. Production deployment

---

**Let's start! 🚀**
