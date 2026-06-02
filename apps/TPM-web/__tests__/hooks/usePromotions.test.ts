/**
 * usePromotions Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  usePromotions,
  usePromotion,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useSubmitPromotion,
  useApprovePromotion,
  useRejectPromotion,
  usePromotionOptions,
} from '@/hooks/usePromotions';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { mockPromotions, mockPromotion } from '../mocks/handlers';

// Start/stop MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('usePromotions', () => {
  it('should fetch promotions list', async () => {
    const { result } = renderHook(() => usePromotions(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check data
    expect(result.current.data?.promotions).toHaveLength(mockPromotions.length);
  });

  it('should fetch promotions with filters', async () => {
    const { result } = renderHook(() => usePromotions({ status: 'ACTIVE' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.promotions).toBeDefined();
  });

  it('should handle pagination params', async () => {
    const { result } = renderHook(() => usePromotions({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });
});

describe('usePromotion', () => {
  it('should fetch single promotion by ID', async () => {
    const { result } = renderHook(() => usePromotion('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe(mockPromotion.code);
    expect(result.current.data?.name).toBe(mockPromotion.name);
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => usePromotion(''), {
      wrapper: createWrapper(),
    });

    // Should not be loading since query is disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreatePromotion', () => {
  it('should create a promotion', async () => {
    const { result } = renderHook(() => useCreatePromotion(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        code: 'PROMO-NEW',
        name: 'New Promotion',
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        budget: 50000000,
        customerId: 'cust-1',
        fundId: 'fund-1',
        promotionType: 'TRADE_PROMOTION',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdatePromotion', () => {
  it('should update a promotion', async () => {
    const { result } = renderHook(() => useUpdatePromotion(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: '1', data: { name: 'Updated Name' } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeletePromotion', () => {
  it('should delete a promotion', async () => {
    const { result } = renderHook(() => useDeletePromotion(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useSubmitPromotion', () => {
  it('should submit a promotion', async () => {
    const { result } = renderHook(() => useSubmitPromotion(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useApprovePromotion', () => {
  it('should approve a promotion', async () => {
    const { result } = renderHook(() => useApprovePromotion(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: '1', comment: 'Approved' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useRejectPromotion', () => {
  it('should reject a promotion', async () => {
    const { result } = renderHook(() => useRejectPromotion(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: '1', reason: 'Budget too high' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('usePromotionOptions', () => {
  it('should fetch promotion options for dropdown', async () => {
    const { result } = renderHook(() => usePromotionOptions(), {
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
