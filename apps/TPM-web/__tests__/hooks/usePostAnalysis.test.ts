/**
 * usePostAnalysis Hook Tests
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { createWrapper } from '../test-utils';
import {
  usePostAnalysis,
  usePostAnalysisSummary,
  usePostAnalysisLearnings,
  useGenerateAnalysis,
  useApplyBaseline,
  analysisKeys,
} from '@/hooks/usePostAnalysis';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('analysisKeys', () => {
  it('generates correct key structures', () => {
    expect(analysisKeys.all).toEqual(['post-analysis']);
    expect(analysisKeys.detail('promo-1')).toEqual(['post-analysis', 'detail', 'promo-1']);
    expect(analysisKeys.summary()).toEqual(['post-analysis', 'summary']);
    expect(analysisKeys.learnings()).toEqual(['post-analysis', 'learnings']);
  });
});

describe('usePostAnalysis', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/post-analysis/:id', ({ params }) => {
        return HttpResponse.json({
          data: {
            id: params.id,
            promotionId: params.id,
            roi: 2.5,
            salesLift: 15,
            volumeChange: 1000,
          },
        });
      })
    );
  });

  it('fetches analysis for a promotion', async () => {
    const { result } = renderHook(() => usePostAnalysis('promo-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('does not fetch when promotionId is empty', async () => {
    const { result } = renderHook(() => usePostAnalysis(''), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('handles error', async () => {
    server.use(
      http.get('/api/post-analysis/:id', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );
    const { result } = renderHook(() => usePostAnalysis('invalid'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('usePostAnalysisSummary', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/post-analysis/summary', () => {
        return HttpResponse.json({
          data: {
            totalAnalyzed: 10,
            avgROI: 1.8,
            totalLearnings: 25,
          },
        });
      })
    );
  });

  it('fetches summary data', async () => {
    const { result } = renderHook(() => usePostAnalysisSummary(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe('usePostAnalysisLearnings', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/post-analysis/learnings', () => {
        return HttpResponse.json({
          data: [
            { id: '1', insight: 'Discount > 20% reduces margin', category: 'pricing' },
          ],
        });
      })
    );
  });

  it('fetches learnings', async () => {
    const { result } = renderHook(() => usePostAnalysisLearnings(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe('useGenerateAnalysis', () => {
  beforeEach(() => {
    server.use(
      http.post('/api/post-analysis/generate/:id', () => {
        return HttpResponse.json({ data: { id: 'analysis-1', status: 'completed' } });
      })
    );
  });

  it('generates analysis for a promotion', async () => {
    const { result } = renderHook(() => useGenerateAnalysis(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate('promo-1');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('handles generation error', async () => {
    server.use(
      http.post('/api/post-analysis/generate/:id', () => {
        return HttpResponse.json({ error: 'Failed' }, { status: 500 });
      })
    );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useGenerateAnalysis(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate('promo-1');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    consoleSpy.mockRestore();
  });
});

describe('useApplyBaseline', () => {
  beforeEach(() => {
    server.use(
      http.post('/api/post-analysis/:id/apply-baseline', () => {
        return HttpResponse.json({ data: { success: true } });
      })
    );
  });

  it('applies baseline', async () => {
    const { result } = renderHook(() => useApplyBaseline(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate('analysis-1');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('handles apply error', async () => {
    server.use(
      http.post('/api/post-analysis/:id/apply-baseline', () => {
        return HttpResponse.json({ error: 'Failed' }, { status: 500 });
      })
    );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useApplyBaseline(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate('analysis-1');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    consoleSpy.mockRestore();
  });
});
