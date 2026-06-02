# ══════════════════════════════════════════════════════════════════════════════
#                    📅 WEEK 4: OPERATIONS MODULE
#                         Detailed Implementation Plan
# ══════════════════════════════════════════════════════════════════════════════

## 🎯 WEEK 4 GOALS

| Module | Pages | API Endpoints | Priority |
|--------|-------|---------------|----------|
| Delivery & Logistics | 4 | 8 | 🔴 HIGH |
| Sell-in/Sell-out Tracking | 3 | 6 | 🔴 HIGH |
| Inventory Management | 2 | 5 | 🟡 MEDIUM |
| **TOTAL** | **9** | **19** | |

---

## 📁 FILE STRUCTURE TO CREATE

```
apps/web/src/
├── pages/operations/
│   ├── index.tsx                    # Operations Dashboard
│   ├── delivery/
│   │   ├── index.tsx                # Delivery Order List
│   │   ├── [id].tsx                 # Delivery Detail & Tracking
│   │   ├── new.tsx                  # Create Delivery Order
│   │   └── calendar.tsx             # Delivery Calendar View
│   ├── sell-tracking/
│   │   ├── index.tsx                # Sell Tracking Dashboard
│   │   ├── sell-in.tsx              # Sell-in Analysis
│   │   └── sell-out.tsx             # Sell-out Analysis
│   └── inventory/
│       ├── index.tsx                # Inventory Dashboard
│       └── snapshots.tsx            # Historical Snapshots
├── components/operations/
│   ├── DeliveryCard.tsx
│   ├── DeliveryForm.tsx
│   ├── DeliveryTimeline.tsx
│   ├── DeliveryStatusBadge.tsx
│   ├── DeliveryCalendar.tsx
│   ├── SellTrackingChart.tsx
│   ├── SellComparisonTable.tsx
│   ├── SellImportDialog.tsx
│   ├── InventoryCard.tsx
│   ├── InventoryTable.tsx
│   ├── StockAlertBadge.tsx
│   └── OperationsStats.tsx
├── hooks/operations/
│   ├── useDelivery.ts
│   ├── useSellTracking.ts
│   └── useInventory.ts
└── types/operations.ts

apps/api/api/operations/
├── delivery.ts
├── sell-tracking.ts
└── inventory.ts
```

---

## 📅 DAY 1-2: DELIVERY & LOGISTICS

### 1.1 Business Logic

**Delivery Order là gì?**
- Đơn giao hàng POS/POP materials cho customer
- Liên kết với promotion (promotional materials)
- Track trạng thái từ tạo đến hoàn thành

**Delivery Flow:**
```
Create Order → Confirm → Schedule → Pick & Pack → In Transit → Delivered
                                                            ↘ Partial
                                                            ↘ Returned
```

**Delivery Status:**
```
PENDING → CONFIRMED → SCHEDULED → PICKING → PACKED → IN_TRANSIT → DELIVERED
                                                                 → PARTIAL
                                                                 → RETURNED
                                                                 → CANCELLED
```

### 1.2 API Endpoints

#### GET /api/operations/delivery
```typescript
interface DeliveryListParams {
  status?: DeliveryStatus;
  customerId?: string;
  promotionId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

interface DeliveryListResponse {
  success: boolean;
  data: DeliveryOrder[];
  pagination: Pagination;
  summary: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
    deliveredThisWeek: number;
    onTimeRate: number;  // % delivered on time
  };
}
```

