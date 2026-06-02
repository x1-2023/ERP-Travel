// ============================================================
// E-commerce Order Engine
// Order lifecycle, status management, accounting integration
// ============================================================

import Decimal from 'decimal.js';

// ─── Types ───────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'RETURNED';

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  subtotal: Decimal;
  taxAmount: Decimal;
  shippingFee: Decimal;
  discount: Decimal;
  total: Decimal;
  paymentMethod: string;
  paymentStatus: string;
  shippingProvider?: string;
  trackingNumber?: string;
  createdAt: Date;
  estimatedDelivery?: Date;
}

export interface OrderTransition {
  from: OrderStatus;
  to: OrderStatus;
  action: string;
  actorType: 'system' | 'admin' | 'customer';
  note?: string;
  timestamp: Date;
}

export interface OrderAnalytics {
  period: string;
  totalOrders: number;
  totalRevenue: Decimal;
  averageOrderValue: Decimal;
  cancelRate: number;
  returnRate: number;
  topProducts: Array<{ productId: string; name: string; quantity: number; revenue: Decimal }>;
  revenueByPaymentMethod: Record<string, Decimal>;
  ordersByStatus: Record<string, number>;
  dailyRevenue: Array<{ date: string; orders: number; revenue: Decimal }>;
}

export interface ReturnRequest {
  orderId: string;
  orderLineIds: string[];
  reason: string;
  description?: string;
  images?: string[];
  refundMethod: 'ORIGINAL' | 'WALLET' | 'BANK_TRANSFER';
}

// ─── Order State Machine ─────────────────────────────────────

/**
 * Valid order status transitions
 * Follows Vietnamese e-commerce standard flow
 */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED:    ['DELIVERED', 'RETURNED'],
  DELIVERED:  ['COMPLETED', 'RETURNED'],
  COMPLETED:  ['RETURNED'],
  CANCELLED:  [], // Terminal state
  REFUNDED:   [], // Terminal state
  RETURNED:   ['REFUNDED'],
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get all valid next statuses from current status
 */
export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[current] || [];
}

/**
 * Get Vietnamese label for order status
 */
export function getStatusLabel(status: OrderStatus): { vi: string; en: string; color: string } {
  const labels: Record<OrderStatus, { vi: string; en: string; color: string }> = {
    PENDING:    { vi: 'Chờ xác nhận', en: 'Pending', color: '#FFA500' },
    CONFIRMED:  { vi: 'Đã xác nhận', en: 'Confirmed', color: '#2196F3' },
    PROCESSING: { vi: 'Đang xử lý', en: 'Processing', color: '#9C27B0' },
    SHIPPED:    { vi: 'Đang giao hàng', en: 'Shipped', color: '#00BCD4' },
    DELIVERED:  { vi: 'Đã giao hàng', en: 'Delivered', color: '#4CAF50' },
    COMPLETED:  { vi: 'Hoàn thành', en: 'Completed', color: '#388E3C' },
    CANCELLED:  { vi: 'Đã hủy', en: 'Cancelled', color: '#F44336' },
    REFUNDED:   { vi: 'Đã hoàn tiền', en: 'Refunded', color: '#FF9800' },
    RETURNED:   { vi: 'Trả hàng', en: 'Returned', color: '#E91E63' },
  };
  return labels[status];
}

/**
 * Transition order status with validation
 */
export function transitionOrder(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  actor: { type: 'system' | 'admin' | 'customer'; id: string },
  note?: string
): OrderTransition {
  if (!isValidTransition(currentStatus, newStatus)) {
    throw new OrderError(
      'INVALID_TRANSITION',
      `Không thể chuyển từ "${getStatusLabel(currentStatus).vi}" sang "${getStatusLabel(newStatus).vi}"`,
      400
    );
  }

  return {
    from: currentStatus,
    to: newStatus,
    action: `${currentStatus} → ${newStatus}`,
    actorType: actor.type,
    note,
    timestamp: new Date(),
  };
}

// ─── Order Journal Entries (Accounting Integration) ──────────

