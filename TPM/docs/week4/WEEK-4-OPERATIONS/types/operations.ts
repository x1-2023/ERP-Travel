// ══════════════════════════════════════════════════════════════════════════════
//                    🚚 OPERATIONS MODULE - TYPE DEFINITIONS
//                         File: types/operations.ts
// ══════════════════════════════════════════════════════════════════════════════

import type { Promotion, Customer, Product, User } from '@vierp/tpm-shared';

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum DeliveryStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SCHEDULED = 'SCHEDULED',
  PICKING = 'PICKING',
  PACKED = 'PACKED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  PARTIAL = 'PARTIAL',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export enum LineStatus {
  PENDING = 'PENDING',
  PICKED = 'PICKED',
  PACKED = 'PACKED',
  DELIVERED = 'DELIVERED',
  PARTIAL = 'PARTIAL',
  DAMAGED = 'DAMAGED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export enum StockStatus {
  OK = 'OK',
  LOW = 'LOW',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  OVERSTOCK = 'OVERSTOCK',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELIVERY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  promotionId?: string;
  promotion?: Promotion;
  customerId: string;
  customer?: Customer;
  status: DeliveryStatus;
  scheduledDate: Date;
  deliveredAt?: Date;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  lines: DeliveryLine[];
  trackingInfo?: DeliveryTracking[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

export interface DeliveryLine {
  id: string;
  deliveryOrderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  deliveredQty: number;
  damagedQty: number;
  status: LineStatus;
  notes?: string;
}

export interface DeliveryTracking {
  id: string;
  deliveryOrderId: string;
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

export interface DeliveryListParams {
  status?: DeliveryStatus;
  customerId?: string;
  promotionId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface DeliveryListResponse {
  success: boolean;
  data: DeliveryOrder[];
  pagination: Pagination;
  summary: DeliverySummary;
}

export interface DeliverySummary {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  deliveredThisWeek: number;
  onTimeRate: number;
}

export interface CreateDeliveryRequest {
  promotionId?: string;
  customerId: string;
  scheduledDate: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  lines: DeliveryLineInput[];
}

export interface DeliveryLineInput {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateDeliveryRequest {
  scheduledDate?: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: DeliveryStatus;
  notes?: string;
  deliveredLines?: {
    lineId: string;
    deliveredQty: number;
    damagedQty?: number;
  }[];
}

export interface CalendarParams {
  month: number;
  year: number;
}

export interface CalendarDay {
  date: string;
  orders: DeliveryOrder[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELL TRACKING TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SellTracking {
  id: string;
  customerId: string;
  customer?: Customer;
  productId: string;
  product?: Product;
  period: string;
  sellInQty: number;
  sellInValue: number;
  sellOutQty: number;
  sellOutValue: number;
  stockQty: number;
  stockValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellTrackingParams {
  customerId?: string;
  productId?: string;
  period?: string;
  periodFrom?: string;
  periodTo?: string;
  page?: number;
  pageSize?: number;
}

export interface SellTrackingResponse {
  success: boolean;
  data: SellTracking[];
  pagination: Pagination;
  summary: SellTrackingSummary;
}

export interface SellTrackingSummary {
  totalSellIn: number;
  totalSellOut: number;
  totalStock: number;
  sellThroughRate: number;
  avgDaysOfStock: number;
}

export interface SellInParams {
  customerId?: string;
  productId?: string;
  categoryId?: string;
  periodFrom?: string;
  periodTo?: string;
  groupBy?: 'customer' | 'product' | 'category' | 'period';
}

export interface SellInData {
  groupKey: string;
  groupName: string;
  quantity: number;
  value: number;
  growthPercent?: number;
}

export interface ComparisonData {
  period: string;
  sellIn: { qty: number; value: number };
  sellOut: { qty: number; value: number };
  stock: { qty: number; value: number };
  sellThroughRate: number;
}

export interface ComparisonAnalysis {
  avgSellThroughRate: number;
  stockTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  sellOutGrowth: number;
  totalSellIn: number;
  totalSellOut: number;
  avgDaysOfStock: number;
  recommendation: string;
}

export interface ImportRequest {
  type: 'SELL_IN' | 'SELL_OUT' | 'STOCK';
  period: string;
  data: ImportRow[];
}

export interface ImportRow {
  customerId: string;
  productId: string;
  quantity: number;
  value: number;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

export interface SellAlert {
  type: 'LOW_SELL_THROUGH' | 'HIGH_STOCK' | 'NEGATIVE_TREND' | 'STOCKOUT_RISK';
  severity: AlertSeverity;
  customerId: string;
  customerName: string;
  productId?: string;
  productName?: string;
  message: string;
  metric: number;
  threshold: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface InventorySnapshot {
  id: string;
  customerId: string;
  customer?: Customer;
  productId: string;
  product?: Product;
  snapshotDate: Date;
  quantity: number;
  value: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: Date;
  createdAt: Date;
}

export interface InventoryItem {
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  productSku?: string;
  category?: string;
  quantity: number;
  value: number;
  lastUpdated: Date;
  avgMonthlySales: number;
  stockCoverage: number;
  status: StockStatus;
  expiryDate?: Date;
  daysUntilExpiry?: number;
}

export interface InventoryParams {
  customerId?: string;
  productId?: string;
  categoryId?: string;
  lowStock?: boolean;
  nearExpiry?: boolean;
  page?: number;
  pageSize?: number;
}

export interface InventoryResponse {
  success: boolean;
  data: InventoryItem[];
  pagination: Pagination;
  summary: InventorySummary;
}

export interface InventorySummary {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  nearExpiryItems: number;
  avgStockCoverage: number;
}

export interface CreateSnapshotRequest {
  customerId: string;
  productId: string;
  quantity: number;
  value: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface BulkSnapshotRequest {
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

export interface InventoryAlert {
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'NEAR_EXPIRY' | 'EXPIRED';
  severity: AlertSeverity;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  currentQty: number;
  threshold: number;
  message: string;
  expiryDate?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TrendData {
  period: string;
  value: number;
  change?: number;
  changePercent?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  [DeliveryStatus.PENDING]: 'Pending',
  [DeliveryStatus.CONFIRMED]: 'Confirmed',
  [DeliveryStatus.SCHEDULED]: 'Scheduled',
  [DeliveryStatus.PICKING]: 'Picking',
  [DeliveryStatus.PACKED]: 'Packed',
  [DeliveryStatus.IN_TRANSIT]: 'In Transit',
  [DeliveryStatus.DELIVERED]: 'Delivered',
  [DeliveryStatus.PARTIAL]: 'Partial',
  [DeliveryStatus.RETURNED]: 'Returned',
  [DeliveryStatus.CANCELLED]: 'Cancelled',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  [DeliveryStatus.PENDING]: 'gray',
  [DeliveryStatus.CONFIRMED]: 'blue',
  [DeliveryStatus.SCHEDULED]: 'blue',
  [DeliveryStatus.PICKING]: 'yellow',
  [DeliveryStatus.PACKED]: 'yellow',
  [DeliveryStatus.IN_TRANSIT]: 'orange',
  [DeliveryStatus.DELIVERED]: 'green',
  [DeliveryStatus.PARTIAL]: 'yellow',
  [DeliveryStatus.RETURNED]: 'red',
  [DeliveryStatus.CANCELLED]: 'gray',
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  [StockStatus.OK]: 'OK',
  [StockStatus.LOW]: 'Low Stock',
  [StockStatus.OUT_OF_STOCK]: 'Out of Stock',
  [StockStatus.OVERSTOCK]: 'Overstock',
};

export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  [StockStatus.OK]: 'green',
  [StockStatus.LOW]: 'yellow',
  [StockStatus.OUT_OF_STOCK]: 'red',
  [StockStatus.OVERSTOCK]: 'blue',
};

// Valid status transitions
export const DELIVERY_STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.PENDING]: [DeliveryStatus.CONFIRMED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.CONFIRMED]: [DeliveryStatus.SCHEDULED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.SCHEDULED]: [DeliveryStatus.PICKING, DeliveryStatus.CANCELLED],
  [DeliveryStatus.PICKING]: [DeliveryStatus.PACKED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.PACKED]: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.CANCELLED],
  [DeliveryStatus.IN_TRANSIT]: [DeliveryStatus.DELIVERED, DeliveryStatus.PARTIAL, DeliveryStatus.RETURNED],
  [DeliveryStatus.DELIVERED]: [],
  [DeliveryStatus.PARTIAL]: [DeliveryStatus.DELIVERED],
  [DeliveryStatus.RETURNED]: [],
  [DeliveryStatus.CANCELLED]: [],
};

// Thresholds
export const INVENTORY_THRESHOLDS = {
  LOW_STOCK_COVERAGE_MONTHS: 1,      // < 1 month = low stock
  OVERSTOCK_COVERAGE_MONTHS: 6,      // > 6 months = overstock
  NEAR_EXPIRY_DAYS: 30,              // < 30 days = near expiry
  LOW_SELL_THROUGH_PERCENT: 50,      // < 50% = low sell-through
  HIGH_STOCK_DAYS: 60,               // > 60 days of supply = high stock
};
