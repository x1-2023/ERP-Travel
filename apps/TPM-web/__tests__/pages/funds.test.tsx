/**
 * Funds Pages Smoke Tests
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
vi.mock('@/hooks/useFunds', () => ({
  useFunds: () => ({ data: undefined, isLoading: false, isError: false }),
  useFund: () => ({ data: undefined, isLoading: false, isError: false }),
  useFundOptions: () => ({ data: [], isLoading: false }),
  useCreateFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteFund: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// Mock form component
vi.mock('@/components/forms', () => ({
  FundForm: ({ onSubmit, isSubmitting, initialData }: any) => (
    <div data-testid="fund-form">
      <button onClick={() => onSubmit({})}>Submit</button>
      {isSubmitting && <span>Submitting...</span>}
      {initialData && <span>Editing: {initialData.code}</span>}
    </div>
  ),
  PromotionForm: () => <div data-testid="promotion-form" />,
  ClaimForm: () => <div data-testid="claim-form" />,
}));

import FundList from '@/pages/funds/FundList';
import FundNew from '@/pages/funds/FundNew';
import FundDetail from '@/pages/funds/FundDetail';
import FundEdit from '@/pages/funds/FundEdit';

describe('FundList Page', () => {
  it('renders page title and description', () => {
    render(<FundList />);
    expect(screen.getByText('Funds')).toBeInTheDocument();
    expect(screen.getByText('Manage promotional funds and budgets')).toBeInTheDocument();
  });

  it('renders new fund button', () => {
    render(<FundList />);
    expect(screen.getByText('New Fund')).toBeInTheDocument();
  });

  it('renders demo fund data in the table', () => {
    render(<FundList />);
    expect(screen.getByText('Trade Fund Q1')).toBeInTheDocument();
    expect(screen.getByText('FUND-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Marketing Fund')).toBeInTheDocument();
  });
});

describe('FundNew Page', () => {
  it('renders page title', () => {
    render(<FundNew />);
    expect(screen.getByText('New Fund')).toBeInTheDocument();
    expect(screen.getByText('Create a new trade fund')).toBeInTheDocument();
  });

  it('renders the fund form', () => {
    render(<FundNew />);
    expect(screen.getByTestId('fund-form')).toBeInTheDocument();
  });
});

describe('FundDetail Page', () => {
  it('renders fund code and name from demo data', () => {
    render(<FundDetail />);
    // FUND-2026-001 appears in header and fund info section
    expect(screen.getAllByText('FUND-2026-001').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Trade Fund Q1')).toBeInTheDocument();
  });

  it('renders summary cards', () => {
    render(<FundDetail />);
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    // "Allocated", "Utilized", "Available" may appear in summary cards and utilization section
    expect(screen.getAllByText('Allocated').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Utilized').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Available').length).toBeGreaterThanOrEqual(1);
  });

  it('renders fund information card', () => {
    render(<FundDetail />);
    expect(screen.getByText('Fund Information')).toBeInTheDocument();
    expect(screen.getByText('Fund Code')).toBeInTheDocument();
    expect(screen.getByText('Fund Type')).toBeInTheDocument();
  });

  it('renders budget utilization card', () => {
    render(<FundDetail />);
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
  });

  it('renders associated promotions', () => {
    render(<FundDetail />);
    expect(screen.getByText('Associated Promotions')).toBeInTheDocument();
    expect(screen.getByText('Create Promotion')).toBeInTheDocument();
  });

  it('renders edit and delete buttons', () => {
    render(<FundDetail />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});

describe('FundEdit Page', () => {
  it('renders error state when no fund data (API returns undefined)', () => {
    render(<FundEdit />);
    // When useFund returns { data: undefined, isLoading: false, error: undefined }
    // The page shows error state because !fund is true
    expect(screen.getByText('Failed to load fund')).toBeInTheDocument();
    expect(screen.getByText('Back to Funds')).toBeInTheDocument();
  });
});
