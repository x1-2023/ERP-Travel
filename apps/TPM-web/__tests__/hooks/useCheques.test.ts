/**
 * useCheques Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useCheques,
  useCheque,
  useCreateCheque,
  useUpdateCheque,
  useDeleteCheque,
  useClearCheque,
  useVoidCheque,
  useStaleCheque,
} from '@/hooks/useCheques';

// Mock data
const mockCheque = {
  id: 'chq-1',
  code: 'CHQ-001',
  chequeNumber: '000123',
  chequeDate: '2024-03-01',
  amount: 5000000,
  status: 'PENDING',
  bankAccount: 'ACC-001',
  bankName: 'VCB',
  payee: 'ABC Corp',
  memo: 'Payment for claim',
  customerId: 'cust-1',
  customer: { id: 'cust-1', code: 'CUST001', name: 'ABC Corp' },
  claimId: 'claim-1',
  claim: {
    id: 'claim-1',
    code: 'CLM-001',
    claimedAmount: 5000000,
    approvedAmount: 5000000,
    promotion: { id: '1', code: 'PROMO-001', name: 'Summer Sale' },
  },
  createdAt: '2024-03-01',
  updatedAt: '2024-03-01',
};

const mockCheques = [
  mockCheque,
  { ...mockCheque, id: 'chq-2', code: 'CHQ-002', chequeNumber: '000124', status: 'CLEARED' },
];

const mockSummary = {
  totalIssued: 10,
  totalCleared: 5,
  totalVoided: 1,
  totalPending: 4,
  issuedAmount: 50000000,
  clearedAmount: 25000000,
  pendingAmount: 20000000,
};

// MSW server
const server = setupServer(
  http.get('*/api/finance/cheques', () => {
    return HttpResponse.json({
      cheques: mockCheques,
      summary: mockSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  }),

  http.get('*/api/finance/cheques/:id', ({ params }) => {
    return HttpResponse.json(mockCheque);
  }),

  http.post('*/api/finance/cheques', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockCheque, ...(body as object), id: 'chq-new' });
  }),

  http.put('*/api/finance/cheques/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockCheque, ...(body as object) });
  }),

  http.delete('*/api/finance/cheques/:id', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useCheques', () => {
  it('should fetch cheques list', async () => {
    const { result } = renderHook(() => useCheques(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.cheques).toHaveLength(2);
    expect(result.current.data?.summary).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch cheques with status filter', async () => {
    const { result } = renderHook(() => useCheques({ status: 'PENDING' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.cheques).toBeDefined();
  });

  it('should fetch cheques with date range filter', async () => {
    const { result } = renderHook(
      () => useCheques({ startDate: '2024-01-01', endDate: '2024-12-31' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.cheques).toBeDefined();
  });

  it('should fetch cheques with amount range filter', async () => {
    const { result } = renderHook(
      () => useCheques({ minAmount: 1000000, maxAmount: 10000000 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.cheques).toBeDefined();
  });
});

describe('useCheque', () => {
  it('should fetch single cheque by ID', async () => {
    const { result } = renderHook(() => useCheque('chq-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('CHQ-001');
    expect(result.current.data?.chequeNumber).toBe('000123');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useCheque(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateCheque', () => {
  it('should create a cheque', async () => {
    const { result } = renderHook(() => useCreateCheque(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: 'cust-1',
        chequeNumber: '000125',
        chequeDate: '2024-03-15',
        amount: 3000000,
        bankAccount: 'ACC-001',
        bankName: 'VCB',
        payee: 'XYZ Ltd',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateCheque', () => {
  it('should update a cheque', async () => {
    const { result } = renderHook(() => useUpdateCheque(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'chq-1', amount: 6000000, memo: 'Updated memo' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteCheque', () => {
  it('should delete a cheque', async () => {
    const { result } = renderHook(() => useDeleteCheque(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('chq-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useClearCheque', () => {
  it('should clear a cheque', async () => {
    const { result } = renderHook(() => useClearCheque(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'chq-1', clearDate: '2024-03-10', notes: 'Cleared OK' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useVoidCheque', () => {
  it('should void a cheque', async () => {
    const { result } = renderHook(() => useVoidCheque(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'chq-1', voidReason: 'Duplicate payment', notes: 'Voided' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useStaleCheque', () => {
  it('should mark a cheque as stale', async () => {
    const { result } = renderHook(() => useStaleCheque(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'chq-1', notes: 'Expired' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
