/**
 * Smoke tests for Operations > Inventory pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks
vi.mock('@/hooks/operations', () => ({
  useInventoryList: () => ({ data: undefined, isLoading: false }),
  useInventorySummary: () => ({ data: undefined }),
  useInventorySnapshot: () => ({ data: undefined, isLoading: false }),
  useDeleteInventorySnapshot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useInventoryHistory: () => ({ data: undefined }),
  useCreateInventorySnapshot: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportInventory: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({ data: undefined, isLoading: false }),
}));

// Mock operations components
vi.mock('@/components/operations/SnapshotImportDialog', () => ({
  SnapshotImportDialog: () => <div data-testid="snapshot-import-dialog" />,
}));

vi.mock('@/components/operations/StockDistributionChart', () => ({
  StockValueChart: () => <div data-testid="stock-value-chart" />,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

import InventoryList from '@/pages/operations/inventory/InventoryList';
import InventoryDetail from '@/pages/operations/inventory/InventoryDetail';
import InventoryNew from '@/pages/operations/inventory/InventoryNew';
import InventoryImport from '@/pages/operations/inventory/InventoryImport';
import InventorySnapshots from '@/pages/operations/inventory/InventorySnapshots';

describe('InventoryList', () => {
  it('renders without crashing', () => {
    render(<InventoryList />);
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('displays summary cards', () => {
    render(<InventoryList />);
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<InventoryList />);
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByText('Add Snapshot')).toBeInTheDocument();
  });
});

describe('InventoryDetail', () => {
  it('renders without crashing and shows not found', () => {
    render(<InventoryDetail />);
    expect(screen.getByText('Snapshot not found')).toBeInTheDocument();
  });
});

describe('InventoryNew', () => {
  it('renders without crashing', () => {
    render(<InventoryNew />);
    expect(screen.getByText('Add Inventory Snapshot')).toBeInTheDocument();
  });

  it('displays form sections', () => {
    render(<InventoryNew />);
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Inventory Data')).toBeInTheDocument();
  });
});

describe('InventoryImport', () => {
  it('renders without crashing', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Import Inventory Data')).toBeInTheDocument();
  });

  it('displays upload and format guide sections', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('CSV Format')).toBeInTheDocument();
  });
});

describe('InventorySnapshots', () => {
  it('renders without crashing', () => {
    render(<InventorySnapshots />);
    expect(screen.getByText('Inventory Snapshots')).toBeInTheDocument();
  });

  it('shows summary cards', () => {
    render(<InventorySnapshots />);
    expect(screen.getByText('Total Snapshots')).toBeInTheDocument();
    expect(screen.getByText('Total Quantity')).toBeInTheDocument();
  });
});
