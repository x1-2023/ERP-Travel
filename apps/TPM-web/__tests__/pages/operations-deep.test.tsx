/**
 * Operations Pages Deep Smoke Tests
 * Deepens coverage for DeliveryList, InventoryList, SellTrackingList
 * Tests more code paths: summary cards, filters, empty states, pagination area
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// --- Delivery hooks ---
vi.mock('@/hooks/operations/useDelivery', () => ({
  useDeliveryOrders: () => ({
    data: undefined,
    isLoading: false,
    error: null,
  }),
  useDeliveryOrder: () => ({
    data: undefined,
    isLoading: false,
    error: null,
  }),
  useDeliveryTracking: () => ({ data: undefined }),
  useDeliveryCalendar: () => ({
    data: undefined,
    isLoading: false,
    error: null,
  }),
  useCreateDelivery: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateDeliveryStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteDelivery: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Operations hooks (inventory, sell-tracking) ---
vi.mock('@/hooks/operations', () => ({
  useInventoryList: () => ({ data: undefined, isLoading: false }),
  useInventorySummary: () => ({ data: undefined }),
  useInventorySnapshot: () => ({ data: undefined, isLoading: false }),
  useDeleteInventorySnapshot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useInventoryHistory: () => ({ data: undefined }),
  useCreateInventorySnapshot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportInventory: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSellTrackingList: () => ({ data: undefined, isLoading: false }),
  useSellTrackingSummary: () => ({ data: undefined }),
  useCreateSellTracking: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportSellTracking: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Shared hooks ---
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/usePromotions', () => ({
  usePromotions: () => ({ data: undefined, isLoading: false }),
}));

// --- Operations components ---
vi.mock('@/components/operations', () => ({
  DeliveryCard: () => <div data-testid="delivery-card" />,
  DeliveryStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="delivery-status">{status}</span>
  ),
  DeliveryTimeline: () => <div data-testid="delivery-timeline" />,
  DeliveryForm: () => <div data-testid="delivery-form" />,
  DeliveryCalendar: () => <div data-testid="delivery-calendar" />,
}));

// Mock types
vi.mock('@/types/operations', () => ({
  DELIVERY_STATUS_TRANSITIONS: {},
}));

// Mock LoadingSpinner
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: ({ fullScreen }: any) => (
    <div data-testid="loading-spinner">{fullScreen ? 'Full Screen' : 'Inline'}</div>
  ),
}));

// ============================================================================
// IMPORTS (after mocks)
// ============================================================================

import DeliveryList from '@/pages/operations/delivery/DeliveryList';
import InventoryList from '@/pages/operations/inventory/InventoryList';
import SellTrackingList from '@/pages/operations/sell-tracking/SellTrackingList';

// ============================================================================
// DELIVERY LIST - DEEP TESTS
// ============================================================================

describe('DeliveryList - Deep', () => {
  it('renders without crashing', () => {
    render(<DeliveryList />);
    expect(screen.getByText('Delivery Orders')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<DeliveryList />);
    expect(
      screen.getByText('Manage and track delivery operations')
    ).toBeInTheDocument();
  });

  it('renders Calendar View and New Order action buttons', () => {
    render(<DeliveryList />);
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
    expect(screen.getByText('New Order')).toBeInTheDocument();
  });

  it('shows empty state with no orders message', () => {
    render(<DeliveryList />);
    expect(screen.getByText('No orders found')).toBeInTheDocument();
    expect(
      screen.getByText('Create your first delivery order to get started.')
    ).toBeInTheDocument();
  });

  it('shows Create Order button in empty state', () => {
    render(<DeliveryList />);
    expect(screen.getByText('Create Order')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<DeliveryList />);
    expect(screen.getByPlaceholderText('Search orders...')).toBeInTheDocument();
  });

  it('renders status filter dropdown', () => {
    render(<DeliveryList />);
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });
});

// ============================================================================
// INVENTORY LIST - DEEP TESTS
// ============================================================================

describe('InventoryList - Deep', () => {
  it('renders without crashing', () => {
    render(<InventoryList />);
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<InventoryList />);
    expect(
      screen.getByText('Monitor inventory levels at customer locations')
    ).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<InventoryList />);
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Near Expiry')).toBeInTheDocument();
  });

  it('renders summary card descriptions', () => {
    render(<InventoryList />);
    expect(screen.getByText('Items need restocking')).toBeInTheDocument();
    expect(screen.getByText('Require immediate attention')).toBeInTheDocument();
    expect(screen.getByText('Expiring within 30 days')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<InventoryList />);
    expect(screen.getByText('View History')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Add Snapshot')).toBeInTheDocument();
  });

  it('renders filter area with status dropdown', () => {
    render(<InventoryList />);
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });

  it('renders Low Stock Only checkbox', () => {
    render(<InventoryList />);
    expect(screen.getByText('Low Stock Only')).toBeInTheDocument();
    expect(screen.getByLabelText('Low Stock Only')).toBeInTheDocument();
  });

  it('renders Near Expiry Only checkbox', () => {
    render(<InventoryList />);
    expect(screen.getByText('Near Expiry Only')).toBeInTheDocument();
    expect(screen.getByLabelText('Near Expiry Only')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<InventoryList />);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Expiry')).toBeInTheDocument();
  });

  it('shows table structure when no data', () => {
    render(<InventoryList />);
    // When data is undefined, data?.data?.map returns undefined (no rows)
    // Table headers still render; verify table is present
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders per-page selector', () => {
    render(<InventoryList />);
    expect(screen.getByText('20 per page')).toBeInTheDocument();
  });
});

// ============================================================================
// SELL TRACKING LIST - DEEP TESTS
// ============================================================================

describe('SellTrackingList - Deep', () => {
  it('renders without crashing', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('Sell Tracking')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<SellTrackingList />);
    expect(
      screen.getByText(
        'Track sell-in, sell-out, and inventory at customer locations'
      )
    ).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('Total Sell-In')).toBeInTheDocument();
    expect(screen.getByText('Total Sell-Out')).toBeInTheDocument();
    expect(screen.getByText('Current Stock')).toBeInTheDocument();
    expect(screen.getByText('Sell-Through Rate')).toBeInTheDocument();
  });

  it('renders summary card descriptions', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('Units shipped to customers')).toBeInTheDocument();
    expect(screen.getByText('Units sold by customers')).toBeInTheDocument();
    expect(screen.getByText('Units at customer locations')).toBeInTheDocument();
    expect(screen.getByText('Overall performance')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<SellTrackingList />);
    // "Sell-In" and "Sell-Out" appear in both nav buttons and table headers
    expect(screen.getAllByText('Sell-In').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Sell-Out').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Add Record')).toBeInTheDocument();
  });

  it('renders filter area with search and period inputs', () => {
    render(<SellTrackingList />);
    expect(
      screen.getByPlaceholderText('Search by period...')
    ).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    // "Sell-In" and "Sell-Out" appear in both nav buttons and table headers
    expect(screen.getAllByText('Sell-In').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Sell-Out').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Sell-Through')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('shows table structure when no data', () => {
    render(<SellTrackingList />);
    // When data is undefined, data?.data?.map returns undefined (no rows)
    // Table headers still render; verify table is present
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('renders per-page selector', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('20 per page')).toBeInTheDocument();
  });
});
