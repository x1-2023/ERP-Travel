# ══════════════════════════════════════════════════════════════════════════════
#                    📅 WEEK 2: FINANCE MODULE
#                         Detailed Implementation Plan
# ══════════════════════════════════════════════════════════════════════════════

## 🎯 WEEK 2 GOALS

| Module | Pages | API Endpoints | Priority |
|--------|-------|---------------|----------|
| Accrual Engine | 3 | 6 | 🔴 HIGH |
| Deductions | 3 | 5 | 🔴 HIGH |
| GL Journals | 2 | 5 | 🔴 HIGH |
| Chequebook | 2 | 4 | 🟡 MEDIUM |
| **TOTAL** | **10** | **20** | |

---

## 📁 FILE STRUCTURE TO CREATE

```
apps/web/src/
├── pages/
│   └── finance/
│       ├── index.tsx                    # Finance Dashboard
│       ├── accruals/
│       │   ├── index.tsx                # Accrual List
│       │   ├── [id].tsx                 # Accrual Detail
│       │   └── calculate.tsx            # Calculate Accruals
│       ├── deductions/
│       │   ├── index.tsx                # Deduction List
│       │   ├── [id].tsx                 # Deduction Detail
│       │   └── matching.tsx             # Match with Claims
│       ├── gl-journals/
│       │   ├── index.tsx                # GL Journal List
│       │   └── [id].tsx                 # Journal Entry Detail
│       └── chequebook/
│           ├── index.tsx                # Cheque List
│           └── new.tsx                  # Issue New Cheque
├── components/
│   └── finance/
│       ├── AccrualCard.tsx
│       ├── AccrualForm.tsx
│       ├── AccrualCalculator.tsx
│       ├── DeductionCard.tsx
│       ├── DeductionForm.tsx
│       ├── DeductionMatcher.tsx
│       ├── GLJournalEntry.tsx
│       ├── GLJournalForm.tsx
│       ├── ChequeCard.tsx
│       ├── ChequeForm.tsx
│       └── FinanceStats.tsx
├── hooks/
│   └── finance/
│       ├── useAccruals.ts
│       ├── useDeductions.ts
│       ├── useGLJournals.ts
│       └── useChequebook.ts
└── types/
    └── finance.ts

apps/api/api/finance/
├── accruals.ts                          # Already created (stub)
├── deductions.ts                        # Already created (stub)
├── gl-journals.ts                       # Already created (stub)
└── chequebook.ts                        # Already created (stub)
```

---

## 📅 DAY 1-2: ACCRUAL ENGINE

### 1.1 Business Logic

**Accrual là gì?**
- Ghi nhận chi phí promotion theo kỳ kế toán
- Dựa trên % completion hoặc estimated spend
- Cần post lên GL cuối kỳ

**Accrual Flow:**
```
Promotion Active → Calculate Accrual → Review → Post to GL → Close Period
```

### 1.2 API Endpoints

#### GET /api/finance/accruals
```typescript
// Query params
interface AccrualListParams {
  period?: string;        // "2026-01"
  status?: AccrualStatus; // PENDING, CALCULATED, POSTED, REVERSED
  promotionId?: string;
  page?: number;
  pageSize?: number;
}

// Response
interface AccrualListResponse {
  success: boolean;
  data: AccrualEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    pendingAmount: number;
    postedAmount: number;
  };
}
```

