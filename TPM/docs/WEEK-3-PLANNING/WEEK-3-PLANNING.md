# ══════════════════════════════════════════════════════════════════════════════
#                    📅 WEEK 3: PLANNING MODULE
#                         Detailed Implementation Plan
# ══════════════════════════════════════════════════════════════════════════════

## 🎯 WEEK 3 GOALS

| Module | Pages | API Endpoints | Priority |
|--------|-------|---------------|----------|
| Promotion Templates | 3 | 6 | 🔴 HIGH |
| Scenarios/What-If | 4 | 6 | 🔴 HIGH |
| Clash Detection | 2 | 4 | 🔴 HIGH |
| **TOTAL** | **9** | **16** | |

---

## 📁 FILE STRUCTURE TO CREATE

```
apps/web/src/
├── pages/planning/
│   ├── index.tsx                    # Planning Dashboard
│   ├── templates/
│   │   ├── index.tsx                # Template List
│   │   ├── [id].tsx                 # Template Detail/Edit
│   │   └── builder.tsx              # Template Builder
│   ├── scenarios/
│   │   ├── index.tsx                # Scenario List
│   │   ├── [id].tsx                 # Scenario Detail
│   │   ├── builder.tsx              # Scenario Builder
│   │   └── compare.tsx              # Scenario Comparison
│   └── clash-detection/
│       ├── index.tsx                # Clash Dashboard
│       └── [id].tsx                 # Clash Detail/Resolution
├── components/planning/
│   ├── TemplateCard.tsx
│   ├── TemplateForm.tsx
│   ├── TemplatePreview.tsx
│   ├── ScenarioCard.tsx
│   ├── ScenarioForm.tsx
│   ├── ScenarioChart.tsx
│   ├── ScenarioComparison.tsx
│   ├── ClashCard.tsx
│   ├── ClashSeverityBadge.tsx
│   ├── ClashTimeline.tsx
│   └── PlanningStats.tsx
├── hooks/planning/
│   ├── useTemplates.ts
│   ├── useScenarios.ts
│   └── useClashDetection.ts
└── types/planning.ts

apps/api/api/planning/
├── templates.ts
├── scenarios.ts
└── clash-detection.ts
```

---

## 📅 DAY 1-2: PROMOTION TEMPLATES

### 1.1 Business Logic

**Template là gì?**
- Mẫu promotion có thể tái sử dụng
- Chứa cấu hình mặc định (type, duration, mechanics)
- Có version history để track changes

**Template Flow:**
```
Create Template → Configure Defaults → Save Version → Apply to New Promotion
```

### 1.2 API Endpoints

#### GET /api/planning/templates
```typescript
interface TemplateListParams {
  type?: PromotionType;
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface TemplateListResponse {
  success: boolean;
  data: PromotionTemplate[];
  pagination: Pagination;
  summary: {
    total: number;
    active: number;
    byType: Record<PromotionType, number>;
  };
}
```

#### POST /api/planning/templates
```typescript
interface CreateTemplateRequest {
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  category?: string;
  defaultDuration?: number;
  defaultBudget?: number;
  mechanics?: TemplateMechanics;
  eligibility?: TemplateEligibility;
}

interface TemplateMechanics {
  discountType?: 'PERCENTAGE' | 'FIXED' | 'BOGO';
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  stackable?: boolean;
  conditions?: MechanicCondition[];
}

interface TemplateEligibility {
  customerTypes?: string[];      // MT, GT, HORECA
  regions?: string[];
  productCategories?: string[];
  minOrderValue?: number;
  excludedProducts?: string[];
}

// Business Logic
async function createTemplate(data: CreateTemplateRequest, userId: string) {
  // 1. Validate unique code
  const existing = await prisma.promotionTemplate.findUnique({
    where: { code: data.code }
  });
  if (existing) throw new Error('Template code exists');

  // 2. Create template
  const template = await prisma.promotionTemplate.create({
    data: { ...data, createdById: userId }
  });

  // 3. Create initial version
  await prisma.templateVersion.create({
    data: {
      templateId: template.id,
      version: 1,
      snapshot: data,
      createdById: userId
    }
  });

  return template;
}
```

#### GET /api/planning/templates/:id
```typescript
interface TemplateDetailResponse {
  success: boolean;
  data: PromotionTemplate & {
    versions: TemplateVersion[];
    createdBy: User;
    recentPromotions: Promotion[];  // Last 5 using this template
  };
}
```

