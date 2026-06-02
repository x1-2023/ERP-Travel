/**
 * Claims Pages Smoke Tests
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

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
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

import ClaimList from '@/pages/claims/ClaimList';
import ClaimNew from '@/pages/claims/ClaimNew';
import ClaimDetail from '@/pages/claims/ClaimDetail';
import ClaimsPayment from '@/pages/claims/Payment';
import ClaimsSettlement from '@/pages/claims/Settlement';

describe('ClaimList Page', () => {
  it('renders page title and description', () => {
    render(<ClaimList />);
    expect(screen.getByText('Claims')).toBeInTheDocument();
    expect(screen.getByText('Manage promotion claims and settlements')).toBeInTheDocument();
  });

  it('renders new claim button', () => {
    render(<ClaimList />);
    expect(screen.getByText('New Claim')).toBeInTheDocument();
  });

  it('renders demo claim data', () => {
    render(<ClaimList />);
    expect(screen.getByText('CLM-2026-001')).toBeInTheDocument();
    expect(screen.getByText('CLM-2026-002')).toBeInTheDocument();
  });
});

describe('ClaimNew Page', () => {
  it('renders page title', () => {
    render(<ClaimNew />);
    expect(screen.getByText('New Claim')).toBeInTheDocument();
    expect(screen.getByText('Submit a new promotion claim')).toBeInTheDocument();
  });

  it('renders the claim form', () => {
    render(<ClaimNew />);
    expect(screen.getByTestId('claim-form')).toBeInTheDocument();
  });
});

describe('ClaimDetail Page', () => {
  it('renders claim code from demo data', () => {
    render(<ClaimDetail />);
    // CLM-2026-001 appears in header and detail info
    expect(screen.getAllByText('CLM-2026-001').length).toBeGreaterThanOrEqual(1);
  });

  it('renders summary cards', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('Claim Amount')).toBeInTheDocument();
    expect(screen.getByText('Approved Amount')).toBeInTheDocument();
    expect(screen.getByText('Paid Amount')).toBeInTheDocument();
    // "Claim Date" appears twice (summary card and detail section)
    expect(screen.getAllByText('Claim Date').length).toBeGreaterThanOrEqual(1);
  });

  it('renders claim information card', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('Claim Information')).toBeInTheDocument();
    expect(screen.getByText('Claim Code')).toBeInTheDocument();
  });

  it('renders related promotion card', () => {
    render(<ClaimDetail />);
    expect(screen.getByText('Related Promotion')).toBeInTheDocument();
    expect(screen.getByText('Summer Sale Campaign')).toBeInTheDocument();
  });
});

describe('ClaimsPayment Page', () => {
  it('renders page title', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Thanh Toán Claims')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('Tổng claims')).toBeInTheDocument();
    expect(screen.getByText('Tổng giá trị')).toBeInTheDocument();
  });

  it('renders payment table tabs', () => {
    render(<ClaimsPayment />);
    // These texts appear in tabs and in status badges/filter options
    expect(screen.getAllByText(/Chờ xử lý/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Đang xử lý/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Hoàn thành/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders payment data', () => {
    render(<ClaimsPayment />);
    expect(screen.getByText('CLM-2026-0001')).toBeInTheDocument();
  });
});

describe('ClaimsSettlement Page', () => {
  it('renders page title', () => {
    render(<ClaimsSettlement />);
    expect(screen.getByText('Claims Settlement')).toBeInTheDocument();
    expect(screen.getByText('Verify and settle customer claims')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<ClaimsSettlement />);
    // "Pending Verification" appears in card title and in filter/badge - use getAllByText
    expect(screen.getAllByText('Pending Verification').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Ready for Settlement').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Pending Amount')).toBeInTheDocument();
    expect(screen.getByText('Settled (MTD)')).toBeInTheDocument();
  });

  it('renders settlement queue', () => {
    render(<ClaimsSettlement />);
    expect(screen.getByText('Settlement Queue')).toBeInTheDocument();
    // CLM-2026-0001 appears in the table
    expect(screen.getAllByText('CLM-2026-0001').length).toBeGreaterThanOrEqual(1);
  });

  it('renders settle selected button', () => {
    render(<ClaimsSettlement />);
    expect(screen.getByText(/Settle Selected/)).toBeInTheDocument();
  });
});