#### POST /api/operations/delivery
```typescript
interface CreateDeliveryRequest {
  promotionId?: string;
  customerId: string;
  scheduledDate: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  lines: DeliveryLineInput[];
}

interface DeliveryLineInput {
  productId: string;
  quantity: number;
  notes?: string;
}

// Business Logic
async function createDeliveryOrder(data: CreateDeliveryRequest, userId: string) {
  // 1. Validate customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId }
  });
  if (!customer) throw new Error('Customer not found');

  // 2. Validate products and check stock
  for (const line of data.lines) {
    const product = await prisma.product.findUnique({
      where: { id: line.productId }
    });
    if (!product) throw new Error(`Product ${line.productId} not found`);
    
    // Optional: Check inventory
    const stock = await getProductStock(line.productId);
    if (stock < line.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  // 3. Generate order number
  const orderNumber = await generateOrderNumber('DO');

  // 4. Create order with lines
  const order = await prisma.deliveryOrder.create({
    data: {
      orderNumber,
      promotionId: data.promotionId,
      customerId: data.customerId,
      scheduledDate: new Date(data.scheduledDate),
      deliveryAddress: data.deliveryAddress || customer.address,
      contactPerson: data.contactPerson || customer.contactName,
      contactPhone: data.contactPhone || customer.phone,
      notes: data.notes,
      status: 'PENDING',
      createdById: userId,
      lines: {
        create: data.lines.map(line => ({
          productId: line.productId,
          quantity: line.quantity,
          notes: line.notes,
          status: 'PENDING'
        }))
      }
    },
    include: { lines: true }
  });

  return order;
}
```

#### GET /api/operations/delivery/:id
```typescript
interface DeliveryDetailResponse {
  success: boolean;
  data: DeliveryOrder & {
    customer: Customer;
    promotion?: Promotion;
    lines: (DeliveryLine & { product: Product })[];
    tracking: DeliveryTracking[];  // Status history
  };
}
```

#### PUT /api/operations/delivery/:id
```typescript
interface UpdateDeliveryRequest {
  scheduledDate?: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
}

// Can only update PENDING or CONFIRMED orders
async function updateDeliveryOrder(id: string, data: UpdateDeliveryRequest) {
  const order = await prisma.deliveryOrder.findUnique({ where: { id } });
  
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new Error('Cannot update order in current status');
  }

  return prisma.deliveryOrder.update({
    where: { id },
    data
  });
}
```

#### PUT /api/operations/delivery/:id/status
```typescript
interface UpdateStatusRequest {
  status: DeliveryStatus;
  notes?: string;
  // For DELIVERED/PARTIAL status
  deliveredLines?: {
    lineId: string;
    deliveredQty: number;
    damagedQty?: number;
  }[];
}

// Status transition logic
async function updateDeliveryStatus(id: string, data: UpdateStatusRequest, userId: string) {
  const order = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: { lines: true }
  });

  // Validate status transition
  const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SCHEDULED', 'CANCELLED'],
    'SCHEDULED': ['PICKING', 'CANCELLED'],
    'PICKING': ['PACKED', 'CANCELLED'],
    'PACKED': ['IN_TRANSIT', 'CANCELLED'],
    'IN_TRANSIT': ['DELIVERED', 'PARTIAL', 'RETURNED'],
    'DELIVERED': [],
    'PARTIAL': ['DELIVERED'],
    'RETURNED': [],
    'CANCELLED': []
  };

  if (!validTransitions[order.status]?.includes(data.status)) {
    throw new Error(`Cannot transition from ${order.status} to ${data.status}`);
  }

  // Update line quantities for DELIVERED/PARTIAL
  if (['DELIVERED', 'PARTIAL'].includes(data.status) && data.deliveredLines) {
    for (const line of data.deliveredLines) {
      await prisma.deliveryLine.update({
        where: { id: line.lineId },
        data: {
          deliveredQty: line.deliveredQty,
          damagedQty: line.damagedQty || 0,
          status: line.deliveredQty >= order.lines.find(l => l.id === line.lineId)!.quantity
            ? 'DELIVERED'
            : line.deliveredQty > 0 ? 'PARTIAL' : 'PENDING'
        }
      });
    }
  }

  // Create tracking entry
  await prisma.deliveryTracking.create({
    data: {
      deliveryOrderId: id,
      status: data.status,
      notes: data.notes,
      timestamp: new Date(),
      userId
    }
  });

  // Update order
  return prisma.deliveryOrder.update({
    where: { id },
    data: {
      status: data.status,
      ...(data.status === 'DELIVERED' && { deliveredAt: new Date() })
    }
  });
}
```

#### GET /api/operations/delivery/:id/tracking
```typescript
interface TrackingResponse {
  success: boolean;
  data: DeliveryTracking[];
}

interface DeliveryTracking {
  id: string;
  status: DeliveryStatus;
  notes?: string;
  timestamp: Date;
  userId: string;
  user?: User;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}
```