#### PUT /api/planning/templates/:id
```typescript
interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  defaultDuration?: number;
  defaultBudget?: number;
  mechanics?: TemplateMechanics;
  eligibility?: TemplateEligibility;
  isActive?: boolean;
}

// Creates new version on update
async function updateTemplate(id: string, data: UpdateTemplateRequest, userId: string) {
  const template = await prisma.promotionTemplate.findUnique({
    where: { id },
    include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
  });

  const newVersion = (template.versions[0]?.version || 0) + 1;

  // Update & create version in transaction
  return prisma.$transaction([
    prisma.promotionTemplate.update({ where: { id }, data }),
    prisma.templateVersion.create({
      data: {
        templateId: id,
        version: newVersion,
        changes: data,
        snapshot: { ...template, ...data },
        createdById: userId
      }
    })
  ]);
}
```

#### DELETE /api/planning/templates/:id
```typescript
// Soft delete - mark as inactive
async function deleteTemplate(id: string) {
  // Check if in use
  const activeCount = await prisma.promotion.count({
    where: { 
      templateId: id,
      status: { in: ['DRAFT', 'PENDING', 'ACTIVE'] }
    }
  });

  if (activeCount > 0) {
    throw new Error(`Cannot delete: ${activeCount} active promotions using this template`);
  }

  return prisma.promotionTemplate.update({
    where: { id },
    data: { isActive: false }
  });
}
```

#### POST /api/planning/templates/:id/apply
```typescript
interface ApplyTemplateRequest {
  name: string;
  startDate: string;
  endDate: string;
  budget?: number;           // Override default
  customerId?: string;
  fundId?: string;
  overrides?: Partial<TemplateMechanics>;
}

async function applyTemplate(templateId: string, data: ApplyTemplateRequest, userId: string) {
  const template = await prisma.promotionTemplate.findUnique({ where: { id: templateId } });

  if (!template.isActive) throw new Error('Template is not active');

  // Create promotion from template
  const promotion = await prisma.promotion.create({
    data: {
      code: generatePromotionCode(),
      name: data.name,
      type: template.type,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      budget: data.budget || template.defaultBudget || 0,
      customerId: data.customerId,
      fundId: data.fundId,
      mechanics: { ...template.mechanics, ...data.overrides },
      eligibility: template.eligibility,
      templateId: templateId,
      status: 'DRAFT',
      createdById: userId
    }
  });

  // Increment usage count
  await prisma.promotionTemplate.update({
    where: { id: templateId },
    data: { usageCount: { increment: 1 } }
  });

  return promotion;
}
```

#### GET /api/planning/templates/:id/versions
```typescript
interface VersionListResponse {
  success: boolean;
  data: TemplateVersion[];
}
```

### 1.3 UI Components

#### TemplateCard
```tsx
interface TemplateCardProps {
  template: PromotionTemplate;
  onApply: () => void;
  onEdit: () => void;
}

export function TemplateCard({ template, onApply, onEdit }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant={template.type === 'DISCOUNT' ? 'default' : 'secondary'}>
              {template.type}
            </Badge>
            <CardTitle className="mt-2">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{template.code}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onApply}>
                <Play className="mr-2 h-4 w-4" /> Apply
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-1 font-medium">
              {template.defaultDuration ? `${template.defaultDuration} days` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Budget:</span>
            <span className="ml-1 font-medium">
              {template.defaultBudget ? formatCurrency(template.defaultBudget) : 'N/A'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Used {template.usageCount} times
          </span>
          <Badge variant={template.isActive ? 'success' : 'secondary'}>
            {template.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onApply}>
          <Play className="mr-2 h-4 w-4" /> Apply Template
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 📅 DAY 3-4: SCENARIOS / WHAT-IF ANALYSIS

### 2.1 Business Logic

**Scenario là gì?**
- Mô phỏng kết quả promotion với các tham số khác nhau
- So sánh nhiều scenarios để chọn phương án tối ưu
- Dựa trên baseline (historical data)

**Scenario Flow:**
```
Select Baseline → Define Parameters → Run Simulation → View Results → Compare
```

### 2.2 API Endpoints

#### GET /api/planning/scenarios
```typescript
interface ScenarioListParams {
  status?: ScenarioStatus;
  baselineId?: string;
  search?: string;
}
```

#### POST /api/planning/scenarios
```typescript
interface CreateScenarioRequest {
  name: string;
  description?: string;
  baselineId?: string;
  parameters: ScenarioParameters;
  assumptions?: ScenarioAssumptions;
}

interface ScenarioParameters {
  promotionType: PromotionType;
  discountPercent?: number;
  budget: number;
  duration: number;
  targetCustomers: string[];
  targetProducts: string[];
  startDate: string;
  expectedLiftPercent: number;
  redemptionRatePercent: number;
}

interface ScenarioAssumptions {
  baselineSalesPerDay: number;
  averageOrderValue: number;
  marginPercent: number;
  cannibalizedPercent?: number;
  haloEffectPercent?: number;
}
```

#### POST /api/planning/scenarios/:id/run
```typescript
interface ScenarioResults {
  // Sales Impact
  baselineSales: number;
  projectedSales: number;
  incrementalSales: number;
  salesLiftPercent: number;
  
