/**
 * usePromoSuggestions Hook Tests
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { createWrapper } from '../test-utils';
import {
  usePromoSuggestions,
  usePromoSuggestion,
  useContractSuggestions,
  useGenerateSuggestion,
  useApproveSuggestion,
  useRejectSuggestion,
  useApplySuggestion,
  suggestionKeys,
} from '@/hooks/usePromoSuggestions';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockSuggestions = [
  { id: '1', type: 'DISCOUNT', status: 'PENDING', customerId: 'c1', confidence: 0.85 },
  { id: '2', type: 'BUNDLE', status: 'APPROVED', customerId: 'c2', confidence: 0.72 },
];

describe('suggestionKeys', () => {
  it('generates correct key structures', () => {
    expect(suggestionKeys.all).toEqual(['promo-suggestions']);
    expect(suggestionKeys.lists()).toEqual(['promo-suggestions', 'list']);
    expect(suggestionKeys.list({ status: 'PENDING' })).toEqual(['promo-suggestions', 'list', { status: 'PENDING' }]);
    expect(suggestionKeys.details()).toEqual(['promo-suggestions', 'detail']);
    expect(suggestionKeys.detail('1')).toEqual(['promo-suggestions', 'detail', '1']);
    expect(suggestionKeys.contract('c1')).toEqual(['promo-suggestions', 'contract', 'c1']);
  });
});

describe('usePromoSuggestions', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/promo-suggestions', () => {
        return HttpResponse.json({
          data: mockSuggestions,
          pagination: { total: 2, page: 1, limit: 10 },
        });
      })
    );
  });

  it('fetches suggestions list', async () => {
    const { result } = renderHook(() => usePromoSuggestions(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.suggestions).toHaveLength(2);
  });

  it('passes filter params', async () => {
    server.use(
      http.get('/api/promo-suggestions', ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const filtered = mockSuggestions.filter(s => !status || s.status === status);
        return HttpResponse.json({ data: filtered, pagination: { total: filtered.length } });
      })
    );
    const { result } = renderHook(() => usePromoSuggestions({ status: 'PENDING' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('handles error', async () => {
    server.use(
      http.get('/api/promo-suggestions', () => {
        return HttpResponse.json({ error: 'Error' }, { status: 500 });
      })
    );
    const { result } = renderHook(() => usePromoSuggestions(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('usePromoSuggestion', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/promo-suggestions/:id', ({ params }) => {
        return HttpResponse.json({
          data: { id: params.id, type: 'DISCOUNT', confidence: 0.85 },
        });
      })
    );
  });

  it('fetches single suggestion', async () => {
    const { result } = renderHook(() => usePromoSuggestion('1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('does not fetch when id is empty', async () => {
    const { result } = renderHook(() => usePromoSuggestion(''), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useContractSuggestions', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/promo-suggestions/contract/:id', () => {
        return HttpResponse.json({ data: [mockSuggestions[0]] });
      })
    );
  });

  it('fetches suggestions for a contract', async () => {
    const { result } = renderHook(() => useContractSuggestions('contract-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('does not fetch when contractId is empty', async () => {
    const { result } = renderHook(() => useContractSuggestions(''), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useGenerateSuggestion', () => {
  beforeEach(() => {
    server.use(
      http.post('/api/promo-suggestions', () => {
        return HttpResponse.json({ data: { id: 'new-1', status: 'PENDING' } });
      })
    );
  });

  it('generates a suggestion', async () => {
    const { result } = renderHook(() => useGenerateSuggestion(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({ customerId: 'c1', type: 'DISCOUNT' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('handles error', async () => {
    server.use(
      http.post('/api/promo-suggestions', () => {
        return HttpResponse.json({ error: 'Failed' }, { status: 500 });
      })
    );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useGenerateSuggestion(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({ type: 'DISCOUNT' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    consoleSpy.mockRestore();
  });
});

describe('useApproveSuggestion', () => {
  beforeEach(() => {
    server.use(
      http.put('/api/promo-suggestions/:id/approve', () => {
        return HttpResponse.json({ data: { status: 'APPROVED' } });
      })
    );
  });

  it('approves a suggestion', async () => {
    const { result } = renderHook(() => useApproveSuggestion(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({ id: '1', notes: 'Looks good' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('handles error', async () => {
    server.use(
      http.put('/api/promo-suggestions/:id/approve', () => {
        return HttpResponse.json({ error: 'Failed' }, { status: 500 });
      })
    );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useApproveSuggestion(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({ id: '1' });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    consoleSpy.mockRestore();
  });
});

describe('useRejectSuggestion', () => {
  beforeEach(() => {
    server.use(
      http.put('/api/promo-suggestions/:id/reject', () => {
        return HttpResponse.json({ data: { status: 'REJECTED' } });
      })
    );
  });

  it('rejects a suggestion', async () => {
    const { result } = renderHook(() => useRejectSuggestion(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({ id: '1', notes: 'Not viable' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useApplySuggestion', () => {
  beforeEach(() => {
    server.use(
      http.post('/api/promo-suggestions/:id/apply', () => {
        return HttpResponse.json({ data: { promotionId: 'promo-new' } });
      })
    );
  });

  it('applies a suggestion', async () => {
    const { result } = renderHook(() => useApplySuggestion(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate('1');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('handles apply error', async () => {
    server.use(
      http.post('/api/promo-suggestions/:id/apply', () => {
        return HttpResponse.json({ error: 'Failed' }, { status: 500 });
      })
    );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useApplySuggestion(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate('1');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    consoleSpy.mockRestore();
  });
});
