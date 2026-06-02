/**
 * useFunds Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useFunds,
  useFund,
  useCreateFund,
  useUpdateFund,
  useDeleteFund,
  useFundUtilization,
  useFundOptions,
} from '@/hooks/useFunds';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { mockFunds } from '../mocks/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useFunds', () => {
  it('should fetch funds list', async () => {
    const { result } = renderHook(() => useFunds(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.funds).toHaveLength(mockFunds.length);
  });

  it('should fetch funds with type filter', async () => {
    const { result } = renderHook(() => useFunds({ fundType: 'TRADE_FUND' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.funds).toBeDefined();
  });

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useFunds({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });
});

describe('useFund', () => {
  it('should fetch single fund by ID', async () => {
    const { result } = renderHook(() => useFund('fund-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('FUND001');
    expect(result.current.data?.name).toBe('Trade Fund Q1');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useFund(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateFund', () => {
  it('should create a fund', async () => {
    const { result } = renderHook(() => useCreateFund(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        code: 'FUND-NEW',
        name: 'New Fund',
        totalBudget: 300000000,
        startDate: '2024-07-01',
        endDate: '2024-12-31',
        fundType: 'TRADE_FUND',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateFund', () => {
  it('should update a fund', async () => {
    const { result } = renderHook(() => useUpdateFund(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'fund-1', data: { name: 'Updated Fund Name' } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteFund', () => {
  it('should delete a fund', async () => {
    const { result } = renderHook(() => useDeleteFund(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('fund-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useFundUtilization', () => {
  it('should fetch fund utilization stats', async () => {
    const { result } = renderHook(() => useFundUtilization('fund-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useFundUtilization(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useFundOptions', () => {
  it('should fetch fund options for dropdown', async () => {
    const { result } = renderHook(() => useFundOptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.[0]).toHaveProperty('value');
    expect(result.current.data?.[0]).toHaveProperty('label');
  });
});
