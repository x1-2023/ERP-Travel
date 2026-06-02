/**
 * Smoke tests for Finance > Accruals pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks used by AccrualList
vi.mock('@/hooks/useAccruals', () => ({
  useAccruals: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  useAccrual: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  usePostAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePostAccrualBatch: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReverseAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateAccrual: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePreviewAccruals: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCalculateAccruals: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock finance components that may cause issues
vi.mock('@/components/finance/AccrualStatusBadge', () => ({
  AccrualStatusBadge: ({ status }: { status: string }) => <span data-testid="accrual-status">{status}</span>,
}));

vi.mock('@/components/finance/FinanceStats', () => ({
  AccrualStats: () => <div data-testid="accrual-stats" />,
}));

vi.mock('@/components/finance/AccrualCard', () => ({
  AccrualCard: () => <div data-testid="accrual-card" />,
}));

// Lazy-import pages
import AccrualListPage from '@/pages/finance/accruals/AccrualList';
import AccrualDetailPage from '@/pages/finance/accruals/AccrualDetail';
import AccrualCalculatePage from '@/pages/finance/accruals/AccrualCalculate';

// Mock useParams for detail page
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

describe('AccrualListPage', () => {
  it('renders without crashing', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('Accrual Management')).toBeInTheDocument();
  });

  it('displays the calculate accruals button', () => {
    render(<AccrualListPage />);
    expect(screen.getAllByText('Calculate Accruals').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no data', () => {
    render(<AccrualListPage />);
    expect(screen.getByText('No accruals found')).toBeInTheDocument();
  });
});

describe('AccrualDetailPage', () => {
  it('renders without crashing and shows empty state', () => {
    render(<AccrualDetailPage />);
    // data is undefined so it shows "not found"
    expect(screen.getByText('Accrual not found')).toBeInTheDocument();
  });
});

describe('AccrualCalculatePage', () => {
  it('renders without crashing', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Calculate Accruals')).toBeInTheDocument();
  });

  it('displays step cards', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Step 1: Select Period')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Calculation Method')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Review & Calculate')).toBeInTheDocument();
  });

  it('shows preview results section', () => {
    render(<AccrualCalculatePage />);
    expect(screen.getByText('Preview Results')).toBeInTheDocument();
  });
});