#### POST /api/finance/accruals/calculate
```typescript
// Request
interface CalculateAccrualsRequest {
  period: string;                    // "2026-01"
  promotionIds?: string[];           // Specific promotions or all active
  method: 'PERCENTAGE' | 'PRO_RATA'; // Calculation method
}

// Response
interface CalculateAccrualsResponse {
  success: boolean;
  data: {
    calculated: number;              // Count of accruals calculated
    totalAmount: number;             // Total accrual amount
    entries: AccrualEntry[];         // Created entries
  };
}

// Business Logic
async function calculateAccruals(period: string, promotionIds?: string[]) {
  // 1. Get active promotions in period
  const promotions = await prisma.promotion.findMany({
    where: {
      status: 'ACTIVE',
      startDate: { lte: periodEndDate },
      endDate: { gte: periodStartDate },
      ...(promotionIds && { id: { in: promotionIds } })
    }
  });

  // 2. For each promotion, calculate accrual
  const entries = [];
  for (const promo of promotions) {
    // Method 1: Percentage of budget
    const percentComplete = calculatePercentComplete(promo, period);
    const accrualAmount = promo.budget * percentComplete - promo.spentAmount;
    
    // Method 2: Pro-rata based on days
    // const daysInPeriod = getDaysInPeriod(promo, period);
    // const totalDays = getTotalPromotionDays(promo);
    // const accrualAmount = (promo.budget / totalDays) * daysInPeriod;

    entries.push({
      promotionId: promo.id,
      period,
      amount: accrualAmount,
      status: 'PENDING',
      createdById: currentUserId
    });
  }

  // 3. Create entries
  return prisma.accrualEntry.createMany({ data: entries });
}
```

#### GET /api/finance/accruals/:id
```typescript
// Response
interface AccrualDetailResponse {
  success: boolean;
  data: AccrualEntry & {
    promotion: Promotion;
    createdBy: User;
    glJournal?: GLJournal;
  };
}
```

#### PUT /api/finance/accruals/:id
```typescript
// Request - Only for PENDING status
interface UpdateAccrualRequest {
  amount?: number;
  notes?: string;
}
```

#### POST /api/finance/accruals/:id/post
```typescript
// Post single accrual to GL
// Request
interface PostAccrualRequest {
  glAccountDebit: string;   // e.g., "6100" (Promotion Expense)
  glAccountCredit: string;  // e.g., "2100" (Accrued Liabilities)
}

// Business Logic
async function postAccrualToGL(id: string, accounts: PostAccrualRequest) {
  const accrual = await prisma.accrualEntry.findUnique({ where: { id } });
  
  if (accrual.status !== 'PENDING' && accrual.status !== 'CALCULATED') {
    throw new Error('Accrual already posted or reversed');
  }

  // Create GL Journal entry
  const journal = await prisma.gLJournal.create({
    data: {
      entryNumber: generateEntryNumber(),
      entryDate: new Date(),
      description: `Accrual for promotion ${accrual.promotionId} - ${accrual.period}`,
      debitAccount: accounts.glAccountDebit,
      creditAccount: accounts.glAccountCredit,
      amount: accrual.amount,
      sourceType: 'ACCRUAL',
      sourceId: accrual.id,
      status: 'POSTED',
      postedAt: new Date()
    }
  });

  // Update accrual status
  await prisma.accrualEntry.update({
    where: { id },
    data: {
      status: 'POSTED',
      postedToGL: true,
      glJournalId: journal.id
    }
  });

  return journal;
}
```

#### POST /api/finance/accruals/post-batch
```typescript
// Post multiple accruals at once
interface PostBatchRequest {
  accrualIds: string[];
  glAccountDebit: string;
  glAccountCredit: string;
}
```

#### POST /api/finance/accruals/:id/reverse
```typescript
// Reverse a posted accrual
// Creates reversal GL entry
async function reverseAccrual(id: string) {
  const accrual = await prisma.accrualEntry.findUnique({
    where: { id },
    include: { glJournal: true }
  });

  if (accrual.status !== 'POSTED') {
    throw new Error('Can only reverse posted accruals');
  }

  // Create reversal journal entry
  const reversalJournal = await prisma.gLJournal.create({
    data: {
      entryNumber: generateEntryNumber(),
      entryDate: new Date(),
      description: `REVERSAL: ${accrual.glJournal.description}`,
      debitAccount: accrual.glJournal.creditAccount,  // Swap
      creditAccount: accrual.glJournal.debitAccount,  // Swap
      amount: accrual.amount,
      sourceType: 'ACCRUAL',
      sourceId: accrual.id,
      status: 'POSTED',
      postedAt: new Date(),
      reversalId: accrual.glJournalId
    }
  });

  // Update original journal
  await prisma.gLJournal.update({
    where: { id: accrual.glJournalId },
    data: { reversedAt: new Date() }
  });

  // Update accrual
  await prisma.accrualEntry.update({
    where: { id },
    data: { status: 'REVERSED' }
  });

  return reversalJournal;
}
```