#### DELETE /api/operations/delivery/:id
```typescript
// Can only delete PENDING orders
async function deleteDeliveryOrder(id: string) {
  const order = await prisma.deliveryOrder.findUnique({ where: { id } });
  
  if (order.status !== 'PENDING') {
    throw new Error('Can only delete pending orders');
  }

  return prisma.deliveryOrder.delete({ where: { id } });
}
```

#### GET /api/operations/delivery/calendar
```typescript
interface CalendarParams {
  month: number;  // 1-12
  year: number;
}

interface CalendarResponse {
  success: boolean;
  data: {
    date: string;
    orders: DeliveryOrderSummary[];
  }[];
}

// Returns orders grouped by scheduled date
async function getDeliveryCalendar(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const orders = await prisma.deliveryOrder.findMany({
    where: {
      scheduledDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: { customer: true },
    orderBy: { scheduledDate: 'asc' }
  });

  // Group by date
  const grouped = orders.reduce((acc, order) => {
    const date = order.scheduledDate.toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {} as Record<string, DeliveryOrder[]>);

  return Object.entries(grouped).map(([date, orders]) => ({ date, orders }));
}
```

#### GET /api/operations/delivery/stats
```typescript
interface DeliveryStatsResponse {
  success: boolean;
  data: {
    totalOrders: number;
    completedOrders: number;
    completionRate: number;
    onTimeDeliveries: number;
    onTimeRate: number;
    averageDeliveryDays: number;
    byStatus: Record<DeliveryStatus, number>;
    byCustomer: { customerId: string; customerName: string; count: number }[];
    trend: { date: string; completed: number; scheduled: number }[];
  };
}
```

### 1.3 UI Components

#### DeliveryList Page
```tsx
// pages/operations/delivery/index.tsx
export default function DeliveryListPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const { data, isLoading } = useDeliveryOrders(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Delivery Management</h1>
          <p className="text-muted-foreground">
            Track and manage promotional material deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <ViewToggle value={view} onChange={setView} options={['list', 'calendar']} />
          <Button onClick={() => navigate('/operations/delivery/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Delivery
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard 
          title="Total Orders" 
          value={data?.summary.total || 0}
          icon={<Package />}
        />
        <StatCard 
          title="Pending" 
          value={data?.summary.pending || 0}
          variant="warning"
          icon={<Clock />}
        />
        <StatCard 
          title="In Transit" 
          value={data?.summary.inTransit || 0}
          variant="info"
          icon={<Truck />}
        />
        <StatCard 
          title="Delivered" 
          value={data?.summary.delivered || 0}
          variant="success"
          icon={<CheckCircle />}
        />
        <StatCard 
          title="On-Time Rate" 
          value={`${data?.summary.onTimeRate || 0}%`}
          variant={data?.summary.onTimeRate >= 90 ? 'success' : 'warning'}
          icon={<Target />}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectItem value="">All Status</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
        </Select>
        <CustomerSelect value={customerId} onChange={setCustomerId} />
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Content */}
      {view === 'list' ? (
        <DataTable
          columns={deliveryColumns}
          data={data?.data || []}
          onRowClick={(row) => navigate(`/operations/delivery/${row.id}`)}
        />
      ) : (
        <DeliveryCalendar 
          month={selectedMonth}
          year={selectedYear}
          onDateClick={(date) => navigate(`/operations/delivery/new?date=${date}`)}
        />
      )}
    </div>
  );
}
```