  // Cost Analysis
  promotionCost: number;
  fundingRequired: number;
  costPerIncrementalUnit: number;
  
  // Profitability
  grossMargin: number;
  netMargin: number;
  roi: number;
  paybackDays: number;
  
  // Volume
  projectedUnits: number;
  incrementalUnits: number;
  redemptions: number;
  
  // Timeline
  dailyProjections: DailyProjection[];
}

// Core calculation logic
async function runScenario(id: string) {
  const scenario = await prisma.scenario.findUnique({ where: { id } });
  const { parameters: p, assumptions: a } = scenario;
  
  // Baseline
  const baselineSales = a.baselineSalesPerDay * p.duration;
  
  // Apply lift
  const liftMultiplier = 1 + (p.expectedLiftPercent / 100);
  const projectedSales = a.baselineSalesPerDay * liftMultiplier * p.duration;
  
  // Costs
  const redemptions = projectedSales * (p.redemptionRatePercent / 100);
  const promotionCost = redemptions * (p.discountPercent / 100) * a.averageOrderValue;
  
  // Incremental (net of cannibalization)
  const cannibalized = (projectedSales - baselineSales) * (a.cannibalizedPercent || 0) / 100;
  const incrementalSales = projectedSales - baselineSales - cannibalized;
  
  // Margins
  const grossMargin = incrementalSales * (a.marginPercent / 100);
  const netMargin = grossMargin - promotionCost;
  const roi = promotionCost > 0 ? (netMargin / promotionCost) * 100 : 0;

  // Save results
  await prisma.scenario.update({
    where: { id },
    data: { results, status: 'COMPLETED' }
  });

  return results;
}
```

#### POST /api/planning/scenarios/compare
```typescript
interface CompareRequest {
  scenarioIds: string[];  // 2-5 scenarios
}