### 1.3 UI Components

#### AccrualList Page
```tsx
// pages/finance/accruals/index.tsx
export default function AccrualListPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Accrual Management</h1>
        <Button onClick={() => navigate('/finance/accruals/calculate')}>
          <Calculator className="mr-2 h-4 w-4" />
          Calculate Accruals
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Accrued" value={formatCurrency(summary.totalAmount)} />
        <StatCard title="Pending" value={formatCurrency(summary.pendingAmount)} />
        <StatCard title="Posted" value={formatCurrency(summary.postedAmount)} />
        <StatCard title="This Period" value={formatCurrency(summary.currentPeriod)} />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={period} onValueChange={setPeriod}>
          {/* Period options: 2026-01, 2026-02, etc */}
        </Select>
        <Select value={status} onValueChange={setStatus}>
          {/* Status options */}
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={accrualColumns}
        data={accruals}
        onRowClick={(row) => navigate(`/finance/accruals/${row.id}`)}
      />

      {/* Batch Actions */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4">
          <span>{selectedIds.length} selected</span>
          <Button onClick={handlePostBatch}>Post to GL</Button>
        </div>
      )}
    </div>
  );
}
```

#### AccrualCalculator Page
```tsx
// pages/finance/accruals/calculate.tsx
export default function AccrualCalculatePage() {
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [method, setMethod] = useState<'PERCENTAGE' | 'PRO_RATA'>('PERCENTAGE');
  const [promotions, setPromotions] = useState<string[]>([]);
  const [preview, setPreview] = useState<AccrualEntry[]>([]);

  const handlePreview = async () => {
    const result = await api.post('/finance/accruals/preview', {
      period, method, promotionIds: promotions
    });
    setPreview(result.data.entries);
  };

  const handleCalculate = async () => {
    await api.post('/finance/accruals/calculate', {
      period, method, promotionIds: promotions
    });
    toast.success('Accruals calculated successfully');
    navigate('/finance/accruals');
  };

  return (
    <div className="space-y-6">
      <h1>Calculate Accruals</h1>

      {/* Step 1: Select Period */}
      <Card>
        <CardHeader>Step 1: Select Period</CardHeader>
        <CardContent>
          <Select value={period} onValueChange={setPeriod}>
            {generatePeriodOptions()}
          </Select>
        </CardContent>
      </Card>

      {/* Step 2: Select Method */}
      <Card>
        <CardHeader>Step 2: Calculation Method</CardHeader>
        <CardContent>
          <RadioGroup value={method} onValueChange={setMethod}>
            <RadioGroupItem value="PERCENTAGE">
              Percentage of Completion
              <span className="text-muted-foreground">
                Based on actual spend vs budget
              </span>
            </RadioGroupItem>
            <RadioGroupItem value="PRO_RATA">
              Pro-Rata (Time-based)
              <span className="text-muted-foreground">
                Based on days elapsed in period
              </span>
            </RadioGroupItem>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Step 3: Select Promotions (Optional) */}
      <Card>
        <CardHeader>Step 3: Select Promotions (Optional)</CardHeader>
        <CardContent>
          <MultiSelect
            options={activePromotions}
            value={promotions}
            onChange={setPromotions}
            placeholder="All active promotions"
          />
        </CardContent>
      </Card>

      {/* Preview Button */}
      <Button onClick={handlePreview}>Preview Accruals</Button>

      {/* Preview Table */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>Preview ({preview.length} entries)</CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Accrual Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map(entry => (
                  <TableRow key={entry.promotionId}>
                    <TableCell>{entry.promotion.name}</TableCell>
                    <TableCell>{formatCurrency(entry.promotion.budget)}</TableCell>
                    <TableCell>{formatCurrency(entry.promotion.spentAmount)}</TableCell>
                    <TableCell>{formatCurrency(entry.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell>
                    {formatCurrency(preview.reduce((sum, e) => sum + e.amount, 0))}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Calculate Button */}
      {preview.length > 0 && (
        <Button onClick={handleCalculate} size="lg">
          Calculate & Save Accruals
        </Button>
      )}
    </div>
  );
}
```

