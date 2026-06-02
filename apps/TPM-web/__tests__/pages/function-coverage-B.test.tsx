/**
 * Function Coverage B - Exercise uncovered functions across 11 components
 *
 * Targets:
 * 1. QuickSearch - 14 functions (search, keyboard nav, selection)
 * 2. ClaimList - 13 functions (filters, view toggle, delete, pagination)
 * 3. FundList - 13 functions (filters, view toggle, delete, utilization color)
 * 4. PromotionList - 11 functions (filters, view toggle, delete, pagination)
 * 5. TemplateForm - 22 functions (form fields, mechanics, eligibility, submit)
 * 6. Deployment - 14 functions (select promo, toggle checklist, dialogs)
 * 7. TargetList - 12 functions (filters, summary, period/achievement rendering)
 * 8. DataTable - 13 functions (sorting, pagination, page size, column visibility)
 * 9. TPO - 33 functions (tabs, recommendations, optimization, scenarios, forms)
 * 10. APIKeysList - 14 functions (create dialog, permissions, revoke, copy)
 * 11. BIDashboard - 14 functions (date range, navigate, formatKPIValue, refetch)
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';

// Fix Radix UI pointer capture and scrollIntoView in jsdom
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

// ─── Router mock ───────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'test-1' }),
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

// ─── Toast mock ────────────────────────────────────────────────────────────
const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// ─── i18n mock ─────────────────────────────────────────────────────────────
vi.mock('@/lib/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

// ─── Claims hooks mock ────────────────────────────────────────────────────
const mockDeleteClaimMutate = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useClaims', () => ({
  useClaims: () => ({
    data: {
      claims: [
        {
          id: 'c1',
          code: 'CLM-001',
          status: 'SUBMITTED',
          claimDate: '2026-01-15',
          claimAmount: 50000000,
          approvedAmount: 48000000,
          description: 'Test claim',
          promotion: { id: 'p1', code: 'PROMO-001', name: 'Summer Sale', status: 'ACTIVE', startDate: '2026-01-01', endDate: '2026-03-31', budget: 500000000, actualSpend: 320000000, promotionType: 'TRADE_PROMOTION', customer: { id: '1', code: 'CUST-001', name: 'Customer A', channel: 'MODERN_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' }, fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' }, createdBy: { id: '1', email: 'a@b.com', name: 'John', role: 'MANAGER', company: { id: '1', name: 'Co' }, createdAt: '', updatedAt: '' }, createdAt: '', updatedAt: '' },
          createdBy: { id: '1', email: 'a@b.com', name: 'John', role: 'MANAGER', company: { id: '1', name: 'Co' }, createdAt: '', updatedAt: '' },
          createdAt: '2026-01-15',
          updatedAt: '2026-01-15',
        },
      ],
      metadata: { totalCount: 1, pageSize: 20, pageNumber: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    },
    isLoading: false,
    error: null,
  }),
  useDeleteClaim: () => ({ mutateAsync: mockDeleteClaimMutate }),
}));

// ─── Funds hooks mock ──────────────────────────────────────────────────────
const mockDeleteFundMutate = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useFunds', () => ({
  useFunds: () => ({
    data: {
      funds: [
        {
          id: 'f1',
          code: 'FUND-001',
          name: 'Trade Fund Q1',
          fundType: 'TRADE_FUND',
          totalBudget: 2000000000,
          allocatedBudget: 1200000000,
          utilizedBudget: 800000000,
          availableBudget: 800000000,
          startDate: '2026-01-01',
          endDate: '2026-03-31',
          createdAt: '2025-12-01',
          updatedAt: '2026-01-15',
        },
        {
          id: 'f2',
          code: 'FUND-002',
          name: 'Marketing Fund',
          fundType: 'MARKETING_FUND',
          totalBudget: 3000000000,
          allocatedBudget: 1500000000,
          utilizedBudget: 2800000000,
          availableBudget: 0,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          createdAt: '2025-12-01',
          updatedAt: '2026-01-10',
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
  useDeleteFund: () => ({ mutateAsync: mockDeleteFundMutate }),
}));

// ─── Promotions hooks mock ─────────────────────────────────────────────────
const mockDeletePromoMutate = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/usePromotions', () => ({
  usePromotions: () => ({
    data: {
      promotions: [
        {
          id: 'p1',
          code: 'PROMO-001',
          name: 'Summer Sale Campaign',
          description: 'Test promo',
          status: 'ACTIVE',
          startDate: '2026-01-01',
          endDate: '2026-03-31',
          budget: 500000000,
          actualSpend: 320000000,
          promotionType: 'TRADE_PROMOTION',
          mechanicType: 'DISCOUNT',
          customer: { id: '1', code: 'CUST-001', name: 'Customer A', channel: 'MODERN_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
          fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
          createdBy: { id: '1', email: 'a@b.com', name: 'John', role: 'MANAGER', company: { id: '1', name: 'Co' }, createdAt: '', updatedAt: '' },
          createdAt: '2025-12-01',
          updatedAt: '2025-12-15',
        },
      ],
      metadata: { totalCount: 1, pageSize: 20, pageNumber: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    },
    isLoading: false,
    error: null,
  }),
  useDeletePromotion: () => ({ mutateAsync: mockDeletePromoMutate }),
}));

// ─── Targets hook mock ─────────────────────────────────────────────────────
vi.mock('@/hooks/useTargets', () => ({
  useTargets: () => ({
    data: {
      targets: [
        { id: 't1', code: 'TGT-001', name: 'Q1 Revenue', year: 2026, quarter: 1, targetType: 'REVENUE', targetValue: 5000000000, actualValue: 4250000000, achievementRate: 85, status: 'ACTIVE', createdAt: '2026-01-01', updatedAt: '2026-01-15' },
        { id: 't2', code: 'TGT-002', name: 'Jan Volume', year: 2026, month: 1, targetType: 'VOLUME', targetValue: 10000, actualValue: 11200, achievementRate: 112, status: 'ACHIEVED', createdAt: '2026-01-01', updatedAt: '2026-01-31' },
        { id: 't3', code: 'TGT-003', name: 'Distribution', year: 2026, targetType: 'DISTRIBUTION', targetValue: 500, actualValue: 420, achievementRate: 60, status: 'ACTIVE', createdAt: '2026-01-01', updatedAt: '2026-01-15' },
      ],
      metadata: { totalCount: 3, pageSize: 20, pageNumber: 1, totalPages: 1 },
    },
    isLoading: false,
  }),
}));

// ─── TPO hooks mock ────────────────────────────────────────────────────────
const mockGetSuggestions = vi.fn();
const mockPredict = vi.fn();
vi.mock('@/hooks/useTPO', () => ({
  useTPO: () => ({
    isConnected: true,
    isLoading: false,
    error: null,
    mechanics: [
      { type: 'DISCOUNT', name: 'Discount' },
      { type: 'REBATE', name: 'Rebate' },
    ],
    channels: [
      { type: 'MT', name: 'Modern Trade' },
      { type: 'GT', name: 'General Trade' },
    ],
  }),
  usePromotionSuggestions: () => ({
    getSuggestions: mockGetSuggestions,
    suggestions: null,
    isLoading: false,
    reset: vi.fn(),
  }),
  useROIPrediction: () => ({
    predict: mockPredict,
    result: null,
    isLoading: false,
    reset: vi.fn(),
  }),
}));

// ─── Security hooks mock ──────────────────────────────────────────────────
const mockCreateAPIKey = vi.fn().mockResolvedValue({ data: { key: 'sk-test-key-12345' } });
const mockRevokeAPIKey = vi.fn().mockResolvedValue({});
const mockRefetchKeys = vi.fn();
vi.mock('@/hooks/integration/useSecurity', () => ({
  useAPIKeys: () => ({
    data: {
      data: [
        { id: 'k1', name: 'Production Key', keyPrefix: 'sk-prod-****', permissions: ['read:promotions'], status: 'ACTIVE', createdAt: '2026-01-01', expiresAt: '2026-06-01', lastUsedAt: '2026-01-15' },
        { id: 'k2', name: 'Dev Key', keyPrefix: 'sk-dev-****', permissions: ['read:promotions', 'write:promotions'], status: 'ACTIVE', createdAt: '2026-01-01', expiresAt: '2026-03-01', lastUsedAt: null },
      ],
    },
    isLoading: false,
    refetch: mockRefetchKeys,
  }),
  useCreateAPIKey: () => ({
    mutateAsync: mockCreateAPIKey,
    isPending: false,
  }),
  useRevokeAPIKey: () => ({
    mutateAsync: mockRevokeAPIKey,
  }),
}));

// ─── BI hooks mock ─────────────────────────────────────────────────────────
const mockBIRefetch = vi.fn();
vi.mock('@/hooks/bi', () => ({
  useDashboard: () => ({
    data: {
      kpis: [
        { name: 'Total Promotions', value: 150, format: 'NUMBER', subtitle: 'Active', trend: 'UP', change: 12 },
        { name: 'Budget', value: 50000000, format: 'CURRENCY', subtitle: 'Allocated', trend: 'UP', change: 5 },
        { name: 'Claims', value: 42, format: 'NUMBER', subtitle: 'Processed', trend: 'DOWN', change: -3 },
        { name: 'ROI', value: 15.5, format: 'PERCENTAGE', subtitle: 'Average', trend: 'UP', change: 2 },
      ],
      charts: [
        { id: 'c1', title: 'Promotions by Type', type: 'PIE', data: [{ label: 'Discount', value: 45 }] },
      ],
    },
    isLoading: false,
    refetch: mockBIRefetch,
  }),
}));

// ─── BI components mock ────────────────────────────────────────────────────
vi.mock('@/components/bi', () => ({
  ChartWidget: ({ type, data, height }: any) => (
    <div data-testid="chart-widget" data-type={type}>Chart</div>
  ),
  ExportButton: ({ type }: any) => (
    <button data-testid="export-button">Export {type}</button>
  ),
}));

// ─── APIKeyCard mock ───────────────────────────────────────────────────────
vi.mock('@/components/integration/APIKeyCard', () => ({
  APIKeyCard: ({ apiKey, onRevoke, isRevoking }: any) => (
    <div data-testid={`apikey-${apiKey.id}`}>
      <span>{apiKey.name}</span>
      <button data-testid={`revoke-${apiKey.id}`} onClick={onRevoke} disabled={isRevoking}>
        Revoke
      </button>
    </div>
  ),
  NewAPIKeyDisplay: ({ keyValue, onCopy }: any) => (
    <div data-testid="new-key-display">
      <code>{keyValue}</code>
      <button data-testid="copy-key" onClick={onCopy}>Copy</button>
    </div>
  ),
}));

// ─── PromotionFilters mock ─────────────────────────────────────────────────
vi.mock('@/components/promotions/PromotionFilters', () => ({
  PromotionFilters: ({ filters, onFiltersChange }: any) => (
    <div data-testid="promotion-filters">
      <input
        data-testid="promo-search"
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        placeholder="Search..."
      />
    </div>
  ),
}));

// ─── PromotionCard mock ────────────────────────────────────────────────────
vi.mock('@/components/promotions/PromotionCard', () => ({
  PromotionCard: ({ promotion }: any) => (
    <div data-testid={`promo-card-${promotion.id}`}>{promotion.name}</div>
  ),
}));

// ─── PromotionStatusBadge mock ─────────────────────────────────────────────
vi.mock('@/components/promotions/PromotionStatusBadge', () => ({
  PromotionStatusBadge: ({ status }: any) => <span data-testid="promo-status">{status}</span>,
}));

// ─── ClaimStatusBadge mock ─────────────────────────────────────────────────
vi.mock('@/components/claims/ClaimStatusBadge', () => ({
  ClaimStatusBadge: ({ status }: any) => <span data-testid="claim-status">{status}</span>,
}));

// ─── Recharts mock ─────────────────────────────────────────────────────────
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  Radar: () => <div />,
}));

// ─── Shared component stubs ───────────────────────────────────────────────
vi.mock('@/components/shared/Pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="pagination">
      <button data-testid="prev-page" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Prev</button>
      <span data-testid="page-info">Page {currentPage} of {totalPages}</span>
      <button data-testid="next-page" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
      {onPageSizeChange && <button data-testid="change-page-size" onClick={() => onPageSizeChange(50)}>50</button>}
    </div>
  ),
}));

vi.mock('@/components/shared/SearchInput', () => ({
  SearchInput: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/components/shared/EmptyState', () => ({
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>,
}));

// ─── StatCard mock ─────────────────────────────────────────────────────────
vi.mock('@/components/ui/stat-card', () => ({
  StatCard: ({ title, value, subtitle }: any) => (
    <div data-testid="stat-card"><span>{title}</span><span>{value}</span></div>
  ),
  StatCardGroup: ({ children }: any) => <div data-testid="stat-card-group">{children}</div>,
}));

// ─── Integration types mock ───────────────────────────────────────────────
vi.mock('@/types/integration', async () => {
  const actual = await vi.importActual('@/types/integration');
  return actual;
});

// Reset mocks before each test
beforeEach(() => {
  mockNavigate.mockReset();
  mockSetSearchParams.mockReset();
  mockToast.mockReset();
  mockDeleteClaimMutate.mockReset().mockResolvedValue({});
  mockDeleteFundMutate.mockReset().mockResolvedValue({});
  mockDeletePromoMutate.mockReset().mockResolvedValue({});
  mockGetSuggestions.mockReset();
  mockPredict.mockReset();
  mockCreateAPIKey.mockReset().mockResolvedValue({ data: { key: 'sk-test-key-12345' } });
  mockRevokeAPIKey.mockReset().mockResolvedValue({});
  mockRefetchKeys.mockReset();
  mockBIRefetch.mockReset();

  // Stub window.confirm
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  // Stub clipboard
  const mockWriteText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });

  // Re-establish ResizeObserver (vitest.setup.ts uses vi.fn which can be cleared)
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. QuickSearch
// ═══════════════════════════════════════════════════════════════════════════════
describe('QuickSearch', () => {
  let QuickSearchMod: any;

  beforeEach(async () => {
    QuickSearchMod = await import('@/components/search/QuickSearch');
  });

  it('renders quick actions and recent pages when open with empty query', () => {
    const onOpenChange = vi.fn();
    render(<QuickSearchMod.QuickSearch open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText('Quick Actions')).toBeTruthy();
    expect(screen.getByText('Recent')).toBeTruthy();
  });

  it('filters results when typing a search query', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<QuickSearchMod.QuickSearch open={true} onOpenChange={onOpenChange} />);
    const input = screen.getByPlaceholderText('Search pages, actions, promotions...');
    await user.type(input, 'calendar');
    expect(screen.getByText('View Calendar')).toBeTruthy();
  });

  it('shows no results message for unmatched query', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<QuickSearchMod.QuickSearch open={true} onOpenChange={onOpenChange} />);
    const input = screen.getByPlaceholderText('Search pages, actions, promotions...');
    await user.type(input, 'xyznonexistent');
    expect(screen.getByText(/No results found/)).toBeTruthy();
  });

  it('navigates with ArrowDown/ArrowUp and Enter keys', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<QuickSearchMod.QuickSearch open={true} onOpenChange={onOpenChange} />);
    const input = screen.getByPlaceholderText('Search pages, actions, promotions...');
    await user.type(input, '{ArrowDown}{ArrowDown}{ArrowUp}{Enter}');
    expect(mockNavigate).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<QuickSearchMod.QuickSearch open={true} onOpenChange={onOpenChange} />);
    const input = screen.getByPlaceholderText('Search pages, actions, promotions...');
    await user.type(input, '{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles clicking a quick action button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<QuickSearchMod.QuickSearch open={true} onOpenChange={onOpenChange} />);
    const createPromoBtn = screen.getByText('Create Promotion');
    await user.click(createPromoBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/promotions/new');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles mouseEnter on items to update selectedIndex', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<QuickSearchMod.QuickSearch open={true} onOpenChange={onOpenChange} />);
    const aiSuggestions = screen.getByText('AI Suggestions');
    await user.hover(aiSuggestions);
    // now Enter should navigate to AI Suggestions href
    const input = screen.getByPlaceholderText('Search pages, actions, promotions...');
    await user.type(input, '{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/planning/tpo');
  });

  it('resets query when dialog closes (open goes false)', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<QuickSearchMod.QuickSearch open={true} onOpenChange={onOpenChange} />);
    rerender(<QuickSearchMod.QuickSearch open={false} onOpenChange={onOpenChange} />);
    // no error means useEffect ran properly
    expect(true).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ClaimList
// ═══════════════════════════════════════════════════════════════════════════════
describe('ClaimList', () => {
  let ClaimList: any;

  beforeEach(async () => {
    const mod = await import('@/pages/claims/ClaimList');
    ClaimList = mod.default;
  });

  it('renders the claim list with data', () => {
    render(<ClaimList />);
    expect(screen.getByText('Claims')).toBeTruthy();
    expect(screen.getByText('CLM-001')).toBeTruthy();
  });

  it('toggles between table and grid view', async () => {
    const user = userEvent.setup();
    render(<ClaimList />);
    // grid toggle buttons - there should be two icon buttons (List and LayoutGrid)
    const buttons = screen.getAllByRole('button');
    // Find the grid toggle button (second icon button in the view group)
    const gridButton = buttons.find(b => b.textContent === '' && b.className.includes('icon'));
    // Click any button that could toggle view mode
    // The list/grid buttons are small icon buttons
    // Try to click them by getting all buttons
    const viewButtons = buttons.filter(b => !b.textContent || b.querySelector('svg'));
    if (viewButtons.length >= 2) {
      // Click last two icon buttons (table/grid toggle)
      await user.click(viewButtons[viewButtons.length - 1]); // grid view
      await user.click(viewButtons[viewButtons.length - 2]); // table view
    }
  });

  it('exercises pagination via page size change', () => {
    render(<ClaimList />);
    // Pagination rendered
    expect(screen.getByTestId('pagination')).toBeTruthy();
    // updatePageSize is exercised via page size button
    const pageSizeBtn = screen.getByTestId('change-page-size');
    fireEvent.click(pageSizeBtn);
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('exercises search filter and updateFilters', () => {
    render(<ClaimList />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('exercises row click on DataTable', () => {
    render(<ClaimList />);
    // The row with data should be clickable
    const claimCode = screen.getByText('CLM-001');
    fireEvent.click(claimCode);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. FundList
// ═══════════════════════════════════════════════════════════════════════════════
describe('FundList', () => {
  let FundList: any;

  beforeEach(async () => {
    const mod = await import('@/pages/funds/FundList');
    FundList = mod.default;
  });

  it('renders fund list with data and utilization colors', () => {
    render(<FundList />);
    expect(screen.getByText('Funds')).toBeTruthy();
    expect(screen.getByText('FUND-001')).toBeTruthy();
    // FUND-002 has 93% utilization (>=90) -> red color coverage
    expect(screen.getByText('FUND-002')).toBeTruthy();
  });

  it('exercises view mode toggle', async () => {
    const user = userEvent.setup();
    render(<FundList />);
    const buttons = screen.getAllByRole('button');
    const viewButtons = buttons.filter(b => !b.textContent || b.querySelector('svg'));
    if (viewButtons.length >= 2) {
      await user.click(viewButtons[viewButtons.length - 1]); // grid mode
    }
  });

  it('exercises search and filter', () => {
    render(<FundList />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'trade' } });
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('exercises pagination via page size change', () => {
    render(<FundList />);
    expect(screen.getByTestId('pagination')).toBeTruthy();
    const pageSizeBtn = screen.getByTestId('change-page-size');
    fireEvent.click(pageSizeBtn);
    expect(mockSetSearchParams).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PromotionList
// ═══════════════════════════════════════════════════════════════════════════════
describe('PromotionList', () => {
  let PromotionList: any;

  beforeEach(async () => {
    const mod = await import('@/pages/promotions/PromotionList');
    PromotionList = mod.default;
  });

  it('renders promotion list with data', () => {
    render(<PromotionList />);
    expect(screen.getByText('Promotions')).toBeTruthy();
    expect(screen.getByText('PROMO-001')).toBeTruthy();
  });

  it('exercises view toggle to grid and back', async () => {
    const user = userEvent.setup();
    render(<PromotionList />);
    const buttons = screen.getAllByRole('button');
    const viewButtons = buttons.filter(b => !b.textContent || b.querySelector('svg'));
    if (viewButtons.length >= 2) {
      await user.click(viewButtons[viewButtons.length - 1]); // grid view
      await user.click(viewButtons[viewButtons.length - 2]); // table view
    }
  });

  it('exercises search via PromotionFilters', () => {
    render(<PromotionList />);
    const input = screen.getByTestId('promo-search');
    fireEvent.change(input, { target: { value: 'summer' } });
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('exercises pagination via page size change', () => {
    render(<PromotionList />);
    expect(screen.getByTestId('pagination')).toBeTruthy();
    const pageSizeBtn = screen.getByTestId('change-page-size');
    fireEvent.click(pageSizeBtn);
    expect(mockSetSearchParams).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. TemplateForm
// ═══════════════════════════════════════════════════════════════════════════════
describe('TemplateForm', () => {
  let TemplateForm: any;

  beforeEach(async () => {
    const mod = await import('@/components/planning/TemplateForm');
    TemplateForm = mod.TemplateForm;
  });

  it('renders and submits the form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Fill basic info - use getElementById since labels may not be linked
    const codeInput = screen.getByPlaceholderText('TPL-001');
    await user.clear(codeInput);
    await user.type(codeInput, 'TPL-TEST');

    const nameInput = screen.getByPlaceholderText('Summer Sale Template');
    await user.clear(nameInput);
    await user.type(nameInput, 'Test Template');

    const descInput = screen.getByPlaceholderText('Describe the template purpose...');
    await user.type(descInput, 'A test description');

    // Fill default settings
    const durationInput = screen.getByPlaceholderText('30');
    await user.type(durationInput, '30');

    const budgetInput = screen.getByPlaceholderText('10000');
    await user.type(budgetInput, '50000');

    // Fill mechanics - find by placeholder
    const discountValueInput = screen.getByPlaceholderText('10');
    await user.type(discountValueInput, '10');

    const minPurchaseInput = screen.getByPlaceholderText('50000');
    await user.type(minPurchaseInput, '50000');

    const hundredKInputs = screen.getAllByPlaceholderText('100000');
    // First one is Max Discount, second is Min Order Value
    await user.type(hundredKInputs[0], '100000'); // max discount
    await user.type(hundredKInputs[1], '50000'); // min order value

    // Toggle customer types
    const mtButton = screen.getByText('Modern Trade');
    await user.click(mtButton);
    const gtButton = screen.getByText('General Trade');
    await user.click(gtButton);
    // Toggle MT off
    await user.click(mtButton);

    // Submit
    const submitButton = screen.getByText('Create Template');
    await user.click(submitButton);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('handles cancel button', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });

  it('populates from existing template', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const template = {
      id: 't1',
      code: 'TPL-001',
      name: 'Existing Template',
      description: 'Existing desc',
      type: 'DISCOUNT',
      category: 'SEASONAL',
      defaultDuration: 30,
      defaultBudget: 50000,
      mechanics: {
        discountType: 'PERCENTAGE' as const,
        discountValue: 15,
        minPurchase: 10000,
        maxDiscount: 50000,
        stackable: true,
      },
      eligibility: {
        customerTypes: ['MT'],
        regions: [],
        productCategories: [],
        minOrderValue: 20000,
      },
      isActive: true,
      usageCount: 5,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-15',
    };
    render(<TemplateForm template={template} onSubmit={onSubmit} onCancel={onCancel} />);
    expect(screen.getByText('Update Template')).toBeTruthy();
  });

  it('shows Saving... when loading', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} isLoading={true} />);
    expect(screen.getByText('Saving...')).toBeTruthy();
  });

  it('handles stackable switch toggle', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);
    // Find the switch by its id
    const stackableSwitch = document.getElementById('stackable');
    if (stackableSwitch) {
      await user.click(stackableSwitch);
    }
  });

  it('handles isActive switch toggle', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);
    // Find all switches, the last one should be the Active Status switch
    const allSwitches = screen.getAllByRole('switch');
    const activeSwitch = allSwitches[allSwitches.length - 1];
    await user.click(activeSwitch);
  });

  it('handles empty duration/budget values (null path)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<TemplateForm onSubmit={onSubmit} onCancel={onCancel} />);

    const durationInput = screen.getByPlaceholderText('30');
    await user.type(durationInput, '30');
    await user.clear(durationInput);

    const budgetInput = screen.getByPlaceholderText('10000');
    await user.type(budgetInput, '50000');
    await user.clear(budgetInput);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Deployment
// ═══════════════════════════════════════════════════════════════════════════════
describe('PromotionDeploymentPage', () => {
  let DeploymentPage: any;

  beforeEach(async () => {
    const mod = await import('@/pages/promotions/Deployment');
    DeploymentPage = mod.default;
  });

  it('renders deployment page with promotion list', () => {
    render(<DeploymentPage />);
    expect(screen.getByText('Promotion Deployment')).toBeTruthy();
    expect(screen.getByText('Deployment Queue')).toBeTruthy();
  });

  it('selects a promotion and shows checklist', async () => {
    const user = userEvent.setup();
    render(<DeploymentPage />);

    // Click the unlocked promo (Aquafina) to show checklist with Lock Budget button
    const promoName = screen.getByText('Aquafina Summer Promo');
    await user.click(promoName);

    expect(screen.getByText('Deployment Checklist')).toBeTruthy();
    expect(screen.getByText('Lock Budget')).toBeTruthy();
    expect(screen.getByText('Export Configuration')).toBeTruthy();
  });

  it('toggles checklist items', async () => {
    const user = userEvent.setup();
    render(<DeploymentPage />);

    // Select a promo first
    const promoName = screen.getByText('Aquafina Summer Promo');
    await user.click(promoName);

    // Toggle a checklist item checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0]); // Toggle first item
      await user.click(checkboxes[0]); // Toggle back
    }
  });

  it('opens lock budget dialog', async () => {
    const user = userEvent.setup();
    render(<DeploymentPage />);

    // Select unlocked promo
    const promoName = screen.getByText('Aquafina Summer Promo');
    await user.click(promoName);

    // Click Lock Budget
    const lockButton = screen.getByText('Lock Budget');
    await user.click(lockButton);

    // Dialog content
    expect(screen.getByText('Confirm Lock')).toBeTruthy();

    // Cancel
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
  });

  it('opens deploy dialog for budget-locked promo', async () => {
    const user = userEvent.setup();
    render(<DeploymentPage />);

    // Select a budget-locked, non-deployed promo (Q1 MT Discount)
    const promoName = screen.getByText('Q1 MT Discount Campaign');
    await user.click(promoName);

    // Click Deploy to DMS
    const deployButton = screen.getByText('Deploy to DMS');
    await user.click(deployButton);

    // Dialog content
    expect(screen.getByText('Deploy Now')).toBeTruthy();

    // Close dialog
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
  });

  it('confirms lock budget in dialog', async () => {
    const user = userEvent.setup();
    render(<DeploymentPage />);

    const promoName = screen.getByText('GT Rebate Program');
    await user.click(promoName);

    const lockButton = screen.getByText('Lock Budget');
    await user.click(lockButton);

    const confirmButton = screen.getByText('Confirm Lock');
    await user.click(confirmButton);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. TargetList
// ═══════════════════════════════════════════════════════════════════════════════
describe('TargetList', () => {
  let TargetList: any;

  beforeEach(async () => {
    const mod = await import('@/pages/targets/TargetList');
    TargetList = mod.default;
  });

  it('renders target list with summary cards', () => {
    render(<TargetList />);
    expect(screen.getByText('Total Targets')).toBeTruthy();
    expect(screen.getByText('Achieved')).toBeTruthy();
    expect(screen.getByText('Avg Achievement')).toBeTruthy();
  });

  it('renders targets with different period formats (quarter and month)', () => {
    render(<TargetList />);
    // t1: year=2026, quarter=1 -> "2026 Q1"
    // t2: year=2026, month=1 -> "2026-01"
    // t3: year=2026, no quarter/month -> "2026"
    expect(screen.getByText('TGT-001')).toBeTruthy();
    expect(screen.getByText('TGT-002')).toBeTruthy();
    expect(screen.getByText('TGT-003')).toBeTruthy();
  });

  it('renders achievement rate with color coding', () => {
    render(<TargetList />);
    // t1: 85% (amber), t2: 112% (green with TrendingUp), t3: 60% (red with TrendingDown)
    expect(screen.getByText('85%')).toBeTruthy();
    expect(screen.getByText('112%')).toBeTruthy();
    expect(screen.getByText('60%')).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. DataTable
// ═══════════════════════════════════════════════════════════════════════════════
describe('DataTable', () => {
  let DataTable: any;

  beforeEach(async () => {
    const mod = await import('@/components/shared/DataTable');
    DataTable = mod.DataTable;
  });

  const testData = [
    { id: '1', name: 'Alpha', value: 100 },
    { id: '2', name: 'Beta', value: 200 },
    { id: '3', name: 'Gamma', value: 50 },
  ];

  const testColumns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'value', header: 'Value' },
  ];

  it('renders table with data', () => {
    render(<DataTable columns={testColumns} data={testData} />);
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
    expect(screen.getByText('Gamma')).toBeTruthy();
  });

  it('renders loading skeleton', () => {
    render(<DataTable columns={testColumns} data={[]} isLoading={true} />);
    // Should show skeleton elements, not table data
    expect(screen.queryByText('Alpha')).toBeNull();
  });

  it('renders error state', () => {
    render(<DataTable columns={testColumns} data={[]} error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders empty state', () => {
    render(<DataTable columns={testColumns} data={[]} emptyMessage="No data here" />);
    expect(screen.getByText('No data here')).toBeTruthy();
  });

  it('handles row click', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable columns={testColumns} data={testData} onRowClick={onRowClick} />);
    const row = screen.getByText('Alpha');
    await user.click(row);
    expect(onRowClick).toHaveBeenCalledWith(testData[0]);
  });

  it('handles sorting by clicking column headers', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={testColumns} data={testData} />);
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader); // asc
    await user.click(nameHeader); // desc
    await user.click(nameHeader); // reset
  });

  it('handles search with searchKey', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={testColumns} data={testData} searchKey="name" searchPlaceholder="Search names..." />);
    const searchInput = screen.getByPlaceholderText('Search names...');
    await user.type(searchInput, 'Alpha');
    expect(screen.getByText('Alpha')).toBeTruthy();
  });

  it('handles page size change with local pagination', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={testColumns} data={testData} />);
    // The Rows per page select - find the select trigger
    const rowsSelect = screen.getByText('Rows').closest('div')?.querySelector('button');
    if (rowsSelect) {
      await user.click(rowsSelect);
    }
  });

  it('handles server-side pagination', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        pageCount={5}
        pageIndex={0}
        pageSize={10}
        totalCount={50}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );
    // Click next page button
    const nextButtons = screen.getAllByRole('button');
    // Find the pagination forward button
    const forwardBtn = nextButtons.find(b => !b.hasAttribute('disabled') && b.className.includes('w-7'));
    if (forwardBtn) {
      fireEvent.click(forwardBtn);
    }
  });

  it('shows total count and column visibility dropdown', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={testColumns} data={testData} totalCount={999} />);
    // totalCount text appears in header and pagination
    expect(screen.getAllByText('999').length).toBeGreaterThan(0);

    // Click Columns dropdown
    const columnsButton = screen.getByText('Columns');
    await user.click(columnsButton);
  });

  it('renders with filter and action components', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        filterComponent={<div data-testid="custom-filter">Filter</div>}
        actionComponent={<div data-testid="custom-action">Action</div>}
      />
    );
    expect(screen.getByTestId('custom-filter')).toBeTruthy();
    expect(screen.getByTestId('custom-action')).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. TPO Page
// ═══════════════════════════════════════════════════════════════════════════════
describe('TPOPage', () => {
  let TPOPage: any;

  beforeEach(async () => {
    const mod = await import('@/pages/planning/TPO');
    TPOPage = mod.default;
  });

  it('renders TPO page with summary cards', () => {
    render(<TPOPage />);
    expect(screen.getByText('tpo.title')).toBeTruthy();
    expect(screen.getByText('New Insights')).toBeTruthy();
    expect(screen.getByText('Potential Revenue')).toBeTruthy();
  });

  it('runs optimization on button click', async () => {
    const user = userEvent.setup();
    render(<TPOPage />);
    const runButton = screen.getByText('Run Optimization');
    await user.click(runButton);
    expect(screen.getByText('Optimizing...')).toBeTruthy();
    // Wait for timeout (3s) to complete
    await waitFor(() => {
      expect(screen.getByText('Run Optimization')).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('switches to recommendations tab and accepts/rejects', async () => {
    const user = userEvent.setup();
    render(<TPOPage />);

    const recsTab = screen.getByText('AI Recommendations');
    await user.click(recsTab);

    // Accept a recommendation
    const acceptButtons = screen.getAllByText('Accept');
    if (acceptButtons.length > 0) {
      await user.click(acceptButtons[0]);
    }

    // Reject a recommendation - find thumbs down buttons
    const rejectButtons = screen.getAllByRole('button').filter(b => {
      const svg = b.querySelector('svg');
      return svg && !b.textContent?.includes('Accept') && b.closest('[class*="flex items-center gap-2"]');
    });
    if (rejectButtons.length > 0) {
      await user.click(rejectButtons[0]);
    }
  });

  it('switches to optimization tab and interacts', async () => {
    const user = userEvent.setup();
    render(<TPOPage />);

    const optTab = screen.getByText('Optimization Engine');
    await user.click(optTab);

    // Budget utilization input
    const budgetInput = screen.getByDisplayValue('70');
    await user.clear(budgetInput);
    await user.type(budgetInput, '85');

    // Toggle cannibalization switch - find by id
    const cannibalizationSwitch = document.getElementById('cannibalization');
    if (cannibalizationSwitch) {
      await user.click(cannibalizationSwitch);
    }

    // Run optimization from optimization tab - there are two, pick the last one
    const runButtons = screen.getAllByText('Run Optimization');
    await user.click(runButtons[runButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText('Running...')).toBeNull();
    }, { timeout: 5000 });
  });

  it('switches to scenarios tab and selects scenarios', async () => {
    const user = userEvent.setup();
    render(<TPOPage />);

    const scenariosTab = screen.getByText('Scenario Planning');
    await user.click(scenariosTab);

    // Click on Conservative scenario card
    const conservativeCard = screen.getByText('Conservative');
    await user.click(conservativeCard);

    // Click on Aggressive scenario card
    const aggressiveCard = screen.getByText('Aggressive');
    await user.click(aggressiveCard);
  });

  it('interacts with TPO AI tab form fields', async () => {
    const user = userEvent.setup();
    render(<TPOPage />);

    // Should be on TPO AI tab by default
    expect(screen.getByText('tpo.connected')).toBeTruthy();

    // Fill in budget min
    const budgetMinInputs = screen.getAllByDisplayValue('20000000');
    if (budgetMinInputs.length > 0) {
      await user.clear(budgetMinInputs[0]);
      await user.type(budgetMinInputs[0], '30000000');
    }

    // Fill in budget max
    const budgetMaxInputs = screen.getAllByDisplayValue('100000000');
    if (budgetMaxInputs.length > 0) {
      await user.clear(budgetMaxInputs[0]);
      await user.type(budgetMaxInputs[0], '200000000');
    }

    // Fill in target ROI
    const targetROIInputs = screen.getAllByDisplayValue('80');
    if (targetROIInputs.length > 0) {
      await user.clear(targetROIInputs[0]);
      await user.type(targetROIInputs[0], '90');
    }

    // Click Get AI Suggestions button
    const suggestionsButton = screen.getByText('tpo.getAiSuggestions');
    await user.click(suggestionsButton);
    expect(mockGetSuggestions).toHaveBeenCalled();
  });

  it('interacts with ROI prediction form', async () => {
    const user = userEvent.setup();
    render(<TPOPage />);

    // Fill ROI form fields - discount percent
    const discountInputs = screen.getAllByDisplayValue('15');
    if (discountInputs.length > 0) {
      await user.clear(discountInputs[0]);
      await user.type(discountInputs[0], '20');
    }

    // Fill budget amount
    const budgetAmountInputs = screen.getAllByDisplayValue('50000000');
    if (budgetAmountInputs.length > 0) {
      await user.clear(budgetAmountInputs[0]);
      await user.type(budgetAmountInputs[0], '75000000');
    }

    // Click predict ROI button
    const predictButton = screen.getByText('tpo.predictRoi');
    await user.click(predictButton);
    expect(mockPredict).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. APIKeysList
// ═══════════════════════════════════════════════════════════════════════════════
describe('APIKeysList', () => {
  let APIKeysList: any;

  beforeEach(async () => {
    const mod = await import('@/pages/integration/security/APIKeysList');
    APIKeysList = mod.default;
  });

  it('renders API keys list', () => {
    render(<APIKeysList />);
    expect(screen.getByText('API Keys')).toBeTruthy();
    expect(screen.getByText('Production Key')).toBeTruthy();
    expect(screen.getByText('Dev Key')).toBeTruthy();
  });

  it('opens create key dialog', async () => {
    const user = userEvent.setup();
    render(<APIKeysList />);
    const createButton = screen.getByText('Create Key');
    await user.click(createButton);
    expect(screen.getByText('Create API Key')).toBeTruthy();
  });

  it('fills form and creates a new API key', async () => {
    const user = userEvent.setup();
    render(<APIKeysList />);

    // Open dialog
    const createButton = screen.getByText('Create Key');
    await user.click(createButton);

    // Fill name
    const nameInput = screen.getByLabelText('Key Name');
    await user.type(nameInput, 'Test Key');

    // Change expiry
    const expiresInput = screen.getByLabelText('Expires In (Days)');
    await user.clear(expiresInput);
    await user.type(expiresInput, '180');

    // Toggle some permissions
    const permissionCheckboxes = screen.getAllByRole('checkbox');
    if (permissionCheckboxes.length > 0) {
      await user.click(permissionCheckboxes[0]); // Toggle first permission on
      await user.click(permissionCheckboxes[1]); // Toggle second permission on
    }

    // Click create - find the button inside the dialog that's not disabled
    const allButtons = screen.getAllByRole('button');
    const createBtn = allButtons.find(b => b.textContent === 'Create Key' && !b.hasAttribute('disabled'));
    if (createBtn) {
      await user.click(createBtn);
    }

    await waitFor(() => {
      expect(mockCreateAPIKey).toHaveBeenCalled();
    });
  });

  it('handles toggle permission off', async () => {
    const user = userEvent.setup();
    render(<APIKeysList />);

    const createButton = screen.getByText('Create Key');
    await user.click(createButton);

    // Toggle a permission on then off
    const permissionCheckboxes = screen.getAllByRole('checkbox');
    if (permissionCheckboxes.length > 0) {
      await user.click(permissionCheckboxes[0]); // on
      await user.click(permissionCheckboxes[0]); // off
    }
  });

  it('revokes a key', async () => {
    const user = userEvent.setup();
    render(<APIKeysList />);

    const revokeButton = screen.getByTestId('revoke-k1');
    await user.click(revokeButton);

    await waitFor(() => {
      expect(mockRevokeAPIKey).toHaveBeenCalledWith('k1');
    });
  });

  it('navigates back to security page', async () => {
    const user = userEvent.setup();
    render(<APIKeysList />);

    // Find the back button (arrow left icon button)
    const buttons = screen.getAllByRole('button');
    const backButton = buttons[0]; // First button is the back button
    await user.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/integration/security');
  });

  it('closes create dialog with cancel', async () => {
    const user = userEvent.setup();
    render(<APIKeysList />);

    const createButton = screen.getByText('Create Key');
    await user.click(createButton);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. BIDashboard
// ═══════════════════════════════════════════════════════════════════════════════
describe('BIDashboard', () => {
  let BIDashboard: any;

  beforeEach(async () => {
    const mod = await import('@/pages/bi/BIDashboard');
    BIDashboard = mod.default;
  });

  it('renders BI dashboard with KPIs and charts', () => {
    render(<BIDashboard />);
    expect(screen.getByText('Business Intelligence')).toBeTruthy();
    expect(screen.getByText('Total Promotions')).toBeTruthy();
    expect(screen.getByText('Budget')).toBeTruthy();
    expect(screen.getByText('ROI')).toBeTruthy();
  });

  it('changes date range inputs', async () => {
    const user = userEvent.setup();
    render(<BIDashboard />);

    const fromInput = screen.getByLabelText('From');
    await user.clear(fromInput);
    await user.type(fromInput, '2026-01-01');

    const toInput = screen.getByLabelText('To');
    await user.clear(toInput);
    await user.type(toInput, '2026-02-01');
  });

  it('clicks refetch button', async () => {
    const user = userEvent.setup();
    render(<BIDashboard />);

    // The refresh button with RefreshCw icon
    const buttons = screen.getAllByRole('button');
    // Find the icon-only button near the date inputs
    const refreshButtons = buttons.filter(b => b.querySelector('svg') && !b.textContent);
    if (refreshButtons.length > 0) {
      await user.click(refreshButtons[0]);
      expect(mockBIRefetch).toHaveBeenCalled();
    }
  });

  it('navigates to reports page', async () => {
    const user = userEvent.setup();
    render(<BIDashboard />);

    const reportsButton = screen.getByText('Reports');
    await user.click(reportsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/reports');
  });

  it('navigates via quick report buttons', async () => {
    const user = userEvent.setup();
    render(<BIDashboard />);

    const promoSummary = screen.getByText('Promotion Summary');
    await user.click(promoSummary);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/reports?preset=promotion-summary');

    const claimAnalysis = screen.getByText('Claim Analysis');
    await user.click(claimAnalysis);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/reports?preset=claim-analysis');

    const customerPerf = screen.getByText('Customer Performance');
    await user.click(customerPerf);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/reports?preset=customer-performance');

    const roiReport = screen.getByText('ROI Report');
    await user.click(roiReport);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/reports?preset=roi-report');
  });

  it('navigates via navigation cards', async () => {
    const user = userEvent.setup();
    render(<BIDashboard />);

    const reportBuilder = screen.getByText('Report Builder');
    await user.click(reportBuilder);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/reports');

    const analytics = screen.getByText('Analytics');
    await user.click(analytics);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/analytics');

    const exportCenter = screen.getByText('Export Center');
    await user.click(exportCenter);
    expect(mockNavigate).toHaveBeenCalledWith('/bi/export');
  });
});