#### DeliveryTimeline Component
```tsx
// components/operations/DeliveryTimeline.tsx
interface DeliveryTimelineProps {
  tracking: DeliveryTracking[];
  currentStatus: DeliveryStatus;
}

const STATUS_STEPS: DeliveryStatus[] = [
  'PENDING', 'CONFIRMED', 'SCHEDULED', 'PICKING', 'PACKED', 'IN_TRANSIT', 'DELIVERED'
];

export function DeliveryTimeline({ tracking, currentStatus }: DeliveryTimelineProps) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
      <div 
        className="absolute left-4 top-0 w-0.5 bg-primary transition-all"
        style={{ height: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
      />

      {/* Steps */}
      <div className="space-y-6">
        {STATUS_STEPS.map((status, index) => {
          const trackingEntry = tracking.find(t => t.status === status);
          const isCompleted = index <= currentIndex;
          const isCurrent = status === currentStatus;

          return (
            <div key={status} className="flex items-start gap-4">
              {/* Icon */}
              <div className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center",
                isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                isCurrent && "ring-4 ring-primary/20"
              )}>
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "font-medium",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {STATUS_LABELS[status]}
                  </p>
                  {trackingEntry && (
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(trackingEntry.timestamp)}
                    </span>
                  )}
                </div>
                {trackingEntry?.notes && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {trackingEntry.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 📅 DAY 3-4: SELL-IN / SELL-OUT TRACKING

### 2.1 Business Logic

**Sell-in vs Sell-out:**
- **Sell-in**: Bán vào (từ company đến customer/distributor)
- **Sell-out**: Bán ra (từ customer đến end consumer)
- **Stock**: Tồn kho tại customer

**Key Metrics:**
```
Sell-through Rate = Sell-out / Sell-in × 100
Days of Stock = Stock / Average Daily Sell-out
Stock Coverage = Stock / Monthly Sell-out
```

### 2.2 API Endpoints

#### GET /api/operations/sell-tracking
```typescript
interface SellTrackingParams {
  customerId?: string;
  productId?: string;
  period?: string;      // "2026-01" format
  periodFrom?: string;
  periodTo?: string;
  page?: number;
  pageSize?: number;
}

interface SellTrackingResponse {
  success: boolean;
  data: SellTracking[];
  pagination: Pagination;
  summary: {
    totalSellIn: number;
    totalSellOut: number;
    totalStock: number;
    sellThroughRate: number;
    avgDaysOfStock: number;
  };
}
```

#### GET /api/operations/sell-tracking/sell-in
```typescript
interface SellInParams {
  customerId?: string;
  productId?: string;
  categoryId?: string;
  periodFrom?: string;
  periodTo?: string;
  groupBy?: 'customer' | 'product' | 'category' | 'period';
}

interface SellInResponse {
  success: boolean;
  data: SellInData[];
  totals: {
    quantity: number;
    value: number;
  };
  trend: TrendData[];
}

interface SellInData {
  groupKey: string;
  groupName: string;
  quantity: number;
  value: number;
  growthPercent?: number;  // vs previous period
}
```

#### GET /api/operations/sell-tracking/sell-out
```typescript
interface SellOutParams {
  customerId?: string;
  productId?: string;
  categoryId?: string;
  periodFrom?: string;
  periodTo?: string;
  groupBy?: 'customer' | 'product' | 'category' | 'period';
}

interface SellOutResponse {
  success: boolean;
  data: SellOutData[];
  totals: {
    quantity: number;
    value: number;
  };
  trend: TrendData[];
}
```

#### GET /api/operations/sell-tracking/comparison
```typescript
interface ComparisonParams {
  customerId?: string;
  productId?: string;
  periodFrom: string;
  periodTo: string;
}

interface ComparisonResponse {
  success: boolean;
  data: {
    period: string;
    sellIn: { qty: number; value: number };
    sellOut: { qty: number; value: number };
    stock: { qty: number; value: number };
    sellThroughRate: number;
  }[];
  analysis: {
    avgSellThroughRate: number;
    stockTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
    sellOutGrowth: number;
    recommendation: string;
  };
}
```

#### POST /api/operations/sell-tracking/import
```typescript
interface ImportRequest {
  type: 'SELL_IN' | 'SELL_OUT' | 'STOCK';
  period: string;
  data: ImportRow[];
}

interface ImportRow {
  customerId: string;
  productId: string;
  quantity: number;
  value: number;
}