### 1.4 Hook Implementation

```typescript
// hooks/finance/useAccruals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAccruals(params?: AccrualListParams) {
  return useQuery({
    queryKey: ['accruals', params],
    queryFn: () => api.get('/finance/accruals', { params })
  });
}

export function useAccrual(id: string) {
  return useQuery({
    queryKey: ['accrual', id],
    queryFn: () => api.get(`/finance/accruals/${id}`),
    enabled: !!id
  });
}

export function useCalculateAccruals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CalculateAccrualsRequest) => 
      api.post('/finance/accruals/calculate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accruals'] });
    }
  });
}

export function usePostAccrual() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & PostAccrualRequest) =>
      api.post(`/finance/accruals/${id}/post`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accruals'] });
      queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
    }
  });
}

export function useReverseAccrual() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.post(`/finance/accruals/${id}/reverse`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accruals'] });
      queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
    }
  });
}
```

---

## 📅 DAY 3-4: DEDUCTIONS MANAGEMENT

### 2.1 Business Logic

**Deduction là gì?**
- Khấu trừ từ customer (thường từ invoice)
- Cần match với claims để reconcile
- Có thể dispute nếu không hợp lệ

**Deduction Flow:**
```
Customer Deducts → Create Deduction → Match with Claim → Reconcile
                                   → Dispute → Resolve → Write-off
```

### 2.2 API Endpoints

#### GET /api/finance/deductions
```typescript
interface DeductionListParams {
  status?: DeductionStatus;  // OPEN, MATCHED, DISPUTED, RESOLVED, WRITTEN_OFF
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

interface DeductionListResponse {
  success: boolean;
  data: Deduction[];
  pagination: Pagination;
  summary: {
    totalOpen: number;
    totalMatched: number;
    totalDisputed: number;
    openAmount: number;
  };
}
```

#### POST /api/finance/deductions
```typescript
interface CreateDeductionRequest {
  customerId: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  reason?: string;
}

// Validation
- Amount must be positive
- Invoice number must be unique per customer
- Customer must exist
```

#### GET /api/finance/deductions/:id
```typescript
interface DeductionDetailResponse {
  success: boolean;
  data: Deduction & {
    customer: Customer;
    matchedClaim?: Claim & { promotion: Promotion };
    history: DeductionHistory[];  // Status changes
  };
}
```

#### POST /api/finance/deductions/:id/match
```typescript
interface MatchDeductionRequest {
  claimId: string;
}

// Business Logic
async function matchDeduction(deductionId: string, claimId: string) {
  const deduction = await prisma.deduction.findUnique({ where: { id: deductionId } });
  const claim = await prisma.claim.findUnique({ where: { id: claimId } });

  // Validation
  if (deduction.status !== 'OPEN') {
    throw new Error('Deduction is not open');
  }
  if (claim.status !== 'APPROVED') {
    throw new Error('Claim must be approved');
  }
  if (deduction.customerId !== claim.customerId) {
    throw new Error('Customer mismatch');
  }

  // Match
  await prisma.deduction.update({
    where: { id: deductionId },
    data: {
      status: 'MATCHED',
      matchedClaimId: claimId
    }
  });

  // Update claim
  await prisma.claim.update({
    where: { id: claimId },
    data: { status: 'PAID' }
  });

  return { success: true };
}
```

