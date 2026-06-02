/**
 * Function Coverage C Tests
 *
 * Covers uncovered functions and branches in:
 *  1. AccrualDetail - edit/save/post/reverse flows, GL journal display, reversed entry
 *  2. ChequeDetail - clear/void flows, linked claim, voided state, payee/memo/channel
 *  3. DeductionDetail - dispute/resolve flows, matched claim, partial resolution
 *  4. JournalDetail - post/reverse, journal lines, related entities
 *  5. ScenarioDetail - run/clone/delete/restore, tabs, baseline
 *  6. TemplateDetail - update/delete/apply, edit mode, tabs
 *  7. ClashList - detect/dismiss, stats, filters, pagination, empty state
 *  8. ApplyTemplateDialog - form submit, date auto-calc, customer/fund selects
 *  9. StockDistributionChart + StockValueChart - all three tabs, data rendering
 * 10. Header - help dialog, shortcuts dialog, refresh, logout, mobile menu
 * 11. Dashboard - refresh, alert banner, chart data transforms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import React from 'react';

// ============================================================================
// GLOBAL MOCKS
// ============================================================================

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
const mockToast = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'test-1' }),
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Bar: () => null,
  Line: () => null,
  Pie: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Cell: () => null,
  Area: () => null,
  AreaChart: ({ children }: any) => <div>{children}</div>,
}));

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAccrualPending = {
  id: 'test-1',
  period: '2026-01',
  amount: 50000,
  status: 'PENDING',
  promotionId: 'promo-1',
  promotion: { id: 'promo-1', code: 'PROMO-001', name: 'Summer Sale', budget: 200000, status: 'ACTIVE' },
  glJournal: null,
  notes: 'Test notes for accrual',
  createdBy: { id: 'user-1', name: 'John Doe' },
  createdAt: '2026-01-15',
  updatedAt: '2026-01-15',
};

const mockAccrualPosted = {
  ...mockAccrualPending,
  status: 'POSTED',
  glJournal: {
    entryNumber: 'GL-001',
    entryDate: '2026-01-31',
    debitAccount: '6100',
    creditAccount: '2100',
    amount: 50000,
    description: 'Accrual posting',
    reversedAt: '2026-02-05',
  },
};

const mockChequeIssued = {
  id: 'test-1',
  chequeNumber: 'CHQ-2026-0001',
  chequeDate: '2026-01-15',
  amount: 25000,
  status: 'ISSUED',
  bankAccount: 'ACC-1234',
  bankName: 'Vietcombank',
  payee: 'ABC Corp',
  memo: 'Payment for Q1',
  customerId: 'cust-1',
  customer: { id: 'cust-1', code: 'CUST001', name: 'ABC Corp', channel: 'MODERN_TRADE' },
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

const mockChequeVoided = {
  ...mockChequeIssued,
  status: 'VOIDED',
  voidReason: 'Incorrect amount',
  voidedAt: '2026-02-01',
};

const mockDeductionOpen = {
  id: 'test-1',
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

const mockDeductionDisputed = {
  ...mockDeductionOpen,
  status: 'DISPUTED',
  disputeReason: 'Invalid invoice reference',
  disputedAt: '2026-01-20',
  resolvedAt: null,
};

const mockDeductionMatched = {
  ...mockDeductionOpen,
  status: 'MATCHED',
  matchedClaimId: 'claim-1',
  matchedClaim: {
    code: 'CLM-001',
    amount: 15000,
    status: 'APPROVED',
    promotion: { name: 'Summer Sale' },
  },
  disputeReason: 'Old dispute',
  disputedAt: '2026-01-12',
  resolvedAt: '2026-01-25',
};

const mockJournalDraft = {
  id: 'test-1',
  code: 'JRN-001',
  journalType: 'ACCRUAL',
  journalDate: '2026-01-31',
  description: 'Monthly accrual',
  reference: 'REF-001',
  status: 'DRAFT',
  totalDebit: 50000,
  totalCredit: 50000,
  customerId: 'cust-1',
  customer: { id: 'cust-1', code: 'CUST001', name: 'ABC Corp' },
  promotionId: 'promo-1',
  promotion: { id: 'promo-1', code: 'PROMO-001', name: 'Summer Sale' },
  accrualId: 'acc-1',
  accrual: { code: 'ACC-001' },
  claimId: 'claim-1',
  claim: { code: 'CLM-001' },
  lines: [
    { id: 'line-1', lineNumber: 1, accountCode: '6100', accountName: 'Promo Expense', debit: 50000, credit: 0, description: 'Expense' },
    { id: 'line-2', lineNumber: 2, accountCode: '2100', accountName: 'Accrued Liab', debit: 0, credit: 50000, description: '' },
  ],
  postedAt: null,
  reversedById: null,
  reversedBy: null,
  reversalOfId: null,
  reversalOf: null,
  createdAt: '2026-01-31',
  updatedAt: '2026-01-31',
};

const mockJournalPosted = {
  ...mockJournalDraft,
  status: 'POSTED',
  postedAt: '2026-02-01',
  reversedById: null,
  reversedBy: null,
  reversalOfId: 'j-old',
  reversalOf: { code: 'JRN-OLD' },
};

const mockJournalReversed = {
  ...mockJournalDraft,
  status: 'POSTED',
  postedAt: '2026-02-01',
  reversedById: 'j-rev',
  reversedBy: { code: 'JRN-REV' },
};

const mockScenario = {
  id: 'test-1',
  name: 'Q1 Scenario',
  description: 'Scenario for Q1 planning',
  status: 'DRAFT',
  parameters: {
    promotionType: 'PERCENTAGE',
    discountPercent: 15,
    budget: 500000,
    duration: 30,
    targetCustomers: [],
    targetProducts: [],
    startDate: '2026-03-01',
    expectedLiftPercent: 20,
    redemptionRatePercent: 60,
  },
  assumptions: {
    baselineSalesPerDay: 10000,
    averageOrderValue: 500,
    marginPercent: 35,
    cannibalizedPercent: 5,
    haloEffectPercent: 3,
  },
  results: null,
  baseline: { id: 'bl-1', name: 'Q4 Baseline', code: 'BL-Q4' },
  createdAt: '2026-01-01',
  updatedAt: '2026-01-15',
};

const mockScenarioWithResults = {
  ...mockScenario,
  status: 'COMPLETED',
  results: {
    baselineSales: 300000,
    projectedSales: 360000,
    incrementalSales: 60000,
    salesLiftPercent: 20,
    promotionCost: 45000,
    fundingRequired: 45000,
    costPerIncrementalUnit: 7.5,
    grossMargin: 126000,
    netMargin: 81000,
    roi: 180,
    paybackDays: 12,
    projectedUnits: 720,
    incrementalUnits: 120,
    redemptions: 432,
    dailyProjections: [],
  },
};

const mockVersions = {
  data: {
    versions: [
      {
        id: 'v-1',
        version: 1,
        createdAt: '2026-01-05',
        notes: 'Initial version',
        summary: { roi: 150, netMargin: 70000, salesLiftPercent: 18 },
      },
      {
        id: 'v-2',
        version: 2,
        createdAt: '2026-01-10',
        notes: null,
        summary: null,
      },
    ],
  },
};

const mockTemplate = {
  id: 'test-1',
  code: 'TPL-001',
  name: 'Summer Sale Template',
  description: 'Template for summer promotions',
  type: 'PERCENTAGE',
  category: 'Seasonal',
  defaultDuration: 30,
  defaultBudget: 100000,
  mechanics: { discountType: 'PERCENTAGE', discountValue: 15 },
  eligibility: { customerTypes: ['RETAIL'] },
  isActive: true,
  usageCount: 5,
  versions: [],
  promotions: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-15',
  createdById: 'user-1',
};

const mockClash = {
  id: 'clash-1',
  promotionId: 'promo-1',
  promotion: { id: 'promo-1', code: 'PROMO-001', name: 'Summer Sale', type: 'PERCENTAGE', status: 'ACTIVE', startDate: '2026-01-01', endDate: '2026-03-31' },
  clashWithId: 'promo-2',
  clashWith: { id: 'promo-2', code: 'PROMO-002', name: 'Spring Discount', type: 'FIXED', status: 'ACTIVE', startDate: '2026-02-15', endDate: '2026-04-15' },
  clashType: 'DATE_OVERLAP',
  severity: 'HIGH',
  description: 'Overlapping date ranges',
  impact: 50000,
  status: 'DETECTED',
  createdAt: '2026-01-20',
};

const mockClashStats = {
  total: 5,
  unresolvedHigh: 2,
  byStatus: { REVIEWING: 1, DETECTED: 3, RESOLVED: 1 },
  resolutionRate: 20,
  totalPotentialImpact: 250000,
};

// ============================================================================
// HOOK MOCKS
// ============================================================================

// -- Accruals --
const mockUpdateAccrualMutateAsync = vi.fn().mockResolvedValue({});
const mockPostAccrualMutateAsync = vi.fn().mockResolvedValue({});
const mockReverseAccrualMutateAsync = vi.fn().mockResolvedValue({});

let currentAccrualData: any = mockAccrualPending;

vi.mock('@/hooks/useAccruals', () => ({
  useAccrual: () => ({
    data: currentAccrualData,
    isLoading: false,
    error: null,
  }),
  useUpdateAccrual: () => ({
    mutateAsync: mockUpdateAccrualMutateAsync,
    isPending: false,
  }),
  usePostAccrual: () => ({
    mutateAsync: mockPostAccrualMutateAsync,
    isPending: false,
  }),
  useReverseAccrual: () => ({
    mutateAsync: mockReverseAccrualMutateAsync,
    isPending: false,
  }),
}));

// -- Cheques --
const mockClearChequeMutateAsync = vi.fn().mockResolvedValue({});
const mockVoidChequeMutateAsync = vi.fn().mockResolvedValue({});

let currentChequeData: any = mockChequeIssued;

vi.mock('@/hooks/useCheques', () => ({
  useCheque: () => ({
    data: currentChequeData,
    isLoading: false,
    error: null,
  }),
  useClearCheque: () => ({
    mutateAsync: mockClearChequeMutateAsync,
    isPending: false,
  }),
  useVoidCheque: () => ({
    mutateAsync: mockVoidChequeMutateAsync,
    isPending: false,
  }),
}));

// -- Deductions --
const mockDisputeMutateAsync = vi.fn().mockResolvedValue({});
const mockResolveMutateAsync = vi.fn().mockResolvedValue({});

let currentDeductionData: any = mockDeductionOpen;

vi.mock('@/hooks/useDeductions', () => ({
  useDeduction: () => ({
    data: currentDeductionData,
    isLoading: false,
    error: null,
  }),
  useDisputeDeduction: () => ({
    mutateAsync: mockDisputeMutateAsync,
    isPending: false,
  }),
  useResolveDeduction: () => ({
    mutateAsync: mockResolveMutateAsync,
    isPending: false,
  }),
}));

// -- Journals --
const mockPostJournalMutateAsync = vi.fn().mockResolvedValue({});
const mockReverseJournalMutateAsync = vi.fn().mockResolvedValue({});

let currentJournalData: any = mockJournalDraft;

vi.mock('@/hooks/useJournals', () => ({
  useJournal: () => ({
    data: currentJournalData,
    isLoading: false,
    error: null,
  }),
  usePostJournal: () => ({
    mutateAsync: mockPostJournalMutateAsync,
    isPending: false,
  }),
  useReverseJournal: () => ({
    mutateAsync: mockReverseJournalMutateAsync,
    isPending: false,
  }),
}));

// -- Scenarios --
const mockRunMutateAsync = vi.fn().mockResolvedValue({});
const mockCloneMutateAsync = vi.fn().mockResolvedValue({ id: 'cloned-1' });
const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});
const mockRestoreMutateAsync = vi.fn().mockResolvedValue({});

let currentScenarioData: any = mockScenario;
let currentVersionsData: any = mockVersions;

vi.mock('@/hooks/planning/useScenarios', () => ({
  useScenario: () => ({
    data: currentScenarioData,
    isLoading: false,
    error: null,
  }),
  useScenarioVersions: () => ({
    data: currentVersionsData,
  }),
  useRunScenario: () => ({
    mutateAsync: mockRunMutateAsync,
    isPending: false,
  }),
  useCloneScenario: () => ({
    mutateAsync: mockCloneMutateAsync,
    isPending: false,
  }),
  useDeleteScenario: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
  useRestoreScenarioVersion: () => ({
    mutateAsync: mockRestoreMutateAsync,
    isPending: false,
  }),
}));

// -- Templates --
const mockUpdateTemplateMutateAsync = vi.fn().mockResolvedValue({});
const mockDeleteTemplateMutateAsync = vi.fn().mockResolvedValue({});
const mockApplyTemplateMutateAsync = vi.fn().mockResolvedValue({ data: { id: 'new-promo-1' } });

vi.mock('@/hooks/planning/useTemplates', () => ({
  useTemplate: () => ({
    data: { data: mockTemplate },
    isLoading: false,
    error: null,
  }),
  useUpdateTemplate: () => ({
    mutateAsync: mockUpdateTemplateMutateAsync,
    isPending: false,
  }),
  useDeleteTemplate: () => ({
    mutateAsync: mockDeleteTemplateMutateAsync,
    isPending: false,
  }),
  useApplyTemplate: () => ({
    mutateAsync: mockApplyTemplateMutateAsync,
    isPending: false,
  }),
}));

// -- Clashes --
const mockDetectMutateAsync = vi.fn().mockResolvedValue({ summary: { checked: 10, clashesFound: 2 } });
const mockDismissMutateAsync = vi.fn().mockResolvedValue({});

let currentClashesData: any = { data: [mockClash], pagination: { page: 1, totalPages: 2, total: 12 } };
let currentClashStatsData: any = mockClashStats;

vi.mock('@/hooks/planning/useClashes', () => ({
  useClashes: () => ({
    data: currentClashesData,
    isLoading: false,
    error: null,
  }),
  useClashStats: () => ({
    data: currentClashStatsData,
  }),
  useDetectClashes: () => ({
    mutateAsync: mockDetectMutateAsync,
    isPending: false,
  }),
  useDismissClash: () => ({
    mutateAsync: mockDismissMutateAsync,
    isPending: false,
  }),
}));

// -- Customers & Funds --
vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({
    data: {
      customers: [
        { id: 'cust-1', name: 'ABC Corp' },
        { id: 'cust-2', name: 'XYZ Ltd' },
      ],
    },
  }),
}));

vi.mock('@/hooks/useFunds', () => ({
  useFunds: () => ({
    data: {
      funds: [
        { id: 'fund-1', name: 'Trade Fund 2026', availableBudget: 500000 },
        { id: 'fund-2', name: 'Marketing Fund', availableBudget: 200000 },
      ],
    },
  }),
}));

// -- Dashboard --
const mockRefetchStats = vi.fn().mockResolvedValue({});
const mockRefetchSpend = vi.fn().mockResolvedValue({});
const mockRefetchStatus = vi.fn().mockResolvedValue({});
const mockRefetchCustomers = vi.fn().mockResolvedValue({});

vi.mock('@/hooks/useDashboard', () => ({
  useDashboardStats: () => ({
    data: {
      totalBudget: 15000000000,
      utilizedBudget: 9750000000,
      utilizationRate: 65,
      activePromotions: 24,
      pendingClaims: 12,
      totalClaims: 156,
      overduePromotions: 3,
      atRiskPromotions: 5,
    },
    isLoading: false,
    refetch: mockRefetchStats,
  }),
  useSpendTrend: () => ({
    data: [{ month: 'Jan', budget: 1200000000, spend: 980000000 }],
    refetch: mockRefetchSpend,
  }),
  useStatusDistribution: () => ({
    data: [{ name: 'Active', value: 24 }],
    refetch: mockRefetchStatus,
  }),
  useTopCustomers: () => ({
    data: [{ name: 'Big C', spend: 1500000000 }],
    refetch: mockRefetchCustomers,
  }),
}));

// -- Header stores --
const mockLogout = vi.fn();
const mockToggleSidebar = vi.fn();

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { name: 'Admin User', role: 'ADMIN', email: 'admin@example.com' },
    logout: mockLogout,
  }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    toggleSidebar: mockToggleSidebar,
  }),
}));

// -- Header sub-components --
vi.mock('@/components/notifications/NotificationDropdown', () => ({
  NotificationDropdown: () => <div data-testid="notifications">Notifications</div>,
}));

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggleCompact: () => <div data-testid="theme-toggle">Theme</div>,
}));

vi.mock('@/components/ui/LanguageToggle', () => ({
  LanguageToggle: () => <div data-testid="lang-toggle">Lang</div>,
}));

// -- Planning sub-components --
vi.mock('@/components/planning/ScenarioResults', () => ({
  ScenarioResults: ({ results }: any) => <div data-testid="scenario-results">ROI: {results?.roi}</div>,
}));

vi.mock('@/components/planning/ScenarioStatusBadge', () => ({
  ScenarioStatusBadge: ({ status }: any) => <span data-testid="scenario-status">{status}</span>,
}));

vi.mock('@/components/planning/TemplatePreview', () => ({
  TemplatePreview: ({ template }: any) => <div data-testid="template-preview">{template?.name}</div>,
}));

vi.mock('@/components/planning/TemplateForm', () => ({
  TemplateForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="template-form">
      <button data-testid="template-form-submit" onClick={() => onSubmit({ name: 'Updated', description: 'Desc', category: 'Cat', mechanics: {}, eligibility: {}, isActive: true })}>
        SubmitForm
      </button>
      <button data-testid="template-form-cancel" onClick={onCancel}>CancelForm</button>
    </div>
  ),
}));

vi.mock('@/components/planning/ClashCard', () => ({
  ClashCard: ({ clash, onDismiss }: any) => (
    <div data-testid={`clash-${clash.id}`}>
      <span>{clash.description}</span>
      <button data-testid="dismiss-clash-btn" onClick={() => onDismiss(clash.id)}>DismissClash</button>
    </div>
  ),
}));

// -- Finance sub-components --
vi.mock('@/components/finance/AccrualStatusBadge', () => ({
  AccrualStatusBadge: ({ status }: any) => <span data-testid="accrual-status">{status}</span>,
}));

vi.mock('@/components/finance/ChequeStatusBadge', () => ({
  ChequeStatusBadge: ({ status }: any) => <span data-testid="cheque-status">{status}</span>,
}));

vi.mock('@/components/finance/DeductionStatusBadge', () => ({
  DeductionStatusBadge: ({ status }: any) => <span data-testid="deduction-status">{status}</span>,
}));

vi.mock('@/components/finance/JournalStatusBadge', () => ({
  JournalStatusBadge: ({ status }: any) => <span data-testid="journal-status">{status}</span>,
}));

// -- Dashboard chart components --
vi.mock('@/components/charts/AreaChart', () => ({
  AreaChart: ({ title }: any) => <div data-testid="area-chart">{title}</div>,
}));

vi.mock('@/components/charts/BarChart', () => ({
  BarChart: ({ title }: any) => <div data-testid="bar-chart-component">{title}</div>,
}));

vi.mock('@/components/charts/PieChart', () => ({
  PieChart: ({ title }: any) => <div data-testid="pie-chart-component">{title}</div>,
}));

vi.mock('@/components/shared/page-header', () => ({
  PageHeader: ({ title, actions }: any) => (
    <div data-testid="page-header">
      <span>{title}</span>
      {actions}
    </div>
  ),
}));

// Mock date-fns format used by Dashboard
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: () => 'mock-date',
  };
});

// ============================================================================
// RESET
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  currentAccrualData = mockAccrualPending;
  currentChequeData = mockChequeIssued;
  currentDeductionData = mockDeductionOpen;
  currentJournalData = mockJournalDraft;
  currentScenarioData = mockScenario;
  currentVersionsData = mockVersions;
  currentClashesData = { data: [mockClash], pagination: { page: 1, totalPages: 2, total: 12 } };
  currentClashStatsData = mockClashStats;
});

// ============================================================================
// 1. AccrualDetail
// ============================================================================

describe('AccrualDetailPage', () => {
  const loadComponent = async () => {
    const mod = await import('@/pages/finance/accruals/AccrualDetail');
    return mod.default;
  };

  it('renders PENDING accrual with edit/post buttons and handles edit flow', async () => {
    const AccrualDetail = await loadComponent();
    render(<AccrualDetail />);

    expect(screen.getByText('Accrual Detail')).toBeInTheDocument();
    expect(screen.getByTestId('accrual-status')).toHaveTextContent('PENDING');
    expect(screen.getByText('PROMO-001 - 2026-01')).toBeInTheDocument();
    expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    expect(screen.getByText('Test notes for accrual')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Click Edit
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

    // Now editing - input appears
    const amountInput = screen.getByDisplayValue('50000');
    expect(amountInput).toBeInTheDocument();

    // Change amount and save
    fireEvent.change(amountInput, { target: { value: '60000' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => expect(mockUpdateAccrualMutateAsync).toHaveBeenCalledWith({
      id: 'test-1',
      data: { amount: 60000, notes: 'Test notes for accrual' },
    }));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success' }));
  });

  it('handles cancel editing', async () => {
    const AccrualDetail = await loadComponent();
    render(<AccrualDetail />);

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });

  it('opens and confirms Post to GL dialog', async () => {
    const AccrualDetail = await loadComponent();
    render(<AccrualDetail />);

    fireEvent.click(screen.getByRole('button', { name: /Post to GL/i }));
    expect(screen.getByText('Post Accrual to GL')).toBeInTheDocument();

    // Click the confirm Post to GL button inside the dialog footer
    const dialogButtons = screen.getAllByRole('button');
    const confirmPostBtn = dialogButtons.find(
      (btn) => btn.textContent === 'Post to GL' && btn.closest('[role="dialog"]')
    );
    expect(confirmPostBtn).toBeDefined();
    if (confirmPostBtn) fireEvent.click(confirmPostBtn);

    await waitFor(() => expect(mockPostAccrualMutateAsync).toHaveBeenCalled());
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Accrual posted to GL successfully' }));
  });

  it('renders POSTED accrual with GL journal and reverse button', async () => {
    currentAccrualData = mockAccrualPosted;
    const AccrualDetail = await loadComponent();
    render(<AccrualDetail />);

    expect(screen.getByTestId('accrual-status')).toHaveTextContent('POSTED');
    expect(screen.getByText('GL Journal Entry')).toBeInTheDocument();
    expect(screen.getByText(/GL-001/)).toBeInTheDocument();
    expect(screen.getByText(/This entry was reversed on/)).toBeInTheDocument();

    // Click Reverse in the header (it says "Reverse" with icon)
    const allButtons = screen.getAllByRole('button');
    const reverseHeaderBtn = allButtons.find((btn) => {
      const text = btn.textContent || '';
      return text.includes('Reverse') && !btn.closest('[role="dialog"]');
    });
    expect(reverseHeaderBtn).toBeDefined();
    if (reverseHeaderBtn) fireEvent.click(reverseHeaderBtn);

    // Dialog opens - use heading role to avoid matching the button too
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Reverse Accrual' })).toBeInTheDocument());

    // Enter reason
    const reasonInput = screen.getByPlaceholderText('Enter reason...');
    fireEvent.change(reasonInput, { target: { value: 'Incorrect calculation' } });

    // Confirm reverse in dialog
    const dialogButtons = screen.getAllByRole('button');
    const confirmReverseBtn = dialogButtons.find(
      (btn) => (btn.textContent || '').includes('Reverse Accrual') && btn.closest('[role="dialog"]')
    );
    expect(confirmReverseBtn).toBeDefined();
    if (confirmReverseBtn) fireEvent.click(confirmReverseBtn);

    await waitFor(() => expect(mockReverseAccrualMutateAsync).toHaveBeenCalledWith({
      id: 'test-1',
      reason: 'Incorrect calculation',
    }));
  });

  it('handles save error', async () => {
    mockUpdateAccrualMutateAsync.mockRejectedValueOnce(new Error('fail'));
    const AccrualDetail = await loadComponent();
    render(<AccrualDetail />);

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });

  it('navigates back when clicking back button', async () => {
    const AccrualDetail = await loadComponent();
    render(<AccrualDetail />);

    const backButtons = screen.getAllByRole('button');
    fireEvent.click(backButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/finance/accruals');
  });

  it('handles post error', async () => {
    mockPostAccrualMutateAsync.mockRejectedValueOnce(new Error('post fail'));
    const AccrualDetail = await loadComponent();
    render(<AccrualDetail />);

    fireEvent.click(screen.getByRole('button', { name: /Post to GL/i }));

    const dialogButtons = screen.getAllByRole('button');
    const confirmPostBtn = dialogButtons.find(
      (btn) => btn.textContent === 'Post to GL' && btn.closest('[role="dialog"]')
    );
    if (confirmPostBtn) fireEvent.click(confirmPostBtn);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });

  it('handles reverse error', async () => {
    currentAccrualData = mockAccrualPosted;
    mockReverseAccrualMutateAsync.mockRejectedValueOnce(new Error('reverse fail'));
    const AccrualDetail = await loadComponent();
    render(<AccrualDetail />);

    const allButtons = screen.getAllByRole('button');
    const reverseBtn = allButtons.find((btn) => (btn.textContent || '').includes('Reverse') && !btn.closest('[role="dialog"]'));
    if (reverseBtn) fireEvent.click(reverseBtn);

    await waitFor(() => expect(screen.getByPlaceholderText('Enter reason...')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Enter reason...'), { target: { value: 'test' } });

    const dialogButtons = screen.getAllByRole('button');
    const confirmBtn = dialogButtons.find((btn) => btn.textContent === 'Reverse Accrual' && btn.closest('[role="dialog"]'));
    if (confirmBtn) fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });
});

// ============================================================================
// 2. ChequeDetail
// ============================================================================

describe('ChequeDetailPage', () => {
  const loadComponent = async () => {
    const mod = await import('@/pages/finance/cheques/ChequeDetail');
    return mod.default;
  };

  it('renders ISSUED cheque with all info, linked claim, and handles clear flow', async () => {
    const ChequeDetail = await loadComponent();
    render(<ChequeDetail />);

    // CHQ-2026-0001 appears in both header and info card - use getAllByText
    expect(screen.getAllByText('CHQ-2026-0001').length).toBeGreaterThan(0);
    expect(screen.getByTestId('cheque-status')).toHaveTextContent('ISSUED');
    expect(screen.getByText('Vietcombank')).toBeInTheDocument();
    expect(screen.getByText('ACC-1234')).toBeInTheDocument();
    expect(screen.getByText('Payment for Q1')).toBeInTheDocument();
    expect(screen.getByText('Linked Claim')).toBeInTheDocument();
    expect(screen.getByText('CLM-001')).toBeInTheDocument();
    expect(screen.getByText('MODERN_TRADE')).toBeInTheDocument();

    // Open clear dialog
    const allButtons = screen.getAllByRole('button');
    const clearBtn = allButtons.find((btn) => (btn.textContent || '').includes('Mark Cleared') && !btn.closest('[role="dialog"]'));
    expect(clearBtn).toBeDefined();
    if (clearBtn) fireEvent.click(clearBtn);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Mark Cheque as Cleared' })).toBeInTheDocument());

    // Set clear date via the date input inside the dialog
    const dialog = document.querySelector('[role="dialog"]');
    const dateInput = dialog?.querySelector('input[type="date"]');
    expect(dateInput).toBeTruthy();
    if (dateInput) fireEvent.change(dateInput, { target: { value: '2026-02-01' } });

    // Confirm
    const dialogButtons = screen.getAllByRole('button');
    const confirmClearBtn = dialogButtons.find(
      (btn) => (btn.textContent || '').includes('Mark Cleared') && btn.closest('[role="dialog"]')
    );
    if (confirmClearBtn) fireEvent.click(confirmClearBtn);

    await waitFor(() => expect(mockClearChequeMutateAsync).toHaveBeenCalledWith({
      id: 'test-1',
      clearDate: '2026-02-01',
    }));
  });

  it('opens void dialog, validates reason, and confirms', async () => {
    const ChequeDetail = await loadComponent();
    render(<ChequeDetail />);

    // Click the Void button in header (not in dialog)
    const allButtons = screen.getAllByRole('button');
    const voidBtn = allButtons.find((btn) => {
      const txt = btn.textContent || '';
      return txt.includes('Void') && !btn.closest('[role="dialog"]');
    });
    expect(voidBtn).toBeDefined();
    if (voidBtn) fireEvent.click(voidBtn);

    // Use heading role to avoid matching the button with same text
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Void Cheque' })).toBeInTheDocument());

    // Try to void without reason
    const dialogButtons = screen.getAllByRole('button');
    const confirmVoidBtn = dialogButtons.find(
      (btn) => (btn.textContent || '').includes('Void Cheque') && btn.closest('[role="dialog"]')
    );
    if (confirmVoidBtn) fireEvent.click(confirmVoidBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Please enter a void reason' })));

    // Enter reason and confirm
    const textarea = screen.getByPlaceholderText('Enter reason...');
    fireEvent.change(textarea, { target: { value: 'Duplicate payment' } });

    if (confirmVoidBtn) fireEvent.click(confirmVoidBtn);
    await waitFor(() => expect(mockVoidChequeMutateAsync).toHaveBeenCalledWith({
      id: 'test-1',
      voidReason: 'Duplicate payment',
    }));
  });

  it('renders VOIDED cheque with void info', async () => {
    currentChequeData = mockChequeVoided;
    const ChequeDetail = await loadComponent();
    render(<ChequeDetail />);

    expect(screen.getByTestId('cheque-status')).toHaveTextContent('VOIDED');
    expect(screen.getByText('Void Information')).toBeInTheDocument();
    expect(screen.getByText('Incorrect amount')).toBeInTheDocument();
  });

  it('renders cheque with clearedAt', async () => {
    currentChequeData = { ...mockChequeIssued, status: 'CLEARED', clearedAt: '2026-02-01' };
    const ChequeDetail = await loadComponent();
    render(<ChequeDetail />);

    expect(screen.getByText('Cleared At')).toBeInTheDocument();
  });

  it('handles clear error', async () => {
    mockClearChequeMutateAsync.mockRejectedValueOnce({ message: 'clear failed' });
    const ChequeDetail = await loadComponent();
    render(<ChequeDetail />);

    const allButtons = screen.getAllByRole('button');
    const clearBtn = allButtons.find((btn) => (btn.textContent || '').includes('Mark Cleared') && !btn.closest('[role="dialog"]'));
    if (clearBtn) fireEvent.click(clearBtn);

    const dialogButtons = screen.getAllByRole('button');
    const confirmBtn = dialogButtons.find((btn) => btn.textContent === 'Mark Cleared' && btn.closest('[role="dialog"]'));
    if (confirmBtn) fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });
});

// ============================================================================
// 3. DeductionDetail
// ============================================================================

describe('DeductionDetailPage', () => {
  const loadComponent = async () => {
    const mod = await import('@/pages/finance/deductions/DeductionDetail');
    return mod.default;
  };

  it('renders OPEN deduction with Match Claim and Dispute buttons', async () => {
    const DeductionDetail = await loadComponent();
    render(<DeductionDetail />);

    expect(screen.getByText('DED-001')).toBeInTheDocument();
    expect(screen.getByTestId('deduction-status')).toHaveTextContent('OPEN');
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Promotional discount')).toBeInTheDocument();
    expect(screen.getByText('MODERN_TRADE')).toBeInTheDocument();

    // Match Claim navigates
    const matchBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Match Claim'));
    expect(matchBtn).toBeDefined();
    if (matchBtn) fireEvent.click(matchBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/finance/deductions/test-1/match');
  });

  it('opens dispute dialog, validates, and confirms', async () => {
    const DeductionDetail = await loadComponent();
    render(<DeductionDetail />);

    // Open dispute dialog
    const allButtons = screen.getAllByRole('button');
    const disputeBtn = allButtons.find((btn) => {
      const txt = btn.textContent || '';
      return txt.includes('Dispute') && !btn.closest('[role="dialog"]');
    });
    expect(disputeBtn).toBeDefined();
    if (disputeBtn) fireEvent.click(disputeBtn);

    // Use heading role to avoid matching the button with same text
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Dispute Deduction' })).toBeInTheDocument());

    // Click confirm without reason
    const dialogButtons = screen.getAllByRole('button');
    const confirmDisputeBtn = dialogButtons.find(
      (btn) => (btn.textContent || '').includes('Dispute Deduction') && btn.closest('[role="dialog"]')
    );
    if (confirmDisputeBtn) fireEvent.click(confirmDisputeBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Please enter a reason' })));

    // Enter reason and confirm
    const textarea = screen.getByPlaceholderText('Enter reason...');
    fireEvent.change(textarea, { target: { value: 'Invalid deduction' } });

    if (confirmDisputeBtn) fireEvent.click(confirmDisputeBtn);
    await waitFor(() => expect(mockDisputeMutateAsync).toHaveBeenCalledWith({
      id: 'test-1',
      reason: 'Invalid deduction',
    }));
  });

  it('renders DISPUTED deduction with Resolve button and handles resolve flow', async () => {
    currentDeductionData = mockDeductionDisputed;
    const DeductionDetail = await loadComponent();
    render(<DeductionDetail />);

    expect(screen.getByTestId('deduction-status')).toHaveTextContent('DISPUTED');
    expect(screen.getByText('Dispute Information')).toBeInTheDocument();
    expect(screen.getByText('Invalid invoice reference')).toBeInTheDocument();

    // Open resolve dialog
    const resolveBtn = screen.getAllByRole('button').find((btn) => {
      const txt = btn.textContent || '';
      return txt.includes('Resolve') && !btn.closest('[role="dialog"]');
    });
    expect(resolveBtn).toBeDefined();
    if (resolveBtn) fireEvent.click(resolveBtn);

    expect(screen.getByText('Resolve Dispute')).toBeInTheDocument();

    // Confirm with default ACCEPT
    const dialogButtons = screen.getAllByRole('button');
    const confirmResolveBtn = dialogButtons.find(
      (btn) => btn.textContent === 'Resolve' && btn.closest('[role="dialog"]')
    );
    if (confirmResolveBtn) fireEvent.click(confirmResolveBtn);
    await waitFor(() => expect(mockResolveMutateAsync).toHaveBeenCalledWith({
      id: 'test-1',
      resolution: 'ACCEPT',
      amount: undefined,
      notes: undefined,
    }));
  });

  it('renders matched deduction with matched claim info and resolved date', async () => {
    currentDeductionData = mockDeductionMatched;
    const DeductionDetail = await loadComponent();
    render(<DeductionDetail />);

    expect(screen.getByText('Matched Claim')).toBeInTheDocument();
    expect(screen.getByText('CLM-001')).toBeInTheDocument();
    expect(screen.getByText('Resolved At')).toBeInTheDocument();
  });

  it('handles dispute error', async () => {
    mockDisputeMutateAsync.mockRejectedValueOnce(new Error('fail'));
    const DeductionDetail = await loadComponent();
    render(<DeductionDetail />);

    const disputeBtn = screen.getAllByRole('button').find((btn) => btn.textContent === 'Dispute' && !btn.closest('[role="dialog"]'));
    if (disputeBtn) fireEvent.click(disputeBtn);

    const textarea = screen.getByPlaceholderText('Enter reason...');
    fireEvent.change(textarea, { target: { value: 'Test reason' } });

    const confirmBtn = screen.getAllByRole('button').find((btn) => btn.textContent === 'Dispute Deduction' && btn.closest('[role="dialog"]'));
    if (confirmBtn) fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });

  it('handles resolve error', async () => {
    currentDeductionData = mockDeductionDisputed;
    mockResolveMutateAsync.mockRejectedValueOnce(new Error('resolve fail'));
    const DeductionDetail = await loadComponent();
    render(<DeductionDetail />);

    const resolveBtn = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('Resolve') && !btn.closest('[role="dialog"]'));
    if (resolveBtn) fireEvent.click(resolveBtn);

    const confirmBtn = screen.getAllByRole('button').find((btn) => btn.textContent === 'Resolve' && btn.closest('[role="dialog"]'));
    if (confirmBtn) fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });
});

// ============================================================================
// 4. JournalDetail
// ============================================================================

describe('JournalDetailPage', () => {
  const loadComponent = async () => {
    const mod = await import('@/pages/finance/journals/JournalDetail');
    return mod.default;
  };

  it('renders DRAFT journal with post button, journal lines, and related info', async () => {
    const JournalDetail = await loadComponent();
    render(<JournalDetail />);

    expect(screen.getByText('JRN-001')).toBeInTheDocument();
    expect(screen.getByTestId('journal-status')).toHaveTextContent('DRAFT');
    expect(screen.getByText('Monthly accrual')).toBeInTheDocument();
    expect(screen.getByText('REF-001')).toBeInTheDocument();
    expect(screen.getByText('Promo Expense')).toBeInTheDocument();
    expect(screen.getByText('6100')).toBeInTheDocument();
    expect(screen.getByText('Accrued Liab')).toBeInTheDocument();
    expect(screen.getByText('2100')).toBeInTheDocument();
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
    expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    expect(screen.getByText('ACC-001')).toBeInTheDocument();
    expect(screen.getByText('CLM-001')).toBeInTheDocument();

    // Post button
    const postBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Post to GL'));
    expect(postBtn).toBeDefined();
    if (postBtn) fireEvent.click(postBtn);
    await waitFor(() => expect(mockPostJournalMutateAsync).toHaveBeenCalledWith({ id: 'test-1' }));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Journal posted successfully' }));
  });

  it('renders POSTED journal with reverse button and confirms reverse', async () => {
    currentJournalData = { ...mockJournalPosted, reversedById: null };
    const JournalDetail = await loadComponent();
    render(<JournalDetail />);

    expect(screen.getByText('Posted At')).toBeInTheDocument();
    expect(screen.getByText('Reversal Of')).toBeInTheDocument();
    expect(screen.getByText('JRN-OLD')).toBeInTheDocument();

    // Click Reverse header button
    const allButtons = screen.getAllByRole('button');
    const reverseBtn = allButtons.find((btn) => (btn.textContent || '').includes('Reverse') && !btn.closest('[role="dialog"]'));
    expect(reverseBtn).toBeDefined();
    if (reverseBtn) fireEvent.click(reverseBtn);

    // Use heading role to avoid matching the button with same text
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Reverse Journal' })).toBeInTheDocument());

    // Try without reason
    const dialogButtons = screen.getAllByRole('button');
    const confirmReverseBtn = dialogButtons.find(
      (btn) => (btn.textContent || '').includes('Reverse Journal') && btn.closest('[role="dialog"]')
    );
    if (confirmReverseBtn) fireEvent.click(confirmReverseBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Please enter a reason' })));

    // Enter reason and confirm
    const textarea = screen.getByPlaceholderText('Enter reason...');
    fireEvent.change(textarea, { target: { value: 'Incorrect entry' } });

    if (confirmReverseBtn) fireEvent.click(confirmReverseBtn);
    await waitFor(() => expect(mockReverseJournalMutateAsync).toHaveBeenCalledWith({
      id: 'test-1',
      reason: 'Incorrect entry',
    }));
  });

  it('renders journal with reversedBy link', async () => {
    currentJournalData = mockJournalReversed;
    const JournalDetail = await loadComponent();
    render(<JournalDetail />);

    expect(screen.getByText('Reversed By')).toBeInTheDocument();
    expect(screen.getByText('JRN-REV')).toBeInTheDocument();
  });

  it('handles post error', async () => {
    mockPostJournalMutateAsync.mockRejectedValueOnce(new Error('post failed'));
    const JournalDetail = await loadComponent();
    render(<JournalDetail />);

    const postBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Post to GL'));
    if (postBtn) fireEvent.click(postBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });

  it('handles reverse error', async () => {
    currentJournalData = { ...mockJournalPosted, reversedById: null };
    mockReverseJournalMutateAsync.mockRejectedValueOnce(new Error('reverse failed'));
    const JournalDetail = await loadComponent();
    render(<JournalDetail />);

    const reverseBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Reverse') && !btn.closest('[role="dialog"]'));
    if (reverseBtn) fireEvent.click(reverseBtn);

    fireEvent.change(screen.getByPlaceholderText('Enter reason...'), { target: { value: 'reason' } });
    const confirmBtn = screen.getAllByRole('button').find((btn) => btn.textContent === 'Reverse Journal' && btn.closest('[role="dialog"]'));
    if (confirmBtn) fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });
});

// ============================================================================
// 5. ScenarioDetail
// ============================================================================

describe('ScenarioDetail', () => {
  const loadComponent = async () => {
    const mod = await import('@/pages/planning/scenarios/ScenarioDetail');
    return mod.default;
  };

  it('renders DRAFT scenario with summary cards, baseline, and no results state', async () => {
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    expect(screen.getByText('Q1 Scenario')).toBeInTheDocument();
    expect(screen.getByText('Scenario for Q1 planning')).toBeInTheDocument();
    expect(screen.getByTestId('scenario-status')).toHaveTextContent('DRAFT');
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('Baseline Reference')).toBeInTheDocument();
    expect(screen.getByText(/Q4 Baseline/)).toBeInTheDocument();
    expect(screen.getByText('No Results Yet')).toBeInTheDocument();
  });

  it('handles run simulation', async () => {
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const runButtons = screen.getAllByRole('button').filter((btn) => (btn.textContent || '').includes('Run Simulation'));
    fireEvent.click(runButtons[0]);
    await waitFor(() => expect(mockRunMutateAsync).toHaveBeenCalledWith({ id: 'test-1' }));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Simulation Complete' }));
  });

  it('handles clone', async () => {
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const cloneBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Clone'));
    if (cloneBtn) fireEvent.click(cloneBtn);
    await waitFor(() => expect(mockCloneMutateAsync).toHaveBeenCalledWith({ id: 'test-1' }));
    expect(mockNavigate).toHaveBeenCalledWith('/planning/scenarios/cloned-1');
  });

  it('handles delete flow', async () => {
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const deleteBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Delete') && !btn.closest('[role="alertdialog"]'));
    if (deleteBtn) fireEvent.click(deleteBtn);
    expect(screen.getByText('Delete Scenario')).toBeInTheDocument();

    // Find the Delete button inside the alert dialog
    const dialogDeleteBtn = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'Delete' && btn.closest('[role="alertdialog"]')
    );
    if (dialogDeleteBtn) fireEvent.click(dialogDeleteBtn);
    await waitFor(() => expect(mockDeleteMutateAsync).toHaveBeenCalledWith('test-1'));
    expect(mockNavigate).toHaveBeenCalledWith('/planning/scenarios');
  });

  it('switches to parameters tab and shows parameter data', async () => {
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const paramTab = screen.getByRole('tab', { name: /Parameters/i });

    // Radix Tabs uses onMouseDown handler to switch tabs (not onClick)
    fireEvent.mouseDown(paramTab, { button: 0, ctrlKey: false });

    // Verify tab switched
    await waitFor(() => {
      const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel?.textContent).toContain('Promotion Parameters');
    });
    const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
    expect(activePanel?.textContent).toContain('PERCENTAGE');
  });

  it('switches to assumptions tab and shows assumption data', async () => {
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const assumptionsTab = screen.getByRole('tab', { name: /Assumptions/i });
    fireEvent.mouseDown(assumptionsTab, { button: 0, ctrlKey: false });

    await waitFor(() => {
      const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel?.textContent).toContain('Business Assumptions');
    });
  });

  it('switches to versions tab and shows version history with restore', async () => {
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const versionsTab = screen.getByRole('tab', { name: /Versions/i });
    fireEvent.mouseDown(versionsTab, { button: 0, ctrlKey: false });

    await waitFor(() => {
      const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel?.textContent).toContain('Version History');
    });

    const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
    expect(activePanel?.textContent).toContain('Version 1');
    expect(activePanel?.textContent).toContain('Initial version');

    // Click Restore on first version (button inside active tab panel)
    const restoreButtons = screen.getAllByRole('button').filter((btn) => (btn.textContent || '').includes('Restore') && !btn.closest('[role="alertdialog"]'));
    const firstRestore = restoreButtons[0];
    if (firstRestore) fireEvent.click(firstRestore);

    // Restore dialog opens
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Restore Version' })).toBeInTheDocument());

    const confirmRestore = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'Restore' && btn.closest('[role="alertdialog"]')
    );
    if (confirmRestore) fireEvent.click(confirmRestore);
    await waitFor(() => expect(mockRestoreMutateAsync).toHaveBeenCalledWith({
      scenarioId: 'test-1',
      versionId: 'v-1',
    }));
  });

  it('renders completed scenario with results', async () => {
    currentScenarioData = mockScenarioWithResults;
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    expect(screen.getByTestId('scenario-results')).toHaveTextContent('ROI: 180');
  });

  it('handles run simulation error', async () => {
    mockRunMutateAsync.mockRejectedValueOnce(new Error('simulation error'));
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const runButtons = screen.getAllByRole('button').filter((btn) => (btn.textContent || '').includes('Run Simulation'));
    fireEvent.click(runButtons[0]);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });

  it('handles clone error', async () => {
    mockCloneMutateAsync.mockRejectedValueOnce(new Error('clone error'));
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const cloneBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Clone'));
    if (cloneBtn) fireEvent.click(cloneBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Clone Failed' })));
  });

  it('handles delete error', async () => {
    mockDeleteMutateAsync.mockRejectedValueOnce(new Error('delete error'));
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    const deleteBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Delete') && !btn.closest('[role="alertdialog"]'));
    if (deleteBtn) fireEvent.click(deleteBtn);

    const confirmBtn = screen.getAllByRole('button').find((btn) => btn.textContent === 'Delete' && btn.closest('[role="alertdialog"]'));
    if (confirmBtn) fireEvent.click(confirmBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Delete Failed' })));
  });

  it('handles restore error', async () => {
    mockRestoreMutateAsync.mockRejectedValueOnce(new Error('restore error'));
    const ScenarioDetail = await loadComponent();
    render(<ScenarioDetail />);

    fireEvent.mouseDown(screen.getByRole('tab', { name: /Versions/i }), { button: 0, ctrlKey: false });
    await waitFor(() => {
      const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel?.textContent).toContain('Version 1');
    });

    const restoreButtons = screen.getAllByRole('button').filter((btn) => (btn.textContent || '').includes('Restore') && !btn.closest('[role="alertdialog"]'));
    if (restoreButtons[0]) fireEvent.click(restoreButtons[0]);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Restore Version' })).toBeInTheDocument());
    const confirmBtn = screen.getAllByRole('button').find((btn) => btn.textContent === 'Restore' && btn.closest('[role="alertdialog"]'));
    if (confirmBtn) fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Restore Failed' })));
  });
});

// ============================================================================
// 6. TemplateDetail
// ============================================================================

describe('TemplateDetailPage', () => {
  const loadComponent = async () => {
    const mod = await import('@/pages/planning/templates/TemplateDetail');
    return mod.default;
  };

  it('renders template with preview tab, edit button, apply button, delete button', async () => {
    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    // "Summer Sale Template" appears in both the h1 and the mock TemplatePreview - use heading
    expect(screen.getByRole('heading', { name: 'Summer Sale Template' })).toBeInTheDocument();
    expect(screen.getByText('TPL-001')).toBeInTheDocument();
    expect(screen.getByTestId('template-preview')).toBeInTheDocument();
  });

  it('switches to edit tab and submits update', async () => {
    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    // Click Edit tab - Radix Tabs uses onMouseDown
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Edit/i }), { button: 0, ctrlKey: false });

    // Wait for the active tabpanel to contain the template form
    await waitFor(() => {
      const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel?.querySelector('[data-testid="template-form"]')).toBeTruthy();
    });

    // Submit form via testid
    const submitBtn = document.querySelector('[data-testid="template-form-submit"]') as HTMLElement;
    fireEvent.click(submitBtn);
    await waitFor(() => expect(mockUpdateTemplateMutateAsync).toHaveBeenCalled());
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'Template updated successfully' }));
  });

  it('handles cancel in edit form', async () => {
    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    fireEvent.mouseDown(screen.getByRole('tab', { name: /Edit/i }), { button: 0, ctrlKey: false });
    await waitFor(() => {
      const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel?.querySelector('[data-testid="template-form-cancel"]')).toBeTruthy();
    });
    const cancelBtn = document.querySelector('[data-testid="template-form-cancel"]') as HTMLElement;
    fireEvent.click(cancelBtn);
    expect(mockSetSearchParams).toHaveBeenCalledWith({});
  });

  it('handles Edit button click in header', async () => {
    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    // The header Edit button (not the tab)
    const editBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Edit') && !btn.closest('[role="tablist"]'));
    if (editBtn) fireEvent.click(editBtn);
    expect(mockSetSearchParams).toHaveBeenCalledWith({ edit: 'true' });
  });

  it('handles delete with confirmation', async () => {
    const origConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(true);

    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    const deleteBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Delete'));
    if (deleteBtn) fireEvent.click(deleteBtn);
    await waitFor(() => expect(mockDeleteTemplateMutateAsync).toHaveBeenCalledWith('test-1'));
    expect(mockNavigate).toHaveBeenCalledWith('/planning/templates');

    window.confirm = origConfirm;
  });

  it('handles delete cancelled', async () => {
    const origConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(false);

    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    const deleteBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Delete'));
    if (deleteBtn) fireEvent.click(deleteBtn);
    expect(mockDeleteTemplateMutateAsync).not.toHaveBeenCalled();

    window.confirm = origConfirm;
  });

  it('opens apply dialog and submits', async () => {
    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    const applyBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Apply Template'));
    if (applyBtn) fireEvent.click(applyBtn);

    await waitFor(() => expect(screen.getByText(/Create a new promotion from/)).toBeInTheDocument());

    // Fill form
    const nameInput = screen.getByLabelText(/Promotion Name/i);
    fireEvent.change(nameInput, { target: { value: 'Q1 Summer Sale' } });

    const startDateInput = screen.getByLabelText(/Start Date/i);
    fireEvent.change(startDateInput, { target: { value: '2026-03-01' } });

    const endDateInput = screen.getByLabelText(/End Date/i);
    fireEvent.change(endDateInput, { target: { value: '2026-03-31' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Promotion/i }));
    await waitFor(() => expect(mockApplyTemplateMutateAsync).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/promotions/new-promo-1');
  });

  it('handles update error', async () => {
    mockUpdateTemplateMutateAsync.mockRejectedValueOnce(new Error('update failed'));
    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    fireEvent.mouseDown(screen.getByRole('tab', { name: /Edit/i }), { button: 0, ctrlKey: false });
    await waitFor(() => {
      const activePanel = document.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel?.querySelector('[data-testid="template-form-submit"]')).toBeTruthy();
    });

    const submitBtn = document.querySelector('[data-testid="template-form-submit"]') as HTMLElement;
    fireEvent.click(submitBtn);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });

  it('handles apply error', async () => {
    mockApplyTemplateMutateAsync.mockRejectedValueOnce(new Error('apply failed'));
    const TemplateDetail = await loadComponent();
    render(<TemplateDetail />);

    const applyBtn = screen.getAllByRole('button').find((btn) => (btn.textContent || '').includes('Apply Template'));
    if (applyBtn) fireEvent.click(applyBtn);

    await waitFor(() => expect(screen.getByLabelText(/Promotion Name/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Promotion Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-03-01' } });
    fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2026-03-31' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Promotion/i }));
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });
});

// ============================================================================
// 7. ClashList
// ============================================================================

describe('ClashList', () => {
  const loadComponent = async () => {
    const mod = await import('@/pages/planning/clashes/ClashList');
    return mod.default;
  };

  it('renders clash list with stats, clashes, and pagination', async () => {
    const ClashList = await loadComponent();
    render(<ClashList />);

    expect(screen.getByText('Clash Detection')).toBeInTheDocument();
    expect(screen.getByText('Total Clashes')).toBeInTheDocument();
    expect(screen.getByText('High Severity')).toBeInTheDocument();
    expect(screen.getByText('Reviewing')).toBeInTheDocument();
    expect(screen.getByText('Resolution Rate')).toBeInTheDocument();
    expect(screen.getByText('Potential Impact')).toBeInTheDocument();
    expect(screen.getByTestId('clash-clash-1')).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  });

  it('handles run detection', async () => {
    const ClashList = await loadComponent();
    render(<ClashList />);

    const runButtons = screen.getAllByRole('button').filter((btn) => (btn.textContent || '').includes('Run Detection'));
    fireEvent.click(runButtons[0]);
    await waitFor(() => expect(mockDetectMutateAsync).toHaveBeenCalledWith({}));
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Detection Complete' }));
  });

  it('handles dismiss clash flow', async () => {
    const ClashList = await loadComponent();
    render(<ClashList />);

    // Click dismiss via ClashCard mock
    fireEvent.click(screen.getByTestId('dismiss-clash-btn'));
    expect(screen.getByText('Dismiss Clash')).toBeInTheDocument();

    // Confirm dismiss in alert dialog
    const dismissConfirm = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'Dismiss' && btn.closest('[role="alertdialog"]')
    );
    if (dismissConfirm) fireEvent.click(dismissConfirm);
    await waitFor(() => expect(mockDismissMutateAsync).toHaveBeenCalledWith('clash-1'));
  });

  it('handles pagination', async () => {
    const ClashList = await loadComponent();
    render(<ClashList />);

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);
    // Page state updated internally
  });

  it('renders empty state when no clashes', async () => {
    currentClashesData = { data: [], pagination: { page: 1, totalPages: 1, total: 0 } };
    const ClashList = await loadComponent();
    render(<ClashList />);

    expect(screen.getByText('No Clashes Found')).toBeInTheDocument();
    expect(screen.getByText('Great! There are no promotion conflicts detected.')).toBeInTheDocument();
  });

  it('handles detection error', async () => {
    mockDetectMutateAsync.mockRejectedValueOnce(new Error('detect failed'));
    const ClashList = await loadComponent();
    render(<ClashList />);

    const runButtons = screen.getAllByRole('button').filter((btn) => (btn.textContent || '').includes('Run Detection'));
    fireEvent.click(runButtons[0]);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });

  it('handles dismiss error', async () => {
    mockDismissMutateAsync.mockRejectedValueOnce(new Error('dismiss failed'));
    const ClashList = await loadComponent();
    render(<ClashList />);

    fireEvent.click(screen.getByTestId('dismiss-clash-btn'));
    const dismissConfirm = screen.getAllByRole('button').find(
      (btn) => btn.textContent === 'Dismiss' && btn.closest('[role="alertdialog"]')
    );
    if (dismissConfirm) fireEvent.click(dismissConfirm);
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
  });
});

// ============================================================================
// 8. ApplyTemplateDialog
// ============================================================================

describe('ApplyTemplateDialog', () => {
  const loadComponent = async () => {
    const mod = await import('@/components/planning/ApplyTemplateDialog');
    return mod.ApplyTemplateDialog;
  };

  it('renders form with template info and submits', async () => {
    const ApplyTemplateDialog = await loadComponent();
    const onApply = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ApplyTemplateDialog
        open={true}
        onOpenChange={onOpenChange}
        template={mockTemplate as any}
        onApply={onApply}
        isLoading={false}
      />
    );

    expect(screen.getByText('Apply Template')).toBeInTheDocument();
    expect(screen.getByText('TPL-001')).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Promotion Name/i), { target: { value: 'My Promo' } });
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-04-01' } });

    // End date should auto-calculate (30 days from start = 2026-05-01)
    expect(screen.getByLabelText(/End Date/i)).toHaveValue('2026-05-01');

    // Budget override
    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '200000' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Create Promotion/i }));
    await waitFor(() => expect(onApply).toHaveBeenCalledWith(expect.objectContaining({
      name: 'My Promo',
      startDate: '2026-04-01',
      budget: 200000,
    })));
  });

  it('renders null when template is null', async () => {
    const ApplyTemplateDialog = await loadComponent();
    const { container } = render(
      <ApplyTemplateDialog
        open={true}
        onOpenChange={vi.fn()}
        template={null}
        onApply={vi.fn()}
      />
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('shows loading state', async () => {
    const ApplyTemplateDialog = await loadComponent();
    render(
      <ApplyTemplateDialog
        open={true}
        onOpenChange={vi.fn()}
        template={mockTemplate as any}
        onApply={vi.fn()}
        isLoading={true}
      />
    );
    expect(screen.getByRole('button', { name: /Creating.../i })).toBeDisabled();
  });

  it('handles cancel button', async () => {
    const ApplyTemplateDialog = await loadComponent();
    const onOpenChange = vi.fn();

    render(
      <ApplyTemplateDialog
        open={true}
        onOpenChange={onOpenChange}
        template={mockTemplate as any}
        onApply={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles end date manual change', async () => {
    const ApplyTemplateDialog = await loadComponent();
    render(
      <ApplyTemplateDialog
        open={true}
        onOpenChange={vi.fn()}
        template={mockTemplate as any}
        onApply={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2026-06-15' } });
    expect(screen.getByLabelText(/End Date/i)).toHaveValue('2026-06-15');
  });

  it('handles template without defaultDuration and defaultBudget', async () => {
    const ApplyTemplateDialog = await loadComponent();
    const noDefaultsTemplate = { ...mockTemplate, defaultDuration: undefined, defaultBudget: undefined };

    render(
      <ApplyTemplateDialog
        open={true}
        onOpenChange={vi.fn()}
        template={noDefaultsTemplate as any}
        onApply={vi.fn()}
      />
    );

    // "Custom" appears twice (Duration: Custom and Budget: Custom) - use getAllByText
    expect(screen.getAllByText(/Custom/).length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// 9. StockDistributionChart + StockValueChart
// ============================================================================

describe('StockDistributionChart', () => {
  const loadComponent = async () => {
    const mod = await import('@/components/operations/StockDistributionChart');
    return mod;
  };

  const byStatus = [
    { status: 'OK' as const, count: 50, value: 500000 },
    { status: 'LOW' as const, count: 10, value: 100000 },
    { status: 'OUT_OF_STOCK' as const, count: 3, value: 0 },
    { status: 'OVERSTOCK' as const, count: 5, value: 250000 },
  ];

  const byCategory = [
    { category: 'Beverages', quantity: 100, value: 300000 },
    { category: 'Snacks', quantity: 80, value: 200000 },
  ];

  const byCustomer = [
    { customerId: 'c1', customerName: 'Big C', quantity: 200, value: 600000 },
    { customerId: 'c2', customerName: 'Coopmart', quantity: 150, value: 450000 },
  ];

  it('renders with all three data sets', async () => {
    const { StockDistributionChart } = await loadComponent();
    render(
      <StockDistributionChart
        byStatus={byStatus}
        byCategory={byCategory}
        byCustomer={byCustomer}
        title="Test Distribution"
      />
    );

    expect(screen.getByText('Test Distribution')).toBeInTheDocument();
    expect(screen.getByText('By Status')).toBeInTheDocument();
    expect(screen.getByText('By Category')).toBeInTheDocument();
    expect(screen.getByText('By Customer')).toBeInTheDocument();
  });

  it('renders with only status data', async () => {
    const { StockDistributionChart } = await loadComponent();
    render(<StockDistributionChart byStatus={byStatus} />);
    expect(screen.getByText('Stock Distribution')).toBeInTheDocument();
    expect(screen.getByText('By Status')).toBeInTheDocument();
  });

  it('renders with only category data', async () => {
    const { StockDistributionChart } = await loadComponent();
    render(<StockDistributionChart byCategory={byCategory} />);
    expect(screen.getByText('By Category')).toBeInTheDocument();
  });

  it('renders with only customer data', async () => {
    const { StockDistributionChart } = await loadComponent();
    render(<StockDistributionChart byCustomer={byCustomer} />);
    expect(screen.getByText('By Customer')).toBeInTheDocument();
  });

  it('renders StockValueChart', async () => {
    const { StockValueChart } = await loadComponent();
    const data = [
      { date: '2026-01', totalQuantity: 1000, totalValue: 5000000 },
      { date: '2026-02', totalQuantity: 1200, totalValue: 6000000 },
    ];
    render(<StockValueChart data={data} title="Stock Value Test" />);
    expect(screen.getByText('Stock Value Test')).toBeInTheDocument();
  });

  it('renders StockValueChart with default title', async () => {
    const { StockValueChart } = await loadComponent();
    render(<StockValueChart data={[]} />);
    expect(screen.getByText('Stock Value Over Time')).toBeInTheDocument();
  });
});

// ============================================================================
// 10. Header
// ============================================================================

describe('Header', () => {
  const loadComponent = async () => {
    const mod = await import('@/components/layout/Header');
    return mod.Header;
  };

  it('renders header with search, user menu, and action buttons', async () => {
    const Header = await loadComponent();
    render(<Header />);

    expect(screen.getByTestId('notifications')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('lang-toggle')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument(); // First initial
  });

  it('opens help dialog and shows resources', async () => {
    const Header = await loadComponent();
    render(<Header />);

    const helpBtn = screen.getByTitle('Help (?)');
    fireEvent.click(helpBtn);

    await waitFor(() => expect(screen.getByText('Documentation')).toBeInTheDocument());
    expect(screen.getByText('Live Chat')).toBeInTheDocument();
    expect(screen.getByText('Email Support')).toBeInTheDocument();
    expect(screen.getByText('PROMO MASTER v2.0.0')).toBeInTheDocument();
  });

  it('opens keyboard shortcuts dialog from help dialog', async () => {
    const Header = await loadComponent();
    render(<Header />);

    // Open help
    fireEvent.click(screen.getByTitle('Help (?)'));
    await waitFor(() => expect(screen.getByText('PROMO MASTER v2.0.0')).toBeInTheDocument());

    // Click keyboard shortcuts link in help dialog
    const shortcutsLink = screen.getByText('header.keyboardShortcuts');
    fireEvent.click(shortcutsLink);

    await waitFor(() => expect(screen.getByText('Navigation')).toBeInTheDocument());
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Tables')).toBeInTheDocument();
  });

  it('opens keyboard shortcuts dialog directly', async () => {
    const Header = await loadComponent();
    render(<Header />);

    fireEvent.click(screen.getByTitle('Keyboard Shortcuts (⌘/)'));
    await waitFor(() => expect(screen.getByText('Open search')).toBeInTheDocument());
    expect(screen.getByText('Toggle sidebar')).toBeInTheDocument();
  });

  it('renders mobile menu button when callback provided', async () => {
    const Header = await loadComponent();
    const onMobileMenu = vi.fn();
    render(<Header onMobileMenuClick={onMobileMenu} />);

    // The mobile menu button uses Menu icon
    const buttons = screen.getAllByRole('button');
    const mobileBtn = buttons.find((btn) => btn.classList.contains('lg:hidden'));
    if (mobileBtn) {
      fireEvent.click(mobileBtn);
      expect(onMobileMenu).toHaveBeenCalled();
    }
  });

  it('does not render mobile menu button without callback', async () => {
    const Header = await loadComponent();
    render(<Header />);

    const buttons = screen.getAllByRole('button');
    const mobileBtn = buttons.find((btn) => btn.classList.contains('lg:hidden'));
    expect(mobileBtn).toBeUndefined();
  });

  it('handles keyboard shortcut Ctrl+/ to open shortcuts dialog', async () => {
    const Header = await loadComponent();
    render(<Header />);

    // Simulate Ctrl+/ keydown
    fireEvent.keyDown(window, { key: '/', ctrlKey: true });
    await waitFor(() => expect(screen.getByText('Navigation')).toBeInTheDocument());
  });
});

// ============================================================================
// 11. Dashboard
// ============================================================================

describe('Dashboard', () => {
  const loadComponent = async () => {
    const mod = await import('@/pages/dashboard/Dashboard');
    return mod.default;
  };

  it('renders dashboard with stats, charts, activity, and quick actions', async () => {
    const Dashboard = await loadComponent();
    render(<Dashboard />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Command Center')).toBeInTheDocument();

    // Alert banner
    expect(screen.getByText('Attention Required')).toBeInTheDocument();
    expect(screen.getByText(/3 overdue promotions/)).toBeInTheDocument();
    expect(screen.getByText(/5 at risk/)).toBeInTheDocument();

    // Charts
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-component')).toBeInTheDocument();

    // Activity section
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(/PROMO-2026-001 approved/)).toBeInTheDocument();
    expect(screen.getByText(/Claim #CLM-0042 submitted/)).toBeInTheDocument();

    // Quick actions
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Create New Promotion')).toBeInTheDocument();
    expect(screen.getByText('Submit New Claim')).toBeInTheDocument();

    // System health
    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('API Status')).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    const Dashboard = await loadComponent();
    render(<Dashboard />);

    const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(mockRefetchStats).toHaveBeenCalled();
      expect(mockRefetchSpend).toHaveBeenCalled();
      expect(mockRefetchStatus).toHaveBeenCalled();
      expect(mockRefetchCustomers).toHaveBeenCalled();
    });
  });
});