// Business Logic
async function importSellData(data: ImportRequest, userId: string) {
  const results = {
    created: 0,
    updated: 0,
    errors: [] as string[]
  };

  for (const row of data.data) {
    try {
      // Upsert sell tracking record
      const existing = await prisma.sellTracking.findUnique({
        where: {
          customerId_productId_period: {
            customerId: row.customerId,
            productId: row.productId,
            period: data.period
          }
        }
      });

      const updateData = data.type === 'SELL_IN' 
        ? { sellInQty: row.quantity, sellInValue: row.value }
        : data.type === 'SELL_OUT'
        ? { sellOutQty: row.quantity, sellOutValue: row.value }
        : { stockQty: row.quantity, stockValue: row.value };

      if (existing) {
        await prisma.sellTracking.update({
          where: { id: existing.id },
          data: updateData
        });
        results.updated++;
      } else {
        await prisma.sellTracking.create({
          data: {
            customerId: row.customerId,
            productId: row.productId,
            period: data.period,
            ...updateData
          }
        });
        results.created++;
      }
    } catch (error) {
      results.errors.push(`Row ${row.customerId}-${row.productId}: ${error.message}`);
    }
  }

  return results;
}
```

#### POST /api/operations/sell-tracking
```typescript
interface CreateSellTrackingRequest {
  customerId: string;
  productId: string;
  period: string;
  sellInQty?: number;
  sellInValue?: number;
  sellOutQty?: number;
  sellOutValue?: number;
  stockQty?: number;
  stockValue?: number;
}
```

#### GET /api/operations/sell-tracking/alerts
```typescript
interface AlertsResponse {
  success: boolean;
  data: SellAlert[];
}

interface SellAlert {
  type: 'LOW_SELL_THROUGH' | 'HIGH_STOCK' | 'NEGATIVE_TREND' | 'STOCKOUT_RISK';
  severity: 'WARNING' | 'CRITICAL';
  customerId: string;
  customerName: string;
  productId?: string;
  productName?: string;
  message: string;
  metric: number;
  threshold: number;
}

// Generate alerts based on thresholds
async function generateSellAlerts() {
  const alerts: SellAlert[] = [];
  const currentPeriod = getCurrentPeriod();

  // Low sell-through (< 50%)
  const lowSellThrough = await prisma.sellTracking.findMany({
    where: {
      period: currentPeriod,
      sellInQty: { gt: 0 },
      sellOutQty: { lt: prisma.raw('sell_in_qty * 0.5') }
    },
    include: { customer: true, product: true }
  });

  for (const record of lowSellThrough) {
    const rate = (record.sellOutQty / record.sellInQty) * 100;
    alerts.push({
      type: 'LOW_SELL_THROUGH',
      severity: rate < 30 ? 'CRITICAL' : 'WARNING',
      customerId: record.customerId,
      customerName: record.customer.name,
      productId: record.productId,
      productName: record.product.name,
      message: `Sell-through rate is only ${rate.toFixed(1)}%`,
      metric: rate,
      threshold: 50
    });
  }

  // High stock (> 60 days of supply)
  // ... similar logic

  return alerts;
}
```

### 2.3 UI Components

#### SellTrackingDashboard
```tsx
// pages/operations/sell-tracking/index.tsx
export default function SellTrackingDashboardPage() {
  const { data: comparison } = useSellComparison(filters);
  const { data: alerts } = useSellAlerts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sell-in / Sell-out Tracking</h1>
          <p className="text-muted-foreground">
            Monitor sales performance and inventory levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
          <Button onClick={() => navigate('/operations/sell-tracking/sell-in')}>
            View Details
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts?.data.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            {alerts.data.length} items need attention. 
            <Button variant="link" className="p-0 h-auto">View all</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Sell-in"
          value={formatCurrency(comparison?.analysis.totalSellIn || 0)}
          trend={comparison?.analysis.sellInGrowth}
          icon={<TrendingUp />}
        />
        <StatCard
          title="Total Sell-out"
          value={formatCurrency(comparison?.analysis.totalSellOut || 0)}
          trend={comparison?.analysis.sellOutGrowth}
          icon={<TrendingDown />}
        />
        <StatCard
          title="Sell-through Rate"
          value={`${comparison?.analysis.avgSellThroughRate || 0}%`}
          variant={comparison?.analysis.avgSellThroughRate >= 70 ? 'success' : 'warning'}
          icon={<Activity />}
        />
        <StatCard
          title="Avg Days of Stock"
          value={comparison?.analysis.avgDaysOfStock || 0}
          suffix="days"
          icon={<Package />}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <CustomerSelect value={customerId} onChange={setCustomerId} />
        <ProductSelect value={productId} onChange={setProductId} />
        <PeriodRangePicker value={periodRange} onChange={setPeriodRange} />
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sell-in vs Sell-out Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <SellComparisonChart data={comparison?.data || []} />
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Period Breakdown</CardTitle>
            <Tabs value={groupBy} onValueChange={setGroupBy}>
              <TabsList>
                <TabsTrigger value="period">By Period</TabsTrigger>
                <TabsTrigger value="customer">By Customer</TabsTrigger>
                <TabsTrigger value="product">By Product</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <SellComparisonTable 
            data={comparison?.data || []} 
            groupBy={groupBy}
          />
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <SellImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
      />
    </div>
  );
}
```

#### SellComparisonChart
```tsx
// components/operations/SellComparisonChart.tsx
interface SellComparisonChartProps {
  data: {
    period: string;
    sellIn: { qty: number; value: number };
    sellOut: { qty: number; value: number };
    stock: { qty: number; value: number };
  }[];
}