/**
 * Generate journal entry for order completion
 * Following VAS accounting standards:
 * - Revenue recognition: Debit 131 (Receivables), Credit 511 (Revenue) + 33311 (VAT output)
 * - COGS: Debit 632 (GVHB), Credit 155 (Finished goods) or 156 (Hàng hóa)
 */
export function generateOrderJournalEntry(
  order: {
    orderNumber: string;
    total: Decimal;
    taxAmount: Decimal;
    discount: Decimal;
    lines: Array<{
      productName: string;
      quantity: number;
      unitPrice: Decimal;
      taxAmount: Decimal;
      lineTotal: Decimal;
      costPrice?: Decimal;
    }>;
    paymentMethod: string;
    customerId: string;
  }
): {
  revenueEntry: JournalEntryData;
  cogsEntry?: JournalEntryData;
} {
  const netRevenue = order.total.sub(order.taxAmount);

  // Revenue entry
  const revenueLines: JournalLineData[] = [];

  // Debit: 131 - Phải thu khách hàng (or 111/112 if paid)
  const debitAccount = order.paymentMethod === 'COD' ? '131' :
    ['BANK_TRANSFER', 'VNPAY'].includes(order.paymentMethod) ? '112' : '131';

  revenueLines.push({
    accountCode: debitAccount,
    description: `Thu tiền đơn hàng ${order.orderNumber}`,
    debit: order.total,
    credit: new Decimal(0),
    customerId: order.customerId,
  });

  // Credit: 5111 - Doanh thu bán hàng
  revenueLines.push({
    accountCode: '5111',
    description: `Doanh thu đơn hàng ${order.orderNumber}`,
    debit: new Decimal(0),
    credit: netRevenue,
  });

  // Credit: 33311 - Thuế GTGT đầu ra
  if (order.taxAmount.gt(0)) {
    revenueLines.push({
      accountCode: '33311',
      description: `VAT đầu ra - ${order.orderNumber}`,
      debit: new Decimal(0),
      credit: order.taxAmount,
    });
  }

  // Discount: Debit 5213 - Giảm giá hàng bán
  if (order.discount.gt(0)) {
    revenueLines.push({
      accountCode: '5213',
      description: `Giảm giá - ${order.orderNumber}`,
      debit: order.discount,
      credit: new Decimal(0),
    });
    // Adjust receivable
    revenueLines[0].debit = revenueLines[0].debit.sub(order.discount);
  }

  const revenueEntry: JournalEntryData = {
    type: 'HD', // Hóa đơn
    description: `Ghi nhận doanh thu đơn hàng ${order.orderNumber}`,
    lines: revenueLines,
    reference: order.orderNumber,
  };

  // COGS entry (if cost prices available)
  const linesWithCost = order.lines.filter(l => l.costPrice && l.costPrice.gt(0));
  let cogsEntry: JournalEntryData | undefined;

  if (linesWithCost.length > 0) {
    const totalCOGS = linesWithCost.reduce(
      (sum, l) => sum.add(l.costPrice!.mul(l.quantity)),
      new Decimal(0)
    );

    cogsEntry = {
      type: 'BL', // Bút toán
      description: `Giá vốn đơn hàng ${order.orderNumber}`,
      lines: [
        {
          accountCode: '632',
          description: `GVHB - ${order.orderNumber}`,
          debit: totalCOGS,
          credit: new Decimal(0),
        },
        {
          accountCode: '156',
          description: `Xuất kho hàng hóa - ${order.orderNumber}`,
          debit: new Decimal(0),
          credit: totalCOGS,
        },
      ],
      reference: order.orderNumber,
    };
  }

  return { revenueEntry, cogsEntry };
}

/**
 * Generate refund journal entry
 * Debit 5213 (Sales returns), Credit 131/112 (Receivable/Bank)
 */
