/**
 * Deep Tests for Claims Pages
 * Covers: ClaimList (demo data, buttons, description),
 *         ClaimNew (form render),
 *         ClaimDetail (summary cards, claim info, related promotion),
 *         Payment (tabs, search, filters, summary, demo data),
 *         Settlement (summary, queue, filters)
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
vi.mock('@/hooks/useClaims', () => ({
  useClaims: () => ({ data: undefined, isLoading: false, isError: false }),
  useClaim: () => ({ data: undefined, isLoading: false, isError: false }),
  useDeleteClaim: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateClaim: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateClaim: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSubmitClaim: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApproveClaim: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectClaim: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/usePromotions', () => ({
  usePromotions: () => ({ data: undefined, isLoading: false }),
  usePromotion: () => ({ data: undefined, isLoading: false }),
  usePromotionOptions: () => ({ data: [], isLoading: false }),
}));

const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
  toast: vi.fn(),
}));

// Mock forms
vi.mock('@/components/forms', () => ({
  ClaimForm: ({ isSubmitting }: any) => (
    <div data-testid="claim-form">
      {isSubmitting && <span>Submitting...</span>}
    </div>
  ),
  PromotionForm: () => <div data-testid="promotion-form" />,
  FundForm: () => <div data-testid="fund-form" />,
}));

// Mock ClaimStatusBadge to render human label
vi.mock('@/components/claims/ClaimStatusBadge', () => ({
  ClaimStatusBadge: ({ status }: any) => {
    const labels: Record<string, string> = {
      DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved', REJECTED: 'Rejected', PAID: 'Paid', CANCELLED: 'Cancelled',
    };
    return <span data-testid="claim-status-badge">{labels[status] || status}</span>;
  },
}));

// Mock PromotionStatusBadge
vi.mock('@/components/promotions/PromotionStatusBadge', () => ({
  PromotionStatusBadge: ({ status }: any) => <span data-testid="promo-status-badge">{status}</span>,
}));

// Mock shared components
vi.mock('@/components/shared/DataTable', () => ({
  DataTable: ({ data, columns }: any) => (
    <table data-testid="data-table">
      <tbody>
        {data?.map((item: any, i: number) => (
          <tr key={i} data-testid={`row-${i}`}>
            <td>{item.code}</td>
            <td>{item.promotion?.name}</td>
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
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@/components/shared/SearchInput', () => ({
  SearchInput: ({ placeholder, onChange, value }: any) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value || ''}
      onChange={(e: any) => onChange(e.target.value)}
    />
  ),
}));

// Mock CurrencyDisplay
vi.mock('@/components/ui/currency-display', () => ({
  CurrencyDisplay: ({ amount }: any) => <span data-testid="currency-display">{amount}</span>,
}));

import ClaimList from '@/pages/claims/ClaimList';
import ClaimNew from '@/pages/claims/ClaimNew';
import ClaimDetail from '@/pages/claims/ClaimDetail';
import ClaimsPayment from '@/pages/claims/Payment';
import ClaimsSettlement from '@/pages/claims/Settlement';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// CLAIM LIST DEEP TESTS
// ============================================================================

describe('ClaimList - Deep Tests', () => {
  it('renders page title', () => {
    render(<ClaimList />);
    expect(screen.getByText('Claims')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<ClaimList />);
    expect(screen.getByText('Manage promotion claims and settlements')).toBeInTheDocument();
  });

  it('renders New Claim button', () => {
    render(<ClaimList />);
    expect(screen.getByText('New Claim')).toBeInTheDocument();
  });

  it('renders all demo claim codes in table', () => {
    render(<ClaimList />);
    expect(screen.getByText('CLM-2026-001')).toBeInTheDocument();
    expect(screen.getByText('CLM-2026-002')).toBeInTheDocument();
    expect(screen.getByText('CLM-2026-003')).toBeInTheDocument();
  });

  it('renders demo promotion names in table', () => {
    render(<ClaimList />);
    // Summer Sale Campaign appears twice (CLM-2026-001 and CLM-2026-004 reference same promo)
    expect(screen.getAllByText('Summer Sale Campaign').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Q1 Trade Deal')).toBeInTheDocument();
    expect(screen.getByText('Flash Sale Weekend')).toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    render(<ClaimList />);
    expect(screen.getByPlaceholderText('Search claims...')).toBeInTheDocument();
  });

  it('renders data table component', () => {
    render(<ClaimList />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders pagination component', () => {
    render(<ClaimList />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});

// ============================================================================
// CLAIM NEW DEEP TESTS
// ============================================================================

describe('ClaimNew - Deep Tests', () => {
  it('renders page title and description', () => {
    render(<ClaimNew />);
    expect(screen.getByText('New Claim')).toBeInTheDocument();
    expect(screen.getByText('Submit a new promotion claim')).toBeInTheDocument();
  });

  it('renders the claim form', () => {
    render(<ClaimNew />);
    expect(screen.getByTestId('claim-form')).toBeInTheDocument();
  });
});

// ============================================================================
// CLAIM DETAIL DEEP TESTS
// ============================================================================

describe('ClaimDetail - Deep Tests', () => {
  it('renders claim code from demo data', () => {
    render(<ClaimDetail />);
    expect(screen.getAllByText('CLM-2026-001').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all summary cards', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('Claim Amount')).toBeInTheDocument();
    expect(screen.getByText('Approved Amount')).toBeInTheDocument();
    expect(screen.getByText('Paid Amount')).toBeInTheDocument();
  });

  it('renders Claim Date summary card', () => {
    render(<ClaimDetail />);
    // Claim Date appears as summary card title AND in Claim Information section
    expect(screen.getAllByText('Claim Date').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Claim Information card', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('Claim Information')).toBeInTheDocument();
    expect(screen.getByText('Claim Code')).toBeInTheDocument();
  });

  it('renders Related Promotion card with promotion name', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('Related Promotion')).toBeInTheDocument();
    expect(screen.getByText('Summer Sale Campaign')).toBeInTheDocument();
  });

  it('renders promotion code in Related Promotion section', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('PROMO-2026-001')).toBeInTheDocument();
  });

  it('renders description from demo data', () => {
    render(<ClaimDetail />);
    expect(screen.getByText(/Q1 rebate claim for January sales/)).toBeInTheDocument();
  });

  it('renders Created By info', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('Created By')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders claim status badge', () => {
    render(<ClaimDetail />);
    // Demo claim has SUBMITTED status, ClaimStatusBadge mock renders "Submitted"
    expect(screen.getAllByText('Submitted').length).toBeGreaterThanOrEqual(1);
  });

  it('renders customer and fund info', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('Customer A')).toBeInTheDocument();
    expect(screen.getByText('Trade Fund Q1')).toBeInTheDocument();
  });
});

// ============================================================================
// CLAIMS PAYMENT DEEP TESTS
// ============================================================================

describe('ClaimsPayment - Deep Tests', () => {
  it('renders page title', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Thanh Toán Claims')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Quản lý và xử lý thanh toán cho các claims đã duyệt')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Tổng claims')).toBeInTheDocument();
    expect(screen.getByText('Tổng giá trị')).toBeInTheDocument();
  });

  it('renders tab buttons', () => {
    render(<ClaimsPayment />);
    expect(screen.getAllByText(/Chờ xử lý/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Đang xử lý/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Hoàn thành/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Quá hạn/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders payment data in table', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('CLM-2026-0001')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ClaimsPayment />);
    expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument();
  });

  it('filters by search input', () => {
    render(<ClaimsPayment />);
    const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
    fireEvent.change(searchInput, { target: { value: 'Big C' } });
    // Should still show the matching claim
    expect(screen.getByText('CLM-2026-0001')).toBeInTheDocument();
  });

  it('renders export button', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders create batch payment button', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Tạo đợt thanh toán')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Claim / Promotion')).toBeInTheDocument();
    expect(screen.getByText('Khách hàng')).toBeInTheDocument();
    expect(screen.getByText('Đã duyệt')).toBeInTheDocument();
    expect(screen.getByText('Còn lại')).toBeInTheDocument();
    expect(screen.getByText('Phương thức')).toBeInTheDocument();
    expect(screen.getByText('Hạn TT')).toBeInTheDocument();
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.getByText('Thao tác')).toBeInTheDocument();
  });

  it('shows pagination info', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText(/Hiển thị \d+ \/ \d+ claims/)).toBeInTheDocument();
  });

  it('renders customer names in table', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Siêu thị Big C Thăng Long')).toBeInTheDocument();
  });

  it('renders payment method labels', () => {
    render(<ClaimsPayment />);
    expect(screen.getAllByText('Chuyển khoản').length).toBeGreaterThanOrEqual(1);
  });

  it('renders overdue summary cards', () => {
    render(<ClaimsPayment />);
    expect(screen.getAllByText('Quá hạn').length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// CLAIMS SETTLEMENT DEEP TESTS
// ============================================================================

describe('ClaimsSettlement - Deep Tests', () => {
  it('renders page title', () => {
    render(<ClaimsSettlement />);
    expect(screen.getByText('Claims Settlement')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<ClaimsSettlement />);
    expect(screen.getByText('Verify and settle customer claims')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<ClaimsSettlement />);
    expect(screen.getAllByText('Pending Verification').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ready for Settlement').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Pending Amount')).toBeInTheDocument();
    expect(screen.getByText('Settled (MTD)')).toBeInTheDocument();
  });

  it('renders settlement queue', () => {
    render(<ClaimsSettlement />);
    expect(screen.getByText('Settlement Queue')).toBeInTheDocument();
    expect(screen.getAllByText('CLM-2026-0001').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Settle Selected button', () => {
    render(<ClaimsSettlement />);
    expect(screen.getByText(/Settle Selected/)).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ClaimsSettlement />);
    const searchInputs = screen.getAllByPlaceholderText(/Search|Tìm/i);
    expect(searchInputs.length).toBeGreaterThanOrEqual(1);
  });
});
