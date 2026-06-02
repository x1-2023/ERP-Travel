/**
 * useClashes Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useClashes,
  useClash,
  useClashStats,
  useDetectClashes,
  useUpdateClash,
  useResolveClash,
  useDismissClash,
} from '@/hooks/planning/useClashes';

// Mock data
const mockClash = {
  id: 'clash-1',
  promotionAId: 'promo-1',
  promotionBId: 'promo-2',
  promotionA: {
    id: 'promo-1',
    code: 'PROMO-001',
    name: 'Summer Sale',
    startDate: '2024-03-01',
    endDate: '2024-04-30',
    status: 'ACTIVE',
  },
  promotionB: {
    id: 'promo-2',
    code: 'PROMO-002',
    name: 'Spring Promo',
    startDate: '2024-03-15',
    endDate: '2024-05-15',
    status: 'ACTIVE',
  },
  clashType: 'FULL_OVERLAP',
  severity: 'HIGH',
  status: 'DETECTED',
  description: 'Full overlap between Summer Sale and Spring Promo',
  overlapStart: '2024-03-15',
  overlapEnd: '2024-04-30',
  affectedCustomers: ['cust-1', 'cust-2'],
  affectedProducts: ['prod-1'],
  potentialImpact: 15000000,
  detectedAt: '2024-03-10',
  analysis: {
    overlapDays: 46,
    budgetAtRisk: { promotionA: 8000000, promotionB: 7000000, total: 15000000 },
    overlapPercentage: { promotionA: 76.7, promotionB: 74.2 },
    recommendations: ['Consider adjusting dates', 'Merge promotions'],
  },
};

const mockClashes = [
  mockClash,
  {
    ...mockClash,
    id: 'clash-2',
    clashType: 'CUSTOMER_OVERLAP',
    severity: 'MEDIUM',
    status: 'REVIEWING',
    potentialImpact: 5000000,
  },
];

const mockClashStats = {
  total: 10,
  byStatus: { DETECTED: 4, REVIEWING: 3, RESOLVED: 2, DISMISSED: 1 },
  bySeverity: { HIGH: 3, MEDIUM: 4, LOW: 3 },
  byType: { FULL_OVERLAP: 2, CUSTOMER_OVERLAP: 5, PRODUCT_OVERLAP: 3 },
  recentClashes: 4,
  unresolvedHigh: 3,
  resolutionRate: 30,
  totalPotentialImpact: 50000000,
};

// MSW server
const server = setupServer(
  http.get('*/api/planning/clashes/stats', () => {
    return HttpResponse.json({ data: mockClashStats });
  }),

  http.get('*/api/planning/clashes/:id', () => {
    return HttpResponse.json({ data: mockClash });
  }),

  http.get('*/api/planning/clashes', () => {
    return HttpResponse.json({
      data: mockClashes,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      summary: {
        total: 2,
        byStatus: { DETECTED: 1, REVIEWING: 1 },
        bySeverity: { HIGH: 1, MEDIUM: 1 },
      },
    });
  }),

  http.post('*/api/planning/clashes/:id/resolve', () => {
    return HttpResponse.json({
      data: { ...mockClash, status: 'RESOLVED', resolution: 'ADJUST_DATES', resolvedAt: '2024-03-12' },
      actionResult: { success: true },
      message: 'Clash resolved successfully',
    });
  }),

  http.post('*/api/planning/clashes', () => {
    return HttpResponse.json({
      data: mockClashes,
      summary: { checked: 10, clashesFound: 2, bySeverity: { HIGH: 1, MEDIUM: 1 } },
    });
  }),

  http.put('*/api/planning/clashes/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockClash, ...(body as object) } });
  }),

  http.delete('*/api/planning/clashes/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useClashes', () => {
  it('should fetch clashes list', async () => {
    const { result } = renderHook(() => useClashes(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.summary).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch with status filter', async () => {
    const { result } = renderHook(() => useClashes({ status: 'DETECTED' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });

  it('should fetch with severity filter', async () => {
    const { result } = renderHook(() => useClashes({ severity: 'HIGH' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });

  it('should fetch with promotionId filter', async () => {
    const { result } = renderHook(() => useClashes({ promotionId: 'promo-1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useClash', () => {
  it('should fetch single clash', async () => {
    const { result } = renderHook(() => useClash('clash-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.clashType).toBe('FULL_OVERLAP');
    expect(result.current.data?.severity).toBe('HIGH');
    expect(result.current.data?.analysis).toBeDefined();
  });

  it('should not fetch when ID is undefined', async () => {
    const { result } = renderHook(() => useClash(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useClashStats', () => {
  it('should fetch clash statistics', async () => {
    const { result } = renderHook(() => useClashStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.total).toBe(10);
    expect(result.current.data?.unresolvedHigh).toBe(3);
    expect(result.current.data?.resolutionRate).toBe(30);
    expect(result.current.data?.totalPotentialImpact).toBe(50000000);
  });
});

describe('useDetectClashes', () => {
  it('should detect clashes', async () => {
    const { result } = renderHook(() => useDetectClashes(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.summary.clashesFound).toBe(2);
  });

  it('should detect clashes with specific promotions', async () => {
    const { result } = renderHook(() => useDetectClashes(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ promotionIds: ['promo-1', 'promo-2'] });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should detect clashes with date range', async () => {
    const { result } = renderHook(() => useDetectClashes(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        dateRange: { startDate: '2024-03-01', endDate: '2024-06-30' },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateClash', () => {
  it('should update clash status', async () => {
    const { result } = renderHook(() => useUpdateClash(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'clash-1', status: 'REVIEWING', notes: 'Under review' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useResolveClash', () => {
  it('should resolve a clash', async () => {
    const { result } = renderHook(() => useResolveClash(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        id: 'clash-1',
        resolution: 'ADJUST_DATES',
        action: {
          promotionId: 'promo-2',
          newStartDate: '2024-05-01',
        },
        notes: 'Adjusted Spring Promo start date',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.message).toBe('Clash resolved successfully');
  });
});

describe('useDismissClash', () => {
  it('should dismiss a clash', async () => {
    const { result } = renderHook(() => useDismissClash(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('clash-2');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