export function SellComparisonChart({ data }: SellComparisonChartProps) {
  const chartData = data.map(d => ({
    period: d.period,
    'Sell-in': d.sellIn.value,
    'Sell-out': d.sellOut.value,
    'Stock': d.stock.value
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" tickFormatter={formatCompactNumber} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={formatCompactNumber} />
        <Tooltip formatter={formatCurrency} />
        <Legend />
        <Bar yAxisId="left" dataKey="Sell-in" fill="#3b82f6" />
        <Bar yAxisId="left" dataKey="Sell-out" fill="#22c55e" />
        <Line yAxisId="right" dataKey="Stock" stroke="#f59e0b" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

---

## 📅 DAY 5: INVENTORY MANAGEMENT

### 3.1 Business Logic

**Inventory Snapshot:**
- Chụp ảnh tồn kho tại một thời điểm
- Track theo customer (tồn tại outlet)
- Có thể có batch number, expiry date

**Key Metrics:**
```
Stock Coverage = Stock / Avg Monthly Sales
Stock Turn = Annual Sales / Avg Stock
Days of Supply = Stock / Avg Daily Sales
```

### 3.2 API Endpoints

#### GET /api/operations/inventory
```typescript
interface InventoryParams {
  customerId?: string;
  productId?: string;
  categoryId?: string;
  lowStock?: boolean;    // Filter low stock items
  nearExpiry?: boolean;  // Filter near expiry
  page?: number;
  pageSize?: number;
}

interface InventoryResponse {
  success: boolean;
  data: InventoryItem[];
  pagination: Pagination;
  summary: {
    totalValue: number;
    totalItems: number;
    lowStockItems: number;
    nearExpiryItems: number;
    avgStockCoverage: number;
  };
}

interface InventoryItem {
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  value: number;
  lastUpdated: Date;
  avgMonthlySales: number;
  stockCoverage: number;  // months
  status: 'OK' | 'LOW' | 'OUT_OF_STOCK' | 'OVERSTOCK';
}
```

#### GET /api/operations/inventory/snapshots
```typescript
interface SnapshotParams {
  customerId?: string;
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface SnapshotResponse {
  success: boolean;
  data: InventorySnapshot[];
}
```

#### POST /api/operations/inventory/snapshots
```typescript
interface CreateSnapshotRequest {
  customerId: string;
  productId: string;
  quantity: number;
  value: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
}
```

#### POST /api/operations/inventory/snapshots/bulk
```typescript
interface BulkSnapshotRequest {
  snapshotDate: string;
  items: {
    customerId: string;
    productId: string;
    quantity: number;
    value: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
}
```

#### GET /api/operations/inventory/alerts
```typescript
interface InventoryAlertsResponse {
  success: boolean;
  data: InventoryAlert[];
}

interface InventoryAlert {
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'NEAR_EXPIRY' | 'EXPIRED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  currentQty: number;
  threshold: number;
  message: string;
  expiryDate?: string;
}
```

### 3.3 UI Components

#### InventoryDashboard
```tsx
// pages/operations/inventory/index.tsx
export default function InventoryDashboardPage() {
  const { data: inventory } = useInventory(filters);
  const { data: alerts } = useInventoryAlerts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor stock levels and inventory health
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/operations/inventory/snapshots')}>
            <History className="mr-2 h-4 w-4" />
            View History
          </Button>
          <Button onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Snapshot
          </Button>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts?.data.filter(a => a.severity === 'CRITICAL').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Stock Issues</AlertTitle>
          <AlertDescription>
            {alerts.data.filter(a => a.severity === 'CRITICAL').length} critical items need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="Total Value"
          value={formatCurrency(inventory?.summary.totalValue || 0)}
          icon={<DollarSign />}
        />
        <StatCard
          title="Total Items"
          value={inventory?.summary.totalItems || 0}
          icon={<Package />}
        />
        <StatCard
          title="Low Stock"
          value={inventory?.summary.lowStockItems || 0}
          variant="warning"
          icon={<AlertTriangle />}
        />
        <StatCard
          title="Near Expiry"
          value={inventory?.summary.nearExpiryItems || 0}
          variant="destructive"
          icon={<Clock />}
        />
        <StatCard
          title="Avg Coverage"
          value={`${inventory?.summary.avgStockCoverage || 0} mo`}
          icon={<Calendar />}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <CustomerSelect value={customerId} onChange={setCustomerId} />
        <ProductSelect value={productId} onChange={setProductId} />
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectItem value="">All Stock Levels</SelectItem>
          <SelectItem value="low">Low Stock</SelectItem>
          <SelectItem value="out">Out of Stock</SelectItem>
          <SelectItem value="over">Overstock</SelectItem>
        </Select>
        <Checkbox 
          checked={showNearExpiry} 
          onCheckedChange={setShowNearExpiry}
          label="Near Expiry Only"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <InventoryTable 
            data={inventory?.data || []}
            onRowClick={(item) => setSelectedItem(item)}
          />
        </CardContent>
      </Card>

      {/* Stock Level Distribution */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StockDistributionChart data={inventory?.data || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stock Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <StockByCategoryChart data={inventory?.data || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## ✅ WEEK 4 CHECKLIST

### Day 1
- [ ] Delivery API: CRUD endpoints
- [ ] Delivery API: Status transitions
- [ ] Delivery API: Tracking & Calendar
- [ ] Test with Postman

### Day 2
- [ ] Delivery UI: List page with calendar view
- [ ] Delivery UI: Detail page with timeline
- [ ] Delivery UI: Create/Edit form
- [ ] useDelivery hooks

### Day 3
- [ ] Sell Tracking API: CRUD endpoints
- [ ] Sell Tracking API: Comparison & analysis
- [ ] Sell Tracking API: Import & Alerts
- [ ] Test calculations

### Day 4
- [ ] Sell Tracking UI: Dashboard
- [ ] Sell Tracking UI: Sell-in & Sell-out pages
- [ ] Sell Tracking UI: Import dialog
- [ ] useSellTracking hooks

### Day 5
- [ ] Inventory API: CRUD & Snapshots
- [ ] Inventory API: Alerts
- [ ] Inventory UI: Dashboard & History
- [ ] Integration tests
- [ ] Commit and push

---

## 📝 ACCEPTANCE CRITERIA

### Delivery
- ✅ Create/update delivery orders
- ✅ Status transitions work correctly
- ✅ Timeline shows full history
- ✅ Calendar view shows scheduled deliveries
- ✅ On-time rate calculated

### Sell Tracking
- ✅ Import sell-in/sell-out data
- ✅ Comparison chart shows trends
- ✅ Sell-through rate calculated
- ✅ Alerts generated for issues

### Inventory
- ✅ View current stock levels
- ✅ Historical snapshots tracked
- ✅ Low stock/expiry alerts
- ✅ Stock coverage calculated

---

## 🚀 READY FOR WEEK 5

After Week 4: Integration Module (ERP, DMS, Webhooks, Security)
