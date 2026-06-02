/**
 * Budgets Pages Smoke Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock react-router-dom partially
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock hooks
vi.mock('@/hooks/useBudgets', () => ({
  useBudgets: () => ({ data: undefined, isLoading: false, isError: false }),
  useBudget: () => ({ data: undefined, isLoading: false, isError: false }),
  useCreateBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useFundHealthScore: () => ({ data: undefined, isLoading: false }),
  budgetKeys: { all: ['budgets'], lists: () => ['budgets', 'list'] },
}));

vi.mock('@/hooks/useBudgetAllocations', () => ({
  useBudgetAllocations: () => ({ data: undefined, isLoading: false }),
  useBudgetAllocationTree: () => ({ data: undefined, isLoading: false }),
  useCreateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useGeographicUnits', () => ({
  useGeographicUnits: () => ({ data: undefined, isLoading: false }),
  useGeographicUnitsTree: () => ({ data: undefined, isLoading: false }),
}));

// Also mock the barrel export since some pages import from @/hooks
vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks/useBudgets');
  return {
    ...actual,
    useBudgets: () => ({ data: undefined, isLoading: false, isError: false }),
    useBudget: () => ({ data: undefined, isLoading: false, isError: false }),
    useFundHealthScore: () => ({ data: undefined, isLoading: false }),
    useGeographicUnitsTree: () => ({ data: undefined, isLoading: false }),
    useBudgetAllocationTree: () => ({ data: undefined, isLoading: false }),
    useCreateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useUpdateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useDeleteBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  };
});

vi.mock('@/hooks/useFunds', () => ({
  useFunds: () => ({ data: undefined, isLoading: false }),
  useFund: () => ({ data: undefined, isLoading: false }),
  useFundOptions: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// Mock recharts
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
  Cell: () => null,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
}));

import BudgetList from '@/pages/budgets/BudgetList';
import BudgetNew from '@/pages/budgets/BudgetNew';
import BudgetOverview from '@/pages/budget/Overview';

describe('BudgetList Page', () => {
  it('renders page title', () => {
    render(<BudgetList />);
    // Page title is in Vietnamese
    expect(screen.getByText('Ngân sách')).toBeInTheDocument();
  });

  it('renders new budget button', () => {
    render(<BudgetList />);
    // Button text is in Vietnamese
    expect(screen.getByText('Tạo mới')).toBeInTheDocument();
  });

  it('renders demo budget data', () => {
    render(<BudgetList />);
    expect(screen.getByText('Q1 Trade Budget')).toBeInTheDocument();
    expect(screen.getByText('BUD-2026-001')).toBeInTheDocument();
  });
});

describe('BudgetNew Page', () => {
  it('renders page title', () => {
    render(<BudgetNew />);
    expect(screen.getByText('New Budget')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<BudgetNew />);
    // Labels include asterisks for required fields
    expect(screen.getByLabelText('Budget Code *')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Total Amount (VND) *')).toBeInTheDocument();
  });

  it('renders create button', () => {
    render(<BudgetNew />);
    expect(screen.getByText('Create Budget')).toBeInTheDocument();
  });
});

describe('BudgetOverview Page', () => {
  it('renders the overview heading', () => {
    render(<BudgetOverview />);
    expect(screen.getByText('Budget Management')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<BudgetOverview />);
    expect(screen.getByText('Total Budget FY2026')).toBeInTheDocument();
    expect(screen.getByText('Spent YTD')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('renders budget functions section', () => {
    render(<BudgetOverview />);
    expect(screen.getByText('Budget Functions')).toBeInTheDocument();
  });
});
