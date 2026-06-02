/**
 * useJournals Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useJournals,
  useJournal,
  useCreateJournal,
  useUpdateJournal,
  useDeleteJournal,
  usePostJournal,
  useReverseJournal,
} from '@/hooks/useJournals';

// Mock data
const mockJournal = {
  id: 'jnl-1',
  code: 'JNL-001',
  journalType: 'ACCRUAL',
  journalDate: '2024-03-01',
  description: 'Monthly accrual',
  reference: 'ACC-2024-03',
  status: 'DRAFT',
  totalDebit: 5000000,
  totalCredit: 5000000,
  customerId: 'cust-1',
  customer: { id: 'cust-1', code: 'CUST001', name: 'ABC Corp' },
  promotionId: '1',
  promotion: { id: '1', code: 'PROMO-001', name: 'Summer Sale' },
  lines: [
    {
      id: 'line-1',
      lineNumber: 1,
      accountCode: '6100',
      accountName: 'Trade Expense',
      debit: 5000000,
      credit: 0,
      description: 'Trade expense accrual',
    },
    {
      id: 'line-2',
      lineNumber: 2,
      accountCode: '2100',
      accountName: 'Accrued Liability',
      debit: 0,
      credit: 5000000,
      description: 'Accrued trade liability',
    },
  ],
  createdAt: '2024-03-01',
  updatedAt: '2024-03-01',
};

const mockJournals = [
  mockJournal,
  { ...mockJournal, id: 'jnl-2', code: 'JNL-002', status: 'POSTED', journalType: 'SETTLEMENT' },
];

const mockSummary = {
  totalDraft: 3,
  totalPosted: 10,
  totalReversed: 1,
  draftAmount: 15000000,
  postedAmount: 50000000,
};

// MSW server
const server = setupServer(
  http.get('*/api/finance/journals', () => {
    return HttpResponse.json({
      journals: mockJournals,
      summary: mockSummary,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  }),

  http.get('*/api/finance/journals/:id', () => {
    return HttpResponse.json(mockJournal);
  }),

  http.post('*/api/finance/journals', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockJournal, ...(body as object), id: 'jnl-new' });
  }),

  http.put('*/api/finance/journals/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockJournal, ...(body as object) });
  }),

  http.delete('*/api/finance/journals/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('*/api/finance/journals/:id/post', () => {
    return HttpResponse.json({ ...mockJournal, status: 'POSTED', postedAt: '2024-03-02' });
  }),

  http.post('*/api/finance/journals/:id/reverse', () => {
    return HttpResponse.json({ ...mockJournal, status: 'REVERSED', reversedAt: '2024-03-03' });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useJournals', () => {
  it('should fetch journals list', async () => {
    const { result } = renderHook(() => useJournals(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.journals).toHaveLength(2);
    expect(result.current.data?.summary).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch journals with status filter', async () => {
    const { result } = renderHook(() => useJournals({ status: 'DRAFT' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.journals).toBeDefined();
  });

  it('should fetch journals with type filter', async () => {
    const { result } = renderHook(() => useJournals({ type: 'ACCRUAL' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.journals).toBeDefined();
  });

  it('should fetch journals with date range', async () => {
    const { result } = renderHook(
      () => useJournals({ startDate: '2024-01-01', endDate: '2024-12-31' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.journals).toBeDefined();
  });
});

describe('useJournal', () => {
  it('should fetch single journal by ID', async () => {
    const { result } = renderHook(() => useJournal('jnl-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.code).toBe('JNL-001');
    expect(result.current.data?.lines).toHaveLength(2);
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useJournal(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateJournal', () => {
  it('should create a journal', async () => {
    const { result } = renderHook(() => useCreateJournal(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        journalType: 'ACCRUAL',
        journalDate: '2024-04-01',
        description: 'April accrual',
        lines: [
          { accountCode: '6100', accountName: 'Trade Expense', debit: 3000000, credit: 0 },
          { accountCode: '2100', accountName: 'Accrued Liability', debit: 0, credit: 3000000 },
        ],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateJournal', () => {
  it('should update a journal', async () => {
    const { result } = renderHook(() => useUpdateJournal(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'jnl-1', description: 'Updated description' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteJournal', () => {
  it('should delete a journal', async () => {
    const { result } = renderHook(() => useDeleteJournal(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('jnl-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('usePostJournal', () => {
  it('should post a journal', async () => {
    const { result } = renderHook(() => usePostJournal(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'jnl-1', userId: 'user-1' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useReverseJournal', () => {
  it('should reverse a journal', async () => {
    const { result } = renderHook(() => useReverseJournal(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        id: 'jnl-1',
        reason: 'Incorrect entry',
        reversalDate: '2024-03-03',
        userId: 'user-1',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
