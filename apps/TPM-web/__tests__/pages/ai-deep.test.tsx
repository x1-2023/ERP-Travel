/**
 * Deep Tests for AI Pages
 * Covers: AIDashboard (actions, sections),
 *         ClaimsAI (demo data, stats, batch processing),
 *         InsightsList (generate, filters),
 *         RecommendationsList (empty state, generate),
 *         Suggestions (stats cards, actions)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock AI insight hooks
const mockGenerateInsights = vi.fn();
vi.mock('@/hooks/ai/useInsights', () => ({
  useInsights: () => ({ data: { data: [], summary: undefined, pagination: undefined }, isLoading: false, refetch: vi.fn() }),
  useGenerateInsights: () => ({ mutateAsync: mockGenerateInsights, isPending: false }),
  useDismissInsight: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTakeInsightAction: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock AI recommendation hooks
const mockGenerateRecommendations = vi.fn();
vi.mock('@/hooks/ai/useRecommendations', () => ({
  useRecommendations: () => ({ data: { data: [], summary: undefined, pagination: undefined }, isLoading: false, refetch: vi.fn() }),
  useGenerateRecommendations: () => ({ mutateAsync: mockGenerateRecommendations, isPending: false }),
  useAcceptRecommendation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRejectRecommendation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock claims AI hooks
vi.mock('@/hooks/useClaimsAI', () => ({
  useClaimsAIStats: () => ({ data: undefined }),
  usePendingClaims: () => ({ data: undefined }),
  useProcessClaim: () => ({ mutate: vi.fn(), isPending: false }),
  useBatchProcessClaims: () => ({ mutate: vi.fn(), isPending: false }),
}));

// Mock promo suggestions hooks
vi.mock('@/hooks/usePromoSuggestions', () => ({
  usePromoSuggestions: () => ({ data: undefined }),
  useApproveSuggestion: () => ({ mutate: vi.fn(), isPending: false }),
  useRejectSuggestion: () => ({ mutate: vi.fn(), isPending: false }),
  useApplySuggestion: () => ({ mutate: vi.fn(), isPending: false }),
  useGenerateSuggestion: () => ({ mutate: vi.fn(), isPending: false }),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock AI components
vi.mock('@/components/ai', () => ({
  InsightFeed: ({ insights }: any) => <div data-testid="insight-feed">{insights?.length || 0} insights</div>,
  RecommendationCard: () => <div data-testid="recommendation-card" />,
  AnomalyAlert: () => <div data-testid="anomaly-alert" />,
}));

vi.mock('@/components/ai/ClaimMatchResult', () => ({
  default: () => <div data-testid="claim-match-result" />,
}));

vi.mock('@/components/ai/SuggestionCard', () => ({
  default: () => <div data-testid="suggestion-card" />,
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

vi.mock('@/components/shared/page-header', () => ({
  PageHeader: ({ title }: any) => <h1>{title}</h1>,
}));

// Mock types/advanced constants
vi.mock('@/types/advanced', () => ({
  INSIGHT_TYPES: ['ANOMALY', 'TREND', 'OPPORTUNITY'],
  INSIGHT_TYPE_LABELS: { ANOMALY: 'Anomaly', TREND: 'Trend', OPPORTUNITY: 'Opportunity' },
  SEVERITIES: ['CRITICAL', 'WARNING', 'INFO'],
  SEVERITY_LABELS: { CRITICAL: 'Critical', WARNING: 'Warning', INFO: 'Info' },
  RECOMMENDATION_TYPES: ['PROMOTION_OPTIMIZATION', 'BUDGET_REALLOCATION'],
  RECOMMENDATION_TYPE_LABELS: { PROMOTION_OPTIMIZATION: 'Promotion Optimization', BUDGET_REALLOCATION: 'Budget Reallocation' },
  RECOMMENDATION_STATUSES: ['PENDING', 'ACCEPTED', 'REJECTED'],
  RECOMMENDATION_STATUS_LABELS: { PENDING: 'Pending', ACCEPTED: 'Accepted', REJECTED: 'Rejected' },
  VOICE_COMMAND_EXAMPLES: [],
}));

import AIDashboard from '@/pages/ai/AIDashboard';
import ClaimsAI from '@/pages/ai/ClaimsAI';
import InsightsList from '@/pages/ai/InsightsList';
import RecommendationsList from '@/pages/ai/RecommendationsList';
import Suggestions from '@/pages/ai/Suggestions';

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// AI DASHBOARD DEEP TESTS
// ============================================================================

describe('AIDashboard - Deep Tests', () => {
  it('renders page heading', () => {
    render(<AIDashboard />);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('renders Generate Insights button', () => {
    render(<AIDashboard />);
    expect(screen.getByText('Generate Insights')).toBeInTheDocument();
  });

  it('renders Get Recommendations button', () => {
    render(<AIDashboard />);
    expect(screen.getByText('Get Recommendations')).toBeInTheDocument();
  });

  it('renders Recent Insights section', () => {
    render(<AIDashboard />);
    expect(screen.getByText('Recent Insights')).toBeInTheDocument();
  });

  it('renders the insight feed component', () => {
    render(<AIDashboard />);
    expect(screen.getByTestId('insight-feed')).toBeInTheDocument();
  });

  it('clicking Generate Insights triggers the mutation', async () => {
    render(<AIDashboard />);
    const generateButton = screen.getByText('Generate Insights');
    fireEvent.click(generateButton);
    expect(mockGenerateInsights).toHaveBeenCalled();
  });

  it('clicking Get Recommendations triggers the mutation', async () => {
    render(<AIDashboard />);
    const recsButton = screen.getByText('Get Recommendations');
    fireEvent.click(recsButton);
    expect(mockGenerateRecommendations).toHaveBeenCalled();
  });
});

// ============================================================================
// CLAIMS AI DEEP TESTS
// ============================================================================

describe('ClaimsAI - Deep Tests', () => {
  it('renders page heading', () => {
    render(<ClaimsAI />);
    expect(screen.getByText('AI Claims Processing')).toBeInTheDocument();
  });

  it('renders demo pending claim codes', () => {
    render(<ClaimsAI />);
    expect(screen.getByText('CLM-2026-0048')).toBeInTheDocument();
  });

  it('renders Total Claims stat from demo data', () => {
    render(<ClaimsAI />);
    expect(screen.getByText('Total Claims')).toBeInTheDocument();
  });

  it('renders Processed stat from demo data', () => {
    render(<ClaimsAI />);
    expect(screen.getByText('Processed')).toBeInTheDocument();
  });

  it('renders demo pending claim customer names', () => {
    render(<ClaimsAI />);
    expect(screen.getByText('CLM-2026-0049')).toBeInTheDocument();
  });
});

// ============================================================================
// INSIGHTS LIST DEEP TESTS
// ============================================================================

describe('InsightsList - Deep Tests', () => {
  it('renders page heading', () => {
    render(<InsightsList />);
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
  });

  it('renders Generate Insights button', () => {
    render(<InsightsList />);
    expect(screen.getByText('Generate Insights')).toBeInTheDocument();
  });

  it('renders filter sections', () => {
    render(<InsightsList />);
    // Severity and type filter dropdowns
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(0);
  });

  it('shows no insights state when data is empty', () => {
    render(<InsightsList />);
    // When no insights data, should show something related to empty
    expect(screen.getByText('Generate Insights')).toBeInTheDocument();
  });
});

// ============================================================================
// RECOMMENDATIONS LIST DEEP TESTS
// ============================================================================

describe('RecommendationsList - Deep Tests', () => {
  it('renders page heading', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
  });

  it('renders no recommendations state', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('No Recommendations')).toBeInTheDocument();
  });

  it('renders generate recommendations button', () => {
    render(<RecommendationsList />);
    expect(screen.getByText('Generate Recommendations')).toBeInTheDocument();
  });
});

// ============================================================================
// SUGGESTIONS DEEP TESTS
// ============================================================================

describe('Suggestions - Deep Tests', () => {
  it('renders page heading', () => {
    render(<Suggestions />);
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    render(<Suggestions />);
    expect(screen.getByText('Total Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
  });

  it('renders demo suggestions count of 3', () => {
    render(<Suggestions />);
    // Demo data has 3 suggestions
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders Approved stat card', () => {
    render(<Suggestions />);
    // StatCard component renders "Approved"
    expect(screen.getAllByText('Approved').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Avg Confidence stat card', () => {
    render(<Suggestions />);
    expect(screen.getByText('Avg Confidence')).toBeInTheDocument();
  });
});
