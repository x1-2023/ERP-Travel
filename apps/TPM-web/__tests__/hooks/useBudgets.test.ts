/**
 * useBudgets Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useBudgets,
  useBudget,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useBudgetYears,
  useSubmitBudget,
  useReviewBudget,
  useApprovalHistory,
  useFundHealthScore,
  useBudgetComparison,
} from '@/hooks/useBudgets';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { mockBudgets } from '../mocks/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useBudgets', () => {
  it('should fetch budgets list', async () => {
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.budgets).toHaveLength(mockBudgets.length);
  });

  it('should fetch with year filter', async () => {
    const { result } = renderHook(() => useBudgets({ year: 2024 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.budgets).toBeDefined();
  });

  it('should fetch with status filter', async () => {
    const { result } = renderHook(() => useBudgets({ status: 'APPROVED' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });

  it('should fetch with pagination', async () => {
    const { result } = renderHook(() => useBudgets({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });

  it('should fetch with category filter', async () => {
    const { result } = renderHook(() => useBudgets({ category: 'TRADE' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.budgets).toBeDefined();
  });
});

describe('useBudget', () => {
  it('should fetch single budget by ID', async () => {
    const { result } = renderHook(() => useBudget('budget-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('BUD-2024-001');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useBudget(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateBudget', () => {
  it('should create a budget', async () => {
    const { result } = renderHook(() => useCreateBudget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        code: 'BUD-2024-003',
        name: 'New Budget',
        totalAmount: 100000000,
        year: 2024,
        category: 'TRADE',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateBudget', () => {
  it('should update a budget', async () => {
    const { result } = renderHook(() => useUpdateBudget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'budget-1', data: { name: 'Updated Budget' } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteBudget', () => {
  it('should delete a budget', async () => {
    const { result } = renderHook(() => useDeleteBudget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('budget-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useBudgetYears', () => {
  it('should fetch available years', async () => {
    const { result } = renderHook(() => useBudgetYears(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([2024, 2023, 2022]);
  });
});

describe('useSubmitBudget', () => {
  it('should submit a budget', async () => {
    const { result } = renderHook(() => useSubmitBudget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('budget-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useReviewBudget', () => {
  it('should approve a budget', async () => {
    const { result } = renderHook(() => useReviewBudget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ budgetId: 'budget-1', action: 'approve', comments: 'Looks good' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should reject a budget', async () => {
    const { result } = renderHook(() => useReviewBudget(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ budgetId: 'budget-1', action: 'reject', comments: 'Needs revision' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useApprovalHistory', () => {
  it('should fetch approval history', async () => {
    const { result } = renderHook(() => useApprovalHistory('budget-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should not fetch when budgetId is empty', async () => {
    const { result } = renderHook(() => useApprovalHistory(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useFundHealthScore', () => {
  it('should fetch health score', async () => {
    const { result } = renderHook(() => useFundHealthScore('budget-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.healthScore).toBe(85);
  });

  it('should not fetch when budgetId is empty', async () => {
    const { result } = renderHook(() => useFundHealthScore(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useBudgetComparison', () => {
  it('should fetch budget comparison', async () => {
    const { result } = renderHook(() => useBudgetComparison('budget-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should not fetch when budgetId is empty', async () => {
    const { result } = renderHook(() => useBudgetComparison(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});
