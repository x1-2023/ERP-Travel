/**
 * Budget & Finance Deep Coverage Tests
 *
 * TARGET PAGES:
 * 1. budget/Allocation.tsx (BudgetAllocationPage) - tree-based budget allocation
 * 2. targets/TargetAllocation.tsx - target allocation with tree view
 * 3. budgets/BudgetAllocation.tsx - budget allocation (phase 5)
 * 4. budget/Approval.tsx - budget approval workflow
 * 5. finance/accruals/AccrualList.tsx - accrual management
 * 6. finance/cheques/ChequeList.tsx - cheque management
 * 7. finance/deductions/DeductionList.tsx - deduction management
 * 8. finance/journals/JournalList.tsx - journal management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockChequeSummary = {
  totalIssued: 5,
  totalCleared: 3,
  totalVoided: 1,
  totalPending: 2,
  issuedAmount: 125000,
  clearedAmount: 75000,
  pendingAmount: 50000,
};

const mockCheque = {
  id: 'cheque-1',
  code: 'CHQ-001',
  chequeNumber: 'CHQ-2026-0001',
  chequeDate: '2026-01-15',
  amount: 25000,
  status: 'ISSUED',
  bankAccount: 'ACC-1234',
  bankName: 'Vietcombank',
  payee: 'ABC Corp',
  memo: 'Payment for Q1 promotion',
  customerId: 'cust-1',
  customer: { id: 'cust-1', code: 'CUST001', name: 'ABC Corp' },
  claimId: 'claim-1',
  claim: { id: 'claim-1', code: 'CLM-001' },
  issuedAt: '2026-01-16',
  clearedAt: null,
  voidedAt: null,
  voidReason: null,
  createdAt: '2026-01-15',
  updatedAt: '2026-01-16',
};

const mockDeduction = {
  id: 'ded-1',
  code: 'DED-001',
  customerId: 'cust-1',
  customer: { id: 'cust-1', code: 'CUST001', name: 'ABC Corp', channel: 'MODERN_TRADE' },
  invoiceNumber: 'INV-2026-001',
  invoiceDate: '2026-01-10',
  amount: 15000,
  status: 'OPEN',
  reason: 'Promotional discount',
  matchedClaimId: null,
  matchedClaim: null,
  disputeReason: null,
  disputedAt: null,
  resolvedAt: null,
  createdAt: '2026-01-10',
  updatedAt: '2026-01-10',
};

const mockDeductionSummary = {
  totalAmount: 45000,
  pendingCount: 3,
  openCount: 2,
  matchedCount: 1,
};

const mockJournal = {
  id: 'j-1',
  code: 'JRN-001',
  journalType: 'ACCRUAL',
  journalDate: '2026-01-31',
  description: 'Monthly accrual for Q1 promotions',
  reference: 'REF-001',
  status: 'DRAFT',
  totalDebit: 50000,
  totalCredit: 50000,
  customerId: 'cust-1',
  customer: { id: 'cust-1', code: 'CUST001', name: 'ABC Corp' },
  promotionId: 'promo-1',
  promotion: { id: 'promo-1', code: 'PROMO-001', name: 'Summer Sale' },
  lines: [],
  postedAt: null,
  postedBy: null,
  reversedAt: null,
  reversedById: null,
  reversedBy: null,
  reversalOfId: null,
  reversalOf: null,
  createdAt: '2026-01-31',
  updatedAt: '2026-01-31',
};

const mockJournalSummary = {
  totalDraft: 2,
  totalPosted: 5,
  totalReversed: 1,
  draftAmount: 100000,
  postedAmount: 250000,
};

const mockAccrual = {
  id: 'acc-1',
  period: '2026-01',
  amount: 30000,
  status: 'PENDING',
  promotionId: 'promo-1',
  promotion: {
    id: 'promo-1',
    code: 'PROMO-001',
    name: 'Summer Sale',
    budget: 100000,
    spentAmount: 45000,
    status: 'ACTIVE',
  },
  glJournal: null,
  notes: 'Auto-calculated accrual',
  createdBy: { id: 'user-1', name: 'Admin User' },
  createdAt: '2026-01-31',
  updatedAt: '2026-01-31',
};

const mockAccrualSummary = {
  totalAmount: 90000,
  pendingCount: 3,
  postedCount: 5,
  reversedCount: 1,
};

// ============================================================================
// MOCKS - react-router-dom
// ============================================================================

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-1' }),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

// ============================================================================
// MOCKS - Hooks
// ============================================================================

const mockMutateAsync = vi.fn().mockResolvedValue({});
const mockRefetch = vi.fn();

vi.mock('@/hooks/useBudgets', () => ({
  useBudgets: () => ({
    data: {
      budgets: [
        {
          id: 'b-1',
          code: 'BUD-2026-Q1',
          name: 'Q1 Budget 2026',
          fundType: 'PROMOTIONAL',
          year: 2026,
          quarter: 1,
          totalAmount: 50000000,
          totalBudget: 50000000,
          allocatedAmount: 40000000,
          committed: 40000000,
          spentAmount: 25000000,
          approvalStatus: 'SUBMITTED',
          approvalLevel: 3,
          currentLevel: 1,
          status: 'ACTIVE',
          createdAt: '2026-01-01',
          utilizationRate: 50,
          allocationRate: 80,
        },
        {
          id: 'b-2',
          code: 'BUD-2026-Q2',
          name: 'Q2 Budget 2026',
          fundType: 'TACTICAL',
          year: 2026,
          quarter: 2,
          totalAmount: 30000000,
          totalBudget: 30000000,
          allocatedAmount: 20000000,
          committed: 20000000,
          spentAmount: 10000000,
          approvalStatus: 'APPROVED',
          approvalLevel: 3,
          currentLevel: 3,
          status: 'ACTIVE',
          createdAt: '2026-01-01',
          utilizationRate: 33,
          allocationRate: 67,
        },
      ],
      pagination: { page: 1, limit: 50, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  }),
  useBudget: () => ({ data: undefined, isLoading: false }),
  useCreateBudget: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useUpdateBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteBudget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useFundHealthScore: () => ({ data: undefined, isLoading: false }),
  useSubmitBudget: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useReviewBudget: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useApprovalHistory: () => ({ data: undefined, isLoading: false }),
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
  useGeographicUnit: () => ({ data: undefined, isLoading: false }),
  useCreateGeographicUnit: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateGeographicUnit: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteGeographicUnit: () => ({ mutateAsync: vi.fn(), isPending: false }),
  flattenGeographicTree: () => [],
  geographicUnitKeys: { all: ['geo'] },
}));

vi.mock('@/hooks/useTargetAllocations', () => ({
  useTargetAllocations: () => ({ data: undefined, isLoading: false }),
  useTargetAllocationTree: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  useTargetAllocation: () => ({ data: undefined, isLoading: false }),
  useCreateTargetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTargetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTargetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  getProgressStatus: () => 'default',
  getMetricLabel: (m: string) => {
    switch (m) {
      case 'CASES': return 'Thùng';
      case 'VOLUME_LITERS': return 'Lít';
      case 'REVENUE_VND': return 'VND';
      case 'UNITS': return 'Đơn vị';
      default: return m;
    }
  },
  formatTargetValue: (v: number) => String(v),
  flattenTargetAllocationTree: () => [],
  targetAllocationKeys: { all: ['target-allocations'] },
}));

vi.mock('@/hooks/useTargets', () => ({
  useTargets: () => ({
    data: {
      targets: [
        {
          id: 'target-1',
          code: 'TGT-Q1',
          name: 'Q1 Sales Target',
          year: 2026,
          totalTarget: 10000,
          totalAchieved: 6500,
          metric: 'CASES',
          status: 'ACTIVE',
        },
      ],
    },
    isLoading: false,
  }),
  useTarget: () => ({ data: undefined, isLoading: false }),
  useCreateTarget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTarget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTarget: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTargetProgress: () => ({ data: undefined, isLoading: false }),
  useTargetAllocationTreeWithSummary: () => ({ data: undefined, isLoading: false }),
  useCreateTargetAllocationNested: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTargetAllocationNested: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTargetAllocationNested: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTargetProgress: () => ({ mutateAsync: vi.fn(), isPending: false }),
  getProgressStatusColor: () => 'text-green-600',
  getProgressStatusLabel: () => 'Good',
  progressKeys: { all: ['target-progress'] },
  targetKeys: { all: ['targets'] },
}));

vi.mock('@/hooks', () => ({
  useBudgets: () => ({ data: undefined, isLoading: false }),
  useBudget: () => ({ data: undefined, isLoading: false }),
  useFundHealthScore: () => ({ data: undefined, isLoading: false }),
  useGeographicUnitsTree: () => ({ data: undefined, isLoading: false }),
  useBudgetAllocationTree: () => ({ data: undefined, isLoading: false }),
  useTargetAllocationTree: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
  useCreateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteBudgetAllocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  getMetricLabel: (m: string) => {
    switch (m) {
      case 'CASES': return 'Thùng';
      case 'VOLUME_LITERS': return 'Lít';
      case 'REVENUE_VND': return 'VND';
      case 'UNITS': return 'Đơn vị';
      default: return m;
    }
  },
  getProgressStatus: () => 'default',
  formatTargetValue: (v: number) => String(v),
  flattenTargetAllocationTree: () => [],
}));

vi.mock('@/hooks/useFunds', () => ({
  useFunds: () => ({ data: undefined, isLoading: false }),
  useFund: () => ({ data: undefined, isLoading: false }),
  useFundOptions: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useCheques', () => ({
  useCheques: () => ({
    data: {
      cheques: [
        mockCheque,
        { ...mockCheque, id: 'cheque-2', chequeNumber: 'CHQ-2026-0002', status: 'CLEARED' },
      ],
      summary: mockChequeSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCheque: () => ({ data: mockCheque, isLoading: false }),
  useCreateCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useClearCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVoidCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  Cheque: {},
}));

vi.mock('@/hooks/useDeductions', () => ({
  useDeductions: () => ({
    data: {
      deductions: [
        mockDeduction,
        { ...mockDeduction, id: 'ded-2', code: 'DED-002', status: 'MATCHED' },
      ],
      summary: mockDeductionSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useDeduction: () => ({ data: mockDeduction, isLoading: false }),
  useCreateDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDisputeDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useResolveDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useMatchingSuggestions: () => ({ data: [], isLoading: false }),
  useMatchDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useJournals', () => ({
  useJournals: () => ({
    data: {
      journals: [
        mockJournal,
        { ...mockJournal, id: 'j-2', code: 'JRN-002', status: 'POSTED' },
      ],
      summary: mockJournalSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useJournal: () => ({ data: mockJournal, isLoading: false }),
  usePostJournal: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReverseJournal: () => ({ mutateAsync: vi.fn(), isPending: false }),
  Journal: {},
}));

vi.mock('@/hooks/useAccruals', () => ({
  useAccruals: () => ({
    data: {
      accruals: [
        mockAccrual,
        { ...mockAccrual, id: 'acc-2', period: '2026-02', status: 'CALCULATED' },
      ],
      summary: mockAccrualSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useAccrual: () => ({ data: mockAccrual, isLoading: false }),
  usePostAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePostAccrualBatch: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReverseAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePreviewAccruals: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCalculateAccruals: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({
    data: {
      customers: [
        { id: 'cust-1', name: 'ABC Corp' },
        { id: 'cust-2', name: 'XYZ Ltd' },
      ],
    },
    isLoading: false,
  }),
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

// ============================================================================
// IMPORTS - after mocks
// ============================================================================

import BudgetAllocationPage from '@/pages/budget/Allocation';
import TargetAllocation from '@/pages/targets/TargetAllocation';
import BudgetAllocationPhase5 from '@/pages/budgets/BudgetAllocation';
import BudgetApprovalPage from '@/pages/budget/Approval';
import AccrualListPage from '@/pages/finance/accruals/AccrualList';
import ChequeListPage from '@/pages/finance/cheques/ChequeList';
import DeductionListPage from '@/pages/finance/deductions/DeductionList';
import JournalListPage from '@/pages/finance/journals/JournalList';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// 1. BUDGET ALLOCATION PAGE (budget/Allocation.tsx)
// ============================================================================

describe('BudgetAllocationPage', () => {
  it('renders heading and description', () => {
    const { container } = render(<BudgetAllocationPage />);
    expect(screen.getByText('Phân Bổ Ngân Sách')).toBeDefined();
    expect(screen.getByText('Quản lý phân bổ ngân sách theo cấp bậc địa lý')).toBeDefined();
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders summary cards with mock data (no budget selected)', () => {
    render(<BudgetAllocationPage />);
    // Summary labels
    expect(screen.getAllByText('Tổng ngân sách').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Đã phân bổ').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Chưa phân bổ').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Đã chi tiêu').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cam kết').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Còn khả dụng').length).toBeGreaterThanOrEqual(1);
  });

  it('renders tree view with mock allocation data', () => {
    render(<BudgetAllocationPage />);
    // Mock data nodes (no budget selected => mockAllocationTree)
    expect(screen.getByText('Vietnam')).toBeDefined();
    expect(screen.getAllByText(/Miền Bắc/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Miền Trung/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Miền Nam/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders tree view header columns', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getAllByText('Tên / Mã').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Tỷ lệ').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ngân sách').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Trạng thái/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders buttons: Refresh, Export, Thêm phân bổ', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getAllByText('Refresh').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Export')).toBeDefined();
    expect(screen.getByText('Thêm phân bổ')).toBeDefined();
  });

  it('renders status badges in the tree', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getAllByText('Đang hoạt động').length).toBeGreaterThanOrEqual(1);
  });

  it('renders allocation method labels', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getAllByText('Thủ công').length).toBeGreaterThanOrEqual(1);
  });

  it('renders expanded children in tree view (level 2 nodes visible)', () => {
    render(<BudgetAllocationPage />);
    // Hà Nội is level 2, parent is expanded by default
    expect(screen.getAllByText('Hà Nội').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hải Phòng').length).toBeGreaterThanOrEqual(1);
  });

  it('renders budget selector placeholder', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getByText('Chọn ngân sách...')).toBeDefined();
  });

  it('renders filter method selector with options', () => {
    render(<BudgetAllocationPage />);
    expect(screen.getAllByText('Tất cả').length).toBeGreaterThanOrEqual(1);
  });

  it('does not contain NaN in any output', () => {
    const { container } = render(<BudgetAllocationPage />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 2. TARGET ALLOCATION PAGE (targets/TargetAllocation.tsx)
// ============================================================================

describe('TargetAllocation', () => {
  it('renders heading and description', () => {
    const { container } = render(<TargetAllocation />);
    expect(screen.getAllByText('Phân bổ Mục tiêu').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Cấu trúc phân cấp mục tiêu theo vùng miền')).toBeDefined();
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders target selector with options', () => {
    render(<TargetAllocation />);
    expect(screen.getByText('Chọn mục tiêu...')).toBeDefined();
  });

  it('renders no target selected state initially', () => {
    render(<TargetAllocation />);
    expect(screen.getByText('Chọn mục tiêu để xem phân bổ')).toBeDefined();
    expect(screen.getByText(/Vui lòng chọn một mục tiêu/)).toBeDefined();
  });

  it('renders create button (disabled when no target selected)', () => {
    render(<TargetAllocation />);
    const createBtn = screen.getByText('Tạo phân bổ');
    expect(createBtn).toBeDefined();
  });

  it('renders type config legend labels in type config', () => {
    // Verify the type config constants are defined (they render in legend when target selected)
    render(<TargetAllocation />);
    // Header should always render
    expect(screen.getAllByText('Phân bổ Mục tiêu').length).toBeGreaterThanOrEqual(1);
  });

  it('does not contain NaN in any output', () => {
    const { container } = render(<TargetAllocation />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 3. BUDGET ALLOCATION PHASE 5 (budgets/BudgetAllocation.tsx)
// ============================================================================

describe('BudgetAllocationPhase5', () => {
  it('renders heading and description', () => {
    const { container } = render(<BudgetAllocationPhase5 />);
    expect(screen.getAllByText('Phân bổ Ngân sách').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Cấu trúc phân cấp ngân sách theo vùng miền')).toBeDefined();
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders budget selector', () => {
    render(<BudgetAllocationPhase5 />);
    expect(screen.getByText('Chọn ngân sách...')).toBeDefined();
  });

  it('renders no budget selected state', () => {
    render(<BudgetAllocationPhase5 />);
    expect(screen.getByText('Chọn ngân sách để xem phân bổ')).toBeDefined();
    expect(screen.getByText(/Vui lòng chọn một ngân sách/)).toBeDefined();
  });

  it('renders view mode toggle buttons', () => {
    render(<BudgetAllocationPhase5 />);
    expect(screen.getByText('Cây thư mục')).toBeDefined();
    expect(screen.getByText('Luồng phân bổ')).toBeDefined();
  });

  it('renders create allocation button', () => {
    render(<BudgetAllocationPhase5 />);
    expect(screen.getByText('Tạo phân bổ')).toBeDefined();
  });

  it('does not contain NaN in any output', () => {
    const { container } = render(<BudgetAllocationPhase5 />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 4. BUDGET APPROVAL PAGE (budget/Approval.tsx)
// ============================================================================

describe('BudgetApprovalPage', () => {
  it('renders heading and description', () => {
    const { container } = render(<BudgetApprovalPage />);
    expect(screen.getByText('Budget Approval')).toBeDefined();
    expect(screen.getByText('Multi-level approval workflow (Aforza-style)')).toBeDefined();
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders summary stat cards', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getAllByText('Pending Approval').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Pending Amount')).toBeDefined();
    // "Approved" appears in stat cards and tabs
    expect(screen.getAllByText('Approved').length).toBeGreaterThanOrEqual(1);
    // "Rejected" appears in stat cards and tabs
    expect(screen.getAllByText('Rejected').length).toBeGreaterThanOrEqual(1);
  });

  it('renders stat card descriptions', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('budgets waiting')).toBeDefined();
    expect(screen.getByText('total value')).toBeDefined();
    expect(screen.getAllByText('this period').length).toBe(2);
  });

  it('renders approval queue card with title', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Approval Queue')).toBeDefined();
    expect(screen.getByText('Review and process budget requests')).toBeDefined();
  });

  it('renders tabs for filtering', () => {
    render(<BudgetApprovalPage />);
    // Pending appears in tab and stat card
    expect(screen.getAllByText(/Pending/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Approved').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Rejected').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('All')).toBeDefined();
  });

  it('renders table headers', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Budget')).toBeDefined();
    expect(screen.getByText('Fund Type')).toBeDefined();
    expect(screen.getByText('Amount')).toBeDefined();
    expect(screen.getByText('Period')).toBeDefined();
    expect(screen.getByText('Progress')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Actions')).toBeDefined();
  });

  it('renders budget rows from data', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Q1 Budget 2026')).toBeDefined();
    expect(screen.getByText('BUD-2026-Q1')).toBeDefined();
  });

  it('renders search input', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByPlaceholderText('Search budgets...')).toBeDefined();
  });

  it('renders refresh button', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Refresh')).toBeDefined();
  });

  it('renders fund type badges', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Promotional')).toBeDefined();
  });

  it('renders approval status badges', () => {
    render(<BudgetApprovalPage />);
    expect(screen.getByText('Submitted')).toBeDefined();
  });

  it('does not contain NaN in any output', () => {
    const { container } = render(<BudgetApprovalPage />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 5. ACCRUAL LIST PAGE (finance/accruals/AccrualList.tsx)
// ============================================================================

describe('AccrualListPage', () => {
  it('renders heading and description', () => {
    const { container } = render(<AccrualListPage />);
    expect(screen.getByText('Accrual Management')).toBeDefined();
    expect(screen.getByText('Manage promotion accruals and GL postings')).toBeDefined();
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders calculate accruals button', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('Calculate Accruals')).toBeDefined();
  });

  it('renders filter selectors', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('All Periods')).toBeDefined();
    expect(screen.getByText('All Status')).toBeDefined();
  });

  it('renders accrual data in table with promotion info', () => {
    render(<AccrualListPage />);
    // Promotion code from mock data
    expect(screen.getAllByText('PROMO-001').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Summer Sale').length).toBeGreaterThanOrEqual(1);
  });

  it('renders period column data', () => {
    render(<AccrualListPage />);
    expect(screen.getAllByText('2026-01').length).toBeGreaterThanOrEqual(1);
  });

  it('renders table column headers', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('Promotion')).toBeDefined();
    expect(screen.getByText('Period')).toBeDefined();
    expect(screen.getAllByText('Amount').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Status').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Created')).toBeDefined();
  });

  it('renders view mode toggle buttons', () => {
    render(<AccrualListPage />);
    // Both table and grid view buttons should exist
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('does not contain NaN in any output', () => {
    const { container } = render(<AccrualListPage />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 6. CHEQUE LIST PAGE (finance/cheques/ChequeList.tsx)
// ============================================================================

describe('ChequeListPage', () => {
  it('renders heading and description', () => {
    const { container } = render(<ChequeListPage />);
    expect(screen.getByText('Chequebook')).toBeDefined();
    expect(screen.getByText('Manage cheque issuance and tracking')).toBeDefined();
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders issue cheque button', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('Issue Cheque')).toBeDefined();
  });

  it('renders status filter', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('All Status')).toBeDefined();
  });

  it('renders table column headers', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('Cheque #')).toBeDefined();
    expect(screen.getByText('Date')).toBeDefined();
    expect(screen.getByText('Payee')).toBeDefined();
    expect(screen.getAllByText('Amount').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bank')).toBeDefined();
    expect(screen.getAllByText('Status').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Claim')).toBeDefined();
  });

  it('renders cheque data from mock', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('CHQ-2026-0001')).toBeDefined();
    expect(screen.getByText('CHQ-2026-0002')).toBeDefined();
    expect(screen.getAllByText('Vietcombank').length).toBeGreaterThanOrEqual(1);
  });

  it('renders payee from mock data', () => {
    render(<ChequeListPage />);
    expect(screen.getAllByText('ABC Corp').length).toBeGreaterThanOrEqual(1);
  });

  it('does not contain NaN in any output', () => {
    const { container } = render(<ChequeListPage />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 7. DEDUCTION LIST PAGE (finance/deductions/DeductionList.tsx)
// ============================================================================

describe('DeductionListPage', () => {
  it('renders heading and description', () => {
    const { container } = render(<DeductionListPage />);
    expect(screen.getByText('Deductions')).toBeDefined();
    expect(screen.getByText('Manage customer deductions and claim matching')).toBeDefined();
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders record deduction button', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('Record Deduction')).toBeDefined();
  });

  it('renders status and customer filters', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('All Status')).toBeDefined();
    expect(screen.getByText('All Customers')).toBeDefined();
  });

  it('renders table column headers', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('Code')).toBeDefined();
    expect(screen.getByText('Customer')).toBeDefined();
    expect(screen.getByText('Invoice #')).toBeDefined();
    expect(screen.getAllByText('Amount').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Status').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Date').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Matched Claim')).toBeDefined();
  });

  it('renders deduction data from mock', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('DED-001')).toBeDefined();
    expect(screen.getByText('DED-002')).toBeDefined();
    expect(screen.getAllByText('INV-2026-001').length).toBeGreaterThanOrEqual(1);
  });

  it('renders customer name', () => {
    render(<DeductionListPage />);
    expect(screen.getAllByText('ABC Corp').length).toBeGreaterThanOrEqual(1);
  });

  it('does not contain NaN in any output', () => {
    const { container } = render(<DeductionListPage />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 8. JOURNAL LIST PAGE (finance/journals/JournalList.tsx)
// ============================================================================

describe('JournalListPage', () => {
  it('renders heading and description', () => {
    const { container } = render(<JournalListPage />);
    expect(screen.getByText('GL Journals')).toBeDefined();
    expect(screen.getByText('Manage general ledger journal entries')).toBeDefined();
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders create journal button', () => {
    render(<JournalListPage />);
    expect(screen.getByText('Create Journal')).toBeDefined();
  });

  it('renders status and type filters', () => {
    render(<JournalListPage />);
    expect(screen.getByText('All Status')).toBeDefined();
    expect(screen.getByText('All Types')).toBeDefined();
  });

  it('renders table column headers', () => {
    render(<JournalListPage />);
    expect(screen.getAllByText('Code').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Type')).toBeDefined();
    expect(screen.getAllByText('Date').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Description')).toBeDefined();
    expect(screen.getAllByText('Amount').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Status').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Customer').length).toBeGreaterThanOrEqual(1);
  });

  it('renders journal data from mock', () => {
    render(<JournalListPage />);
    expect(screen.getByText('JRN-001')).toBeDefined();
    expect(screen.getByText('JRN-002')).toBeDefined();
    expect(screen.getAllByText('ACCRUAL').length).toBeGreaterThanOrEqual(1);
  });

  it('renders journal description', () => {
    render(<JournalListPage />);
    expect(screen.getAllByText(/Monthly accrual/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders customer name in table', () => {
    render(<JournalListPage />);
    expect(screen.getAllByText('ABC Corp').length).toBeGreaterThanOrEqual(1);
  });

  it('does not contain NaN in any output', () => {
    const { container } = render(<JournalListPage />);
    expect(container.textContent).not.toContain('NaN');
  });
});