#### POST /api/finance/deductions/:id/dispute
```typescript
interface DisputeDeductionRequest {
  reason: string;
}

async function disputeDeduction(id: string, reason: string) {
  return prisma.deduction.update({
    where: { id },
    data: {
      status: 'DISPUTED',
      disputeReason: reason,
      disputedAt: new Date()
    }
  });
}
```

#### POST /api/finance/deductions/:id/resolve
```typescript
interface ResolveDeductionRequest {
  resolution: 'ACCEPT' | 'REJECT' | 'PARTIAL';
  amount?: number;  // For partial resolution
  notes?: string;
}

async function resolveDeduction(id: string, data: ResolveDeductionRequest) {
  const updates: any = {
    resolvedAt: new Date()
  };

  if (data.resolution === 'ACCEPT') {
    updates.status = 'RESOLVED';
  } else if (data.resolution === 'REJECT') {
    updates.status = 'WRITTEN_OFF';
  } else if (data.resolution === 'PARTIAL') {
    // Create new deduction for remaining amount
    // Mark original as resolved
  }

  return prisma.deduction.update({
    where: { id },
    data: updates
  });
}
```

#### GET /api/finance/deductions/matching-suggestions/:id
```typescript
// AI-powered matching suggestions
interface MatchingSuggestion {
  claimId: string;
  claim: Claim;
  confidence: number;  // 0-1
  matchReasons: string[];
}

async function getMatchingSuggestions(deductionId: string) {
  const deduction = await prisma.deduction.findUnique({
    where: { id: deductionId },
    include: { customer: true }
  });

  // Find claims with similar amount, same customer, similar date
  const claims = await prisma.claim.findMany({
    where: {
      customerId: deduction.customerId,
      status: 'APPROVED',
      amount: {
        gte: deduction.amount * 0.9,
        lte: deduction.amount * 1.1
      }
    },
    include: { promotion: true }
  });

  return claims.map(claim => ({
    claimId: claim.id,
    claim,
    confidence: calculateMatchConfidence(deduction, claim),
    matchReasons: getMatchReasons(deduction, claim)
  }));
}
```

### 2.3 UI Components

#### DeductionList Page
```tsx
// pages/finance/deductions/index.tsx
export default function DeductionListPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Deductions</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Deduction
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          title="Open Deductions" 
          value={summary.totalOpen}
          amount={formatCurrency(summary.openAmount)}
          variant="warning"
        />
        <StatCard title="Matched" value={summary.totalMatched} variant="success" />
        <StatCard title="Disputed" value={summary.totalDisputed} variant="destructive" />
        <StatCard title="This Month" value={summary.thisMonth} />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectItem value="">All Status</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="MATCHED">Matched</SelectItem>
          <SelectItem value="DISPUTED">Disputed</SelectItem>
        </Select>
        <CustomerSelect value={customerId} onChange={setCustomerId} />
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Table */}
      <DataTable
        columns={[
          { header: 'Code', accessorKey: 'code' },
          { header: 'Customer', accessorKey: 'customer.name' },
          { header: 'Invoice #', accessorKey: 'invoiceNumber' },
          { header: 'Amount', accessorKey: 'amount', cell: formatCurrency },
          { header: 'Status', accessorKey: 'status', cell: StatusBadge },
          { header: 'Date', accessorKey: 'invoiceDate', cell: formatDate },
          { header: 'Actions', cell: DeductionActions }
        ]}
        data={deductions}
      />

      <CreateDeductionModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}
```

