/**
 * Budget Pages Deep Smoke Tests
 * Covers: Allocation, Approval, Definition, Monitoring
 * These are the largest files in the project (~3600 lines combined)
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

// Mock useBudgets hook
vi.mock('@/hooks/useBudgets', () => ({
  useBudgets: () => ({
    data: { budgets: [], total: 0 },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useBudget: () => ({ data: undefined, isLoading: false, isError: false }),
  useCreateBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useFundHealthScore: () => ({ data: undefined, isLoading: false }),
  useSubmitBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReviewBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApprovalHistory: () => ({ data: undefined, isLoading: false }),
  budgetKeys: { all: ['budgets'], lists: () => ['budgets', 'list'] },
}));

// Mock useBudgetAllocations hook
vi.mock('@/hooks/useBudgetAllocations', () => ({
  useBudgetAllocations: () => ({ data: undefined, isLoading: false }),
  useBudgetAllocationTree: () => ({
    data: undefined,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock useGeographicUnits hook
vi.mock('@/hooks/useGeographicUnits', () => ({
  useGeographicUnits: () => ({ data: undefined, isLoading: false }),
  useGeographicUnitsTree: () => ({ data: undefined, isLoading: false }),
}));

// Mock useToast hook
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// Mock barrel hooks export
vi.mock('@/hooks', async () => {
  return {
    useBudgets: () => ({
      data: { budgets: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
    useBudget: () => ({ data: undefined, isLoading: false, isError: false }),
    useFundHealthScore: () => ({ data: undefined, isLoading: false }),
    useGeographicUnitsTree: () => ({ data: undefined, isLoading: false }),
    useBudgetAllocationTree: () => ({
      data: undefined,
      isLoading: false,
      refetch: vi.fn(),
    }),
    useCreateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useUpdateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDeleteBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useSubmitBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useReviewBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useApprovalHistory: () => ({ data: undefined, isLoading: false }),
  };
});

// Mock recharts (used by Monitoring page)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ComposedChart: () => <div data-testid="composed-chart" />,
  Area: () => null,
  AreaChart: () => <div data-testid="area-chart" />,
  Cell: () => null,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
}));

// ============================================================================
// IMPORTS (after mocks)
// ============================================================================

import BudgetAllocationPage from '@/pages/budget/Allocation';
import BudgetApprovalPage from '@/pages/budget/Approval';
import BudgetDefinitionPage from '@/pages/budget/Definition';
import BudgetMonitoringPage from '@/pages/budget/Monitoring';

// ============================================================================
// ALLOCATION PAGE TESTS (1851 lines)
// ============================================================================

describe('BudgetAllocationPage', () => {
  it('renders without crashing', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getByText('Phân Bổ Ngân Sách')).toBeInTheDocument();
  });

  it('shows the page description', () => {
    render(<BudgetAllocationPage />);
    expect(
      screen.getByText('Quản lý phân bổ ngân sách theo cấp bậc địa lý')
    ).toBeInTheDocument();
  });

  it('renders summary cards with demo data', () => {
    render(<BudgetAllocationPage />);
    // Summary labels (Vietnamese)
    expect(screen.getByText('Tổng ngân sách')).toBeInTheDocument();
    expect(screen.getByText('Đã phân bổ')).toBeInTheDocument();
    expect(screen.getByText('Chưa phân bổ')).toBeInTheDocument();
    expect(screen.getByText('Đã chi tiêu')).toBeInTheDocument();
    expect(screen.getByText('Cam kết')).toBeInTheDocument();
    expect(screen.getByText('Còn khả dụng')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Thêm phân bổ')).toBeInTheDocument();
  });

  it('renders the budget selector placeholder', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getByText('Chọn ngân sách...')).toBeInTheDocument();
  });

  it('renders demo tree data with Vietnam node', () => {
    render(<BudgetAllocationPage />);
    // The mock data shows "Vietnam" as the root country node
    expect(screen.getByText('Vietnam')).toBeInTheDocument();
    expect(screen.getByText('(VN)')).toBeInTheDocument();
  });

  it('shows region nodes in demo data', () => {
    render(<BudgetAllocationPage />);
    // Regions: expanded by default (level < 2)
    expect(screen.getByText('Miền Bắc')).toBeInTheDocument();
    expect(screen.getByText('(NORTH)')).toBeInTheDocument();
  });

  it('shows tree view header columns', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getByText('Tên / Mã')).toBeInTheDocument();
    expect(screen.getByText('Tỷ lệ')).toBeInTheDocument();
    expect(screen.getByText('Ngân sách')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument();
  });

  it('renders method filter dropdown with default value', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getByText('Tất cả')).toBeInTheDocument();
  });
});

// ============================================================================
// APPROVAL PAGE TESTS (762 lines)
// ============================================================================

describe('BudgetApprovalPage', () => {
  it('renders without crashing', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Budget Approval')).toBeInTheDocument();
  });

  it('shows the page description', () => {
    render(<BudgetApprovalPage />);
    expect(
      screen.getByText('Multi-level approval workflow (Aforza-style)')
    ).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.getByText('Pending Amount')).toBeInTheDocument();
    // "Approved" appears in both summary card title and tab, use getAllByText
    expect(screen.getAllByText('Approved').length).toBeGreaterThanOrEqual(1);
    // "Rejected" appears in both summary card title and tab, use getAllByText
    expect(screen.getAllByText('Rejected').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Approval Queue section', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Approval Queue')).toBeInTheDocument();
    expect(
      screen.getByText('Review and process budget requests')
    ).toBeInTheDocument();
  });

  it('renders tabs for filtering', () => {
    render(<BudgetApprovalPage />);
    // Tabs: Pending, Approved, Rejected, All -- these overlap with card titles
    expect(screen.getAllByText('Approved').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Rejected').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByPlaceholderText('Search budgets...')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('Fund Type')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows empty state when no budgets', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('No budgets found')).toBeInTheDocument();
  });

  it('renders Refresh button', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });
});

// ============================================================================
// DEFINITION PAGE TESTS (541 lines)
// ============================================================================

describe('BudgetDefinitionPage', () => {
  it('renders without crashing', () => {
    render(<BudgetDefinitionPage />);
    expect(screen.getByText('Budget Definition')).toBeInTheDocument();
  });

  it('shows the page description in Vietnamese', () => {
    render(<BudgetDefinitionPage />);
    expect(
      screen.getByText('Định nghĩa và kiểm soát ngân sách theo năm, quý, tháng')
    ).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<BudgetDefinitionPage />);
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    // "Allocated" and "Remaining" also appear as table column headers
    expect(screen.getAllByText('Allocated').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Remaining').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Active Budgets')).toBeInTheDocument();
  });

  it('renders Create Budget button', () => {
    render(<BudgetDefinitionPage />);
    expect(screen.getByText('Create Budget')).toBeInTheDocument();
  });

  it('renders budget definitions table section', () => {
    render(<BudgetDefinitionPage />);
    expect(screen.getByText('Budget Definitions')).toBeInTheDocument();
    expect(
      screen.getByText('Manage budget definitions and allocations')
    ).toBeInTheDocument();
  });

  it('renders filter and export buttons', () => {
    render(<BudgetDefinitionPage />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders demo budget data in the table', () => {
    render(<BudgetDefinitionPage />);
    // Demo data entries
    expect(screen.getByText('FY2026 Trade Promotion Budget')).toBeInTheDocument();
    expect(screen.getByText('BUD-2026-ANNUAL')).toBeInTheDocument();
    expect(screen.getByText('Q1/2026 Trade Budget')).toBeInTheDocument();
    expect(screen.getByText('BUD-2026-Q1')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<BudgetDefinitionPage />);
    expect(
      screen.getByPlaceholderText('Search by name or code...')
    ).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<BudgetDefinitionPage />);
    // Note: "Budget" text also appears in headings so we use getAllByText
    expect(screen.getAllByText('Budget').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
  });

  it('shows pagination info', () => {
    render(<BudgetDefinitionPage />);
    // Default filter: year 2026, so 4 of 5 budgets match
    expect(screen.getByText(/Showing \d+ of \d+ budgets/)).toBeInTheDocument();
  });

  it('renders status badges for mock data', () => {
    render(<BudgetDefinitionPage />);
    // Active, Pending, Approved, Closed statuses in mock data
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// MONITORING PAGE TESTS (471 lines)
// ============================================================================

describe('BudgetMonitoringPage', () => {
  it('renders without crashing', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('Budget Monitoring')).toBeInTheDocument();
  });

  it('shows the page description', () => {
    render(<BudgetMonitoringPage />);
    expect(
      screen.getByText('Real-time budget tracking: Planned vs Committed vs Actual')
    ).toBeInTheDocument();
  });

  it('renders KPI cards', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Committed')).toBeInTheDocument();
    expect(screen.getByText('Actual Spend')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('renders KPI card values', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('70% of annual budget')).toBeInTheDocument();
    expect(screen.getByText('+12% vs last Q')).toBeInTheDocument();
    expect(screen.getByText('82% of committed')).toBeInTheDocument();
    expect(screen.getByText('44% remaining')).toBeInTheDocument();
  });

  it('renders analysis tabs', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('Trend Analysis')).toBeInTheDocument();
    expect(screen.getByText('By Channel')).toBeInTheDocument();
    expect(screen.getByText('By Region')).toBeInTheDocument();
    expect(screen.getByText('By Category')).toBeInTheDocument();
  });

  it('renders Export Report button', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('Export Report')).toBeInTheDocument();
  });

  it('renders Budget Alerts section', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('Budget Alerts')).toBeInTheDocument();
    expect(
      screen.getByText('Warnings and threshold breaches')
    ).toBeInTheDocument();
  });

  it('shows demo alert data', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('MT Channel approaching limit')).toBeInTheDocument();
    expect(screen.getByText('Q1 overspend detected')).toBeInTheDocument();
    expect(screen.getByText('Budget reallocation approved')).toBeInTheDocument();
  });

  it('renders alert type badges', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('WARNING')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('INFO')).toBeInTheDocument();
  });

  it('renders Trend Analysis chart section by default', () => {
    render(<BudgetMonitoringPage />);
    expect(screen.getByText('Budget Trend')).toBeInTheDocument();
    expect(
      screen.getByText('Planned vs Committed vs Actual (Monthly)')
    ).toBeInTheDocument();
  });

  it('renders period selector', () => {
    render(<BudgetMonitoringPage />);
    // Default: Q1 2026
    expect(screen.getByText('Q1 2026')).toBeInTheDocument();
  });
});
