/**
 * AI Components Tests
 * Tests for AnomalyAlert, ConfidenceBadge, InsightCard, InsightFeed,
 * RecommendationCard, SuggestionCard, ClaimMatchResult
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';

// ============================================================================
// AnomalyAlert
// ============================================================================
import { AnomalyAlert } from '@/components/ai/AnomalyAlert';

describe('AnomalyAlert', () => {
  const criticalInsight = {
    id: '1',
    type: 'ANOMALY' as const,
    title: 'Anomaly detected',
    description: 'Unusual spending pattern',
    severity: 'CRITICAL' as const,
    confidence: 0.95,
    actionRequired: true,
    actionTaken: false,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const infoInsight = {
    id: '2',
    type: 'TREND' as const,
    title: 'Trend noticed',
    description: 'Sales going up',
    severity: 'INFO' as const,
    confidence: 0.7,
    actionRequired: false,
    actionTaken: false,
    createdAt: '2026-01-01T00:00:00Z',
  };

  it('renders nothing when no critical insights', () => {
    const { container } = render(<AnomalyAlert insights={[infoInsight]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders alert when critical insights exist', () => {
    render(<AnomalyAlert insights={[criticalInsight]} />);
    expect(screen.getByText('Critical Issues Detected')).toBeInTheDocument();
  });

  it('displays correct count of critical insights', () => {
    render(<AnomalyAlert insights={[criticalInsight, { ...criticalInsight, id: '3' }]} />);
    expect(screen.getByText(/2 critical insights require/)).toBeInTheDocument();
  });

  it('uses singular form for one critical insight', () => {
    render(<AnomalyAlert insights={[criticalInsight]} />);
    expect(screen.getByText(/1 critical insight requires/)).toBeInTheDocument();
  });

  it('renders View Details link', () => {
    render(<AnomalyAlert insights={[criticalInsight]} />);
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });
});

// ============================================================================
// ConfidenceBadge
// ============================================================================
import { ConfidenceBadge } from '@/components/ai/ConfidenceBadge';

describe('ConfidenceBadge', () => {
  it('renders with percentage', () => {
    render(<ConfidenceBadge confidence={0.85} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows label by default', () => {
    render(<ConfidenceBadge confidence={0.85} />);
    expect(screen.getByText('Confidence:')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ConfidenceBadge confidence={0.85} showLabel={false} />);
    expect(screen.queryByText('Confidence:')).not.toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<ConfidenceBadge confidence={0.85} size="sm" />);
    expect(screen.getByText('85%')).toBeInTheDocument();

    rerender(<ConfidenceBadge confidence={0.85} size="lg" />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders low confidence', () => {
    render(<ConfidenceBadge confidence={0.3} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });
});

// ============================================================================
// InsightCard
// ============================================================================
import { InsightCard } from '@/components/ai/InsightCard';

describe('InsightCard', () => {
  const mockInsight = {
    id: '1',
    type: 'ANOMALY' as const,
    title: 'Spending Anomaly',
    description: 'Unusual spending pattern detected in Q1',
    severity: 'CRITICAL' as const,
    confidence: 0.92,
    actionRequired: true,
    actionTaken: false,
    createdAt: '2026-01-01T00:00:00Z',
  };

  it('renders insight title', () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.getByText('Spending Anomaly')).toBeInTheDocument();
  });

  it('renders severity badge', () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('renders confidence percentage', () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders description when not compact', () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.getByText('Unusual spending pattern detected in Q1')).toBeInTheDocument();
  });

  it('hides description in compact mode', () => {
    render(<InsightCard insight={mockInsight} compact />);
    expect(screen.queryByText('Unusual spending pattern detected in Q1')).not.toBeInTheDocument();
  });

  it('renders Take Action button when actionRequired and callback provided', () => {
    const onAction = vi.fn();
    render(<InsightCard insight={mockInsight} onAction={onAction} />);
    expect(screen.getByText('Take Action')).toBeInTheDocument();
  });

  it('does not render Take Action when no callback', () => {
    render(<InsightCard insight={mockInsight} />);
    expect(screen.queryByText('Take Action')).not.toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss provided', () => {
    const onDismiss = vi.fn();
    render(<InsightCard insight={mockInsight} onDismiss={onDismiss} />);
    // The dismiss button has an X icon
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// InsightFeed
// ============================================================================
import { InsightFeed } from '@/components/ai/InsightFeed';

describe('InsightFeed', () => {
  const mockInsights = [
    {
      id: '1',
      type: 'ANOMALY' as const,
      title: 'Insight 1',
      description: 'Description 1',
      severity: 'CRITICAL' as const,
      confidence: 0.9,
      actionRequired: false,
      actionTaken: false,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
      type: 'TREND' as const,
      title: 'Insight 2',
      description: 'Description 2',
      severity: 'INFO' as const,
      confidence: 0.7,
      actionRequired: false,
      actionTaken: false,
      createdAt: '2026-01-02T00:00:00Z',
    },
  ];

  it('renders empty state when no insights', () => {
    render(<InsightFeed insights={[]} />);
    expect(screen.getByText('No insights available')).toBeInTheDocument();
  });

  it('renders all insights', () => {
    render(<InsightFeed insights={mockInsights} />);
    expect(screen.getByText('Insight 1')).toBeInTheDocument();
    expect(screen.getByText('Insight 2')).toBeInTheDocument();
  });
});

// ============================================================================
// RecommendationCard
// ============================================================================
import { RecommendationCard } from '@/components/ai/RecommendationCard';

describe('RecommendationCard', () => {
  const mockRecommendation = {
    id: '1',
    type: 'PROMOTION_OPTIMIZATION' as const,
    title: 'Optimize Q1 Promotion',
    description: 'Consider increasing discount for top customers',
    confidence: 0.88,
    impact: { uplift: 12.5 },
    parameters: {},
    reasoning: 'Based on historical data analysis',
    status: 'PENDING' as const,
    createdAt: '2026-01-01T00:00:00Z',
  };

  it('renders recommendation title', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    expect(screen.getByText('Optimize Q1 Promotion')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders description when not compact', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    expect(screen.getByText('Consider increasing discount for top customers')).toBeInTheDocument();
  });

  it('hides description in compact mode', () => {
    render(<RecommendationCard recommendation={mockRecommendation} compact />);
    expect(screen.queryByText('Consider increasing discount for top customers')).not.toBeInTheDocument();
  });

  it('renders accept and reject buttons for pending recommendation', () => {
    const onAccept = vi.fn();
    const onReject = vi.fn();
    render(
      <RecommendationCard
        recommendation={mockRecommendation}
        onAccept={onAccept}
        onReject={onReject}
      />
    );
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('does not render action buttons for accepted recommendation', () => {
    const accepted = { ...mockRecommendation, status: 'ACCEPTED' as const };
    render(<RecommendationCard recommendation={accepted} onAccept={vi.fn()} onReject={vi.fn()} />);
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
  });

  it('shows reasoning in non-compact mode', () => {
    render(<RecommendationCard recommendation={mockRecommendation} />);
    expect(screen.getByText(/"Based on historical data analysis"/)).toBeInTheDocument();
  });
});

// ============================================================================
// SuggestionCard
// ============================================================================
import SuggestionCard from '@/components/ai/SuggestionCard';

describe('SuggestionCard', () => {
  const mockSuggestion = {
    id: 'sug-1',
    type: 'PROMOTION',
    status: 'PENDING',
    priority: 1,
    title: 'New Promotion Suggestion',
    description: 'Create a new promotion for Q2',
    confidence: 0.82,
    impactEstimate: {
      estimatedROI: 2.5,
      incrementalVolume: 5000,
      estimatedCost: 10000000,
    },
    customer: { name: 'Acme Corp', code: 'ACME' },
    createdAt: '2026-01-15T10:00:00Z',
  };

  it('renders suggestion title', () => {
    render(<SuggestionCard suggestion={mockSuggestion} />);
    expect(screen.getByText('New Promotion Suggestion')).toBeInTheDocument();
  });

  it('renders type label', () => {
    render(<SuggestionCard suggestion={mockSuggestion} />);
    expect(screen.getByText('New Promotion')).toBeInTheDocument();
  });

  it('renders customer name', () => {
    render(<SuggestionCard suggestion={mockSuggestion} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders status', () => {
    render(<SuggestionCard suggestion={mockSuggestion} />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders impact estimates', () => {
    render(<SuggestionCard suggestion={mockSuggestion} />);
    expect(screen.getByText('2.5x')).toBeInTheDocument();
    expect(screen.getByText('10M')).toBeInTheDocument();
  });

  it('renders approve and reject buttons when pending', () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();
    render(
      <SuggestionCard suggestion={mockSuggestion} onApprove={onApprove} onReject={onReject} />
    );
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('renders Apply button when approved', () => {
    const approved = { ...mockSuggestion, status: 'APPROVED' };
    const onApply = vi.fn();
    render(<SuggestionCard suggestion={approved} onApply={onApply} />);
    expect(screen.getByText('Apply Suggestion')).toBeInTheDocument();
  });
});

// ============================================================================
// ClaimMatchResult
// ============================================================================
import ClaimMatchResult from '@/components/ai/ClaimMatchResult';

describe('ClaimMatchResult', () => {
  const mockMatch = {
    recommendation: 'AUTO_APPROVE',
    confidence: 0.95,
    matchScore: 0.92,
    matchedAmount: 5000000,
    variance: 200000,
    variancePercent: 4.2,
    flags: ['HIGH_VALUE', 'NEW_CUSTOMER'],
    reasoning: 'Match score is above threshold',
  };

  it('renders recommendation label', () => {
    render(<ClaimMatchResult match={mockMatch} />);
    expect(screen.getByText('Auto Approve')).toBeInTheDocument();
  });

  it('renders match score', () => {
    render(<ClaimMatchResult match={mockMatch} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders flags', () => {
    render(<ClaimMatchResult match={mockMatch} />);
    expect(screen.getByText('HIGH VALUE')).toBeInTheDocument();
    expect(screen.getByText('NEW CUSTOMER')).toBeInTheDocument();
  });

  it('renders reasoning', () => {
    render(<ClaimMatchResult match={mockMatch} />);
    expect(screen.getByText('Match score is above threshold')).toBeInTheDocument();
  });

  it('renders matched amount', () => {
    render(<ClaimMatchResult match={mockMatch} />);
    expect(screen.getByText(/5,000,000 VND/)).toBeInTheDocument();
  });

  it('renders without optional fields', () => {
    const minimal = {
      recommendation: 'MANUAL_REVIEW',
      confidence: 0.6,
      matchScore: 0.5,
      flags: [],
    };
    render(<ClaimMatchResult match={minimal} />);
    expect(screen.getByText('Manual Review')).toBeInTheDocument();
  });
});