interface CompareResponse {
  scenarios: Scenario[];
  comparison: {
    metrics: string[];
    values: Record<string, Record<string, number>>;
    winner: Record<string, string>;
  };
  recommendation: string;
}
```

### 2.3 UI - Scenario Comparison
```tsx
export default function ScenarioComparisonPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: comparison } = useScenarioComparison(selectedIds);

  return (
    <div className="space-y-6">
      <h1>Compare Scenarios</h1>

      {/* Scenario Selector */}
      <Card>
        <CardContent>
          <ScenarioMultiSelect 
            value={selectedIds}
            onChange={setSelectedIds}
            max={5}
          />
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {comparison && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              {comparison.scenarios.map(s => (
                <TableHead key={s.id}>{s.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {['roi', 'netMargin', 'salesLiftPercent', 'paybackDays'].map(metric => (
              <TableRow key={metric}>
                <TableCell className="font-medium">{metricLabels[metric]}</TableCell>
                {comparison.scenarios.map(s => (
                  <TableCell 
                    key={s.id}
                    className={comparison.comparison.winner[metric] === s.id ? 'bg-green-50 font-bold' : ''}
                  >
                    {formatMetric(metric, s.results[metric])}
                    {comparison.comparison.winner[metric] === s.id && (
                      <Trophy className="inline ml-1 h-4 w-4 text-yellow-500" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>ROI Comparison</CardTitle></CardHeader>
          <CardContent>
            <BarChart data={formatChartData(comparison, 'roi')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Net Margin</CardTitle></CardHeader>
          <CardContent>
            <BarChart data={formatChartData(comparison, 'netMargin')} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 📅 DAY 5: CLASH DETECTION

### 3.1 Business Logic

**Clash Types:**
- DATE_OVERLAP: Cùng thời gian
- CUSTOMER_OVERLAP: Cùng khách hàng
- PRODUCT_OVERLAP: Cùng sản phẩm
- MECHANIC_CONFLICT: Non-stackable conflicts
- BUDGET_CONFLICT: Vượt ngân sách

**Severity Levels:**
- CRITICAL: Cần resolve ngay
- HIGH: Quan trọng
- MEDIUM: Cần review
- LOW: Có thể chấp nhận

### 3.2 API Endpoints

#### POST /api/planning/clash-detection/check
```typescript
interface CheckClashRequest {
  promotionId?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

async function detectClashes(params: CheckClashRequest) {
  const clashes: ClashDetection[] = [];
  
  const promotions = await prisma.promotion.findMany({
    where: {
      status: { in: ['DRAFT', 'PENDING', 'APPROVED', 'ACTIVE'] },
      // Date overlap filter
    },
    include: { customer: true, products: true }
  });

  if (params.promotionId) {
    const target = await prisma.promotion.findUnique({
      where: { id: params.promotionId },
      include: { customer: true, products: true }
    });

    for (const promo of promotions) {
      if (promo.id === target.id) continue;
      
      // Check date overlap
      if (hasDateOverlap(target, promo)) {
        // Check customer overlap
        if (target.customerId === promo.customerId) {
          clashes.push({
            promotionId: target.id,
            clashWithId: promo.id,
            clashType: 'CUSTOMER_OVERLAP',
            severity: 'HIGH',
            description: `Both target ${promo.customer.name}`
          });
        }

        // Check product overlap
        const common = findCommonProducts(target.products, promo.products);
        if (common.length > 0) {
          clashes.push({
            promotionId: target.id,
            clashWithId: promo.id,
            clashType: 'PRODUCT_OVERLAP',
            severity: common.length > 5 ? 'CRITICAL' : 'MEDIUM',
            description: `${common.length} products overlap`
          });
        }

        // Check mechanic conflict
        if (!target.mechanics?.stackable && !promo.mechanics?.stackable) {
          clashes.push({
            promotionId: target.id,
            clashWithId: promo.id,
            clashType: 'MECHANIC_CONFLICT',
            severity: 'HIGH',
            description: 'Both non-stackable'
          });
        }
      }
    }
  }

  return { clashes, summary: calculateSummary(clashes) };
}
```

#### GET /api/planning/clash-detection
```typescript
interface ClashListParams {
  severity?: ClashSeverity;
  promotionId?: string;
  resolved?: boolean;
}
```

#### GET /api/planning/clash-detection/:id
```typescript
interface ClashDetailResponse {
  clash: ClashDetection;
  promotion: Promotion;
  clashWith: Promotion;
  suggestedResolutions: ResolutionSuggestion[];
}

interface ResolutionSuggestion {
  action: 'ADJUST_DATES' | 'CHANGE_CUSTOMER' | 'REMOVE_PRODUCTS' | 'MAKE_STACKABLE';
  description: string;
  impact: string;
}
```

#### POST /api/planning/clash-detection/:id/resolve
```typescript
interface ResolveClashRequest {
  resolution: string;
  action?: 'ADJUST_PROMOTION' | 'ADJUST_CLASH_WITH' | 'ACCEPT_RISK';
}
```

### 3.3 UI - ClashCard
```tsx
export function ClashCard({ clash, onResolve }: ClashCardProps) {
  return (
    <Card className={cn(
      "border-l-4",
      clash.severity === 'CRITICAL' && "border-l-red-500",
      clash.severity === 'HIGH' && "border-l-orange-500",
      clash.severity === 'MEDIUM' && "border-l-yellow-500",
      clash.severity === 'LOW' && "border-l-blue-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ClashSeverityBadge severity={clash.severity} />
              <Badge variant="outline">{clash.clashType.replace('_', ' ')}</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {clash.description}
            </p>

            <div className="flex items-center gap-4 text-sm">
              <Link to={`/promotions/${clash.promotionId}`}>
                {clash.promotion?.code}
              </Link>
              <ArrowRight className="h-4 w-4" />
              <Link to={`/promotions/${clash.clashWithId}`}>
                {clash.clashWith?.code}
              </Link>
            </div>
          </div>

          {!clash.resolvedAt && (
            <Button onClick={onResolve}>Resolve</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## ✅ WEEK 3 CHECKLIST

### Day 1
- [ ] Template API: GET list, POST create
- [ ] Template API: GET detail, PUT update, DELETE
- [ ] Test with Postman

### Day 2
- [ ] Template UI: List page with grid/table
- [ ] Template UI: Builder/Edit page
- [ ] Template: Apply flow
- [ ] useTemplates hooks

### Day 3
- [ ] Scenario API: CRUD endpoints
- [ ] Scenario API: Run simulation
- [ ] Scenario API: Compare endpoint
- [ ] Core calculation logic

### Day 4
- [ ] Scenario UI: List & Detail pages
- [ ] Scenario UI: Builder page
- [ ] Scenario UI: Comparison page
- [ ] useScenarios hooks

### Day 5
- [ ] Clash Detection API: Check, List, Detail, Resolve
- [ ] Clash UI: Dashboard & Detail pages
- [ ] Auto-detection logic
- [ ] Integration tests
- [ ] Commit and push

---

## 📝 ACCEPTANCE CRITERIA

### Templates
- ✅ CRUD operations work
- ✅ Version history tracked
- ✅ Apply creates promotion
- ✅ Usage count updates

### Scenarios
- ✅ Create with parameters
- ✅ Run returns accurate results
- ✅ Compare 2-5 scenarios
- ✅ Generates recommendation

### Clash Detection
- ✅ Auto-detects conflicts
- ✅ Classifies by severity
- ✅ Shows suggestions
- ✅ Can resolve

---

## 🚀 READY FOR WEEK 4

After Week 3: Operations Module (Delivery, Sell Tracking, Inventory)
