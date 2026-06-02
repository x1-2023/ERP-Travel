/**
 * Smoke tests for Finance > Journals pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// Mock hooks
vi.mock('@/hooks/useJournals', () => ({
  useJournals: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  useJournal: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  usePostJournal: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReverseJournal: () => ({ mutateAsync: vi.fn(), isPending: false }),
  Journal: {},
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock finance components
vi.mock('@/components/finance/JournalStatusBadge', () => ({
  JournalStatusBadge: ({ status }: { status: string }) => <span data-testid="journal-status">{status}</span>,
}));

vi.mock('@/components/finance/JournalStats', () => ({
  JournalStats: () => <div data-testid="journal-stats" />,
}));

vi.mock('@/components/finance/JournalCard', () => ({
  JournalCard: () => <div data-testid="journal-card" />,
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

import JournalListPage from '@/pages/finance/journals/JournalList';
import JournalDetailPage from '@/pages/finance/journals/JournalDetail';

describe('JournalListPage', () => {
  it('renders without crashing', () => {
    render(<JournalListPage />);
    expect(screen.getByText('GL Journals')).toBeInTheDocument();
  });

  it('displays the create journal button', () => {
    render(<JournalListPage />);
    expect(screen.getAllByText('Create Journal').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no data', () => {
    render(<JournalListPage />);
    expect(screen.getByText('No journals found')).toBeInTheDocument();
  });
});

describe('JournalDetailPage', () => {
  it('renders without crashing and shows not found', () => {
    render(<JournalDetailPage />);
    expect(screen.getByText('Journal not found')).toBeInTheDocument();
  });
});
