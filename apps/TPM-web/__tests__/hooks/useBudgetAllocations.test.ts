/**
 * useBudgetAllocations Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useBudgetAllocations,
  useBudgetAllocationTree,
  useBudgetAllocation,
  useCreateBudgetAllocation,
  useUpdateBudgetAllocation,
  useDeleteBudgetAllocation,
  calculateAllocationProgress,
  calculateAllocationUtilization,
  flattenAllocationTree,
  type BudgetAllocation,
} from '@/hooks/useBudgetAllocations';

// Mock data
const mockAllocation: BudgetAllocation = {
  id: 'alloc-1',
  code: 'ALLOC-001',
  budgetId: 'budget-1',
  budget: { id: 'budget-1', code: 'BUD-001', name: 'Annual Budget', totalAmount: 1000000 },
  geographicUnitId: 'geo-1',
  allocatedAmount: 500000,
  spentAmount: 200000,
  childrenAllocated: 300000,
  availableToAllocate: 200000,
  status: 'APPROVED',
  createdAt: '2024-01-15',
  updatedAt: '2024-06-15',
};

const mockAllocations = [
  mockAllocation,
  {
    ...mockAllocation,
    id: 'alloc-2',
    code: 'ALLOC-002',
    allocatedAmount: 300000,
    spentAmount: 100000,
    childrenAllocated: 150000,
    availableToAllocate: 150000,
    status: 'DRAFT' as const,
  },
];

const mockTreeAllocation: BudgetAllocation = {
  ...mockAllocation,
  children: [
    {
      ...mockAllocation,
      id: 'alloc-child-1',
      code: 'ALLOC-C1',
      parentId: 'alloc-1',
      allocatedAmount: 200000,
      spentAmount: 80000,
      childrenAllocated: 0,
      availableToAllocate: 200000,
      children: [],
    },
  ],
};

// Server setup
const server = setupServer(
  // List allocations
  http.get('*/budget-allocations', ({ request }) => {
    const url = new URL(request.url);
    const isTree = url.searchParams.get('tree');
    if (isTree === 'true') {
      return HttpResponse.json({
        success: true,
        data: [mockTreeAllocation],
      });
    }
    return HttpResponse.json({
      success: true,
      data: mockAllocations,
    });
  }),

  // Get single allocation
  http.get('*/budget-allocations/:id', () => {
    return HttpResponse.json({
      success: true,
      data: mockAllocation,
    });
  }),

  // Create allocation
  http.post('*/budget-allocations', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockAllocation, id: 'alloc-new' },
    });
  }),

  // Update allocation
  http.patch('*/budget-allocations/:id', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockAllocation, allocatedAmount: 600000 },
    });
  }),

  // Delete allocation
  http.delete('*/budget-allocations/:id', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================================================
// useBudgetAllocations
// ============================================================================
describe('useBudgetAllocations', () => {
  it('should fetch allocations list', async () => {
    const { result } = renderHook(() => useBudgetAllocations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].code).toBe('ALLOC-001');
  });

  it('should filter by budgetId', async () => {
    const { result } = renderHook(
      () => useBudgetAllocations({ budgetId: 'budget-1' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should filter by status', async () => {
    const { result } = renderHook(
      () => useBudgetAllocations({ status: 'APPROVED' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

// ============================================================================
// useBudgetAllocationTree
// ============================================================================
describe('useBudgetAllocationTree', () => {
  it('should fetch allocation tree', async () => {
    const { result } = renderHook(
      () => useBudgetAllocationTree('budget-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data![0].children).toBeDefined();
  });

  it('should not fetch when budgetId is empty', () => {
    const { result } = renderHook(
      () => useBudgetAllocationTree(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ============================================================================
// useBudgetAllocation
// ============================================================================
describe('useBudgetAllocation', () => {
  it('should fetch a single allocation', async () => {
    const { result } = renderHook(
      () => useBudgetAllocation('alloc-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('ALLOC-001');
    expect(result.current.data?.allocatedAmount).toBe(500000);
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(
      () => useBudgetAllocation(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ============================================================================
// useCreateBudgetAllocation
// ============================================================================
describe('useCreateBudgetAllocation', () => {
  it('should provide a mutate function', () => {
    const { result } = renderHook(
      () => useCreateBudgetAllocation(),
      { wrapper: createWrapper() }
    );

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isIdle).toBe(true);
  });

  it('should call the mutation endpoint', async () => {
    const { result } = renderHook(
      () => useCreateBudgetAllocation(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        budgetId: 'budget-1',
        geographicUnitId: 'geo-1',
        allocatedAmount: 200000,
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useUpdateBudgetAllocation
// ============================================================================
describe('useUpdateBudgetAllocation', () => {
  it('should update a budget allocation', async () => {
    const { result } = renderHook(
      () => useUpdateBudgetAllocation(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        id: 'alloc-1',
        data: { allocatedAmount: 600000 },
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useDeleteBudgetAllocation
// ============================================================================
describe('useDeleteBudgetAllocation', () => {
  it('should delete a budget allocation', async () => {
    const { result } = renderHook(
      () => useDeleteBudgetAllocation(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate('alloc-1');
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// Helper Functions
// ============================================================================
describe('calculateAllocationProgress', () => {
  it('should calculate correct progress', () => {
    expect(calculateAllocationProgress(mockAllocation)).toBe(40); // 200000/500000 * 100
  });

  it('should return 0 for zero allocated amount', () => {
    const zeroAlloc = { ...mockAllocation, allocatedAmount: 0 };
    expect(calculateAllocationProgress(zeroAlloc)).toBe(0);
  });
});

describe('calculateAllocationUtilization', () => {
  it('should calculate correct utilization', () => {
    expect(calculateAllocationUtilization(mockAllocation)).toBe(60); // 300000/500000 * 100
  });

  it('should return 0 for zero allocated amount', () => {
    const zeroAlloc = { ...mockAllocation, allocatedAmount: 0 };
    expect(calculateAllocationUtilization(zeroAlloc)).toBe(0);
  });
});

describe('flattenAllocationTree', () => {
  it('should flatten tree structure', () => {
    const flat = flattenAllocationTree([mockTreeAllocation]);
    expect(flat.length).toBe(2);
    expect(flat[0].depth).toBe(0);
    expect(flat[1].depth).toBe(1);
  });

  it('should handle empty array', () => {
    const flat = flattenAllocationTree([]);
    expect(flat).toHaveLength(0);
  });

  it('should handle allocation without children', () => {
    const flat = flattenAllocationTree([mockAllocation]);
    expect(flat).toHaveLength(1);
    expect(flat[0].depth).toBe(0);
  });
});
