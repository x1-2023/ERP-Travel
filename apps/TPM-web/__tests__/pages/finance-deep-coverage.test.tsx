/**
 * Finance Pages Deep Coverage Tests
 *
 * These tests render finance pages WITH data to exercise rendering code paths
 * that were missed by existing smoke tests (which only test empty/not-found states).
 * Targets: ChequeList, ChequeDetail, DeductionList, DeductionDetail, DeductionMatching,
 *          JournalList, JournalDetail, AccrualList, AccrualDetail, AccrualCalculate
 */

import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { server } from '../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================================================
// MOCK DATA
// ============================================================================

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
  claim: {
    id: 'claim-1',
    code: 'CLM-001',
    claimedAmount: 30000,
    approvedAmount: 25000,
    promotion: { id: 'promo-1', code: 'PROMO-001', name: 'Summer Sale' },
  },
  issuedAt: '2026-01-16',
  clearedAt: null,
  voidedAt: null,
  voidReason: null,
  createdAt: '2026-01-15',
  updatedAt: '2026-01-16',
};

const mockChequeSummary = {
  totalIssued: 5,
  totalCleared: 3,
  totalVoided: 1,
  totalPending: 2,
  issuedAmount: 125000,
  clearedAmount: 75000,
  pendingAmount: 50000,
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
  accrualId: null,
  accrual: null,
  claimId: null,
  claim: null,
  lines: [
    {
      id: 'line-1',
      lineNumber: 1,
      accountCode: '6100',
      accountName: 'Promotion Expense',
      debit: 50000,
      credit: 0,
      description: 'Q1 promo expense',
    },
    {
      id: 'line-2',
      lineNumber: 2,
      accountCode: '2100',
      accountName: 'Accrued Liabilities',
      debit: 0,
      credit: 50000,
      description: 'Q1 promo liability',
    },
  ],
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'cheque-1' }),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// ============================================================================
// MOCKS - Hooks (with data)
// ============================================================================