#### DeductionMatcher Page
```tsx
// pages/finance/deductions/matching.tsx
export default function DeductionMatchingPage() {
  const { id } = useParams();
  const { data: deduction } = useDeduction(id);
  const { data: suggestions } = useMatchingSuggestions(id);
  const matchMutation = useMatchDeduction();

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Deduction Details */}
      <Card>
        <CardHeader>Deduction Details</CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="font-medium">{deduction.customer.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Invoice</dt>
              <dd className="font-medium">{deduction.invoiceNumber}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium text-lg">
                {formatCurrency(deduction.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reason</dt>
              <dd>{deduction.reason || 'Not specified'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Right: Matching Suggestions */}
      <Card>
        <CardHeader>
          Matching Claims
          <span className="text-muted-foreground ml-2">
            ({suggestions?.length || 0} suggestions)
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions?.map(suggestion => (
            <div 
              key={suggestion.claimId}
              className="border rounded-lg p-4 hover:border-primary cursor-pointer"
              onClick={() => setSelectedClaim(suggestion.claimId)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{suggestion.claim.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.claim.promotion.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(suggestion.claim.amount)}
                  </p>
                  <Badge variant={suggestion.confidence > 0.8 ? 'success' : 'warning'}>
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {suggestion.matchReasons.join(' • ')}
              </div>
            </div>
          ))}

          {selectedClaim && (
            <Button 
              className="w-full"
              onClick={() => matchMutation.mutate({ id, claimId: selectedClaim })}
            >
              Match Selected Claim
            </Button>
          )}

          <Separator />

          <Button variant="outline" className="w-full">
            Search All Claims
          </Button>
          <Button variant="destructive" className="w-full">
            Dispute Deduction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📅 DAY 5: GL JOURNALS & CHEQUEBOOK

### 3.1 GL Journals API

```typescript
// GET /api/finance/gl-journals
interface GLJournalListParams {
  status?: GLStatus;
  sourceType?: 'ACCRUAL' | 'CLAIM' | 'DEDUCTION' | 'MANUAL';
  dateFrom?: string;
  dateTo?: string;
  account?: string;
}

// POST /api/finance/gl-journals (Manual entry)
interface CreateGLJournalRequest {
  entryDate: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  reference?: string;
}

