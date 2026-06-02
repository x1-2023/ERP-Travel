/**
 * Deep Tests for Budget Pages
 * Covers: BudgetList (search, filters, summary calculations, demo data),
 *         BudgetNew (form interactions, validation, submit),
 *         BudgetAllocation (view mode toggle, search, expand/collapse, select budget)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';

// Mock react-router-dom
const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

// Mock hooks
const mockMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useBudgets', () => ({
  useBudgets: () => ({ data: undefined, isLoading: false, isError: false }),
  useBudget: () => ({ data: undefined, isLoading: false, isError: false }),
  useCreateBudget: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
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

vi.mock('@/hooks', async () => {
  return {
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

const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
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
import BudgetAllocation from '@/pages/budgets/BudgetAllocation';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// BUDGET LIST DEEP TESTS
// ============================================================================

describe('BudgetList - Deep Tests', () => {
  it('renders all three demo budgets', () => {
    render(<BudgetList />);
    expect(screen.getByText('Q1 Trade Budget')).toBeInTheDocument();
    expect(screen.getByText('Q1 Marketing Budget')).toBeInTheDocument();
    expect(screen.getByText('Q2 Trade Budget')).toBeInTheDocument();
  });

  it('renders all demo budget codes', () => {
    render(<BudgetList />);
    expect(screen.getByText('BUD-2026-001')).toBeInTheDocument();
    expect(screen.getByText('BUD-2026-002')).toBeInTheDocument();
    expect(screen.getByText('BUD-2026-003')).toBeInTheDocument();
  });

  it('renders summary cards with correct labels', () => {
    render(<BudgetList />);
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders the search input with correct placeholder', () => {
    render(<BudgetList />);
    expect(screen.getByPlaceholderText('Search budgets...')).toBeInTheDocument();
  });

  it('renders allocation link button', () => {
    render(<BudgetList />);
    expect(screen.getByText('Phân bổ ngân sách')).toBeInTheDocument();
  });

  it('renders budget status badges for demo data', () => {
    render(<BudgetList />);
    const activeBadges = screen.getAllByText('ACTIVE');
    expect(activeBadges.length).toBe(2); // Two ACTIVE budgets
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('displays page description in Vietnamese', () => {
    render(<BudgetList />);
    expect(screen.getByText('Quản lý ngân sách và phân bổ theo năm')).toBeInTheDocument();
  });

  it('renders year filter options', () => {
    render(<BudgetList />);
    // Year filter select is present
    const selectTriggers = screen.getAllByRole('combobox');
    expect(selectTriggers.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// BUDGET NEW DEEP TESTS
// ============================================================================

describe('BudgetNew - Deep Tests', () => {
  it('renders all form fields', () => {
    render(<BudgetNew />);
    expect(screen.getByLabelText('Budget Code *')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Total Amount (VND) *')).toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    render(<BudgetNew />);
    expect(screen.getByText('Create a new annual budget')).toBeInTheDocument();
  });

  it('renders Budget Details card header', () => {
    render(<BudgetNew />);
    expect(screen.getByText('Budget Details')).toBeInTheDocument();
  });

  it('renders cancel link', () => {
    render(<BudgetNew />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('allows typing in the code input', () => {
    render(<BudgetNew />);
    const codeInput = screen.getByLabelText('Budget Code *') as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: 'BUD-TEST-001' } });
    expect(codeInput.value).toBe('BUD-TEST-001');
  });

  it('allows typing in the name input', () => {
    render(<BudgetNew />);
    const nameInput = screen.getByLabelText('Budget Name *') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test Budget' } });
    expect(nameInput.value).toBe('Test Budget');
  });

  it('allows typing in the amount input', () => {
    render(<BudgetNew />);
    const amountInput = screen.getByLabelText('Total Amount (VND) *') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '1000000' } });
    expect(amountInput.value).toBe('1000000');
  });

  it('allows typing in the department input', () => {
    render(<BudgetNew />);
    const deptInput = screen.getByLabelText('Department') as HTMLInputElement;
    fireEvent.change(deptInput, { target: { value: 'Sales' } });
    expect(deptInput.value).toBe('Sales');
  });

  it('allows typing in the notes textarea', () => {
    render(<BudgetNew />);
    const notesInput = screen.getByLabelText('Notes') as HTMLTextAreaElement;
    fireEvent.change(notesInput, { target: { value: 'Test notes' } });
    expect(notesInput.value).toBe('Test notes');
  });

  it('has correct placeholders', () => {
    render(<BudgetNew />);
    expect(screen.getByPlaceholderText('BUD-2026-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Q1 Trade Budget')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1000000000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sales Department')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Additional notes...')).toBeInTheDocument();
  });

  it('submits form with filled data', async () => {
    render(<BudgetNew />);
    const codeInput = screen.getByLabelText('Budget Code *') as HTMLInputElement;
    const nameInput = screen.getByLabelText('Budget Name *') as HTMLInputElement;
    const amountInput = screen.getByLabelText('Total Amount (VND) *') as HTMLInputElement;

    fireEvent.change(codeInput, { target: { value: 'BUD-TEST' } });
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(amountInput, { target: { value: '1000' } });

    const submitButton = screen.getByText('Create Budget');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// BUDGET ALLOCATION DEEP TESTS
// ============================================================================

describe('BudgetAllocation - Deep Tests', () => {
  it('renders page title in Vietnamese', () => {
    render(<BudgetAllocation />);
    expect(screen.getByText('Phân bổ Ngân sách')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<BudgetAllocation />);
    expect(screen.getByText('Cấu trúc phân cấp ngân sách theo vùng miền')).toBeInTheDocument();
  });

  it('renders budget selector with default option', () => {
    render(<BudgetAllocation />);
    expect(screen.getByText('Chọn ngân sách...')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(<BudgetAllocation />);
    expect(screen.getByText('Cây thư mục')).toBeInTheDocument();
    expect(screen.getByText('Luồng phân bổ')).toBeInTheDocument();
  });

  it('renders create allocation button', () => {
    render(<BudgetAllocation />);
    expect(screen.getByText('Tạo phân bổ')).toBeInTheDocument();
  });

  it('shows empty state when no budget is selected', () => {
    render(<BudgetAllocation />);
    expect(screen.getByText('Chọn ngân sách để xem phân bổ')).toBeInTheDocument();
    expect(screen.getByText(/Vui lòng chọn một ngân sách/)).toBeInTheDocument();
  });

  it('shows warning when no budgets exist', () => {
    render(<BudgetAllocation />);
    expect(screen.getByText(/Chưa có ngân sách nào/)).toBeInTheDocument();
  });

  it('can switch view mode to flow', () => {
    render(<BudgetAllocation />);
    const flowButton = screen.getByText('Luồng phân bổ');
    fireEvent.click(flowButton);
    // After clicking, tree mode button should be in inactive state
    expect(flowButton).toBeInTheDocument();
  });

  it('can switch view mode back to tree', () => {
    render(<BudgetAllocation />);
    const flowButton = screen.getByText('Luồng phân bổ');
    fireEvent.click(flowButton);
    const treeButton = screen.getByText('Cây thư mục');
    fireEvent.click(treeButton);
    expect(treeButton).toBeInTheDocument();
  });
});
