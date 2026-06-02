/**
 * Finance Pages Deep Smoke Tests
 * Deepens coverage for AccrualList, ChequeList, DeductionList
 * Tests more code paths: filters, view modes, dialogs, empty states
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

// --- Accrual hooks ---
vi.mock('@/hooks/useAccruals', () => ({
  useAccruals: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useAccrual: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  }),
  usePostAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePostAccrualBatch: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReverseAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePreviewAccruals: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCalculateAccruals: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Cheque hooks ---
vi.mock('@/hooks/useCheques', () => ({
  useCheques: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCheque: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCreateCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useClearCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVoidCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  Cheque: {},
}));

// --- Deduction hooks ---
vi.mock('@/hooks/useDeductions', () => ({
  useDeductions: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useDeduction: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCreateDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDisputeDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useResolveDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useMatchingSuggestions: () => ({ data: undefined, isLoading: false }),
  useMatchDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// --- Shared hooks ---
vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// --- Finance components ---
vi.mock('@/components/finance/AccrualStatusBadge', () => ({
  AccrualStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="accrual-status">{status}</span>
  ),
}));

vi.mock('@/components/finance/FinanceStats', () => ({
  AccrualStats: () => <div data-testid="accrual-stats">Accrual Stats</div>,
}));

vi.mock('@/components/finance/AccrualCard', () => ({
  AccrualCard: () => <div data-testid="accrual-card">Accrual Card</div>,
}));

vi.mock('@/components/finance/ChequeStatusBadge', () => ({
  ChequeStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="cheque-status">{status}</span>
  ),
}));

vi.mock('@/components/finance/ChequeStats', () => ({
  ChequeStats: () => <div data-testid="cheque-stats">Cheque Stats</div>,
}));

vi.mock('@/components/finance/ChequeCard', () => ({
  ChequeCard: () => <div data-testid="cheque-card">Cheque Card</div>,
}));

vi.mock('@/components/finance/DeductionStatusBadge', () => ({
  DeductionStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="deduction-status">{status}</span>
  ),
}));

vi.mock('@/components/finance/DeductionStats', () => ({
  DeductionStats: () => <div data-testid="deduction-stats">Deduction Stats</div>,
}));

vi.mock('@/components/finance/DeductionCard', () => ({
  DeductionCard: () => <div data-testid="deduction-card">Deduction Card</div>,
}));

// Mock DataTable since it uses @tanstack/react-table internals
vi.mock('@/components/shared/DataTable', () => ({
  DataTable: ({ data }: any) => (
    <div data-testid="data-table">
      {data?.length || 0} rows
    </div>
  ),
}));

// Mock LoadingSpinner
vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock EmptyState
vi.mock('@/components/shared/EmptyState', () => ({
  EmptyState: ({ title, description, action }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
      {action}
    </div>
  ),
}));

// Mock types/finance for GL_ACCOUNTS constant
vi.mock('@/types/finance', () => ({
  GL_ACCOUNTS: {
    PROMOTION_EXPENSE: '6100',
    TRADE_SPEND: '6200',
    REBATE_EXPENSE: '6300',
    ACCRUED_LIABILITIES: '2100',
    ACCOUNTS_PAYABLE: '2000',
  },
}));

// ============================================================================
// IMPORTS (after mocks)
// ============================================================================

import AccrualListPage from '@/pages/finance/accruals/AccrualList';
import ChequeListPage from '@/pages/finance/cheques/ChequeList';
import DeductionListPage from '@/pages/finance/deductions/DeductionList';

// ============================================================================
// ACCRUAL LIST - DEEP TESTS
// ============================================================================

describe('AccrualListPage - Deep', () => {
  it('renders page heading and subtext', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('Accrual Management')).toBeInTheDocument();
    expect(
      screen.getByText('Manage promotion accruals and GL postings')
    ).toBeInTheDocument();
  });

  it('renders the Calculate Accruals button', () => {
    render(<AccrualListPage />);
    expect(
      screen.getAllByText('Calculate Accruals').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state with description when no data', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('No accruals found')).toBeInTheDocument();
    expect(
      screen.getByText('Calculate accruals for a period to get started.')
    ).toBeInTheDocument();
  });

  it('renders period filter dropdown', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('All Periods')).toBeInTheDocument();
  });

  it('renders status filter dropdown', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons (table/grid)', () => {
    render(<AccrualListPage />);
    // The view mode buttons are icon-only, so check for testids or button count
    // Both table and grid buttons exist
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================================
// CHEQUE LIST - DEEP TESTS
// ============================================================================

describe('ChequeListPage - Deep', () => {
  it('renders page heading and subtext', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('Chequebook')).toBeInTheDocument();
    expect(
      screen.getByText('Manage cheque issuance and tracking')
    ).toBeInTheDocument();
  });

  it('renders Issue Cheque button', () => {
    render(<ChequeListPage />);
    expect(screen.getAllByText('Issue Cheque').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state with description when no data', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('No cheques found')).toBeInTheDocument();
    expect(
      screen.getByText('Issue a cheque to get started.')
    ).toBeInTheDocument();
  });

  it('renders status filter dropdown', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(<ChequeListPage />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================================
// DEDUCTION LIST - DEEP TESTS
// ============================================================================

describe('DeductionListPage - Deep', () => {
  it('renders page heading and subtext', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('Deductions')).toBeInTheDocument();
    expect(
      screen.getByText('Manage customer deductions and claim matching')
    ).toBeInTheDocument();
  });

  it('renders Record Deduction button', () => {
    render(<DeductionListPage />);
    expect(
      screen.getAllByText('Record Deduction').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state with description when no data', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('No deductions found')).toBeInTheDocument();
    expect(
      screen.getByText('Record a deduction to get started.')
    ).toBeInTheDocument();
  });

  it('renders status filter dropdown', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });

  it('renders customer filter dropdown', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('All Customers')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(<DeductionListPage />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
