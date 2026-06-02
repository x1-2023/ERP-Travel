/**
 * Smoke tests for Finance > Deductions pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks
vi.mock('@/hooks/useDeductions', () => ({
  useDeductions: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  useDeduction: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  useCreateDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDisputeDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useResolveDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useMatchingSuggestions: () => ({ data: undefined, isLoading: false }),
  useMatchDeduction: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock finance components
vi.mock('@/components/finance/DeductionStatusBadge', () => ({
  DeductionStatusBadge: ({ status }: { status: string }) => <span data-testid="deduction-status">{status}</span>,
}));

vi.mock('@/components/finance/DeductionStats', () => ({
  DeductionStats: () => <div data-testid="deduction-stats" />,
}));

vi.mock('@/components/finance/DeductionCard', () => ({
  DeductionCard: () => <div data-testid="deduction-card" />,
}));

vi.mock('@/components/finance/MatchingSuggestionCard', () => ({
  MatchingSuggestionCard: () => <div data-testid="matching-suggestion" />,
}));

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

import DeductionListPage from '@/pages/finance/deductions/DeductionList';
import DeductionDetailPage from '@/pages/finance/deductions/DeductionDetail';
import DeductionMatchingPage from '@/pages/finance/deductions/DeductionMatching';

describe('DeductionListPage', () => {
  it('renders without crashing', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('Deductions')).toBeInTheDocument();
  });

  it('displays the record deduction button', () => {
    render(<DeductionListPage />);
    expect(screen.getAllByText('Record Deduction').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no data', () => {
    render(<DeductionListPage />);
    expect(screen.getByText('No deductions found')).toBeInTheDocument();
  });
});

describe('DeductionDetailPage', () => {
  it('renders without crashing and shows not found', () => {
    render(<DeductionDetailPage />);
    expect(screen.getByText('Deduction not found')).toBeInTheDocument();
  });
});

describe('DeductionMatchingPage', () => {
  it('renders without crashing and shows not found when no deduction', () => {
    render(<DeductionMatchingPage />);
    expect(screen.getByText('Deduction not found')).toBeInTheDocument();
  });
});
