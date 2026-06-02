/**
 * Promotions Pages Smoke Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock react-router-dom partially (keep BrowserRouter from test-utils)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock hooks
vi.mock('@/hooks/usePromotions', () => ({
  usePromotions: () => ({ data: undefined, isLoading: false, isError: false }),
  usePromotion: () => ({ data: undefined, isLoading: false, isError: false }),
  useDeletePromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreatePromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdatePromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePromotionOptions: () => ({ data: [], isLoading: false }),
  useSubmitPromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApprovePromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectPromotion: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useFunds', () => ({
  useFunds: () => ({ data: undefined, isLoading: false, isError: false }),
  useFund: () => ({ data: undefined, isLoading: false, isError: false }),
  useFundOptions: () => ({ data: [], isLoading: false }),
  useCreateFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({ data: undefined, isLoading: false, isError: false }),
  useCustomer: () => ({ data: undefined, isLoading: false, isError: false }),
  useCustomerOptions: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// Mock charts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ScatterChart: () => <div data-testid="scatter-chart" />,
  Scatter: () => null,
  ZAxis: () => null,
}));

// Mock form component (complex with react-hook-form + zodResolver)
vi.mock('@/components/forms', () => ({
  PromotionForm: ({ onSubmit, isSubmitting }: any) => (
    <div data-testid="promotion-form">
      <button onClick={() => onSubmit({})}>Submit Form</button>
      {isSubmitting && <span>Submitting...</span>}
    </div>
  ),
  ClaimForm: () => <div data-testid="claim-form" />,
  FundForm: () => <div data-testid="fund-form" />,
}));

import PromotionList from '@/pages/promotions/PromotionList';
import PromotionNew from '@/pages/promotions/PromotionNew';
import PromotionDetail from '@/pages/promotions/PromotionDetail';
import PromotionDeployment from '@/pages/promotions/Deployment';
import PromotionEfficiency from '@/pages/promotions/Efficiency';
import PromotionMechanics from '@/pages/promotions/Mechanics';

describe('PromotionList Page', () => {
  it('renders page title and description', () => {
    render(<PromotionList />);
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Manage trade promotions and campaigns')).toBeInTheDocument();
  });

  it('renders new promotion button', () => {
    render(<PromotionList />);
    expect(screen.getByText('New Promotion')).toBeInTheDocument();
  });

  it('renders demo promotion data', () => {
    render(<PromotionList />);
    expect(screen.getByText('Summer Sale Campaign')).toBeInTheDocument();
    expect(screen.getByText('PROMO-2026-001')).toBeInTheDocument();
  });
});

describe('PromotionNew Page', () => {
  it('renders page title', () => {
    render(<PromotionNew />);
    expect(screen.getByText('New Promotion')).toBeInTheDocument();
    expect(screen.getByText('Create a new trade promotion')).toBeInTheDocument();
  });

  it('renders the promotion form', () => {
    render(<PromotionNew />);
    expect(screen.getByTestId('promotion-form')).toBeInTheDocument();
  });
});

describe('PromotionDetail Page', () => {
  it('renders promotion code and name from demo data', () => {
    render(<PromotionDetail />);
    // PROMO-2026-001 appears multiple times (header + claims section)
    expect(screen.getAllByText('PROMO-2026-001').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Summer Sale Campaign').length).toBeGreaterThanOrEqual(1);
  });

  it('renders tabs', () => {
    render(<PromotionDetail />);
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText(/Claims/)).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<PromotionDetail />);
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Actual Spend')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('Utilization')).toBeInTheDocument();
  });
});

describe('PromotionDeployment Page', () => {
  it('renders page title and description', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText('Promotion Deployment')).toBeInTheDocument();
    expect(screen.getByText(/Deploy promotions to DMS/)).toBeInTheDocument();
  });

  it('renders summary stat cards', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText('Total Promotions')).toBeInTheDocument();
    // "Deployed" appears in stat cards and as badge text
    expect(screen.getAllByText('Deployed').length).toBeGreaterThanOrEqual(1);
    // "Ready" appears in stat card and as badge
    expect(screen.getAllByText('Ready').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders deployment queue with promotion names', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText('Deployment Queue')).toBeInTheDocument();
    expect(screen.getByText(/Pepsi Bundle/)).toBeInTheDocument();
  });

  it('renders deployment checklist section', () => {
    render(<PromotionDeployment />);
    expect(screen.getByText('Deployment Checklist')).toBeInTheDocument();
  });
});

describe('PromotionEfficiency Page', () => {
  it('renders page title', () => {
    render(<PromotionEfficiency />);
    expect(screen.getByText('Promotion Efficiency')).toBeInTheDocument();
    expect(screen.getAllByText(/ROI Calculator/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders summary cards', () => {
    render(<PromotionEfficiency />);
    expect(screen.getByText('Average ROI')).toBeInTheDocument();
    expect(screen.getByText('Avg Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Total Investment')).toBeInTheDocument();
    expect(screen.getByText('Incremental Revenue')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    render(<PromotionEfficiency />);
    // Tab triggers
    expect(screen.getAllByText(/ROI Calculator/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Performance Analysis')).toBeInTheDocument();
    expect(screen.getByText('Promotion Comparison')).toBeInTheDocument();
  });
});

describe('PromotionMechanics Page', () => {
  it('renders page title', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Mechanics / Slab')).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    // "Discount", "Rebate", "Free Goods", "Bundle" appear in stats cards, tabs, table, and guide
    expect(screen.getAllByText('Discount').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Rebate').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Free Goods').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Bundle').length).toBeGreaterThanOrEqual(1);
  });

  it('renders mechanic configurations table', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Mechanic Configurations')).toBeInTheDocument();
    expect(screen.getByText('Volume Discount Tiers')).toBeInTheDocument();
    expect(screen.getByText('Quarterly Rebate')).toBeInTheDocument();
  });

  it('renders mechanic types guide', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Mechanic Types Guide')).toBeInTheDocument();
  });

  it('renders create mechanic button', () => {
    render(<PromotionMechanics />);
    expect(screen.getByText('Create Mechanic')).toBeInTheDocument();
  });
});
