# 📋 WEEK 3 PLANNING - QUICK REFERENCE

## 🗓️ DAILY TASKS

| Day | Focus | Deliverables |
|-----|-------|--------------|
| **Day 1** | Template API | 6 endpoints |
| **Day 2** | Template UI | 3 pages + components + hooks |
| **Day 3** | Scenario API | 6 endpoints + simulation logic |
| **Day 4** | Scenario UI | 4 pages + comparison |
| **Day 5** | Clash Detection | 4 endpoints + 2 pages |

---

## 🔌 API ENDPOINTS CHECKLIST

### Templates (6)
```
[ ] GET    /api/planning/templates
[ ] POST   /api/planning/templates
[ ] GET    /api/planning/templates/:id
[ ] PUT    /api/planning/templates/:id
[ ] DELETE /api/planning/templates/:id
[ ] POST   /api/planning/templates/:id/apply
[ ] GET    /api/planning/templates/:id/versions
```

### Scenarios (6)
```
[ ] GET    /api/planning/scenarios
[ ] POST   /api/planning/scenarios
[ ] GET    /api/planning/scenarios/:id
[ ] PUT    /api/planning/scenarios/:id
[ ] POST   /api/planning/scenarios/:id/run
[ ] POST   /api/planning/scenarios/compare
```

### Clash Detection (4)
```
[ ] POST   /api/planning/clash-detection/check
[ ] GET    /api/planning/clash-detection
[ ] GET    /api/planning/clash-detection/:id
[ ] POST   /api/planning/clash-detection/:id/resolve
```

---

## 📄 PAGES CHECKLIST

### Templates (3)
```
[ ] /planning/templates           → List page (grid/table)
[ ] /planning/templates/:id       → Detail/Edit page
[ ] /planning/templates/builder   → Create/Edit builder
```

### Scenarios (4)
```
[ ] /planning/scenarios           → List page
[ ] /planning/scenarios/:id       → Detail page
[ ] /planning/scenarios/builder   → Create builder
[ ] /planning/scenarios/compare   → Comparison page
```

### Clash Detection (2)
```
[ ] /planning/clash-detection     → Dashboard
[ ] /planning/clash-detection/:id → Detail/Resolution
```

---

## 🧩 COMPONENTS CHECKLIST

### Templates
```
[ ] TemplateCard.tsx
[ ] TemplateForm.tsx
[ ] TemplatePreview.tsx
[ ] ApplyTemplateDialog.tsx
```

### Scenarios
```
[ ] ScenarioCard.tsx
[ ] ScenarioForm.tsx
[ ] ScenarioChart.tsx
[ ] ScenarioComparison.tsx
[ ] ScenarioResultsCard.tsx
```

### Clash Detection
```
[ ] ClashCard.tsx
[ ] ClashSeverityBadge.tsx
[ ] ClashTimeline.tsx
[ ] ResolveClashDialog.tsx
```

### Shared
```
[ ] PlanningStats.tsx
[ ] PlanningDashboard.tsx
```

---

## 🪝 HOOKS CHECKLIST

```
[ ] useTemplates.ts
    - useTemplates(params)
    - useTemplate(id)
    - useCreateTemplate()
    - useUpdateTemplate()
    - useDeleteTemplate()
    - useApplyTemplate()
    - useTemplateVersions(id)

[ ] useScenarios.ts
    - useScenarios(params)
    - useScenario(id)
    - useCreateScenario()
    - useUpdateScenario()
    - useRunScenario()
    - useScenarioComparison(ids)

[ ] useClashDetection.ts
    - useClashDetections(params)
    - useClashDetection(id)
    - useCheckClash()
    - useResolveClash()
```

---

## 📊 SCENARIO CALCULATION FORMULAS

### Sales Projection
```
baselineSales = baselineSalesPerDay × duration
projectedSales = baselineSales × (1 + expectedLiftPercent/100)
incrementalSales = projectedSales - baselineSales - cannibalized
```

### Cost & Margins
```
redemptions = projectedSales × redemptionRatePercent/100
promotionCost = redemptions × discountPercent/100 × averageOrderValue
grossMargin = incrementalSales × marginPercent/100
netMargin = grossMargin - promotionCost
roi = (netMargin / promotionCost) × 100
```

---

## 🚨 CLASH SEVERITY RULES

| Severity | Criteria | Action |
|----------|----------|--------|
| **CRITICAL** | >5 products overlap OR Budget conflict >20% | Block approval |
| **HIGH** | Customer overlap OR Mechanic conflict | Require resolution |
| **MEDIUM** | 1-5 products overlap | Review required |
| **LOW** | Date overlap only (no other conflicts) | Warning only |

---

## 🔄 WORKFLOWS

### Template Application
```
1. Select template
2. Fill required fields (name, dates)
3. Optionally override defaults
4. Preview promotion
5. Create promotion (DRAFT)
6. Usage count ++
```

### Scenario Analysis
```
1. Create scenario with parameters
2. Set assumptions (baseline, margin)
3. Run simulation
4. Review results (ROI, margin, payback)
5. Create versions for comparison
6. Compare 2-5 scenarios
7. Select winner
```

### Clash Resolution
```
1. Auto-detect on promotion create/update
2. Review clash details
3. View suggested resolutions
4. Apply resolution OR accept risk
5. Mark as resolved
6. Proceed with approval
```

---

## 📁 FILE STRUCTURE

```
apps/web/src/
├── pages/planning/
│   ├── index.tsx
│   ├── templates/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── builder.tsx
│   ├── scenarios/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   ├── builder.tsx
│   │   └── compare.tsx
│   └── clash-detection/
│       ├── index.tsx
│       └── [id].tsx
├── components/planning/
│   └── [components]
├── hooks/planning/
│   └── [hooks]
└── types/
    └── planning.ts

apps/api/api/planning/
├── templates.ts
├── scenarios.ts
└── clash-detection.ts
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
git commit -m "feat(planning): Day X - [description]"
```

---

## ✅ END OF WEEK 3 GOALS

- [ ] All 16 API endpoints working
- [ ] All 9 pages implemented
- [ ] Template → Promotion flow works
- [ ] Scenario simulation accurate
- [ ] Clash auto-detection works
- [ ] Tests passing
- [ ] Code committed

---

## 📊 WEEK 3 METRICS TARGET

| Metric | Target |
|--------|--------|
| API Endpoints | 16 |
| Pages | 9 |
| Components | ~12 |
| Hooks | ~20 |
| Test Coverage | >80% |
