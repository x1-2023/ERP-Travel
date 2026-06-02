/**
 * useTargets Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useTargets,
  useTarget,
  useCreateTarget,
  useUpdateTarget,
  useDeleteTarget,
  useTargetProgress,
  useTargetAllocationTreeWithSummary,
  useCreateTargetAllocationNested,
  useUpdateTargetAllocationNested,
  useDeleteTargetAllocationNested,
  useUpdateTargetProgress,
  getProgressStatusColor,
  getProgressStatusLabel,
} from '@/hooks/useTargets';

// Mock data
const mockTarget = {
  id: 'target-1',
  code: 'TGT-001',
  name: 'Q1 Revenue Target',
  metric: 'REVENUE',
  year: 2024,
  quarter: 1,
  targetType: 'REVENUE',
  status: 'ACTIVE',
  targetValue: 500000000,
  achievedValue: 250000000,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockTargets = [
  mockTarget,
  { ...mockTarget, id: 'target-2', code: 'TGT-002', name: 'Q1 Volume Target', metric: 'VOLUME' },
];

const mockProgressResponse = {
  target: { id: 'target-1', code: 'TGT-001', name: 'Q1 Revenue Target', metric: 'REVENUE', year: 2024, quarter: 1 },
  overall: { totalTarget: 500000000, totalAchieved: 250000000, progress: 50, status: 'GOOD', remaining: 250000000 },
  byLevel: {
    regions: [{ id: 'r1', code: 'R1', name: 'North', targetValue: 200000000, achievedValue: 120000000, progress: 60, status: 'GOOD' }],
    provinces: [],
    districts: [],
  },
  statusBreakdown: { achieved: 1, good: 5, slow: 2, atRisk: 1 },
  topPerformers: [{ id: 'r1', code: 'R1', name: 'North', level: 'REGION', progress: 60 }],
  underperformers: [{ id: 'r2', code: 'R2', name: 'South', level: 'REGION', progress: 30 }],
};

const mockAllocations = [
  { id: 'alloc-1', targetId: 'target-1', geographicUnitId: 'r1', targetValue: 200000000, achievedValue: 120000000 },
];

const mockAllocationSummary = {
  totalTarget: 500000000,
  totalAllocated: 400000000,
  totalAchieved: 250000000,
  unallocated: 100000000,
  overallProgress: 62.5,
};

// MSW server
const server = setupServer(
  http.get('*/api/targets', () => {
    return HttpResponse.json({
      data: mockTargets,
      metadata: { totalCount: 2, pageSize: 10, pageNumber: 1, totalPages: 1 },
    });
  }),

  http.get('*/api/targets/:id/progress', () => {
    return HttpResponse.json({ data: mockProgressResponse });
  }),

  http.get('*/api/targets/:id/allocation', () => {
    return HttpResponse.json({ data: mockAllocations, summary: mockAllocationSummary });
  }),

  http.get('*/api/targets/:id', () => {
    return HttpResponse.json({ data: mockTarget });
  }),

  http.post('*/api/targets', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockTarget, ...(body as object), id: 'target-new' } });
  }),

  http.patch('*/api/targets/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockTarget, ...(body as object) } });
  }),

  http.delete('*/api/targets/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('*/api/targets/:targetId/allocation', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { id: 'alloc-new', ...(body as object) } });
  }),

  http.put('*/api/targets/:targetId/allocation/:allocId', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockAllocations[0], ...(body as object) } });
  }),

  http.delete('*/api/targets/:targetId/allocation/:allocId', () => {
    return HttpResponse.json({ success: true });
  }),

  http.patch('*/api/target-allocations/:allocationId', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockAllocations[0], ...(body as object), targetId: 'target-1' } });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useTargets', () => {
  it('should fetch targets list', async () => {
    const { result } = renderHook(() => useTargets(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.targets).toHaveLength(2);
  });

  it('should fetch targets with year filter', async () => {
    const { result } = renderHook(() => useTargets({ year: 2024 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.targets).toBeDefined();
  });

  it('should fetch targets with targetType filter', async () => {
    const { result } = renderHook(() => useTargets({ targetType: 'REVENUE' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.targets).toBeDefined();
  });
});

describe('useTarget', () => {
  it('should fetch single target by ID', async () => {
    const { result } = renderHook(() => useTarget('target-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('TGT-001');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useTarget(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateTarget', () => {
  it('should create a target', async () => {
    const { result } = renderHook(() => useCreateTarget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        name: 'Q2 Revenue Target',
        targetType: 'REVENUE',
        year: 2024,
        quarter: 2,
        targetValue: 600000000,
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateTarget', () => {
  it('should update a target', async () => {
    const { result } = renderHook(() => useUpdateTarget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'target-1', data: { name: 'Updated Target Name' } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteTarget', () => {
  it('should delete a target', async () => {
    const { result } = renderHook(() => useDeleteTarget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('target-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useTargetProgress', () => {
  it('should fetch target progress', async () => {
    const { result } = renderHook(() => useTargetProgress('target-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.overall.progress).toBe(50);
    expect(result.current.data?.overall.status).toBe('GOOD');
  });

  it('should not fetch when targetId is empty', async () => {
    const { result } = renderHook(() => useTargetProgress(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useTargetAllocationTreeWithSummary', () => {
  it('should fetch allocation tree with summary', async () => {
    const { result } = renderHook(() => useTargetAllocationTreeWithSummary('target-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.allocations).toBeDefined();
    expect(result.current.data?.summary).toBeDefined();
  });
});

describe('useCreateTargetAllocationNested', () => {
  it('should create an allocation', async () => {
    const { result } = renderHook(() => useCreateTargetAllocationNested('target-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        geographicUnitId: 'r1',
        targetValue: 200000000,
        notes: 'North region allocation',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateTargetAllocationNested', () => {
  it('should update an allocation', async () => {
    const { result } = renderHook(() => useUpdateTargetAllocationNested('target-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        allocId: 'alloc-1',
        data: { targetValue: 250000000 },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteTargetAllocationNested', () => {
  it('should delete an allocation', async () => {
    const { result } = renderHook(() => useDeleteTargetAllocationNested('target-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('alloc-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateTargetProgress', () => {
  it('should update target progress', async () => {
    const { result } = renderHook(() => useUpdateTargetProgress(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ allocationId: 'alloc-1', achievedValue: 150000000 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('getProgressStatusColor', () => {
  it('should return green for ACHIEVED', () => {
    expect(getProgressStatusColor('ACHIEVED')).toContain('green');
  });

  it('should return blue for GOOD', () => {
    expect(getProgressStatusColor('GOOD')).toContain('blue');
  });

  it('should return yellow for SLOW', () => {
    expect(getProgressStatusColor('SLOW')).toContain('yellow');
  });

  it('should return red for AT_RISK', () => {
    expect(getProgressStatusColor('AT_RISK')).toContain('red');
  });

  it('should return default for unknown status', () => {
    expect(getProgressStatusColor('UNKNOWN')).toContain('muted');
  });
});

describe('getProgressStatusLabel', () => {
  it('should return Vietnamese labels', () => {
    expect(getProgressStatusLabel('ACHIEVED')).toBe('Dat muc tieu'.normalize ? 'Đạt mục tiêu' : expect.any(String));
    expect(getProgressStatusLabel('GOOD')).toBe('Tốt');
    expect(getProgressStatusLabel('SLOW')).toBe('Chậm');
    expect(getProgressStatusLabel('AT_RISK')).toBe('Có rủi ro');
  });

  it('should return the status string for unknown status', () => {
    expect(getProgressStatusLabel('CUSTOM')).toBe('CUSTOM');
  });
});
