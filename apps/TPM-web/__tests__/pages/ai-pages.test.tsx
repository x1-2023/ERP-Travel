/**
 * Smoke Tests for AI Pages
 * Tests: AIDashboard, ClaimsAI, InsightsList, RecommendationsList, Suggestions
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

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
vi.mock('@/hooks/ai/useInsights', () => ({
  useInsights: () => ({ data: { data: [], summary: undefined, pagination: undefined }, isLoading: false, refetch: vi.fn() }),
  useGenerateInsights: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDismissInsight: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTakeInsightAction: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

// Mock AI recommendation hooks
vi.mock('@/hooks/ai/useRecommendations', () => ({
  useRecommendations: () => ({ data: { data: [], summary: undefined, pagination: undefined }, isLoading: false, refetch: vi.fn() }),
  useGenerateRecommendations: () => ({ mutateAsync: vi.fn(), isPending: false }),
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
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
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

describe('AI Pages', () => {
  describe('AIDashboard', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: AIDashboard } = await import('@/pages/ai/AIDashboard');
      render(<AIDashboard />);
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('shows generate actions', async () => {
      const { default: AIDashboard } = await import('@/pages/ai/AIDashboard');
      render(<AIDashboard />);
      expect(screen.getByText('Generate Insights')).toBeInTheDocument();
      expect(screen.getByText('Get Recommendations')).toBeInTheDocument();
    });

    it('shows recent insights section', async () => {
      const { default: AIDashboard } = await import('@/pages/ai/AIDashboard');
      render(<AIDashboard />);
      expect(screen.getByText('Recent Insights')).toBeInTheDocument();
    });
  });

  describe('ClaimsAI', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: ClaimsAI } = await import('@/pages/ai/ClaimsAI');
      render(<ClaimsAI />);
      expect(screen.getByText('AI Claims Processing')).toBeInTheDocument();
    });

    it('shows demo pending claims', async () => {
      const { default: ClaimsAI } = await import('@/pages/ai/ClaimsAI');
      render(<ClaimsAI />);
      expect(screen.getByText('CLM-2026-0048')).toBeInTheDocument();
    });
  });

  describe('InsightsList', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: InsightsList } = await import('@/pages/ai/InsightsList');
      render(<InsightsList />);
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
    });

    it('shows generate insights button', async () => {
      const { default: InsightsList } = await import('@/pages/ai/InsightsList');
      render(<InsightsList />);
      expect(screen.getByText('Generate Insights')).toBeInTheDocument();
    });
  });

  describe('RecommendationsList', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: RecommendationsList } = await import('@/pages/ai/RecommendationsList');
      render(<RecommendationsList />);
      expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
    });

    it('shows no recommendations state', async () => {
      const { default: RecommendationsList } = await import('@/pages/ai/RecommendationsList');
      render(<RecommendationsList />);
      expect(screen.getByText('No Recommendations')).toBeInTheDocument();
    });
  });

  describe('Suggestions', () => {
    it('renders without crashing and shows heading', async () => {
      const { default: Suggestions } = await import('@/pages/ai/Suggestions');
      render(<Suggestions />);
      expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
    });

    it('shows suggestion stats', async () => {
      const { default: Suggestions } = await import('@/pages/ai/Suggestions');
      render(<Suggestions />);
      expect(screen.getByText('Total Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });
});
