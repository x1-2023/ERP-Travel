/**
 * useClaims Hook Tests (Real MSW)
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useClaims,
  useClaim,
  useCreateClaim,
  useUpdateClaim,
  useDeleteClaim,
  useSubmitClaim,
  useApproveClaim,
  useRejectClaim,
} from '@/hooks/useClaims';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';
import { mockClaims } from '../mocks/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useClaims', () => {
  it('should fetch claims list', async () => {
    const { result } = renderHook(() => useClaims(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.claims).toHaveLength(mockClaims.length);
  });

  it('should fetch claims with status filter', async () => {
    const { result } = renderHook(() => useClaims({ status: 'DRAFT' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.claims).toBeDefined();
  });

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useClaims({ page: 1, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.metadata).toBeDefined();
  });

  it('should fetch claims with promotionId filter', async () => {
    const { result } = renderHook(() => useClaims({ promotionId: '1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.claims).toBeDefined();
  });

  it('should fetch claims with search filter', async () => {
    const { result } = renderHook(() => useClaims({ search: 'CLM' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.claims).toBeDefined();
  });
});

describe('useClaim', () => {
  it('should fetch single claim by ID', async () => {
    const { result } = renderHook(() => useClaim('claim-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('CLM-001');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useClaim(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateClaim', () => {
  it('should create a claim', async () => {
    const { result } = renderHook(() => useCreateClaim(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        promotionId: '1',
        claimDate: '2024-03-01',
        claimAmount: 3000000,
        description: 'Test claim',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateClaim', () => {
  it('should update a claim', async () => {
    const { result } = renderHook(() => useUpdateClaim(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'claim-1', data: { claimAmount: 6000000 } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteClaim', () => {
  it('should delete a claim', async () => {
    const { result } = renderHook(() => useDeleteClaim(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('claim-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useSubmitClaim', () => {
  it('should submit a claim', async () => {
    const { result } = renderHook(() => useSubmitClaim(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('claim-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useApproveClaim', () => {
  it('should approve a claim', async () => {
    const { result } = renderHook(() => useApproveClaim(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'claim-1', approvedAmount: 5000000 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useRejectClaim', () => {
  it('should reject a claim', async () => {
    const { result } = renderHook(() => useRejectClaim(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'claim-1', reason: 'Insufficient evidence' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
