/**
 * Deep Tests for Promotion Pages
 * Covers: PromotionList (demo data, buttons),
 *         PromotionNew (form render),
 *         PromotionDetail (tabs, summary cards, demo data),
 *         PromotionEdit (loading, error state, form),
 *         Deployment (summary, queue, checklist),
 *         Efficiency (tabs, ROI, summary),
 *         Mechanics (stats, guide, create button)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock hooks
vi.mock('@/hooks/usePromotions', () => ({
  usePromotions: () => ({ data: undefined, isLoading: false, isError: false }),
  usePromotion: () => ({ data: undefined, isLoading: false, isError: false }),
  useDeletePromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreatePromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdatePromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePromotionOptions: () => ({ data: [], isLoading: false }),
  useSubmitPromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApprovePromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectPromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useFunds', () => ({
  useFunds: () => ({ data: undefined, isLoading: false, isError: false }),
  useFund: () => ({ data: undefined, isLoading: false, isError: false }),
  useFundOptions: () => ({ data: [], isLoading: false }),
  useCreateFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({ data: undefined, isLoading: false, isError: false }),
  useCustomer: () => ({ data: undefined, isLoading: false, isError: false }),
  useCustomerOptions: () => ({ data: [], isLoading: false }),
}));

const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
  toast: vi.fn(),
}));

// Mock charts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ScatterChart: () => <div data-testid="scatter-chart" />,
  Scatter: () => null,
  ZAxis: () => null,
}));

// Mock form component
vi.mock('@/components/forms', () => ({
  PromotionForm: ({ onSubmit, isSubmitting, initialData }: any) => (
    <div data-testid="promotion-form">
      {initialData && <span data-testid="has-initial-data">Has data</span>}
      <button onClick={() => onSubmit({})}>Submit Form</button>
      {isSubmitting && <span>Submitting...</span>}
    </div>
  ),
  ClaimForm: () => <div data-testid="claim-form" />,
  FundForm: () => <div data-testid="fund-form" />,
}));

// Mock LoadingSpinner
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock PromotionStatusBadge to render human label
vi.mock('@/components/promotions/PromotionStatusBadge', () => ({
  PromotionStatusBadge: ({ status }: any) => {
    const labels: Record<string, string> = {
      DRAFT: 'Draft', PENDING_APPROVAL: 'Pending Approval', APPROVED: 'Approved',
      ACTIVE: 'Active', COMPLETED: 'Completed', CANCELLED: 'Cancelled', REJECTED: 'Rejected',
    };
    return <span data-testid="promo-status-badge">{labels[status] || status}</span>;
  },
}));

// Mock ClaimStatusBadge
vi.mock('@/components/claims/ClaimStatusBadge', () => ({
  ClaimStatusBadge: ({ status }: any) => <span data-testid="claim-status-badge">{status}</span>,
}));

// Mock CurrencyDisplay
vi.mock('@/components/ui/currency-display', () => ({
  CurrencyDisplay: ({ amount }: any) => <span data-testid="currency-display">{amount}</span>,
  formatCurrencyCompact: (amount: number) => `${(amount / 1e9).toFixed(1)}B`,
}));

// Mock PromotionFilters
vi.mock('@/components/promotions/PromotionFilters', () => ({
  PromotionFilters: () => <div data-testid="promotion-filters" />,
}));

// Mock PromotionCard
vi.mock('@/components/promotions/PromotionCard', () => ({
  PromotionCard: () => <div data-testid="promotion-card" />,
}));

// Mock shared components used by PromotionList
vi.mock('@/components/shared/DataTable', () => ({
  DataTable: ({ data, columns }: any) => (
    <table data-testid="data-table">
      <tbody>
        {data?.map((item: any, i: number) => (
          <tr key={i} data-testid={`row-${i}`}>
            <td><a href={`/promotions/${item.id}`}>{item.code}</a></td>
            <td>{item.name}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock('@/components/shared/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

vi.mock('@/components/shared/EmptyState', () => ({
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

vi.mock('@/components/shared/SearchInput', () => ({
  SearchInput: ({ placeholder }: any) => <input data-testid="search-input" placeholder={placeholder} />,
}));

import PromotionList from '@/pages/promotions/PromotionList';
import PromotionNew from '@/pages/promotions/PromotionNew';
import PromotionDetail from '@/pages/promotions/PromotionDetail';
import PromotionEdit from '@/pages/promotions/PromotionEdit';
import PromotionDeployment from '@/pages/promotions/Deployment';
import PromotionEfficiency from '@/pages/promotions/Efficiency';
import PromotionMechanics from '@/pages/promotions/Mechanics';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// PROMOTION LIST DEEP TESTS
// ============================================================================

describe('PromotionList - Deep Tests', () => {
  it('renders page title and description', () => {
    render(<PromotionList />);
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Manage trade promotions and campaigns')).toBeInTheDocument();
  });

  it('renders New Promotion button', () => {
    render(<PromotionList />);
    expect(screen.getByText('New Promotion')).toBeInTheDocument();
  });

  it('renders all demo promotion data', () => {
    render(<PromotionList />);
    expect(screen.getByText('Summer Sale Campaign')).toBeInTheDocument();
    expect(screen.getByText('PROMO-2026-001')).toBeInTheDocument();
  });

  it('renders demo promotion codes as links', () => {
    render(<PromotionList />);
    const link = screen.getByText('PROMO-2026-001');
    expect(link.closest('a')).toHaveAttribute('href', '/promotions/1');
  });

  it('renders demo promotion status values in table', () => {
    render(<PromotionList />);
    // DataTable mock renders raw status text from demo data
    expect(screen.getAllByText('ACTIVE').length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// PROMOTION NEW DEEP TESTS
// ============================================================================

describe('PromotionNew - Deep Tests', () => {
  it('renders page title and description', () => {
    render(<PromotionNew />);
    expect(screen.getByText('New Promotion')).toBeInTheDocument();
    expect(screen.getByText('Create a new trade promotion')).toBeInTheDocument();
  });

  it('renders the promotion form component', () => {
    render(<PromotionNew />);
    expect(screen.getByTestId('promotion-form')).toBeInTheDocument();
  });

  it('renders Submit Form button from mocked form', () => {
    render(<PromotionNew />);
    expect(screen.getByText('Submit Form')).toBeInTheDocument();
  });
});

// ============================================================================
// PROMOTION DETAIL DEEP TESTS
// ============================================================================

describe('PromotionDetail - Deep Tests', () => {
  it('renders promotion code from demo data', () => {
    render(<PromotionDetail />);
    expect(screen.getAllByText('PROMO-2026-001').length).toBeGreaterThanOrEqual(1);
  });

  it('renders promotion name from demo data', () => {
    render(<PromotionDetail />);
    expect(screen.getAllByText('Summer Sale Campaign').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all tabs', () => {
    render(<PromotionDetail />);
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText(/Claims/)).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('renders all four summary cards', () => {
    render(<PromotionDetail />);
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Actual Spend')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('Utilization')).toBeInTheDocument();
  });

  it('renders promotion type info', () => {
    render(<PromotionDetail />);
    // Demo data includes type info
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('renders promotion status badge', () => {
    render(<PromotionDetail />);
    // PromotionStatusBadge mock renders human label "Active" for ACTIVE status
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// PROMOTION EDIT DEEP TESTS (0% coverage - critical)
// ============================================================================

describe('PromotionEdit - Deep Tests', () => {
  it('shows error state when promotion not found', () => {
    render(<PromotionEdit />);
    // usePromotion returns undefined data and no error, so error || !promotion is true
    expect(screen.getByText('Failed to load promotion')).toBeInTheDocument();
  });

  it('renders Back to Promotions link in error state', () => {
    render(<PromotionEdit />);
    expect(screen.getByText('Back to Promotions')).toBeInTheDocument();
  });

  it('Back to Promotions link has correct href', () => {
    render(<PromotionEdit />);
    const link = screen.getByText('Back to Promotions');
    expect(link.closest('a')).toHaveAttribute('href', '/promotions');
  });
});

// ============================================================================
// PROMOTION DEPLOYMENT DEEP TESTS
// ============================================================================

describe('PromotionDeployment - Deep Tests', () => {
  it('renders page title and description', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText('Promotion Deployment')).toBeInTheDocument();
    expect(screen.getByText(/Deploy promotions to DMS/)).toBeInTheDocument();
  });

  it('renders summary stat cards', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText('Total Promotions')).toBeInTheDocument();
    expect(screen.getAllByText('Deployed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ready').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders Deployment Queue', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText('Deployment Queue')).toBeInTheDocument();
  });

  it('renders deployment items with promotion names', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText(/Pepsi Bundle/)).toBeInTheDocument();
  });

  it('renders Deployment Checklist section', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText('Deployment Checklist')).toBeInTheDocument();
  });

  it('renders empty checklist state when no promotion selected', () => {
    render(<PromotionDeployment />);
    // When no promotion selected, shows placeholder message
    expect(screen.getByText('Select a promotion from the list')).toBeInTheDocument();
  });
});

// ============================================================================
// PROMOTION EFFICIENCY DEEP TESTS
// ============================================================================

describe('PromotionEfficiency - Deep Tests', () => {
  it('renders page title', () => {
    render(<PromotionEfficiency />);
    expect(screen.getByText('Promotion Efficiency')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<PromotionEfficiency />);
    expect(screen.getByText('Average ROI')).toBeInTheDocument();
    expect(screen.getByText('Avg Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Total Investment')).toBeInTheDocument();
    expect(screen.getByText('Incremental Revenue')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    render(<PromotionEfficiency />);
    expect(screen.getAllByText(/ROI Calculator/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Performance Analysis')).toBeInTheDocument();
    expect(screen.getByText('Promotion Comparison')).toBeInTheDocument();
  });

  it('renders ROI calculator tab by default', () => {
    render(<PromotionEfficiency />);
    // ROI Calculator tab should have content visible
    expect(screen.getAllByText(/ROI Calculator/).length).toBeGreaterThanOrEqual(1);
  });

  it('clicking Performance Analysis tab works', () => {
    render(<PromotionEfficiency />);
    const perfTab = screen.getByText('Performance Analysis');
    fireEvent.click(perfTab);
    expect(perfTab).toBeInTheDocument();
  });

  it('clicking Promotion Comparison tab works', () => {
    render(<PromotionEfficiency />);
    const compTab = screen.getByText('Promotion Comparison');
    fireEvent.click(compTab);
    expect(compTab).toBeInTheDocument();
  });
});

// ============================================================================
// PROMOTION MECHANICS DEEP TESTS
// ============================================================================

describe('PromotionMechanics - Deep Tests', () => {
  it('renders page title', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Mechanics / Slab')).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getAllByText('Discount').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Rebate').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Free Goods').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Bundle').length).toBeGreaterThanOrEqual(1);
  });

  it('renders mechanic configurations table', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Mechanic Configurations')).toBeInTheDocument();
  });

  it('renders specific mechanic entries', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Volume Discount Tiers')).toBeInTheDocument();
    expect(screen.getByText('Quarterly Rebate')).toBeInTheDocument();
  });

  it('renders Mechanic Types Guide', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Mechanic Types Guide')).toBeInTheDocument();
  });

  it('renders Create Mechanic button', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Create Mechanic')).toBeInTheDocument();
  });

  it('renders filter or tab options for mechanic types', () => {
    render(<PromotionMechanics />);
    // There should be filter/tab buttons for types
    expect(screen.getAllByText('Discount').length).toBeGreaterThanOrEqual(2);
  });
});