export function generateRefundJournalEntry(
  orderNumber: string,
  refundAmount: Decimal,
  taxAmount: Decimal,
  refundMethod: string,
  customerId: string
): JournalEntryData {
  const creditAccount = refundMethod === 'BANK_TRANSFER' ? '112' : '131';

  return {
    type: 'DC', // Điều chỉnh
    description: `Hoàn tiền đơn hàng ${orderNumber}`,
    lines: [
      {
        accountCode: '5212', // Hàng bán bị trả lại
        description: `Trả hàng - ${orderNumber}`,
        debit: refundAmount.sub(taxAmount),
        credit: new Decimal(0),
      },
      {
        accountCode: '33311',
        description: `Hoàn VAT - ${orderNumber}`,
        debit: taxAmount,
        credit: new Decimal(0),
      },
      {
        accountCode: creditAccount,
        description: `Hoàn tiền cho KH - ${orderNumber}`,
        debit: new Decimal(0),
        credit: refundAmount,
        customerId,
      },
    ],
    reference: orderNumber,
  };
}

export interface JournalEntryData {
  type: string;
  description: string;
  lines: JournalLineData[];
  reference: string;
}

export interface JournalLineData {
  accountCode: string;
  description: string;
  debit: Decimal;
  credit: Decimal;
  customerId?: string;
  departmentId?: string;
}

// ─── Order Analytics ─────────────────────────────────────────

/**
 * Calculate order analytics for a period
 */
export function calculateOrderAnalytics(
  orders: Array<{
    id: string;
    status: OrderStatus;
    total: string;
    taxAmount: string;
    paymentMethod: string;
    createdAt: Date;
    lines: Array<{
      productId: string;
      productName: string;
      quantity: number;
      lineTotal: string;
    }>;
  }>,
  periodLabel: string
): OrderAnalytics {
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => !['CANCELLED', 'REFUNDED'].includes(o.status))
    .reduce((sum, o) => sum.add(new Decimal(o.total)), new Decimal(0));

  const averageOrderValue = totalOrders > 0
    ? totalRevenue.div(totalOrders)
    : new Decimal(0);

  const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;
  const returnedCount = orders.filter(o => ['RETURNED', 'REFUNDED'].includes(o.status)).length;

  // Top products
  const productMap = new Map<string, { name: string; quantity: number; revenue: Decimal }>();
  for (const order of orders) {
    if (['CANCELLED', 'REFUNDED'].includes(order.status)) continue;
    for (const line of order.lines) {
      const existing = productMap.get(line.productId) || {
        name: line.productName,
        quantity: 0,
        revenue: new Decimal(0),
      };
      existing.quantity += line.quantity;
      existing.revenue = existing.revenue.add(new Decimal(line.lineTotal));
      productMap.set(line.productId, existing);
    }
  }

  const topProducts = Array.from(productMap.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.revenue.cmp(a.revenue))
    .slice(0, 10);

  // Revenue by payment method
  const revenueByMethod: Record<string, Decimal> = {};
  for (const order of orders) {
    if (['CANCELLED', 'REFUNDED'].includes(order.status)) continue;
    const method = order.paymentMethod;
    revenueByMethod[method] = (revenueByMethod[method] || new Decimal(0)).add(new Decimal(order.total));
  }

  // Orders by status
  const ordersByStatus: Record<string, number> = {};
  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
  }

  // Daily revenue
  const dailyMap = new Map<string, { orders: number; revenue: Decimal }>();
  for (const order of orders) {
    if (['CANCELLED', 'REFUNDED'].includes(order.status)) continue;
    const dateKey = order.createdAt.toISOString().split('T')[0];
    const existing = dailyMap.get(dateKey) || { orders: 0, revenue: new Decimal(0) };
    existing.orders++;
    existing.revenue = existing.revenue.add(new Decimal(order.total));
    dailyMap.set(dateKey, existing);
  }

  const dailyRevenue = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    period: periodLabel,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    cancelRate: totalOrders > 0 ? cancelledCount / totalOrders : 0,
    returnRate: totalOrders > 0 ? returnedCount / totalOrders : 0,
    topProducts,
    revenueByPaymentMethod: revenueByMethod,
    ordersByStatus,
    dailyRevenue,
  };
}

// ─── Errors ──────────────────────────────────────────────────

export class OrderError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'OrderError';
  }
}
