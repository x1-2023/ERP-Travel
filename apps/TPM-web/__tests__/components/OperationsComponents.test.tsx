/**
 * Operations Components Tests
 * Tests for DeliveryForm, SellImportDialog, SnapshotImportDialog, StockDistributionChart
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks used by SellImportDialog and SnapshotImportDialog
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/hooks/operations', () => ({
  useImportSellTracking: () => ({
    mutateAsync: vi.fn(),
    isLoading: false,
  }),
  useImportInventory: () => ({
    mutateAsync: vi.fn(),
    isLoading: false,
  }),
}));

// Mock recharts for StockDistributionChart
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

import { DeliveryForm } from '@/components/operations/DeliveryForm';
import { SellImportDialog } from '@/components/operations/SellImportDialog';
import { SnapshotImportDialog } from '@/components/operations/SnapshotImportDialog';
import { StockDistributionChart } from '@/components/operations/StockDistributionChart';

// ============================================================================
// DeliveryForm
// ============================================================================
describe('DeliveryForm', () => {
  const customers = [
    { id: 'c1', code: 'CUST001', name: 'ABC Corp', address: '123 Main St' },
    { id: 'c2', code: 'CUST002', name: 'XYZ Inc' },
  ];
  const products = [
    { id: 'p1', code: 'PROD001', name: 'Widget A' },
    { id: 'p2', code: 'PROD002', name: 'Widget B' },
  ];
  const promotions = [
    { id: 'promo1', code: 'PROMO001', name: 'Summer Sale' },
  ];
  const onSubmit = vi.fn();

  it('renders without crashing', () => {
    render(
      <DeliveryForm
        customers={customers}
        products={products}
        promotions={promotions}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByText('Order Details')).toBeInTheDocument();
  });

  it('displays all form sections', () => {
    render(
      <DeliveryForm
        customers={customers}
        products={products}
        promotions={promotions}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByText('Order Details')).toBeInTheDocument();
    expect(screen.getByText('Delivery Information')).toBeInTheDocument();
    expect(screen.getByText('Line Items')).toBeInTheDocument();
  });

  it('shows the submit button', () => {
    render(
      <DeliveryForm
        customers={customers}
        products={products}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByText('Create Delivery Order')).toBeInTheDocument();
  });

  it('shows Add Item button', () => {
    render(
      <DeliveryForm
        customers={customers}
        products={products}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <DeliveryForm
        customers={customers}
        products={products}
        onSubmit={onSubmit}
        isLoading={true}
      />
    );
    const submitButton = screen.getByText('Create Delivery Order');
    expect(submitButton.closest('button')).toBeDisabled();
  });
});

// ============================================================================
// SellImportDialog
// ============================================================================
describe('SellImportDialog', () => {
  it('renders when open', () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Import Sell Tracking Data')).toBeInTheDocument();
  });

  it('shows upload area', () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Click to upload CSV file')).toBeInTheDocument();
  });

  it('shows Import Data button (disabled by default)', () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const importBtn = screen.getByText('Import Data');
    expect(importBtn.closest('button')).toBeDisabled();
  });

  it('shows Cancel button', () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});

// ============================================================================
// SnapshotImportDialog
// ============================================================================
describe('SnapshotImportDialog', () => {
  it('renders when open', () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Import Inventory Snapshots')).toBeInTheDocument();
  });

  it('shows description', () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Upload a CSV file to bulk import/)).toBeInTheDocument();
  });

  it('shows snapshot date field', () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Snapshot Date')).toBeInTheDocument();
  });

  it('shows Import Snapshots button (disabled by default)', () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const importBtn = screen.getByText('Import Snapshots');
    expect(importBtn.closest('button')).toBeDisabled();
  });
});

// ============================================================================
// StockDistributionChart
// ============================================================================
describe('StockDistributionChart', () => {
  it('renders with default title', () => {
    render(<StockDistributionChart />);
    expect(screen.getByText('Stock Distribution')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<StockDistributionChart title="Custom Distribution" />);
    expect(screen.getByText('Custom Distribution')).toBeInTheDocument();
  });

  it('renders status tab when byStatus data is provided', () => {
    const byStatus = [
      { status: 'OK' as const, count: 100, value: 50000 },
      { status: 'LOW' as const, count: 20, value: 10000 },
    ];
    render(<StockDistributionChart byStatus={byStatus} />);
    expect(screen.getByText('By Status')).toBeInTheDocument();
  });

  it('renders category tab when byCategory data is provided', () => {
    const byCategory = [
      { category: 'Beverages', quantity: 500, value: 100000 },
    ];
    render(<StockDistributionChart byCategory={byCategory} />);
    expect(screen.getByText('By Category')).toBeInTheDocument();
  });

  it('renders customer tab when byCustomer data is provided', () => {
    const byCustomer = [
      { customerId: 'c1', customerName: 'ABC Corp', quantity: 200, value: 40000 },
    ];
    render(<StockDistributionChart byCustomer={byCustomer} />);
    expect(screen.getByText('By Customer')).toBeInTheDocument();
  });
});
