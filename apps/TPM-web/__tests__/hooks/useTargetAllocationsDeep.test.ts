/**
 * useTargetAllocations Deep Hook Tests
 * Covers: hooks + helper functions (getProgressStatus, getMetricLabel, formatTargetValue, flattenTargetAllocationTree)
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { createWrapper } from '../test-utils';
import {
  useTargetAllocations,
  useTargetAllocationTree,
  useTargetAllocation,
  useCreateTargetAllocation,
  useUpdateTargetAllocation,
  useDeleteTargetAllocation,
  getProgressStatus,
  getMetricLabel,
  formatTargetValue,
  flattenTargetAllocationTree,
  targetAllocationKeys,
} from '@/hooks/useTargetAllocations';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockAllocations = [
  {
    id: 'ta-1',
    code: 'TA-001',
    targetId: 't-1',
    geographicUnitId: 'gu-1',
    targetValue: 1000,
    achievedValue: 750,
    metric: 'CASES' as const,
    childrenTarget: 0,
    progressPercent: 75,
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
];

describe('targetAllocationKeys', () => {
  it('generates correct key structures', () => {
    expect(targetAllocationKeys.all).toEqual(['target-allocations']);
    expect(targetAllocationKeys.lists()).toEqual(['target-allocations', 'list']);
    expect(targetAllocationKeys.list({ targetId: 't1' })).toEqual(['target-allocations', 'list', { targetId: 't1' }]);
    expect(targetAllocationKeys.tree('t1')).toEqual(['target-allocations', 'tree', 't1']);
    expect(targetAllocationKeys.details()).toEqual(['target-allocations', 'detail']);
    expect(targetAllocationKeys.detail('ta-1')).toEqual(['target-allocations', 'detail', 'ta-1']);
  });
});

describe('getProgressStatus', () => {
  it('returns success for 100%+', () => {
    expect(getProgressStatus(100)).toBe('success');
    expect(getProgressStatus(150)).toBe('success');
  });

  it('returns warning for 75-99%', () => {
    expect(getProgressStatus(75)).toBe('warning');
    expect(getProgressStatus(99)).toBe('warning');
  });

  it('returns default for 50-74%', () => {
    expect(getProgressStatus(50)).toBe('default');
    expect(getProgressStatus(74)).toBe('default');
  });

  it('returns danger for <50%', () => {
    expect(getProgressStatus(49)).toBe('danger');
    expect(getProgressStatus(0)).toBe('danger');
    expect(getProgressStatus(-10)).toBe('danger');
  });
});

describe('getMetricLabel', () => {
  it('returns Vietnamese labels', () => {
    expect(getMetricLabel('CASES')).toBe('Thùng');
    expect(getMetricLabel('VOLUME_LITERS')).toBe('Lít');
    expect(getMetricLabel('REVENUE_VND')).toBe('VND');
    expect(getMetricLabel('UNITS')).toBe('Đơn vị');
  });

  it('returns raw metric for unknown type', () => {
    expect(getMetricLabel('UNKNOWN' as any)).toBe('UNKNOWN');
  });
});

describe('formatTargetValue', () => {
  it('formats VND values as currency', () => {
    const result = formatTargetValue(1000000, 'REVENUE_VND');
    expect(result).toMatch(/1[.,]000[.,]000/);
    expect(result).toContain('₫');
  });

  it('formats non-VND values as plain number', () => {
    const result = formatTargetValue(1000, 'CASES');
    expect(result).toMatch(/1[.,]000/);
    expect(result).not.toContain('₫');
  });

  it('handles zero', () => {
    expect(formatTargetValue(0, 'CASES')).toBe('0');
    const vndZero = formatTargetValue(0, 'REVENUE_VND');
    expect(vndZero).toContain('0');
  });
});

describe('flattenTargetAllocationTree', () => {
  it('flattens empty array', () => {
    expect(flattenTargetAllocationTree([])).toEqual([]);
  });

  it('flattens single level', () => {
    const result = flattenTargetAllocationTree(mockAllocations as any);
    expect(result).toHaveLength(1);
    expect(result[0].depth).toBe(0);
  });

  it('flattens nested tree', () => {
    const tree = [
      {
        ...mockAllocations[0],
        children: [
          {
            ...mockAllocations[0],
            id: 'ta-2',
            children: [
              { ...mockAllocations[0], id: 'ta-3', children: [] },
            ],
          },
        ],
      },
    ] as any;
    const result = flattenTargetAllocationTree(tree);
    expect(result).toHaveLength(3);
    expect(result[0].depth).toBe(0);
    expect(result[1].depth).toBe(1);
    expect(result[2].depth).toBe(2);
  });

  it('handles nodes without children', () => {
    const tree = [{ ...mockAllocations[0], children: undefined }] as any;
    const result = flattenTargetAllocationTree(tree);
    expect(result).toHaveLength(1);
  });
});

describe('useTargetAllocations', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/target-allocations', () => {
        return HttpResponse.json({ data: mockAllocations });
      })
    );
  });

  it('fetches allocations', async () => {
    const { result } = renderHook(() => useTargetAllocations(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('passes filter params', async () => {
    const { result } = renderHook(() => useTargetAllocations({ targetId: 't-1' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useTargetAllocationTree', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/target-allocations', () => {
        return HttpResponse.json({ data: mockAllocations });
      })
    );
  });

  it('fetches tree for a target', async () => {
    const { result } = renderHook(() => useTargetAllocationTree('t-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('does not fetch when targetId is empty', () => {
    const { result } = renderHook(() => useTargetAllocationTree(''), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useTargetAllocation', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/target-allocations/:id', () => {
        return HttpResponse.json({ data: mockAllocations[0] });
      })
    );
  });

  it('fetches single allocation', async () => {
    const { result } = renderHook(() => useTargetAllocation('ta-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useTargetAllocation(''), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateTargetAllocation', () => {
  beforeEach(() => {
    server.use(
      http.post('/api/target-allocations', () => {
        return HttpResponse.json({ data: { id: 'new-ta', code: 'TA-NEW' } });
      })
    );
  });

  it('creates an allocation', async () => {
    const { result } = renderHook(() => useCreateTargetAllocation(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({
        targetId: 't-1',
        geographicUnitId: 'gu-1',
        targetValue: 500,
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('creates with parentId', async () => {
    const { result } = renderHook(() => useCreateTargetAllocation(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({
        targetId: 't-1',
        geographicUnitId: 'gu-2',
        targetValue: 200,
        parentId: 'ta-1',
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateTargetAllocation', () => {
  beforeEach(() => {
    server.use(
      http.patch('/api/target-allocations/:id', () => {
        return HttpResponse.json({ data: { ...mockAllocations[0], targetValue: 1500 } });
      })
    );
  });

  it('updates an allocation', async () => {
    const { result } = renderHook(() => useUpdateTargetAllocation(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate({ id: 'ta-1', data: { targetValue: 1500 } });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useDeleteTargetAllocation', () => {
  beforeEach(() => {
    server.use(
      http.delete('/api/target-allocations/:id', () => {
        return HttpResponse.json({ data: { success: true } });
      })
    );
  });

  it('deletes an allocation', async () => {
    const { result } = renderHook(() => useDeleteTargetAllocation(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      result.current.mutate('ta-1');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
