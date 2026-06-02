/**
 * Smoke tests for Finance > Cheques pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks
vi.mock('@/hooks/useCheques', () => ({
  useCheques: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  useCheque: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  useCreateCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useClearCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVoidCheque: () => ({ mutateAsync: vi.fn(), isPending: false }),
  Cheque: {},
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock finance components
vi.mock('@/components/finance/ChequeStatusBadge', () => ({
  ChequeStatusBadge: ({ status }: { status: string }) => <span data-testid="cheque-status">{status}</span>,
}));

vi.mock('@/components/finance/ChequeStats', () => ({
  ChequeStats: () => <div data-testid="cheque-stats" />,
}));

vi.mock('@/components/finance/ChequeCard', () => ({
  ChequeCard: () => <div data-testid="cheque-card" />,
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

import ChequeListPage from '@/pages/finance/cheques/ChequeList';
import ChequeDetailPage from '@/pages/finance/cheques/ChequeDetail';

describe('ChequeListPage', () => {
  it('renders without crashing', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('Chequebook')).toBeInTheDocument();
  });

  it('displays the issue cheque button', () => {
    render(<ChequeListPage />);
    expect(screen.getAllByText('Issue Cheque').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no data', () => {
    render(<ChequeListPage />);
    expect(screen.getByText('No cheques found')).toBeInTheDocument();
  });
});

describe('ChequeDetailPage', () => {
  it('renders without crashing and shows not found state', () => {
    render(<ChequeDetailPage />);
    expect(screen.getByText('Cheque not found')).toBeInTheDocument();
  });
});