vi.mock('@/hooks/useCheques', () => ({
  useCheques: () => ({
    data: {
      cheques: [mockCheque, { ...mockCheque, id: 'cheque-2', chequeNumber: 'CHQ-2026-0002', status: 'CLEARED' }],
      summary: mockChequeSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCheque: () => ({
    data: mockCheque,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCreateCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useClearCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVoidCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  Cheque: {},
}));

vi.mock('@/hooks/useDeductions', () => ({
  useDeductions: () => ({
    data: {
      deductions: [mockDeduction, { ...mockDeduction, id: 'ded-2', code: 'DED-002', status: 'MATCHED' }],
      summary: mockDeductionSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useDeduction: () => ({
    data: mockDeduction,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCreateDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDisputeDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useResolveDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useMatchingSuggestions: () => ({
    data: [],
    isLoading: false,
  }),
  useMatchDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useJournals', () => ({
  useJournals: () => ({
    data: {
      journals: [mockJournal, { ...mockJournal, id: 'j-2', code: 'JRN-002', status: 'POSTED' }],
      summary: mockJournalSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useJournal: () => ({
    data: mockJournal,
    isLoading: false,
    isError: false,
    error: null,
  }),
  usePostJournal: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReverseJournal: () => ({ mutateAsync: vi.fn(), isPending: false }),
  Journal: {},
}));

vi.mock('@/hooks/useAccruals', () => ({
  useAccruals: () => ({
    data: {
      accruals: [mockAccrual, { ...mockAccrual, id: 'acc-2', period: '2026-02', status: 'CALCULATED' }],
      summary: mockAccrualSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useAccrual: () => ({
    data: mockAccrual,
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

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// ============================================================================
// MOCKS - Finance components
// ============================================================================

vi.mock('@/components/finance/ChequeStatusBadge', () => ({
  ChequeStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="cheque-status-badge">{status}</span>
  ),
}));

vi.mock('@/components/finance/ChequeStats', () => ({
  ChequeStats: ({ summary }: any) => (
    <div data-testid="cheque-stats">
      <span>Issued: {summary?.totalIssued}</span>
      <span>Cleared: {summary?.totalCleared}</span>
    </div>
  ),
}));

vi.mock('@/components/finance/ChequeCard', () => ({
  ChequeCard: ({ cheque }: any) => (
    <div data-testid="cheque-card">{cheque?.chequeNumber}</div>
  ),
}));

vi.mock('@/components/finance/DeductionStatusBadge', () => ({
  DeductionStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="deduction-status-badge">{status}</span>
  ),
}));

vi.mock('@/components/finance/DeductionStats', () => ({
  DeductionStats: ({ summary }: any) => (
    <div data-testid="deduction-stats">
      <span>Total: {summary?.totalAmount}</span>
    </div>
  ),
}));

vi.mock('@/components/finance/DeductionCard', () => ({
  DeductionCard: ({ deduction }: any) => (
    <div data-testid="deduction-card">{deduction?.code}</div>
  ),
}));

vi.mock('@/components/finance/MatchingSuggestionCard', () => ({
  MatchingSuggestionCard: ({ suggestion }: any) => (
    <div data-testid="matching-suggestion">{suggestion?.claimId}</div>
  ),
}));

vi.mock('@/components/finance/JournalStatusBadge', () => ({
  JournalStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="journal-status-badge">{status}</span>
  ),
}));

vi.mock('@/components/finance/JournalStats', () => ({
  JournalStats: ({ summary }: any) => (
    <div data-testid="journal-stats">
      <span>Draft: {summary?.totalDraft}</span>
      <span>Posted: {summary?.totalPosted}</span>
    </div>
  ),
}));

vi.mock('@/components/finance/JournalCard', () => ({
  JournalCard: ({ journal }: any) => (
    <div data-testid="journal-card">{journal?.code}</div>
  ),
}));

vi.mock('@/components/finance/AccrualStatusBadge', () => ({
  AccrualStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="accrual-status-badge">{status}</span>
  ),
}));

vi.mock('@/components/finance/FinanceStats', () => ({
  AccrualStats: ({ summary }: any) => (
    <div data-testid="accrual-stats">
      <span>Total: {summary?.totalAmount}</span>
    </div>
  ),
}));

vi.mock('@/components/finance/AccrualCard', () => ({
  AccrualCard: ({ accrual }: any) => (
    <div data-testid="accrual-card">{accrual?.period}</div>
  ),
}));

// Mock DataTable to render data
vi.mock('@/components/shared/DataTable', () => ({
  DataTable: ({ data, columns }: any) => (
    <div data-testid="data-table">
      <span>{data?.length || 0} rows</span>
      <span>{columns?.length || 0} columns</span>
    </div>
  ),
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@/components/shared/EmptyState', () => ({
  EmptyState: ({ title, description, action }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
      {action}
    </div>
  ),
}));

vi.mock('@/components/ui/currency-display', () => ({
  CurrencyDisplay: ({ amount }: { amount: number }) => (
    <span data-testid="currency">{typeof amount === 'number' ? amount.toLocaleString() : '0'}</span>
  ),
}));

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

import ChequeListPage from '@/pages/finance/cheques/ChequeList';
import ChequeDetailPage from '@/pages/finance/cheques/ChequeDetail';
import DeductionListPage from '@/pages/finance/deductions/DeductionList';
import DeductionDetailPage from '@/pages/finance/deductions/DeductionDetail';
import DeductionMatchingPage from '@/pages/finance/deductions/DeductionMatching';
import JournalListPage from '@/pages/finance/journals/JournalList';
import JournalDetailPage from '@/pages/finance/journals/JournalDetail';
import AccrualListPage from '@/pages/finance/accruals/AccrualList';
import AccrualDetailPage from '@/pages/finance/accruals/AccrualDetail';
import AccrualCalculatePage from '@/pages/finance/accruals/AccrualCalculate';

// ============================================================================
// 1. CHEQUE LIST PAGE (target: 28% -> higher)
// ============================================================================

describe('ChequeListPage - Deep Coverage', () => {
  it('renders without crashing and shows heading', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('Chequebook')).toBeInTheDocument();
    expect(screen.getByText('Manage cheque issuance and tracking')).toBeInTheDocument();
  });

  it('shows stat cards when data is available', () => {
    render(<ChequeListPage />);
    expect(screen.getByTestId('cheque-stats')).toBeInTheDocument();
    expect(screen.getByText('Issued: 5')).toBeInTheDocument();
    expect(screen.getByText('Cleared: 3')).toBeInTheDocument();
  });

  it('shows data table with cheque data', () => {
    render(<ChequeListPage />);
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('renders Issue Cheque button', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('Issue Cheque')).toBeInTheDocument();
  });

  it('does not show NaN in the rendered output', () => {
    const { container } = render(<ChequeListPage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders status filter with All Status option', () => {
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
// 2. CHEQUE DETAIL PAGE (target: 38% -> higher)
// ============================================================================

describe('ChequeDetailPage - Deep Coverage', () => {
  it('renders without crashing and shows cheque number', () => {
    render(<ChequeDetailPage />);
    expect(screen.getAllByText('CHQ-2026-0001').length).toBeGreaterThan(0);
  });

  it('shows cheque information card', () => {
    render(<ChequeDetailPage />);
    expect(screen.getByText('Cheque Information')).toBeInTheDocument();
  });

  it('shows bank information card', () => {
    render(<ChequeDetailPage />);
    expect(screen.getByText('Bank Information')).toBeInTheDocument();
    expect(screen.getByText('Vietcombank')).toBeInTheDocument();
  });

  it('shows customer card', () => {
    render(<ChequeDetailPage />);
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getAllByText('ABC Corp').length).toBeGreaterThan(0);
  });

  it('shows linked claim section', () => {
    render(<ChequeDetailPage />);
    expect(screen.getByText('Linked Claim')).toBeInTheDocument();
    expect(screen.getByText('CLM-001')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<ChequeDetailPage />);
    expect(screen.getByTestId('cheque-status-badge')).toBeInTheDocument();
    expect(screen.getByText('ISSUED')).toBeInTheDocument();
  });

  it('shows Mark Cleared and Void buttons for ISSUED cheque', () => {
    render(<ChequeDetailPage />);
    expect(screen.getByText('Mark Cleared')).toBeInTheDocument();
    expect(screen.getByText('Void')).toBeInTheDocument();
  });

  it('does not show NaN in rendered output', () => {
    const { container } = render(<ChequeDetailPage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('shows payee and memo when provided', () => {
    render(<ChequeDetailPage />);
    expect(screen.getByText('Payment for Q1 promotion')).toBeInTheDocument();
  });
});

// ============================================================================
// 3. DEDUCTION LIST PAGE (target: 30% -> higher)
// ============================================================================

describe('DeductionListPage - Deep Coverage', () => {
  it('renders without crashing and shows heading', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('Deductions')).toBeInTheDocument();
    expect(screen.getByText('Manage customer deductions and claim matching')).toBeInTheDocument();
  });

  it('shows stat cards when data is available', () => {
    render(<DeductionListPage />);
    expect(screen.getByTestId('deduction-stats')).toBeInTheDocument();
    expect(screen.getByText('Total: 45000')).toBeInTheDocument();
  });

  it('shows data table with deduction data', () => {
    render(<DeductionListPage />);
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('renders Record Deduction button', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('Record Deduction')).toBeInTheDocument();
  });

  it('does not show NaN in the rendered output', () => {
    const { container } = render(<DeductionListPage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders status and customer filter dropdowns', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('All Status')).toBeInTheDocument();
    expect(screen.getByText('All Customers')).toBeInTheDocument();
  });
});

// ============================================================================
// 4. DEDUCTION DETAIL PAGE (target: 36.5% -> higher)
// ============================================================================

describe('DeductionDetailPage - Deep Coverage', () => {
  it('renders without crashing and shows deduction code', () => {
    render(<DeductionDetailPage />);
    expect(screen.getByText('DED-001')).toBeInTheDocument();
  });

  it('shows deduction information card', () => {
    render(<DeductionDetailPage />);
    expect(screen.getByText('Deduction Information')).toBeInTheDocument();
  });

  it('shows invoice number', () => {
    render(<DeductionDetailPage />);
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
  });

  it('shows customer card with name', () => {
    render(<DeductionDetailPage />);
    expect(screen.getByText('Customer')).toBeInTheDocument();
  });

  it('shows action buttons for OPEN deduction', () => {
    render(<DeductionDetailPage />);
    expect(screen.getByText('Match Claim')).toBeInTheDocument();
    expect(screen.getByText('Dispute')).toBeInTheDocument();
  });

  it('shows deduction reason when provided', () => {
    render(<DeductionDetailPage />);
    expect(screen.getByText('Promotional discount')).toBeInTheDocument();
  });

  it('does not show NaN in rendered output', () => {
    const { container } = render(<DeductionDetailPage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('shows status badge', () => {
    render(<DeductionDetailPage />);
    expect(screen.getByTestId('deduction-status-badge')).toBeInTheDocument();
  });
});

// ============================================================================
// 5. DEDUCTION MATCHING PAGE (target: 38% -> higher)
// ============================================================================

describe('DeductionMatchingPage - Deep Coverage', () => {
  it('renders without crashing and shows heading', () => {
    render(<DeductionMatchingPage />);
    expect(screen.getByText('Match Deduction')).toBeInTheDocument();
    expect(screen.getByText('Find and match a claim for this deduction')).toBeInTheDocument();
  });

  it('shows deduction details card', () => {
    render(<DeductionMatchingPage />);
    expect(screen.getByText('Deduction Details')).toBeInTheDocument();
  });

  it('shows deduction code in details', () => {
    render(<DeductionMatchingPage />);
    expect(screen.getByText('DED-001')).toBeInTheDocument();
  });

  it('shows matching claims section', () => {
    render(<DeductionMatchingPage />);
    expect(screen.getByText('Matching Claims')).toBeInTheDocument();
  });

  it('shows customer name in details', () => {
    render(<DeductionMatchingPage />);
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
  });

  it('shows invoice number in details', () => {
    render(<DeductionMatchingPage />);
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
  });

  it('shows search input for claims', () => {
    render(<DeductionMatchingPage />);
    expect(screen.getByPlaceholderText('Search claims...')).toBeInTheDocument();
  });

  it('does not show NaN in rendered output', () => {
    const { container } = render(<DeductionMatchingPage />);
    expect(container.textContent).not.toContain('NaN');
  });
});

// ============================================================================
// 6. JOURNAL LIST PAGE (target: 31% -> higher)
// ============================================================================

describe('JournalListPage - Deep Coverage', () => {
  it('renders without crashing and shows heading', () => {
    render(<JournalListPage />);
    expect(screen.getByText('GL Journals')).toBeInTheDocument();
    expect(screen.getByText('Manage general ledger journal entries')).toBeInTheDocument();
  });

  it('shows stat cards when data is available', () => {
    render(<JournalListPage />);
    expect(screen.getByTestId('journal-stats')).toBeInTheDocument();
    expect(screen.getByText('Draft: 2')).toBeInTheDocument();
    expect(screen.getByText('Posted: 5')).toBeInTheDocument();
  });

  it('shows data table with journal data', () => {
    render(<JournalListPage />);
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('renders Create Journal button', () => {
    render(<JournalListPage />);
    expect(screen.getByText('Create Journal')).toBeInTheDocument();
  });

  it('does not show NaN in the rendered output', () => {
    const { container } = render(<JournalListPage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders status and type filter dropdowns', () => {
    render(<JournalListPage />);
    expect(screen.getByText('All Status')).toBeInTheDocument();
    expect(screen.getByText('All Types')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(<JournalListPage />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================================
// 7. JOURNAL DETAIL PAGE (target: 42% -> higher)
// ============================================================================

describe('JournalDetailPage - Deep Coverage', () => {
  it('renders without crashing and shows journal code', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('JRN-001')).toBeInTheDocument();
  });

  it('shows journal information card', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('Journal Information')).toBeInTheDocument();
  });

  it('shows journal type', () => {
    render(<JournalDetailPage />);
    // The journal type appears in the header subtitle and in the info card
    const accrualTexts = screen.getAllByText('ACCRUAL');
    expect(accrualTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows journal lines table', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('Journal Lines')).toBeInTheDocument();
    expect(screen.getByText('2 line(s)')).toBeInTheDocument();
  });

  it('shows account codes and names in lines', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('6100')).toBeInTheDocument();
    expect(screen.getByText('Promotion Expense')).toBeInTheDocument();
    expect(screen.getByText('2100')).toBeInTheDocument();
    expect(screen.getByText('Accrued Liabilities')).toBeInTheDocument();
  });

  it('shows related information card with customer', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('Related Information')).toBeInTheDocument();
  });

  it('shows Post to GL button for DRAFT journal', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('Post to GL')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<JournalDetailPage />);
    expect(screen.getByTestId('journal-status-badge')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  it('shows description and reference', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('Monthly accrual for Q1 promotions')).toBeInTheDocument();
    expect(screen.getByText('REF-001')).toBeInTheDocument();
  });

  it('does not show NaN in rendered output', () => {
    const { container } = render(<JournalDetailPage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('shows line descriptions', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('Q1 promo expense')).toBeInTheDocument();
    expect(screen.getByText('Q1 promo liability')).toBeInTheDocument();
  });

  it('shows total row in journal lines', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});

// ============================================================================
// 8. ACCRUAL LIST PAGE (target: 38.7% -> higher)
// ============================================================================

describe('AccrualListPage - Deep Coverage', () => {
  it('renders without crashing and shows heading', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('Accrual Management')).toBeInTheDocument();
    expect(screen.getByText('Manage promotion accruals and GL postings')).toBeInTheDocument();
  });

  it('shows stat cards when data is available', () => {
    render(<AccrualListPage />);
    expect(screen.getByTestId('accrual-stats')).toBeInTheDocument();
    expect(screen.getByText('Total: 90000')).toBeInTheDocument();
  });

  it('shows data table with accrual data', () => {
    render(<AccrualListPage />);
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('renders Calculate Accruals button', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('Calculate Accruals')).toBeInTheDocument();
  });

  it('does not show NaN in the rendered output', () => {
    const { container } = render(<AccrualListPage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('renders period and status filter dropdowns', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('All Periods')).toBeInTheDocument();
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(<AccrualListPage />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================================
// 9. ACCRUAL DETAIL PAGE (target: 42% -> higher)
// ============================================================================

describe('AccrualDetailPage - Deep Coverage', () => {
  it('renders without crashing and shows heading', () => {
    render(<AccrualDetailPage />);
    expect(screen.getByText('Accrual Detail')).toBeInTheDocument();
  });

  it('shows accrual information card', () => {
    render(<AccrualDetailPage />);
    expect(screen.getByText('Accrual Information')).toBeInTheDocument();
  });

  it('shows period', () => {
    render(<AccrualDetailPage />);
    // Period appears in header subtitle and info card
    const periodTexts = screen.getAllByText('2026-01');
    expect(periodTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows promotion card', () => {
    render(<AccrualDetailPage />);
    expect(screen.getByText('Promotion')).toBeInTheDocument();
    expect(screen.getByText('PROMO-001')).toBeInTheDocument();
    expect(screen.getByText('Summer Sale')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<AccrualDetailPage />);
    expect(screen.getByTestId('accrual-status-badge')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('shows Edit and Post to GL buttons for PENDING accrual', () => {
    render(<AccrualDetailPage />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Post to GL')).toBeInTheDocument();
  });

  it('shows notes', () => {
    render(<AccrualDetailPage />);
    expect(screen.getByText('Auto-calculated accrual')).toBeInTheDocument();
  });

  it('shows created by user name', () => {
    render(<AccrualDetailPage />);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('does not show NaN in rendered output', () => {
    const { container } = render(<AccrualDetailPage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('shows View Promotion Details link', () => {
    render(<AccrualDetailPage />);
    expect(screen.getByText('View Promotion Details')).toBeInTheDocument();
  });
});

// ============================================================================
// 10. ACCRUAL CALCULATE PAGE (target: 65% -> branch coverage)
// ============================================================================

describe('AccrualCalculatePage - Deep Coverage', () => {
  it('renders without crashing and shows heading', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Calculate Accruals')).toBeInTheDocument();
    expect(screen.getByText('Calculate accruals for active promotions in a period')).toBeInTheDocument();
  });

  it('shows all three step cards', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Step 1: Select Period')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Calculation Method')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Review & Calculate')).toBeInTheDocument();
  });

  it('shows period selection description', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Choose the accounting period for accrual calculation')).toBeInTheDocument();
  });

  it('shows calculation method options', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Percentage of Completion')).toBeInTheDocument();
    expect(screen.getByText('Pro-Rata (Time-based)')).toBeInTheDocument();
  });

  it('shows method descriptions', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Based on time elapsed vs total promotion duration')).toBeInTheDocument();
    expect(screen.getByText('Even distribution based on days in period')).toBeInTheDocument();
  });

  it('shows Preview Accruals button', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Preview Accruals')).toBeInTheDocument();
  });

  it('shows Preview Results section with placeholder text', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Preview Results')).toBeInTheDocument();
    expect(screen.getByText('Select a period and method, then click Preview')).toBeInTheDocument();
  });

  it('does not show NaN in rendered output', () => {
    const { container } = render(<AccrualCalculatePage />);
    expect(container.textContent).not.toContain('NaN');
  });

  it('does not show Calculate & Save button before preview', () => {
    render(<AccrualCalculatePage />);
    expect(screen.queryByText('Calculate & Save')).not.toBeInTheDocument();
  });
});
