/**
 * Operations Module - Type Definitions
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export type DeliveryStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SCHEDULED'
  | 'PICKING'
  | 'PACKED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'PARTIAL'
  | 'RETURNED'
  | 'CANCELLED';

export type LineStatus =
  | 'PENDING'
  | 'PICKED'
  | 'PACKED'
  | 'DELIVERED'
  | 'PARTIAL'
  | 'DAMAGED'
  | 'RETURNED'
  | 'CANCELLED';

export type StockStatus = 'OK' | 'LOW' | 'OUT_OF_STOCK' | 'OVERSTOCK';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

// ═══════════════════════════════════════════════════════════════════════════════
// DELIVERY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  promotionId?: string;
  promotion?: {
    id: string;
    code: string;
    name: string;
  };
  customerId: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  status: DeliveryStatus;
  scheduledDate: string;
  deliveredAt?: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  lines: DeliveryLine[];
  trackingInfo?: DeliveryTracking[];
  notes?: string;
  totalItems: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface DeliveryLine {
  id: string;
  deliveryOrderId: string;
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
    price?: number;
  };
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
  timestamp: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface DeliveryListParams {
  page?: number;
  limit?: number;
  status?: DeliveryStatus | 'all';
  customerId?: string;
  promotionId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DeliverySummary {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  deliveredThisWeek: number;
  onTimeRate: number;
  byStatus: Record<string, number>;
}

export interface CreateDeliveryRequest {
  promotionId?: string;
  customerId: string;
  scheduledDate: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  lines: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
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

export interface CalendarDay {
  date: string;
  orders: DeliveryOrder[];
  totalOrders: number;
  deliveredCount: number;
  pendingCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELL TRACKING TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SellTracking {
  id: string;
  customerId: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
  };
  period: string;
  sellInQty: number;
  sellInValue: number;
  sellOutQty: number;
  sellOutValue: number;
  stockQty: number;
  stockValue: number;
  sellThroughRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellTrackingParams {
  page?: number;
  limit?: number;
  customerId?: string;
  productId?: string;
  period?: string;
  periodFrom?: string;
  periodTo?: string;
}

export interface SellTrackingSummary {
  totalSellIn: number;
  totalSellOut: number;
  totalStock: number;
  sellThroughRate: number;
  avgDaysOfStock: number;
}

export interface ComparisonData {
  period: string;
  sellIn: { qty: number; value: number };
  sellOut: { qty: number; value: number };
  stock: { qty: number; value: number };
  sellThroughRate: number;
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
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  productId: string;
  product?: {
    id: string;
    code: string;
    name: string;
  };
  snapshotDate: string;
  quantity: number;
  value: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
  createdAt: string;
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
  lastUpdated: string;
  avgMonthlySales: number;
  stockCoverage: number;
  status: StockStatus;
  expiryDate?: string;
  daysUntilExpiry?: number;
}

export interface InventoryParams {
  page?: number;
  limit?: number;
  customerId?: string;
  productId?: string;
  categoryId?: string;
  status?: StockStatus | 'all';
  lowStock?: boolean;
  nearExpiry?: boolean;
}

export interface InventorySummary {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  nearExpiryItems: number;
  avgStockCoverage: number;
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
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const DELIVERY_STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: { label: 'Pending', color: 'text-white', bgColor: 'bg-slate-500 dark:bg-slate-600' },
  CONFIRMED: { label: 'Confirmed', color: 'text-white', bgColor: 'bg-blue-500 dark:bg-blue-600' },
  SCHEDULED: { label: 'Scheduled', color: 'text-white', bgColor: 'bg-blue-500 dark:bg-blue-600' },
  PICKING: { label: 'Picking', color: 'text-white', bgColor: 'bg-amber-500 dark:bg-amber-600' },
  PACKED: { label: 'Packed', color: 'text-white', bgColor: 'bg-amber-500 dark:bg-amber-600' },
  IN_TRANSIT: { label: 'In Transit', color: 'text-white', bgColor: 'bg-amber-500 dark:bg-amber-600' },
  DELIVERED: { label: 'Delivered', color: 'text-white', bgColor: 'bg-emerald-600 dark:bg-emerald-500' },
  PARTIAL: { label: 'Partial', color: 'text-white', bgColor: 'bg-amber-500 dark:bg-amber-600' },
  RETURNED: { label: 'Returned', color: 'text-white', bgColor: 'bg-red-500 dark:bg-red-600' },
  CANCELLED: { label: 'Cancelled', color: 'text-white', bgColor: 'bg-slate-500 dark:bg-slate-600' },
};

export const DELIVERY_STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['PICKING', 'CANCELLED'],
  PICKING: ['PACKED', 'CANCELLED'],
  PACKED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'PARTIAL', 'RETURNED'],
  DELIVERED: [],
  PARTIAL: ['DELIVERED'],
  RETURNED: [],
  CANCELLED: [],
};

export const STOCK_STATUS_CONFIG: Record<
  StockStatus,
  { label: string; color: string; bgColor: string }
> = {
  OK: { label: 'OK', color: 'text-green-700', bgColor: 'bg-green-100' },
  LOW: { label: 'Low Stock', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  OUT_OF_STOCK: { label: 'Out of Stock', color: 'text-red-700', bgColor: 'bg-red-100' },
  OVERSTOCK: { label: 'Overstock', color: 'text-blue-700', bgColor: 'bg-blue-100' },
};

export const INVENTORY_THRESHOLDS = {
  LOW_STOCK_COVERAGE_MONTHS: 1,
  OVERSTOCK_COVERAGE_MONTHS: 6,
  NEAR_EXPIRY_DAYS: 30,
  LOW_SELL_THROUGH_PERCENT: 50,
  HIGH_STOCK_DAYS: 60,
};
