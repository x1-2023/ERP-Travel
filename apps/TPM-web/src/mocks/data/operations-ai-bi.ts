// ══════════════════════════════════════════════════════════════════════════════
//                    MOCK DATA: OPERATIONS, INTEGRATION, AI, BI
// ══════════════════════════════════════════════════════════════════════════════

import { subDays, format, addDays } from 'date-fns';

const today = new Date();

// ═══════════════════════════════════════════════════════════════════════
// OPERATIONS: DELIVERY
// ═══════════════════════════════════════════════════════════════════════

export const deliveryStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;

export const mockDeliveries = [
  {
    id: 'del-001',
    code: 'DEL-2026-001',
    orderId: 'ord-001',
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    status: 'DELIVERED',
    scheduledDate: format(subDays(today, 3), 'yyyy-MM-dd'),
    deliveredDate: format(subDays(today, 3), 'yyyy-MM-dd'),
    address: '199 Nguyễn Thị Minh Khai, Q.1, TP.HCM',
    totalItems: 150,
    totalValue: 45000000,
    driver: 'Nguyễn Văn Tài',
    vehicleNumber: '51C-12345',
    notes: 'Giao hàng thành công',
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'del-002',
    code: 'DEL-2026-002',
    orderId: 'ord-002',
    customerId: 'cust-002',
    customerName: 'Siêu thị Big C',
    status: 'IN_TRANSIT',
    scheduledDate: format(today, 'yyyy-MM-dd'),
    address: '268 Tô Hiến Thành, Q.10, TP.HCM',
    totalItems: 200,
    totalValue: 62000000,
    driver: 'Trần Văn Bình',
    vehicleNumber: '51C-67890',
    estimatedArrival: format(addDays(today, 0), 'yyyy-MM-dd\'T\'14:00:00\'Z\''),
    createdAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'del-003',
    code: 'DEL-2026-003',
    orderId: 'ord-003',
    customerId: 'cust-003',
    customerName: 'VinMart',
    status: 'CONFIRMED',
    scheduledDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    address: '72 Lê Thánh Tôn, Q.1, TP.HCM',
    totalItems: 180,
    totalValue: 55000000,
    createdAt: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
];

// ═══════════════════════════════════════════════════════════════════════
// OPERATIONS: SELL TRACKING
// ═══════════════════════════════════════════════════════════════════════

export const mockSellData = [
  {
    id: 'sell-001',
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    productId: 'prod-001',
    productName: 'Nước ngọt Cola 330ml',
    period: '2026-01',
    sellIn: 5000,
    sellOut: 4200,
    sellThrough: 84,
    openingStock: 800,
    closingStock: 1600,
    avgPrice: 11500,
    revenue: 48300000,
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'sell-002',
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    productId: 'prod-002',
    productName: 'Nước cam ép 1L',
    period: '2026-01',
    sellIn: 2000,
    sellOut: 1850,
    sellThrough: 92.5,
    openingStock: 300,
    closingStock: 450,
    avgPrice: 43000,
    revenue: 79550000,
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'sell-003',
    customerId: 'cust-002',
    customerName: 'Siêu thị Big C',
    productId: 'prod-001',
    productName: 'Nước ngọt Cola 330ml',
    period: '2026-01',
    sellIn: 4000,
    sellOut: 3500,
    sellThrough: 87.5,
    openingStock: 600,
    closingStock: 1100,
    avgPrice: 11800,
    revenue: 41300000,
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
];

// ═══════════════════════════════════════════════════════════════════════
// OPERATIONS: INVENTORY
// ═══════════════════════════════════════════════════════════════════════

export const mockInventory = [
  {
    id: 'inv-001',
    productId: 'prod-001',
    productName: 'Nước ngọt Cola 330ml',
    sku: 'BEV-001',
    warehouseId: 'wh-001',
    warehouseName: 'Kho HCM',
    quantity: 5420,
    reservedQuantity: 350,
    availableQuantity: 5070,
    minStock: 1000,
    maxStock: 10000,
    reorderPoint: 2000,
    status: 'NORMAL',
    lastUpdated: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'inv-002',
    productId: 'prod-002',
    productName: 'Nước cam ép 1L',
    sku: 'BEV-002',
    warehouseId: 'wh-001',
    warehouseName: 'Kho HCM',
    quantity: 2150,
    reservedQuantity: 200,
    availableQuantity: 1950,
    minStock: 500,
    maxStock: 5000,
    reorderPoint: 1000,
    status: 'NORMAL',
    lastUpdated: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'inv-003',
    productId: 'prod-003',
    productName: 'Bánh quy Oreo 133g',
    sku: 'SNK-001',
    warehouseId: 'wh-001',
    warehouseName: 'Kho HCM',
    quantity: 850,
    reservedQuantity: 100,
    availableQuantity: 750,
    minStock: 800,
    maxStock: 4000,
    reorderPoint: 1500,
    status: 'LOW_STOCK',
    lastUpdated: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
];

// ═══════════════════════════════════════════════════════════════════════
// INTEGRATION: SYNC STATUS
// ═══════════════════════════════════════════════════════════════════════

export const mockERPSyncs = [
  {
    id: 'erp-001',
    system: 'SAP',
    type: 'CUSTOMER',
    direction: 'INBOUND',
    status: 'SUCCESS',
    recordsProcessed: 150,
    recordsFailed: 0,
    startedAt: format(subDays(today, 0), 'yyyy-MM-dd\'T\'06:00:00\'Z\''),
    completedAt: format(subDays(today, 0), 'yyyy-MM-dd\'T\'06:05:23\'Z\''),
    duration: 323,
    errorMessage: null,
  },
  {
    id: 'erp-002',
    system: 'SAP',
    type: 'PRODUCT',
    direction: 'INBOUND',
    status: 'SUCCESS',
    recordsProcessed: 450,
    recordsFailed: 2,
    startedAt: format(subDays(today, 0), 'yyyy-MM-dd\'T\'06:10:00\'Z\''),
    completedAt: format(subDays(today, 0), 'yyyy-MM-dd\'T\'06:18:45\'Z\''),
    duration: 525,
    errorMessage: '2 products skipped due to missing category',
  },
  {
    id: 'erp-003',
    system: 'SAP',
    type: 'ORDER',
    direction: 'OUTBOUND',
    status: 'RUNNING',
    recordsProcessed: 45,
    recordsFailed: 0,
    startedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    completedAt: null,
    duration: null,
  },
];

export const mockDMSSyncs = [
  {
    id: 'dms-001',
    system: 'MISA DMS',
    type: 'SELL_OUT',
    direction: 'INBOUND',
    status: 'SUCCESS',
    recordsProcessed: 1250,
    recordsFailed: 0,
    startedAt: format(subDays(today, 0), 'yyyy-MM-dd\'T\'08:00:00\'Z\''),
    completedAt: format(subDays(today, 0), 'yyyy-MM-dd\'T\'08:12:30\'Z\''),
    duration: 750,
  },
  {
    id: 'dms-002',
    system: 'FAST DMS',
    type: 'INVENTORY',
    direction: 'INBOUND',
    status: 'FAILED',
    recordsProcessed: 0,
    recordsFailed: 0,
    startedAt: format(subDays(today, 1), 'yyyy-MM-dd\'T\'08:00:00\'Z\''),
    completedAt: format(subDays(today, 1), 'yyyy-MM-dd\'T\'08:00:15\'Z\''),
    duration: 15,
    errorMessage: 'Connection timeout - Unable to reach DMS server',
  },
];

export const mockWebhooks = [
  {
    id: 'wh-001',
    name: 'Promotion Approved Notification',
    url: 'https://erp.company.com/webhooks/promo-approved',
    events: ['promotion.approved'],
    status: 'ACTIVE',
    secret: 'whsec_***',
    lastTriggered: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    successRate: 98.5,
    totalCalls: 156,
    createdAt: format(subDays(today, 60), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'wh-002',
    name: 'Claim Status Update',
    url: 'https://finance.company.com/api/claim-updates',
    events: ['claim.approved', 'claim.rejected', 'claim.paid'],
    status: 'ACTIVE',
    secret: 'whsec_***',
    lastTriggered: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    successRate: 99.2,
    totalCalls: 89,
    createdAt: format(subDays(today, 45), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
];

// ═══════════════════════════════════════════════════════════════════════
// AI: INSIGHTS & RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════

export const insightTypes = ['ANOMALY', 'TREND', 'OPPORTUNITY', 'RISK'] as const;
export const insightSeverities = ['INFO', 'WARNING', 'CRITICAL'] as const;

export const mockInsights = [
  {
    id: 'ins-001',
    type: 'ANOMALY',
    severity: 'WARNING',
    title: 'Chi tiêu vượt mức bình thường',
    description: 'Chương trình SUMMER-2026 đang chi tiêu nhanh hơn 35% so với kế hoạch. Với tốc độ này, ngân sách sẽ cạn trước 45 ngày.',
    entityType: 'PROMOTION',
    entityId: 'promo-001',
    entityName: 'Khuyến mãi Hè 2026',
    confidence: 0.92,
    data: {
      currentSpendRate: 1.35,
      expectedSpendRate: 1.0,
      daysToDepletion: 45,
      recommendedAction: 'Giảm ngân sách hàng ngày hoặc điều chỉnh target',
    },
    suggestedActions: [
      'Xem xét giảm mức chiết khấu',
      'Thu hẹp phạm vi sản phẩm áp dụng',
      'Tăng ngân sách nếu doanh thu đạt kỳ vọng',
    ],
    status: 'ACTIVE',
    createdAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    expiresAt: format(addDays(today, 7), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'ins-002',
    type: 'OPPORTUNITY',
    severity: 'INFO',
    title: 'Cơ hội tăng trưởng với VinMart',
    description: 'VinMart có sell-through rate cao (92%) nhưng chỉ tham gia 2 chương trình KM. Có tiềm năng mở rộng hợp tác.',
    entityType: 'CUSTOMER',
    entityId: 'cust-003',
    entityName: 'VinMart',
    confidence: 0.85,
    data: {
      currentPromotions: 2,
      avgSellThrough: 92,
      potentialRevenue: 500000000,
    },
    suggestedActions: [
      'Đề xuất thêm 2-3 chương trình KM mới',
      'Tăng ngân sách cho khách hàng này',
      'Mở rộng danh mục sản phẩm',
    ],
    status: 'ACTIVE',
    createdAt: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    expiresAt: format(addDays(today, 14), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'ins-003',
    type: 'RISK',
    severity: 'CRITICAL',
    title: 'Tồn kho thấp - Bánh quy Oreo',
    description: 'Sản phẩm Oreo 133g đang ở mức tồn kho thấp (850 units), dưới mức an toàn (1000). Có nguy cơ hết hàng trong 5 ngày.',
    entityType: 'PRODUCT',
    entityId: 'prod-003',
    entityName: 'Bánh quy Oreo 133g',
    confidence: 0.95,
    data: {
      currentStock: 850,
      minStock: 1000,
      avgDailySales: 150,
      daysToStockout: 5,
    },
    suggestedActions: [
      'Đặt hàng bổ sung ngay',
      'Tạm dừng promotion cho sản phẩm này',
      'Liên hệ nhà cung cấp',
    ],
    status: 'ACTIVE',
    createdAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    expiresAt: format(addDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'ins-004',
    type: 'TREND',
    severity: 'INFO',
    title: 'Xu hướng tăng doanh số Q1',
    description: 'Doanh số tổng thể đang tăng 15% so với cùng kỳ năm trước. Các chương trình khuyến mãi đang phát huy hiệu quả.',
    entityType: 'SYSTEM',
    entityId: null,
    entityName: 'Toàn hệ thống',
    confidence: 0.88,
    data: {
      growthRate: 15,
      comparisonPeriod: 'YoY',
      topPerformers: ['SUMMER-2026', 'BUNDLE-Q1'],
    },
    suggestedActions: [
      'Duy trì chiến lược hiện tại',
      'Tăng ngân sách cho các chương trình hiệu quả',
      'Mở rộng sang khách hàng mới',
    ],
    status: 'ACTIVE',
    createdAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    expiresAt: format(addDays(today, 30), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
];

export const mockRecommendations = [
  {
    id: 'rec-001',
    type: 'BUDGET_OPTIMIZATION',
    title: 'Tối ưu ngân sách SUMMER-2026',
    description: 'Dựa trên phân tích, đề xuất giảm 15% ngân sách hàng ngày để đảm bảo chương trình kéo dài đến hết thời hạn.',
    confidence: 0.89,
    impact: {
      budgetSaving: 75000000,
      revenueImpact: -5,
      roiImprovement: 12,
    },
    parameters: {
      currentDailyBudget: 10000000,
      recommendedDailyBudget: 8500000,
      startDate: format(today, 'yyyy-MM-dd'),
    },
    status: 'PENDING',
    createdAt: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'rec-002',
    type: 'CUSTOMER_TARGETING',
    title: 'Mở rộng chương trình sang Lotte Mart',
    description: 'Lotte Mart có profile tương tự CoopMart nhưng ROI tiềm năng cao hơn 20%. Đề xuất thêm vào SUMMER-2026.',
    confidence: 0.82,
    impact: {
      potentialRevenue: 350000000,
      estimatedCost: 70000000,
      expectedROI: 400,
    },
    parameters: {
      targetCustomerId: 'cust-004',
      promotionId: 'promo-001',
      suggestedBudget: 70000000,
    },
    status: 'PENDING',
    createdAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
];

// ═══════════════════════════════════════════════════════════════════════
// BI: REPORTS & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════

export const mockReports = [
  {
    id: 'rpt-001',
    name: 'Báo cáo hiệu quả KM tháng 1/2026',
    type: 'PROMOTION_PERFORMANCE',
    status: 'READY',
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    generatedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    format: 'PDF',
    size: 2456000,
    downloadUrl: '/reports/promotion-performance-2026-01.pdf',
  },
  {
    id: 'rpt-002',
    name: 'Báo cáo ROI Q4-2025',
    type: 'ROI_ANALYSIS',
    status: 'READY',
    createdAt: format(subDays(today, 30), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    generatedAt: format(subDays(today, 30), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    format: 'EXCEL',
    size: 1850000,
    downloadUrl: '/reports/roi-analysis-q4-2025.xlsx',
  },
  {
    id: 'rpt-003',
    name: 'Báo cáo Claims tháng 1/2026',
    type: 'CLAIMS_SUMMARY',
    status: 'GENERATING',
    createdAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    progress: 65,
  },
];

// Dashboard KPIs
export const mockDashboardKPIs = {
  totalRevenue: 2850000000,
  revenueGrowth: 15.3,
  totalPromotions: 24,
  activePromotions: 8,
  pendingClaims: 12,
  claimApprovalRate: 85.5,
  avgROI: 320,
  budgetUtilization: 68.5,
};

// Chart data for dashboard
export const mockChartData = {
  revenueByMonth: [
    { month: 'T1', revenue: 2850000000, target: 2500000000 },
    { month: 'T2', revenue: 0, target: 2800000000 },
    { month: 'T3', revenue: 0, target: 3000000000 },
  ],
  promotionsByStatus: [
    { status: 'Active', count: 8, value: 35 },
    { status: 'Pending', count: 5, value: 20 },
    { status: 'Completed', count: 6, value: 25 },
    { status: 'Draft', count: 5, value: 20 },
  ],
  claimsTrend: [
    { date: format(subDays(today, 6), 'dd/MM'), submitted: 5, approved: 3, rejected: 1 },
    { date: format(subDays(today, 5), 'dd/MM'), submitted: 8, approved: 5, rejected: 2 },
    { date: format(subDays(today, 4), 'dd/MM'), submitted: 6, approved: 4, rejected: 1 },
    { date: format(subDays(today, 3), 'dd/MM'), submitted: 10, approved: 7, rejected: 2 },
    { date: format(subDays(today, 2), 'dd/MM'), submitted: 7, approved: 5, rejected: 1 },
    { date: format(subDays(today, 1), 'dd/MM'), submitted: 9, approved: 6, rejected: 2 },
    { date: format(today, 'dd/MM'), submitted: 4, approved: 2, rejected: 0 },
  ],
  topCustomers: [
    { name: 'CoopMart', revenue: 580000000, growth: 12 },
    { name: 'VinMart', revenue: 520000000, growth: 18 },
    { name: 'Big C', revenue: 480000000, growth: 8 },
    { name: 'Lotte Mart', revenue: 350000000, growth: 15 },
    { name: 'AEON', revenue: 290000000, growth: 22 },
  ],
};

export type Delivery = typeof mockDeliveries[0];
export type SellData = typeof mockSellData[0];
export type Inventory = typeof mockInventory[0];
export type Insight = typeof mockInsights[0];
export type Recommendation = typeof mockRecommendations[0];
