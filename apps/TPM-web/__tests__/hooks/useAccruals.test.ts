/**
 * useAccruals Hook Tests
 * Tests for finance accrual hooks
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';

import {
  accrualKeys,
  useAccruals,
  useAccrual,
  useCalculateAccruals,
  usePreviewAccruals,
  useUpdateAccrual,
  useDeleteAccrual,
  usePostAccrual,
  usePostAccrualBatch,
  useReverseAccrual,
} from '@/hooks/useAccruals';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ══════════════════════════════════════════════════════════════════════════════
// Query Key Factory Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('accrualKeys', () => {
  it('should generate correct all key', () => {
    expect(accrualKeys.all).toEqual(['accruals']);
  });

  it('should generate correct lists key', () => {
    expect(accrualKeys.lists()).toEqual(['accruals', 'list']);
  });

  it('should generate correct list key with filters', () => {
    const filters = { status: 'PENDING', page: 1 };
    expect(accrualKeys.list(filters)).toEqual(['accruals', 'list', filters]);
  });

  it('should generate correct details key', () => {
    expect(accrualKeys.details()).toEqual(['accruals', 'detail']);
  });

  it('should generate correct detail key with id', () => {
    expect(accrualKeys.detail('acc-1')).toEqual(['accruals', 'detail', 'acc-1']);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Query Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useAccruals', () => {
  it('should fetch accruals list', async () => {
    const { result } = renderHook(() => useAccruals(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.accruals).toHaveLength(1);
    expect(result.current.data?.summary).toBeDefined();
  });

  it('should fetch accruals with filters', async () => {
    const { result } = renderHook(
      () => useAccruals({ page: 1, limit: 10, period: '2026-01' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.accruals).toBeDefined();
  });

  it('should apply select transform', async () => {
    const { result } = renderHook(() => useAccruals(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // The select function should transform the response
    expect(result.current.data).toHaveProperty('accruals');
    expect(result.current.data).toHaveProperty('pagination');
    expect(result.current.data).toHaveProperty('summary');
  });
});

describe('useAccrual', () => {
  it('should fetch single accrual', async () => {
    const { result } = renderHook(() => useAccrual('acc-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useAccrual(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Mutation Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useCalculateAccruals', () => {
  it('should calculate accruals', async () => {
    const { result } = renderHook(() => useCalculateAccruals(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ period: '2026-01', method: 'PERCENTAGE' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('usePreviewAccruals', () => {
  it('should preview accruals', async () => {
    const { result } = renderHook(() => usePreviewAccruals(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ period: '2026-01', method: 'PRO_RATA' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateAccrual', () => {
  it('should update an accrual', async () => {
    const { result } = renderHook(() => useUpdateAccrual(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'acc-1', data: { amount: 35000000, notes: 'Updated' } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteAccrual', () => {
  it('should delete an accrual', async () => {
    const { result } = renderHook(() => useDeleteAccrual(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('acc-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('usePostAccrual', () => {
  it('should post an accrual', async () => {
    const { result } = renderHook(() => usePostAccrual(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'acc-1', glAccountDebit: '6100', glAccountCredit: '2100' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('usePostAccrualBatch', () => {
  it('should post accruals in batch', async () => {
    const { result } = renderHook(() => usePostAccrualBatch(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({
        accrualIds: ['acc-1', 'acc-2', 'acc-3'],
        glAccountDebit: '6100',
        glAccountCredit: '2100',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useReverseAccrual', () => {
  it('should reverse an accrual', async () => {
    const { result } = renderHook(() => useReverseAccrual(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'acc-1', reason: 'Incorrect amount' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should reverse an accrual without reason', async () => {
    const { result } = renderHook(() => useReverseAccrual(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'acc-1' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
