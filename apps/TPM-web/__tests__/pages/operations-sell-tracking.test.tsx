/**
 * Smoke tests for Operations > Sell Tracking pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks
vi.mock('@/hooks/operations', () => ({
  useSellTrackingList: () => ({ data: undefined, isLoading: false }),
  useSellTrackingSummary: () => ({ data: undefined }),
  useCreateSellTracking: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportSellTracking: () => ({ mutateAsync: vi.fn(), isPending: false }),
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

// Mock operations chart components
vi.mock('@/components/operations/SellTrendChart', () => ({
  SellTrendChart: () => <div data-testid="sell-trend-chart" />,
}));

// Mock stat card components
vi.mock('@/components/ui/stat-card', () => ({
  StatCard: ({ title }: { title: string }) => <div data-testid="stat-card">{title}</div>,
  StatCardGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="stat-card-group">{children}</div>,
}));

// Mock api module for sell-in/sell-out direct useQuery calls
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
  },
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

import SellTrackingList from '@/pages/operations/sell-tracking/SellTrackingList';
import SellInPage from '@/pages/operations/sell-tracking/SellInPage';
import SellOutPage from '@/pages/operations/sell-tracking/SellOutPage';
import SellTrackingNew from '@/pages/operations/sell-tracking/SellTrackingNew';
import SellTrackingImport from '@/pages/operations/sell-tracking/SellTrackingImport';

describe('SellTrackingList', () => {
  it('renders without crashing', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('Sell Tracking')).toBeInTheDocument();
  });

  it('shows summary cards', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('Total Sell-In')).toBeInTheDocument();
    expect(screen.getByText('Total Sell-Out')).toBeInTheDocument();
    expect(screen.getByText('Current Stock')).toBeInTheDocument();
  });

  it('displays action buttons', () => {
    render(<SellTrackingList />);
    expect(screen.getByText('Add Record')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});

describe('SellInPage', () => {
  it('renders without crashing', () => {
    render(<SellInPage />);
    expect(screen.getByText('Sell-In Analysis')).toBeInTheDocument();
  });

  it('shows filter tabs', () => {
    render(<SellInPage />);
    expect(screen.getByText('By Period')).toBeInTheDocument();
    expect(screen.getByText('By Customer')).toBeInTheDocument();
  });
});

describe('SellOutPage', () => {
  it('renders without crashing', () => {
    render(<SellOutPage />);
    expect(screen.getByText('Sell-Out Analysis')).toBeInTheDocument();
  });

  it('shows filter tabs', () => {
    render(<SellOutPage />);
    expect(screen.getByText('By Period')).toBeInTheDocument();
    expect(screen.getByText('By Product')).toBeInTheDocument();
  });
});

describe('SellTrackingNew', () => {
  it('renders without crashing', () => {
    render(<SellTrackingNew />);
    expect(screen.getByText('Add Sell Tracking Record')).toBeInTheDocument();
  });

  it('displays form sections', () => {
    render(<SellTrackingNew />);
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Sell-In / Sell-Out Data')).toBeInTheDocument();
  });
});

describe('SellTrackingImport', () => {
  it('renders without crashing', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Import Sell Tracking Data')).toBeInTheDocument();
  });

  it('shows upload and format guide sections', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('CSV Format')).toBeInTheDocument();
  });
});
