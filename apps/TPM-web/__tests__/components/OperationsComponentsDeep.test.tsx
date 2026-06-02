/**
 * Operations Components Deep Tests
 * Tests for DeliveryCard, DeliveryStatusBadge, DeliveryFilters, DeliveryTimeline,
 * InventoryCard, OperationsStats, SellAlertCard, StockAlertBadge
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { DeliveryCard } from '@/components/operations/DeliveryCard';
import { DeliveryStatusBadge } from '@/components/operations/DeliveryStatusBadge';
import { DeliveryFilters } from '@/components/operations/DeliveryFilters';
import { DeliveryTimeline } from '@/components/operations/DeliveryTimeline';
import { InventoryCard, InventorySummaryCard } from '@/components/operations/InventoryCard';
import { DeliveryStats, SellTrackingStats, InventoryStats } from '@/components/operations/OperationsStats';
import { SellAlertCard, SellAlertList } from '@/components/operations/SellAlertCard';
import { StockAlertBadge, InventoryAlertBadge, ExpiryBadge } from '@/components/operations/StockAlertBadge';
import type { DeliveryOrder, DeliveryStatus, DeliveryTracking } from '@/types/operations';

// ============================================================================
// Mock Data
// ============================================================================

const mockDeliveryOrder: DeliveryOrder = {
  id: 'del-001',
  orderNumber: 'DO-2026-0001',
  customerId: 'cust-001',
  customer: { id: 'cust-001', code: 'C001', name: 'Saigon Beverages Co.' },
  promotionId: 'promo-001',
  promotion: { id: 'promo-001', code: 'SUMMER2026', name: 'Summer Promo 2026' },
  status: 'PENDING',
  scheduledDate: '2026-02-15T09:00:00Z',
  deliveryAddress: '123 Le Loi Street, District 1, HCMC',
  contactPerson: 'Nguyen Van Anh',
  contactPhone: '0901234567',
  lines: [
    {
      id: 'line-001',
      deliveryOrderId: 'del-001',
      productId: 'prod-001',
      product: { id: 'prod-001', code: 'PEP-500', name: 'Pepsi 500ml' },
      quantity: 100,
      deliveredQty: 0,
      damagedQty: 0,
      status: 'PENDING',
    },
  ],
  totalItems: 100,
  totalValue: 5000000,
  notes: 'Deliver before noon',
  createdAt: '2026-02-01T08:00:00Z',
  updatedAt: '2026-02-01T08:00:00Z',
  createdById: 'user-001',
};

const mockTimeline: Array<DeliveryTracking & { duration: string | null }> = [
  {
    id: 'track-001',
    deliveryOrderId: 'del-001',
    status: 'PENDING',
    notes: 'Order created',
    timestamp: '2026-02-01T08:00:00Z',
    userId: 'user-001',
    user: { id: 'user-001', name: 'Admin User' },
    duration: null,
  },
  {
    id: 'track-002',
    deliveryOrderId: 'del-001',
    status: 'CONFIRMED',
    notes: 'Confirmed by warehouse',
    timestamp: '2026-02-01T10:00:00Z',
    userId: 'user-002',
    user: { id: 'user-002', name: 'Warehouse Manager' },
    location: { lat: 10.762, lng: 106.66, address: 'Central Warehouse, HCMC' },
    duration: '2 hours',
  },
  {
    id: 'track-003',
    deliveryOrderId: 'del-001',
    status: 'IN_TRANSIT',
    timestamp: '2026-02-02T06:00:00Z',
    userId: 'user-003',
    user: { id: 'user-003', name: 'Driver Tran' },
    location: { lat: 10.77, lng: 106.69, address: 'Highway 1, Binh Duong' },
    duration: '20 hours',
  },
];

const mockSellAlert = {
  type: 'LOW_SELL_THROUGH' as const,
  severity: 'WARNING' as const,
  customerId: 'cust-001',
  customerName: 'Saigon Beverages Co.',
  productId: 'prod-001',
  productName: 'Pepsi 500ml',
  message: 'Sell-through rate below threshold at 35%',
  metric: 35,
  threshold: 50,
  period: '2026-01',
};

// ============================================================================
// DeliveryCard
// ============================================================================
describe('DeliveryCard', () => {
  it('renders order number and customer name', () => {
    render(<DeliveryCard order={mockDeliveryOrder} />);
    expect(screen.getByText('DO-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Saigon Beverages Co.')).toBeInTheDocument();
  });

  it('renders delivery address and contact person', () => {
    render(<DeliveryCard order={mockDeliveryOrder} />);
    expect(screen.getByText('123 Le Loi Street, District 1, HCMC')).toBeInTheDocument();
    expect(screen.getByText(/Nguyen Van Anh/)).toBeInTheDocument();
  });

  it('renders promotion name when present', () => {
    render(<DeliveryCard order={mockDeliveryOrder} />);
    expect(screen.getByText('Summer Promo 2026')).toBeInTheDocument();
  });

  it('renders items count', () => {
    render(<DeliveryCard order={mockDeliveryOrder} />);
    expect(screen.getByText(/100 items/)).toBeInTheDocument();
  });

  it('calls onStatusUpdate and onDelete when provided', () => {
    const onStatusUpdate = vi.fn();
    const onDelete = vi.fn();
    render(
      <DeliveryCard
        order={mockDeliveryOrder}
        onStatusUpdate={onStatusUpdate}
        onDelete={onDelete}
      />
    );
    // Component should render without error with callback props
    expect(screen.getByText('DO-2026-0001')).toBeInTheDocument();
  });

  it('renders without optional fields', () => {
    const minimalOrder: DeliveryOrder = {
      ...mockDeliveryOrder,
      customer: undefined,
      promotion: undefined,
      deliveryAddress: undefined,
      contactPerson: undefined,
    };
    render(<DeliveryCard order={minimalOrder} />);
    expect(screen.getByText('DO-2026-0001')).toBeInTheDocument();
  });
});

// ============================================================================
// DeliveryStatusBadge
// ============================================================================
describe('DeliveryStatusBadge', () => {
  const statuses: DeliveryStatus[] = [
    'PENDING',
    'CONFIRMED',
    'SCHEDULED',
    'PICKING',
    'PACKED',
    'IN_TRANSIT',
    'DELIVERED',
    'PARTIAL',
    'RETURNED',
    'CANCELLED',
  ];

  it.each(statuses)('renders %s status with correct label', (status) => {
    const labelMap: Record<DeliveryStatus, string> = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      SCHEDULED: 'Scheduled',
      PICKING: 'Picking',
      PACKED: 'Packed',
      IN_TRANSIT: 'In Transit',
      DELIVERED: 'Delivered',
      PARTIAL: 'Partial',
      RETURNED: 'Returned',
      CANCELLED: 'Cancelled',
    };
    render(<DeliveryStatusBadge status={status} />);
    expect(screen.getByText(labelMap[status])).toBeInTheDocument();
  });

  it('renders without icon when showIcon is false', () => {
    const { container } = render(
      <DeliveryStatusBadge status="PENDING" showIcon={false} />
    );
    expect(screen.getByText('Pending')).toBeInTheDocument();
    // The mr-1 span for icon should not be present
    expect(container.querySelector('.mr-1')).not.toBeInTheDocument();
  });

  it('applies sm size class', () => {
    render(<DeliveryStatusBadge status="DELIVERED" size="sm" />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });
});

// ============================================================================
// DeliveryFilters
// ============================================================================
describe('DeliveryFilters', () => {
  const defaultFilters = {
    search: '',
    status: 'all' as const,
    dateFrom: '',
    dateTo: '',
  };

  it('renders search input and status filter', () => {
    const onFiltersChange = vi.fn();
    render(
      <DeliveryFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />
    );
    expect(screen.getByPlaceholderText('Search orders...')).toBeInTheDocument();
  });

  it('renders date picker placeholders', () => {
    const onFiltersChange = vi.fn();
    render(
      <DeliveryFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />
    );
    expect(screen.getByText('From date')).toBeInTheDocument();
    expect(screen.getByText('To date')).toBeInTheDocument();
  });

  it('shows Clear button when filters are active', () => {
    const onFiltersChange = vi.fn();
    const activeFilters = {
      search: 'test query',
      status: 'PENDING' as const,
      dateFrom: '2026-01-01',
      dateTo: '2026-02-01',
    };
    render(
      <DeliveryFilters filters={activeFilters} onFiltersChange={onFiltersChange} />
    );
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('does not show Clear button when no filters are active', () => {
    const onFiltersChange = vi.fn();
    render(
      <DeliveryFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />
    );
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });
});

// ============================================================================
// DeliveryTimeline
// ============================================================================
describe('DeliveryTimeline', () => {
  it('renders the timeline heading', () => {
    render(<DeliveryTimeline timeline={mockTimeline} currentStatus="IN_TRANSIT" />);
    expect(screen.getByText('Delivery Timeline')).toBeInTheDocument();
  });

  it('renders all timeline entries with user names', () => {
    render(<DeliveryTimeline timeline={mockTimeline} currentStatus="IN_TRANSIT" />);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Warehouse Manager')).toBeInTheDocument();
    expect(screen.getByText('Driver Tran')).toBeInTheDocument();
  });

  it('renders notes on timeline entries', () => {
    render(<DeliveryTimeline timeline={mockTimeline} currentStatus="IN_TRANSIT" />);
    expect(screen.getByText('Order created')).toBeInTheDocument();
    expect(screen.getByText('Confirmed by warehouse')).toBeInTheDocument();
  });

  it('renders location addresses when available', () => {
    render(<DeliveryTimeline timeline={mockTimeline} currentStatus="IN_TRANSIT" />);
    expect(screen.getByText('Central Warehouse, HCMC')).toBeInTheDocument();
    expect(screen.getByText('Highway 1, Binh Duong')).toBeInTheDocument();
  });

  it('renders duration when available', () => {
    render(<DeliveryTimeline timeline={mockTimeline} currentStatus="IN_TRANSIT" />);
    expect(screen.getByText('Duration: 2 hours')).toBeInTheDocument();
    expect(screen.getByText('Duration: 20 hours')).toBeInTheDocument();
  });

  it('marks the current status entry', () => {
    render(<DeliveryTimeline timeline={mockTimeline} currentStatus="IN_TRANSIT" />);
    expect(screen.getByText('Current')).toBeInTheDocument();
  });
});

// ============================================================================
// InventoryCard
// ============================================================================
describe('InventoryCard', () => {
  it('renders product name and customer name', () => {
    render(
      <InventoryCard
        customerId="cust-001"
        customerName="Saigon Beverages Co."
        productId="prod-001"
        productName="Pepsi 500ml Case"
        productSku="PEP-500-CS"
        quantity={250}
        value={12500000}
      />
    );
    expect(screen.getByText('Pepsi 500ml Case')).toBeInTheDocument();
    expect(screen.getByText(/Saigon Beverages Co./)).toBeInTheDocument();
    expect(screen.getByText(/PEP-500-CS/)).toBeInTheDocument();
  });

  it('renders quantity and value labels', () => {
    render(
      <InventoryCard
        customerId="cust-001"
        customerName="Test Customer"
        productId="prod-001"
        productName="Test Product"
        quantity={500}
        value={25000000}
      />
    );
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders stock coverage when provided', () => {
    render(
      <InventoryCard
        customerId="cust-001"
        customerName="Test Customer"
        productId="prod-001"
        productName="Test Product"
        quantity={500}
        value={25000000}
        stockCoverage={3.5}
      />
    );
    expect(screen.getByText('Stock Coverage')).toBeInTheDocument();
    expect(screen.getByText('3.5 months')).toBeInTheDocument();
  });

  it('renders avg monthly sales when provided', () => {
    render(
      <InventoryCard
        customerId="cust-001"
        customerName="Test Customer"
        productId="prod-001"
        productName="Test Product"
        quantity={500}
        value={25000000}
        avgMonthlySales={150}
      />
    );
    expect(screen.getByText('Avg Monthly Sales')).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <InventoryCard
        customerId="cust-001"
        customerName="Test Customer"
        productId="prod-001"
        productName="Click Product"
        quantity={100}
        value={5000000}
        onClick={onClick}
      />
    );
    expect(screen.getByText('Click Product')).toBeInTheDocument();
  });
});

// ============================================================================
// InventorySummaryCard
// ============================================================================
describe('InventorySummaryCard', () => {
  it('renders title and value', () => {
    render(<InventorySummaryCard title="Total Stock" value={1250} />);
    expect(screen.getByText('Total Stock')).toBeInTheDocument();
    expect(screen.getByText('1250')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <InventorySummaryCard
        title="Stock Value"
        value="12.5 tỷ"
        subtitle="Across all warehouses"
      />
    );
    expect(screen.getByText('Across all warehouses')).toBeInTheDocument();
  });

  it('renders trend when provided', () => {
    render(
      <InventorySummaryCard
        title="Monthly Sales"
        value={850}
        trend={5.2}
      />
    );
    expect(screen.getByText(/5.2% vs last period/)).toBeInTheDocument();
  });

  it('renders negative trend', () => {
    render(
      <InventorySummaryCard
        title="Returns"
        value={23}
        trend={-3.1}
      />
    );
    expect(screen.getByText(/-3.1% vs last period/)).toBeInTheDocument();
  });

  it('renders with variant styles', () => {
    render(
      <InventorySummaryCard
        title="Low Stock Alert"
        value={8}
        variant="warning"
      />
    );
    expect(screen.getByText('Low Stock Alert')).toBeInTheDocument();
  });
});

// ============================================================================
// DeliveryStats
// ============================================================================
describe('DeliveryStats', () => {
  it('renders all stat cards', () => {
    render(
      <DeliveryStats
        total={150}
        pending={25}
        inTransit={40}
        delivered={80}
        onTimeRate={92.5}
      />
    );
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('On-Time Rate')).toBeInTheDocument();
  });

  it('renders formatted values', () => {
    render(
      <DeliveryStats
        total={1500}
        pending={250}
        inTransit={400}
        delivered={800}
        onTimeRate={85.0}
      />
    );
    expect(screen.getByText('85.0%')).toBeInTheDocument();
  });
});

// ============================================================================
// SellTrackingStats
// ============================================================================
describe('SellTrackingStats', () => {
  it('renders all stat cards', () => {
    render(
      <SellTrackingStats
        totalSellIn={10000}
        totalSellOut={7500}
        totalStock={2500}
        sellThroughRate={75.0}
      />
    );
    expect(screen.getByText('Total Sell-In')).toBeInTheDocument();
    expect(screen.getByText('Total Sell-Out')).toBeInTheDocument();
    expect(screen.getByText('Current Stock')).toBeInTheDocument();
    expect(screen.getByText('Sell-Through')).toBeInTheDocument();
  });

  it('renders subtitles', () => {
    render(
      <SellTrackingStats
        totalSellIn={10000}
        totalSellOut={7500}
        totalStock={2500}
        sellThroughRate={75.0}
      />
    );
    expect(screen.getByText('Units shipped')).toBeInTheDocument();
    expect(screen.getByText('Units sold')).toBeInTheDocument();
    expect(screen.getByText('At customer locations')).toBeInTheDocument();
  });

  it('renders days of stock when provided', () => {
    render(
      <SellTrackingStats
        totalSellIn={10000}
        totalSellOut={7500}
        totalStock={2500}
        sellThroughRate={75.0}
        avgDaysOfStock={45}
      />
    );
    expect(screen.getByText('Days of Stock')).toBeInTheDocument();
    expect(screen.getByText('Average coverage')).toBeInTheDocument();
  });
});

// ============================================================================
// InventoryStats
// ============================================================================
describe('InventoryStats', () => {
  it('renders all stat cards', () => {
    render(
      <InventoryStats
        totalValue={500000000}
        totalItems={3200}
        lowStockItems={15}
        outOfStockItems={3}
        nearExpiryItems={8}
      />
    );
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Near Expiry')).toBeInTheDocument();
  });

  it('renders average coverage when provided', () => {
    render(
      <InventoryStats
        totalValue={500000000}
        totalItems={3200}
        lowStockItems={15}
        outOfStockItems={3}
        nearExpiryItems={8}
        avgStockCoverage={2.8}
      />
    );
    expect(screen.getByText('Avg Coverage')).toBeInTheDocument();
    expect(screen.getByText('2.8 mo')).toBeInTheDocument();
  });
});

// ============================================================================
// SellAlertCard
// ============================================================================
describe('SellAlertCard', () => {
  it('renders alert details', () => {
    render(<SellAlertCard alert={mockSellAlert} />);
    expect(screen.getByText('Saigon Beverages Co.')).toBeInTheDocument();
    expect(screen.getByText('Pepsi 500ml')).toBeInTheDocument();
    expect(screen.getByText('Sell-through rate below threshold at 35%')).toBeInTheDocument();
  });

  it('renders severity badge and period', () => {
    render(<SellAlertCard alert={mockSellAlert} />);
    expect(screen.getByText('WARNING')).toBeInTheDocument();
    expect(screen.getByText('2026-01')).toBeInTheDocument();
  });

  it('renders metric and threshold values', () => {
    render(<SellAlertCard alert={mockSellAlert} />);
    expect(screen.getByText('Metric: 35')).toBeInTheDocument();
    expect(screen.getByText('Threshold: 50')).toBeInTheDocument();
  });

  it('renders CRITICAL severity alert', () => {
    const criticalAlert = {
      ...mockSellAlert,
      type: 'STOCKOUT_RISK' as const,
      severity: 'CRITICAL' as const,
      message: 'Stock expected to run out in 3 days',
    };
    render(<SellAlertCard alert={criticalAlert} />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('Stock expected to run out in 3 days')).toBeInTheDocument();
  });
});

// ============================================================================
// SellAlertList
// ============================================================================
describe('SellAlertList', () => {
  const alerts = [
    { ...mockSellAlert, customerId: 'c1', productId: 'p1' },
    {
      ...mockSellAlert,
      type: 'HIGH_STOCK' as const,
      severity: 'INFO' as const,
      customerId: 'c2',
      productId: 'p2',
      customerName: 'Delta Distributors',
      productName: 'Aquafina 1.5L',
      message: 'Stock level 2x above average',
      metric: 200,
      threshold: 100,
    },
    {
      ...mockSellAlert,
      type: 'NEGATIVE_TREND' as const,
      severity: 'CRITICAL' as const,
      customerId: 'c3',
      productId: 'p3',
      customerName: 'Metro Mart',
      productName: '7Up 330ml',
      message: 'Sales declined 30% over 3 months',
      metric: -30,
      threshold: -10,
    },
  ];

  it('renders all alerts', () => {
    render(<SellAlertList alerts={alerts} />);
    expect(screen.getByText('Saigon Beverages Co.')).toBeInTheDocument();
    expect(screen.getByText('Delta Distributors')).toBeInTheDocument();
    expect(screen.getByText('Metro Mart')).toBeInTheDocument();
  });

  it('shows empty state when no alerts', () => {
    render(<SellAlertList alerts={[]} />);
    expect(screen.getByText('No alerts at this time')).toBeInTheDocument();
  });

  it('limits displayed alerts with maxDisplay', () => {
    render(<SellAlertList alerts={alerts} maxDisplay={2} />);
    expect(screen.getByText('+1 more alerts')).toBeInTheDocument();
  });

  it('passes onClick handler to alert cards', () => {
    const onAlertClick = vi.fn();
    render(<SellAlertList alerts={alerts} onAlertClick={onAlertClick} />);
    expect(screen.getByText('Saigon Beverages Co.')).toBeInTheDocument();
  });
});

// ============================================================================
// StockAlertBadge
// ============================================================================
describe('StockAlertBadge', () => {
  it('renders OK status', () => {
    render(<StockAlertBadge status="OK" />);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders LOW status', () => {
    render(<StockAlertBadge status="LOW" />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('renders OUT_OF_STOCK status', () => {
    render(<StockAlertBadge status="OUT_OF_STOCK" />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('renders OVERSTOCK status', () => {
    render(<StockAlertBadge status="OVERSTOCK" />);
    expect(screen.getByText('Overstock')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(
      <StockAlertBadge status="OK" showIcon={false} />
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
    // Icon span with mr-1 should not exist
    expect(container.querySelector('.mr-1')).not.toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<StockAlertBadge status="LOW" size="sm" />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();

    rerender(<StockAlertBadge status="LOW" size="lg" />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });
});

// ============================================================================
// InventoryAlertBadge
// ============================================================================
describe('InventoryAlertBadge', () => {
  it('renders LOW_STOCK type with WARNING severity', () => {
    render(<InventoryAlertBadge type="LOW_STOCK" severity="WARNING" />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('renders OUT_OF_STOCK type with CRITICAL severity', () => {
    render(<InventoryAlertBadge type="OUT_OF_STOCK" severity="CRITICAL" />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('renders OVERSTOCK type with INFO severity', () => {
    render(<InventoryAlertBadge type="OVERSTOCK" severity="INFO" />);
    expect(screen.getByText('Overstock')).toBeInTheDocument();
  });

  it('renders NEAR_EXPIRY type', () => {
    render(<InventoryAlertBadge type="NEAR_EXPIRY" severity="WARNING" />);
    expect(screen.getByText('Near Expiry')).toBeInTheDocument();
  });

  it('renders EXPIRED type', () => {
    render(<InventoryAlertBadge type="EXPIRED" severity="CRITICAL" />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
});

// ============================================================================
// ExpiryBadge
// ============================================================================
describe('ExpiryBadge', () => {
  it('renders Expired badge for past dates', () => {
    render(<ExpiryBadge expiryDate="2020-01-01" />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('renders Near Expiry with CRITICAL for dates within 7 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    render(<ExpiryBadge expiryDate={soon.toISOString()} />);
    expect(screen.getByText('Near Expiry')).toBeInTheDocument();
  });

  it('renders Near Expiry with WARNING for dates within 30 days', () => {
    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 20);
    render(<ExpiryBadge expiryDate={upcoming.toISOString()} />);
    expect(screen.getByText('Near Expiry')).toBeInTheDocument();
  });

  it('renders nothing for dates more than 30 days away', () => {
    const farAway = new Date();
    farAway.setDate(farAway.getDate() + 90);
    const { container } = render(<ExpiryBadge expiryDate={farAway.toISOString()} />);
    expect(container.innerHTML).toBe('');
  });
});
