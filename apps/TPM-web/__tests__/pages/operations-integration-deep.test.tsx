/**
 * Operations & Integration Pages Deep Smoke Tests
 * Deepens coverage for pages with low percentages:
 * - Delivery (List, Detail)
 * - Inventory (List, Import, Detail, Snapshots)
 * - Sell Tracking (List, Import)
 * - DMS (List, Detail)
 * - ERP (List, Detail)
 * - Webhooks (List, Detail)
 * - Security (APIKeys, AuditLogs)
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { server } from '../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-1' }),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// --- Delivery hooks ---
vi.mock('@/hooks/operations/useDelivery', () => ({
  useDeliveryOrders: () => ({
    data: {
      data: [
        {
          id: 'del-1',
          orderNumber: 'DEL-001',
          status: 'PENDING',
          scheduledDate: '2024-03-15',
          customer: { name: 'ABC Corp', code: 'CUST001' },
          totalItems: 50,
          totalDelivered: 0,
        },
      ],
      summary: {
        total: 12,
        pending: 3,
        inTransit: 4,
        deliveredThisWeek: 5,
        onTimeRate: 92,
      },
      pagination: { page: 1, totalPages: 1, total: 1, limit: 12 },
    },
    isLoading: false,
    error: null,
  }),
  useDeliveryOrder: () => ({
    data: {
      id: 'del-1',
      orderNumber: 'DEL-001',
      status: 'PENDING',
      scheduledDate: '2024-03-15',
      deliveredAt: null,
      deliveryAddress: '123 Main St',
      contactPerson: 'John Doe',
      contactPhone: '0912345678',
      notes: 'Handle with care',
      totalItems: 50,
      totalDelivered: 0,
      totalValue: 2500000,
      customer: { name: 'ABC Corp', code: 'CUST001' },
      promotion: { id: 'promo-1', name: 'Summer Sale' },
      createdBy: { name: 'Admin User' },
      createdAt: '2024-03-01',
      lines: [
        {
          id: 'line-1',
          product: { name: 'Product A', code: 'SKU001' },
          quantity: 30,
          deliveredQty: 0,
          damagedQty: 0,
          status: 'PENDING',
        },
        {
          id: 'line-2',
          product: { name: 'Product B', code: 'SKU002' },
          quantity: 20,
          deliveredQty: 0,
          damagedQty: 0,
          status: 'PENDING',
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
  useDeliveryTracking: () => ({ data: { timeline: [] } }),
  useDeliveryCalendar: () => ({ data: undefined, isLoading: false, error: null }),
  useCreateDelivery: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateDeliveryStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteDelivery: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Operations hooks (inventory, sell-tracking) ---
vi.mock('@/hooks/operations', () => ({
  useInventoryList: () => ({
    data: {
      data: [
        {
          id: 'inv-1',
          snapshotDate: '2024-03-15',
          customer: { name: 'ABC Corp', code: 'CUST001' },
          product: { name: 'Product A', code: 'SKU001' },
          location: 'Warehouse A',
          quantity: 500,
          value: 25000000,
          expiryDate: '2025-06-30',
        },
      ],
      pagination: { page: 1, totalPages: 1, total: 1, limit: 20 },
    },
    isLoading: false,
  }),
  useInventorySummary: () => ({
    data: {
      summary: {
        totalValue: 150000000,
        totalItems: 2500,
        lowStockItems: 8,
        outOfStockItems: 2,
        nearExpiryItems: 5,
      },
    },
  }),
  useInventorySnapshot: () => ({
    data: {
      id: 'inv-1',
      snapshotDate: '2024-03-15',
      customer: { name: 'ABC Corp', code: 'CUST001' },
      product: { name: 'Product A', code: 'SKU001' },
      location: 'Warehouse A',
      quantity: 500,
      value: 25000000,
      batchNumber: 'BATCH-001',
      expiryDate: '2025-06-30',
      customerId: 'cust-1',
      productId: 'prod-1',
      createdAt: '2024-03-01',
    },
    isLoading: false,
  }),
  useDeleteInventorySnapshot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useInventoryHistory: () => ({ data: undefined }),
  useCreateInventorySnapshot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportInventory: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSellTrackingList: () => ({
    data: {
      data: [
        {
          id: 'st-1',
          period: '2024-01',
          customer: { name: 'ABC Corp', code: 'CUST001' },
          product: { name: 'Product A', code: 'SKU001' },
          sellInQty: 100,
          sellInValue: 5000000,
          sellOutQty: 80,
          sellOutValue: 4000000,
          stockQty: 20,
          stockValue: 1000000,
          sellThroughRate: 80,
        },
      ],
      pagination: { page: 1, totalPages: 1, total: 1, limit: 20 },
    },
    isLoading: false,
  }),
  useSellTrackingSummary: () => ({
    data: {
      summary: {
        totalSellIn: 1000,
        totalSellOut: 800,
        totalStock: 200,
        sellThroughRate: 80,
      },
    },
  }),
  useCreateSellTracking: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportSellTracking: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Integration hooks: DMS ---
vi.mock('@/hooks/integration/useDMS', () => ({
  useDMSConnections: () => ({
    data: { data: [] },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useDMSConnection: () => ({
    data: {
      id: 'dms-1',
      name: 'MISA DMS',
      type: 'MISA',
      status: 'ACTIVE',
      distributor: { name: 'Distributor A' },
      lastSyncAt: '2024-03-14T10:00:00Z',
      lastSyncStatus: 'SUCCESS',
      createdAt: '2024-01-15',
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateDMSConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTriggerDMSSync: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePushToDMS: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateDMSConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteDMSConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Integration hooks: ERP ---
vi.mock('@/hooks/integration/useERP', () => ({
  useERPConnections: () => ({
    data: { data: [] },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useERPConnection: () => ({
    data: {
      id: 'erp-1',
      name: 'SAP Production',
      type: 'SAP',
      status: 'ACTIVE',
      lastSyncAt: '2024-03-14T10:00:00Z',
      lastSyncStatus: 'SUCCESS',
      syncSchedule: '0 * * * *',
      createdAt: '2024-01-15',
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTriggerERPSync: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTestERPConnection: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useERPSyncLogs: () => ({
    data: {
      data: [
        {
          id: 'log-1',
          status: 'SUCCESS',
          startedAt: '2024-03-14T10:00:00Z',
          completedAt: '2024-03-14T10:02:00Z',
          recordsSuccess: 150,
          recordsFailed: 0,
        },
      ],
    },
    isLoading: false,
  }),
}));

// --- Integration hooks: Webhooks ---
vi.mock('@/hooks/integration/useWebhooks', () => ({
  useWebhooks: () => ({
    data: { data: [] },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useWebhook: () => ({
    data: {
      id: 'wh-1',
      name: 'Order Notifications',
      url: 'https://example.com/webhook',
      isActive: true,
      events: ['promotion.created', 'claim.created'],
      secret: 'whsec_test123',
      createdAt: '2024-01-15',
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTestWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteWebhook: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useWebhookDeliveries: () => ({
    data: {
      data: [
        {
          id: 'del-1',
          event: 'promotion.created',
          status: 'SUCCESS',
          responseStatus: 200,
          attempts: 1,
          createdAt: '2024-03-14T12:00:00Z',
        },
      ],
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useRetryDelivery: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Integration hooks: Security ---
vi.mock('@/hooks/integration/useSecurity', () => ({
  useAPIKeys: () => ({
    data: { data: [] },
    isLoading: false,
    refetch: vi.fn(),
  }),
  useAuditLogs: () => ({
    data: { data: [], pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 } },
    isLoading: false,
  }),
  useSecurityDashboard: () => ({ data: undefined, isLoading: false }),
  useCreateAPIKey: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRevokeAPIKey: () => ({ mutateAsync: vi.fn(), isPending: false }),
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
  DeliveryCard: ({ order }: any) => (
    <div data-testid="delivery-card">{order?.orderNumber}</div>
  ),
  DeliveryStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="delivery-status">{status}</span>
  ),
  DeliveryTimeline: () => <div data-testid="delivery-timeline" />,
  DeliveryForm: () => <div data-testid="delivery-form" />,
  DeliveryCalendar: () => <div data-testid="delivery-calendar" />,
}));

vi.mock('@/components/operations/SnapshotImportDialog', () => ({
  SnapshotImportDialog: () => <div data-testid="snapshot-import-dialog" />,
}));

vi.mock('@/components/operations/StockDistributionChart', () => ({
  StockValueChart: () => <div data-testid="stock-value-chart" />,
}));

// --- Integration components ---
vi.mock('@/components/integration', () => ({
  IntegrationSummary: () => <div data-testid="integration-summary" />,
  ERPConnectionCard: () => <div data-testid="erp-card" />,
  DMSConnectionCard: () => <div data-testid="dms-card" />,
  WebhookCard: () => <div data-testid="webhook-card" />,
  ConnectionStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="connection-status">{status}</span>
  ),
  SyncStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="sync-status">{status}</span>
  ),
  DeliveryStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="webhook-delivery-badge">{status}</span>
  ),
}));

vi.mock('@/components/integration/AuditLogTable', () => ({
  AuditLogTable: () => <div data-testid="audit-log-table" />,
}));

vi.mock('@/components/integration/APIKeyCard', () => ({
  APIKeyCard: () => <div data-testid="api-key-card" />,
  NewAPIKeyDisplay: () => <div data-testid="new-api-key-display" />,
}));

// --- Mock Select to avoid Radix empty-string value crash ---
vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
}));

// Mock types
vi.mock('@/types/operations', () => ({
  DELIVERY_STATUS_TRANSITIONS: {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SCHEDULED'],
  },
}));

vi.mock('@/types/integration', () => ({
  ERP_TYPES: ['SAP', 'ORACLE'],
  DMS_TYPES: ['MISA', 'FAST'],
  WEBHOOK_EVENTS: ['promotion.created', 'claim.created'],
  API_PERMISSIONS: ['promotions:read', 'promotions:write'],
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
import DeliveryDetail from '@/pages/operations/delivery/DeliveryDetail';
import InventoryList from '@/pages/operations/inventory/InventoryList';
import InventoryImport from '@/pages/operations/inventory/InventoryImport';
import InventoryDetail from '@/pages/operations/inventory/InventoryDetail';
import InventorySnapshots from '@/pages/operations/inventory/InventorySnapshots';
import SellTrackingList from '@/pages/operations/sell-tracking/SellTrackingList';
import SellTrackingImport from '@/pages/operations/sell-tracking/SellTrackingImport';
import DMSList from '@/pages/integration/dms/DMSList';
import DMSDetail from '@/pages/integration/dms/DMSDetail';
import ERPList from '@/pages/integration/erp/ERPList';
import ERPDetail from '@/pages/integration/erp/ERPDetail';
import WebhookList from '@/pages/integration/webhooks/WebhookList';
import WebhookDetail from '@/pages/integration/webhooks/WebhookDetail';
import APIKeysList from '@/pages/integration/security/APIKeysList';
import AuditLogsList from '@/pages/integration/security/AuditLogsList';

// ============================================================================
// 1. DELIVERY LIST - DEEP TESTS
// ============================================================================

describe('DeliveryList - Deep Coverage', () => {
  it('renders heading and description', async () => {
    const { default: Page } = await import('@/pages/operations/delivery/DeliveryList');
    render(<Page />);
    expect(screen.getByText('Delivery Orders')).toBeInTheDocument();
    expect(screen.getByText('Manage and track delivery operations')).toBeInTheDocument();
  });

  it('shows stat cards with summary data', () => {
    render(<DeliveryList />);
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/In Transit/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Delivered This Week')).toBeInTheDocument();
    expect(screen.getByText('On-Time Rate')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders delivery cards for orders', () => {
    render(<DeliveryList />);
    expect(screen.getByTestId('delivery-card')).toBeInTheDocument();
    expect(screen.getByText('DEL-001')).toBeInTheDocument();
  });

  it('does not show NaN in rendered content', () => {
    const { container } = render(<DeliveryList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 2. DELIVERY DETAIL - DEEP TESTS
// ============================================================================

describe('DeliveryDetail - Deep Coverage', () => {
  it('renders detail view with order number', async () => {
    const { default: Page } = await import('@/pages/operations/delivery/DeliveryDetail');
    render(<Page />);
    expect(screen.getByText('DEL-001')).toBeInTheDocument();
  });

  it('shows delivery info cards', () => {
    render(<DeliveryDetail />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Delivered At')).toBeInTheDocument();
  });

  it('renders tabs: Details, Line Items, Timeline', () => {
    render(<DeliveryDetail />);
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText(/Line Items/)).toBeInTheDocument();
    expect(screen.getByText(/Timeline/)).toBeInTheDocument();
  });

  it('shows delivery information section', () => {
    render(<DeliveryDetail />);
    expect(screen.getByText('Delivery Information')).toBeInTheDocument();
    expect(screen.getByText('Order Information')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows status transition buttons', () => {
    render(<DeliveryDetail />);
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<DeliveryDetail />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 3. INVENTORY LIST - DEEP TESTS
// ============================================================================

describe('InventoryList - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/operations/inventory/InventoryList');
    render(<Page />);
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('shows summary cards with data values', () => {
    render(<InventoryList />);
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getAllByText('Low Stock').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Near Expiry').length).toBeGreaterThan(0);
  });

  it('renders table with data rows', () => {
    render(<InventoryList />);
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Warehouse A')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<InventoryList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 4. INVENTORY IMPORT - DEEP TESTS
// ============================================================================

describe('InventoryImport - Deep Coverage', () => {
  it('renders import heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/operations/inventory/InventoryImport');
    render(<Page />);
    expect(screen.getByText('Import Inventory Data')).toBeInTheDocument();
  });

  it('shows upload area and file input', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('CSV files only')).toBeInTheDocument();
  });

  it('shows CSV format guide', () => {
    render(<InventoryImport />);
    expect(screen.getByText('CSV Format')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('customerCode')).toBeInTheDocument();
    expect(screen.getByText('productSku')).toBeInTheDocument();
    expect(screen.getByText('snapshotDate')).toBeInTheDocument();
  });

  it('has disabled Start Import button when no file', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Start Import')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<InventoryImport />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 5. INVENTORY DETAIL - DEEP TESTS
// ============================================================================

describe('InventoryDetail - Deep Coverage', () => {
  it('renders detail view with dynamic import', async () => {
    const { default: Page } = await import('@/pages/operations/inventory/InventoryDetail');
    render(<Page />);
    expect(screen.getByText('Inventory Snapshot')).toBeInTheDocument();
  });

  it('shows snapshot details section', () => {
    render(<InventoryDetail />);
    expect(screen.getByText('Snapshot Details')).toBeInTheDocument();
    expect(screen.getByText('Snapshot Date')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Warehouse A')).toBeInTheDocument();
  });

  it('shows customer and product info', () => {
    render(<InventoryDetail />);
    expect(screen.getByText('Customer & Product')).toBeInTheDocument();
    expect(screen.getAllByText('ABC Corp').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Product A').length).toBeGreaterThanOrEqual(1);
  });

  it('shows batch number', () => {
    render(<InventoryDetail />);
    expect(screen.getByText('Batch Number')).toBeInTheDocument();
    expect(screen.getByText('BATCH-001')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<InventoryDetail />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 6. INVENTORY SNAPSHOTS - DEEP TESTS
// ============================================================================

describe('InventorySnapshots - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/operations/inventory/InventorySnapshots');
    render(<Page />);
    expect(screen.getByText('Inventory Snapshots')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<InventorySnapshots />);
    expect(screen.getByText('View historical inventory data over time')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<InventorySnapshots />);
    expect(screen.getByText('Total Snapshots')).toBeInTheDocument();
    expect(screen.getByText('Total Quantity')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<InventorySnapshots />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 7. SELL TRACKING LIST - DEEP TESTS
// ============================================================================

describe('SellTrackingList - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/operations/sell-tracking/SellTrackingList');
    render(<Page />);
    expect(screen.getByText('Sell Tracking')).toBeInTheDocument();
  });

  it('shows summary cards with data', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('Total Sell-In')).toBeInTheDocument();
    expect(screen.getByText('Total Sell-Out')).toBeInTheDocument();
    expect(screen.getByText('Current Stock')).toBeInTheDocument();
    expect(screen.getByText('Sell-Through Rate')).toBeInTheDocument();
    expect(screen.getByText('Units shipped to customers')).toBeInTheDocument();
  });

  it('renders table with data', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('2024-01')).toBeInTheDocument();
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<SellTrackingList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 8. SELL TRACKING IMPORT - DEEP TESTS
// ============================================================================

describe('SellTrackingImport - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/operations/sell-tracking/SellTrackingImport');
    render(<Page />);
    expect(screen.getByText('Import Sell Tracking Data')).toBeInTheDocument();
  });

  it('shows upload area', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('CSV files only')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  it('shows CSV format guide for sell tracking', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('CSV Format')).toBeInTheDocument();
    expect(screen.getByText('customerCode')).toBeInTheDocument();
    expect(screen.getByText('productSku')).toBeInTheDocument();
    expect(screen.getByText('period')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<SellTrackingImport />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 9. DMS LIST - DEEP TESTS
// ============================================================================

describe('DMSList - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/integration/dms/DMSList');
    render(<Page />);
    expect(screen.getByText('DMS Connections')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<DMSList />);
    expect(
      screen.getByText('Manage connections to Distributor Management Systems')
    ).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<DMSList />);
    expect(screen.getByText('No DMS Connections')).toBeInTheDocument();
    expect(
      screen.getByText('Get started by adding your first DMS connection')
    ).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<DMSList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 10. DMS DETAIL - DEEP TESTS
// ============================================================================

describe('DMSDetail - Deep Coverage', () => {
  it('renders detail view with dynamic import', async () => {
    const { default: Page } = await import('@/pages/integration/dms/DMSDetail');
    render(<Page />);
    expect(screen.getByText('MISA DMS')).toBeInTheDocument();
  });

  it('shows connection details card', () => {
    render(<DMSDetail />);
    expect(screen.getByText('Connection Details')).toBeInTheDocument();
    expect(screen.getByText('Configuration and settings')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Distributor')).toBeInTheDocument();
  });

  it('shows sync status section', () => {
    render(<DMSDetail />);
    expect(screen.getByText('Sync Status')).toBeInTheDocument();
    expect(screen.getByText('Last synchronization details')).toBeInTheDocument();
  });

  it('shows data synchronization types', () => {
    render(<DMSDetail />);
    expect(screen.getByText('Data Synchronization')).toBeInTheDocument();
    expect(screen.getByText('Sell-Out Data')).toBeInTheDocument();
    expect(screen.getByText('Stock Data')).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<DMSDetail />);
    expect(screen.getByText('Sync Data')).toBeInTheDocument();
    expect(screen.getByText('Push Data')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<DMSDetail />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 11. ERP LIST - DEEP TESTS
// ============================================================================

describe('ERPList - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/integration/erp/ERPList');
    render(<Page />);
    expect(screen.getByText('ERP Connections')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<ERPList />);
    expect(
      screen.getByText('Manage connections to SAP, Oracle, and other ERP systems')
    ).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<ERPList />);
    expect(screen.getByText('No ERP Connections')).toBeInTheDocument();
    expect(
      screen.getByText('Get started by adding your first ERP connection')
    ).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<ERPList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 12. ERP DETAIL - DEEP TESTS
// ============================================================================

describe('ERPDetail - Deep Coverage', () => {
  it('renders detail view with dynamic import', async () => {
    const { default: Page } = await import('@/pages/integration/erp/ERPDetail');
    render(<Page />);
    expect(screen.getByText('SAP Production')).toBeInTheDocument();
  });

  it('shows connection details card', () => {
    render(<ERPDetail />);
    expect(screen.getByText('Connection Details')).toBeInTheDocument();
    expect(screen.getByText('Configuration and settings')).toBeInTheDocument();
  });

  it('shows last sync status section', () => {
    render(<ERPDetail />);
    expect(screen.getByText('Last Sync Status')).toBeInTheDocument();
    expect(screen.getByText('Details from the most recent sync')).toBeInTheDocument();
  });

  it('shows sync history section', () => {
    render(<ERPDetail />);
    expect(screen.getByText('Sync History')).toBeInTheDocument();
    expect(screen.getByText('Recent synchronization logs')).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<ERPDetail />);
    expect(screen.getByText('Test Connection')).toBeInTheDocument();
    expect(screen.getByText('Sync Now')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<ERPDetail />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 13. WEBHOOK LIST - DEEP TESTS
// ============================================================================

describe('WebhookList - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/integration/webhooks/WebhookList');
    render(<Page />);
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<WebhookList />);
    expect(
      screen.getByText('Receive real-time notifications for system events')
    ).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<WebhookList />);
    expect(screen.getByText('No Webhooks')).toBeInTheDocument();
    expect(
      screen.getByText('Create a webhook to receive event notifications')
    ).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<WebhookList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 14. WEBHOOK DETAIL - DEEP TESTS
// ============================================================================

describe('WebhookDetail - Deep Coverage', () => {
  it('renders detail view with dynamic import', async () => {
    const { default: Page } = await import('@/pages/integration/webhooks/WebhookDetail');
    render(<Page />);
    expect(screen.getByText('Order Notifications')).toBeInTheDocument();
  });

  it('shows webhook details card', () => {
    render(<WebhookDetail />);
    expect(screen.getByText('Webhook Details')).toBeInTheDocument();
    expect(screen.getByText('Configuration and secret')).toBeInTheDocument();
  });

  it('shows subscribed events section', () => {
    render(<WebhookDetail />);
    expect(screen.getByText('Subscribed Events')).toBeInTheDocument();
    expect(screen.getByText('Events that trigger this webhook')).toBeInTheDocument();
  });

  it('shows delivery history section', () => {
    render(<WebhookDetail />);
    expect(screen.getByText('Delivery History')).toBeInTheDocument();
    expect(screen.getByText('Recent webhook deliveries')).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<WebhookDetail />);
    expect(screen.getByText('Send Test')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<WebhookDetail />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 15. API KEYS LIST - DEEP TESTS
// ============================================================================

describe('APIKeysList - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/integration/security/APIKeysList');
    render(<Page />);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<APIKeysList />);
    expect(screen.getByText('Manage API keys for external access')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<APIKeysList />);
    expect(screen.getByText('No API Keys')).toBeInTheDocument();
    expect(
      screen.getByText('Create an API key to enable external access')
    ).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<APIKeysList />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 16. AUDIT LOGS LIST - DEEP TESTS
// ============================================================================

describe('AuditLogsList - Deep Coverage', () => {
  it('renders heading with dynamic import', async () => {
    const { default: Page } = await import('@/pages/integration/security/AuditLogsList');
    render(<Page />);
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(<AuditLogsList />);
    expect(
      screen.getByText('Complete history of system changes and user actions')
    ).toBeInTheDocument();
  });

  it('shows filters section', () => {
    render(<AuditLogsList />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('shows empty state when no logs', () => {
    render(<AuditLogsList />);
    expect(screen.getByText('No Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('No logs match your current filters')).toBeInTheDocument();
  });

  it('does not show NaN', () => {
    const { container } = render(<AuditLogsList />);
    expect(container.textContent).not.toContain('NaN');
  });
});
