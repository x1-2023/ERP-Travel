/**
 * AI Hooks Tests
 * Tests for useInsights and useRecommendations hooks
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useInsights,
  useInsight,
  useGenerateInsights,
  useDismissInsight,
  useTakeInsightAction,
} from '@/hooks/ai/useInsights';
import {
  useRecommendations,
  useRecommendation,
  useGenerateRecommendations,
  useAcceptRecommendation,
  useRejectRecommendation,
  usePrediction,
} from '@/hooks/ai/useRecommendations';

// Mock data
const mockInsight = {
  id: 'insight-1',
  type: 'ANOMALY',
  category: 'BUDGET',
  title: 'Budget overspend detected',
  description: 'Q2 budget exceeded by 15%',
  severity: 'HIGH',
  confidence: 0.92,
  actionRequired: true,
  entityType: 'budget',
  entityId: 'budget-1',
  createdAt: '2024-06-15T10:00:00Z',
};

const mockInsights = [
  mockInsight,
  {
    ...mockInsight,
    id: 'insight-2',
    type: 'TREND',
    title: 'Sales trending up in North region',
    severity: 'MEDIUM',
    actionRequired: false,
  },
];

const mockRecommendation = {
  id: 'rec-1',
  type: 'BUDGET_OPTIMIZATION',
  title: 'Reallocate budget from South to North',
  description: 'North region shows 25% higher ROI',
  confidence: 0.88,
  status: 'PENDING',
  entityType: 'budget',
  entityId: 'budget-1',
  impact: { estimated_roi_improvement: 15 },
  createdAt: '2024-06-15T10:00:00Z',
};

const mockRecommendations = [
  mockRecommendation,
  {
    ...mockRecommendation,
    id: 'rec-2',
    type: 'PROMOTION_TIMING',
    title: 'Extend summer sale by 1 week',
    status: 'ACCEPTED',
  },
];

const mockPrediction = {
  type: 'ROI',
  value: 2.5,
  confidence: 0.85,
  range: { low: 1.8, high: 3.2 },
  factors: ['seasonality', 'historical_performance'],
};

// Server setup
const server = setupServer(
  // Insights
  http.get('*/ai/insights', () => {
    return HttpResponse.json({
      data: mockInsights,
      pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
    });
  }),

  http.get('*/ai/insights/:id', () => {
    return HttpResponse.json({
      data: {
        ...mockInsight,
        relatedEntity: { id: 'budget-1', name: 'Annual Budget' },
        suggestedActions: ['Reduce spending', 'Reallocate funds'],
      },
    });
  }),

  http.post('*/ai/insights/generate', () => {
    return HttpResponse.json({
      generated: 3,
      insights: mockInsights,
    });
  }),

  http.post('*/ai/insights/:id/dismiss', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockInsight, dismissed: true },
    });
  }),

  http.post('*/ai/insights/:id/action', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockInsight, actionTaken: true },
    });
  }),

  // Recommendations
  http.get('*/ai/recommendations', () => {
    return HttpResponse.json({
      data: mockRecommendations,
      pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
    });
  }),

  http.get('*/ai/recommendations/:id', () => {
    return HttpResponse.json({
      data: mockRecommendation,
    });
  }),

  http.post('*/ai/recommendations/generate', () => {
    return HttpResponse.json({
      generated: 2,
      recommendations: mockRecommendations,
    });
  }),

  http.post('*/ai/recommendations/:id/accept', () => {
    return HttpResponse.json({
      data: { ...mockRecommendation, status: 'ACCEPTED' },
    });
  }),

  http.post('*/ai/recommendations/:id/reject', () => {
    return HttpResponse.json({
      data: { ...mockRecommendation, status: 'REJECTED' },
    });
  }),

  // Predictions
  http.post('*/ai/predict', () => {
    return HttpResponse.json({
      data: mockPrediction,
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================================================
// useInsights
// ============================================================================
describe('useInsights', () => {
  it('should fetch insights list', async () => {
    const { result } = renderHook(() => useInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.data[0].title).toBe('Budget overspend detected');
  });

  it('should filter by type', async () => {
    const { result } = renderHook(
      () => useInsights({ type: 'ANOMALY' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });

  it('should filter by severity', async () => {
    const { result } = renderHook(
      () => useInsights({ severity: 'HIGH' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

// ============================================================================
// useInsight
// ============================================================================
describe('useInsight', () => {
  it('should fetch a single insight', async () => {
    const { result } = renderHook(
      () => useInsight('insight-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.title).toBe('Budget overspend detected');
    expect(result.current.data?.data.suggestedActions).toHaveLength(2);
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(
      () => useInsight(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ============================================================================
// useGenerateInsights
// ============================================================================
describe('useGenerateInsights', () => {
  it('should provide a mutate function', () => {
    const { result } = renderHook(
      () => useGenerateInsights(),
      { wrapper: createWrapper() }
    );

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isIdle).toBe(true);
  });

  it('should call the mutation endpoint', async () => {
    const { result } = renderHook(
      () => useGenerateInsights(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        scope: 'budget',
        entityId: 'budget-1',
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useDismissInsight
// ============================================================================
describe('useDismissInsight', () => {
  it('should dismiss an insight', async () => {
    const { result } = renderHook(
      () => useDismissInsight(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate('insight-1');
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useTakeInsightAction
// ============================================================================
describe('useTakeInsightAction', () => {
  it('should take action on an insight', async () => {
    const { result } = renderHook(
      () => useTakeInsightAction(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        id: 'insight-1',
        data: { action: 'REDUCE_SPENDING', notes: 'Reducing Q3 budget' } as any,
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useRecommendations
// ============================================================================
describe('useRecommendations', () => {
  it('should fetch recommendations list', async () => {
    const { result } = renderHook(() => useRecommendations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.data[0].title).toBe('Reallocate budget from South to North');
  });

  it('should filter by status', async () => {
    const { result } = renderHook(
      () => useRecommendations({ status: 'PENDING' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

// ============================================================================
// useRecommendation
// ============================================================================
describe('useRecommendation', () => {
  it('should fetch a single recommendation', async () => {
    const { result } = renderHook(
      () => useRecommendation('rec-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.title).toBe('Reallocate budget from South to North');
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(
      () => useRecommendation(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ============================================================================
// useGenerateRecommendations
// ============================================================================
describe('useGenerateRecommendations', () => {
  it('should provide a mutate function', () => {
    const { result } = renderHook(
      () => useGenerateRecommendations(),
      { wrapper: createWrapper() }
    );

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isIdle).toBe(true);
  });

  it('should call the mutation endpoint', async () => {
    const { result } = renderHook(
      () => useGenerateRecommendations(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        scope: 'budget',
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useAcceptRecommendation
// ============================================================================
describe('useAcceptRecommendation', () => {
  it('should accept a recommendation', async () => {
    const { result } = renderHook(
      () => useAcceptRecommendation(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate('rec-1');
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useRejectRecommendation
// ============================================================================
describe('useRejectRecommendation', () => {
  it('should reject a recommendation', async () => {
    const { result } = renderHook(
      () => useRejectRecommendation(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        id: 'rec-1',
        data: { reason: 'Not applicable to our context' } as any,
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// usePrediction
// ============================================================================
describe('usePrediction', () => {
  it('should generate a prediction', async () => {
    const { result } = renderHook(
      () => usePrediction(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        type: 'ROI',
        entityId: 'promo-1',
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});