// POST /api/finance/gl-journals/:id/post
// POST /api/finance/gl-journals/:id/reverse
```

### 3.2 GL Journal UI

```tsx
// pages/finance/gl-journals/index.tsx
export default function GLJournalListPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1>General Ledger Journals</h1>
        <Button onClick={() => setShowManualEntry(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
      </div>

      {/* Summary by Account */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>Promotion Expense (6100)</CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals['6100'])}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Accrued Liabilities (2100)</CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals['2100'])}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Cash (1000)</CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals['1000'])}</p>
          </CardContent>
        </Card>
      </div>

      {/* Journal Entries Table */}
      <DataTable
        columns={[
          { header: 'Entry #', accessorKey: 'entryNumber' },
          { header: 'Date', accessorKey: 'entryDate', cell: formatDate },
          { header: 'Description', accessorKey: 'description' },
          { header: 'Debit', accessorKey: 'debitAccount' },
          { header: 'Credit', accessorKey: 'creditAccount' },
          { header: 'Amount', accessorKey: 'amount', cell: formatCurrency },
          { header: 'Status', accessorKey: 'status', cell: StatusBadge },
          { header: 'Source', accessorKey: 'sourceType' }
        ]}
        data={journals}
      />
    </div>
  );
}
```

### 3.3 Chequebook API

```typescript
// GET /api/finance/chequebook
interface ChequeListParams {
  status?: ChequeStatus;
  payeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// POST /api/finance/chequebook
interface IssueChequeRequest {
  payeeId: string;
  amount: number;
  dueDate: string;
  claimId?: string;  // Link to claim being paid
  memo?: string;
}

// POST /api/finance/chequebook/:id/clear
// POST /api/finance/chequebook/:id/void
interface VoidChequeRequest {
  reason: string;
}
```

### 3.4 Chequebook UI

```tsx
// pages/finance/chequebook/index.tsx
export default function ChequebookPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1>Chequebook</h1>
        <Button onClick={() => navigate('/finance/chequebook/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Issue Cheque
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Issued" value={summary.issued} />
        <StatCard title="Cleared" value={summary.cleared} />
        <StatCard title="Outstanding" value={formatCurrency(summary.outstandingAmount)} />
        <StatCard title="This Month" value={summary.thisMonth} />
      </div>

      {/* Table */}
      <DataTable
        columns={[
          { header: 'Cheque #', accessorKey: 'chequeNumber' },
          { header: 'Payee', accessorKey: 'payee.name' },
          { header: 'Amount', accessorKey: 'amount', cell: formatCurrency },
          { header: 'Issue Date', accessorKey: 'issueDate', cell: formatDate },
          { header: 'Due Date', accessorKey: 'dueDate', cell: formatDate },
          { header: 'Status', accessorKey: 'status', cell: ChequeStatusBadge },
          { header: 'Actions', cell: ChequeActions }
        ]}
        data={cheques}
      />
    </div>
  );
}
```

---

## ✅ WEEK 2 CHECKLIST

### Day 1
- [ ] Create Accrual API endpoints (6 endpoints)
- [ ] Create AccrualEntry Prisma queries
- [ ] Test API with Postman/Thunder Client

### Day 2
- [ ] Create Accrual UI pages (3 pages)
- [ ] Create Accrual components
- [ ] Create useAccruals hook
- [ ] Integration test

### Day 3
- [ ] Create Deduction API endpoints (5 endpoints)
- [ ] Create Deduction Prisma queries
- [ ] Implement matching logic

### Day 4
- [ ] Create Deduction UI pages (3 pages)
- [ ] Create Deduction components
- [ ] Create useDeductions hook
- [ ] Test matching workflow

### Day 5
- [ ] Create GL Journal API & UI
- [ ] Create Chequebook API & UI
- [ ] Integration test all finance modules
- [ ] Commit and push

---

## 🧪 TESTING CHECKLIST

### Accrual Tests
- [ ] Calculate accruals for period
- [ ] Post single accrual to GL
- [ ] Post batch accruals
- [ ] Reverse posted accrual
- [ ] Filter by status/period

### Deduction Tests
- [ ] Create deduction
- [ ] Match with claim
- [ ] Dispute deduction
- [ ] Resolve dispute
- [ ] Matching suggestions accuracy

### GL Journal Tests
- [ ] Auto-create from accrual post
- [ ] Manual entry
- [ ] Reverse entry
- [ ] Account totals correct

### Chequebook Tests
- [ ] Issue cheque
- [ ] Clear cheque
- [ ] Void cheque
- [ ] Link to claim

---

## 📝 ACCEPTANCE CRITERIA

### Accrual Engine
- ✅ Can calculate accruals for any period
- ✅ Shows preview before saving
- ✅ Can post to GL with debit/credit accounts
- ✅ Can reverse posted accruals
- ✅ Shows summary totals

### Deductions
- ✅ Can record customer deductions
- ✅ Suggests matching claims
- ✅ Can dispute with reason
- ✅ Can resolve disputes
- ✅ Updates claim status when matched

### GL Journals
- ✅ Auto-creates from accrual/claim posts
- ✅ Supports manual entries
- ✅ Shows account totals
- ✅ Audit trail maintained

### Chequebook
- ✅ Can issue cheques
- ✅ Tracks cheque status
- ✅ Links to claims
- ✅ Can void with reason

---

## 🚀 READY FOR WEEK 3

After Week 2, you'll have complete Finance Module:
- Accrual Engine ✅
- Deductions Management ✅
- GL Journals ✅
- Chequebook ✅

**Week 3 Focus: Planning Module** (Templates, Scenarios, Clash Detection)
