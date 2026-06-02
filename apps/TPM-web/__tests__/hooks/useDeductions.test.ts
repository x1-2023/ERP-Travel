/**
 * useDeductions Hook Tests
 * Tests for finance deduction hooks
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';

import {
  deductionKeys,
  useDeductions,
  useDeduction,
  useMatchingSuggestions,
  useCreateDeduction,
  useUpdateDeduction,
  useDeleteDeduction,
  useMatchDeduction,
  useDisputeDeduction,
  useResolveDeduction,
} from '@/hooks/useDeductions';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ══════════════════════════════════════════════════════════════════════════════
// Query Key Factory Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('deductionKeys', () => {
  it('should generate correct all key', () => {
    expect(deductionKeys.all).toEqual(['deductions']);
  });

  it('should generate correct lists key', () => {
    expect(deductionKeys.lists()).toEqual(['deductions', 'list']);
  });

  it('should generate correct list key with filters', () => {
    const filters = { status: 'PENDING', page: 1 };
    expect(deductionKeys.list(filters)).toEqual(['deductions', 'list', filters]);
  });

  it('should generate correct details key', () => {
    expect(deductionKeys.details()).toEqual(['deductions', 'detail']);
  });

  it('should generate correct detail key with id', () => {
    expect(deductionKeys.detail('ded-1')).toEqual(['deductions', 'detail', 'ded-1']);
  });

  it('should generate correct suggestions key', () => {
    expect(deductionKeys.suggestions('ded-1')).toEqual(['deductions', 'suggestions', 'ded-1']);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Query Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useDeductions', () => {
  it('should fetch deductions list', async () => {
    const { result } = renderHook(() => useDeductions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.deductions).toHaveLength(1);
    expect(result.current.data?.summary).toBeDefined();
  });

  it('should fetch deductions with filters', async () => {
    const { result } = renderHook(
      () => useDeductions({ page: 1, limit: 10, customerId: 'cust-1' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.deductions).toBeDefined();
  });

  it('should apply select transform', async () => {
    const { result } = renderHook(() => useDeductions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveProperty('deductions');
    expect(result.current.data).toHaveProperty('pagination');
    expect(result.current.data).toHaveProperty('summary');
  });
});

describe('useDeduction', () => {
  it('should fetch single deduction', async () => {
    const { result } = renderHook(() => useDeduction('ded-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useDeduction(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useMatchingSuggestions', () => {
  it('should fetch matching suggestions', async () => {
    const { result } = renderHook(() => useMatchingSuggestions('ded-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useMatchingSuggestions(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Mutation Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useCreateDeduction', () => {
  it('should create a deduction', async () => {
    const { result } = renderHook(() => useCreateDeduction(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        customerId: 'cust-1',
        invoiceNumber: 'INV-003',
        invoiceDate: '2026-01-15',
        amount: 5000000,
        reason: 'Test deduction',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateDeduction', () => {
  it('should update a deduction', async () => {
    const { result } = renderHook(() => useUpdateDeduction(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'ded-1', data: { amount: 6000000 } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteDeduction', () => {
  it('should delete a deduction', async () => {
    const { result } = renderHook(() => useDeleteDeduction(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('ded-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useMatchDeduction', () => {
  it('should match a deduction to a claim', async () => {
    const { result } = renderHook(() => useMatchDeduction(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'ded-1', claimId: 'claim-1' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDisputeDeduction', () => {
  it('should dispute a deduction', async () => {
    const { result } = renderHook(() => useDisputeDeduction(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'ded-1', reason: 'Amount mismatch' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useResolveDeduction', () => {
  it('should resolve a deduction with ACCEPT', async () => {
    const { result } = renderHook(() => useResolveDeduction(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'ded-1', resolution: 'ACCEPT', notes: 'Verified' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should resolve a deduction with PARTIAL amount', async () => {
    const { result } = renderHook(() => useResolveDeduction(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'ded-1', resolution: 'PARTIAL', amount: 3000000, notes: 'Partial settlement' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
