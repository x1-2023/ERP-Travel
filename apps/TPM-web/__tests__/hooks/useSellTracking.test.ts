/**
 * useSellTracking Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useSellTrackingList,
  useSellTrackingRecord,
  useSellTrackingSummary,
  useSellTrackingTrends,
  useCreateSellTracking,
  useUpdateSellTracking,
  useDeleteSellTracking,
  useBulkDeleteSellTracking,
  useImportSellTracking,
  useExportSellTracking,
} from '@/hooks/operations/useSellTracking';

// Mock data
const mockRecord = {
  id: 'sell-1',
  customerId: 'cust-1',
  customerName: 'ABC Corp',
  productId: 'prod-1',
  productName: 'Product A',
  period: '2024-03',
  sellInQty: 1000,
  sellInValue: 50000000,
  sellOutQty: 800,
  sellOutValue: 48000000,
  stockQty: 200,
  stockValue: 10000000,
  createdAt: '2024-03-01',
  updatedAt: '2024-03-01',
};

const mockRecords = [
  mockRecord,
  { ...mockRecord, id: 'sell-2', period: '2024-02', sellInQty: 900, sellOutQty: 750 },
];

const mockSellSummary = {
  totalSellIn: 5000,
  totalSellOut: 4000,
  totalStock: 1000,
  avgSellThroughRate: 80,
};

const mockSummaryResponse = {
  summary: mockSellSummary,
  comparison: [{ period: '2024-03', sellInQty: 1000, sellOutQty: 800 }],
  byCustomer: [{ customerId: 'cust-1', customerName: 'ABC Corp', sellInQty: 1000, sellOutQty: 800, stockQty: 200, sellThroughRate: 80 }],
  byProduct: [{ productId: 'prod-1', productName: 'Product A', sellInQty: 1000, sellOutQty: 800, stockQty: 200, sellThroughRate: 80 }],
  alerts: [{ type: 'HIGH_STOCK', message: 'Product A has high stock levels' }],
};

const mockTrends = {
  timeline: [
    { period: '2024-01', sellInQty: 800, sellInValue: 40000000, sellOutQty: 700, sellOutValue: 42000000, stockQty: 100, stockValue: 5000000, sellThroughRate: 87.5 },
    { period: '2024-02', sellInQty: 900, sellInValue: 45000000, sellOutQty: 750, sellOutValue: 45000000, stockQty: 250, stockValue: 12500000, sellThroughRate: 83.3 },
  ],
  movingAverages: [
    { period: '2024-03', ma3SellIn: 900, ma3SellOut: 750, ma3SellThrough: 83.6 },
  ],
  changes: [
    { period: '2024-02', sellInChange: 12.5, sellOutChange: 7.1, stockChange: 150 },
  ],
  overallTrend: { sellInGrowth: 10.5, sellOutGrowth: 8.2, avgSellThrough: 83.6 },
};

// MSW server
const server = setupServer(
  http.get('*/api/operations/sell-tracking/summary', () => {
    return HttpResponse.json(mockSummaryResponse);
  }),

  http.get('*/api/operations/sell-tracking/trends', () => {
    return HttpResponse.json(mockTrends);
  }),

  http.get('*/api/operations/sell-tracking/export', () => {
    return new HttpResponse('csv,data', { headers: { 'Content-Type': 'text/csv' } });
  }),

  http.get('*/api/operations/sell-tracking/:id', () => {
    return HttpResponse.json({ data: mockRecord });
  }),

  http.get('*/api/operations/sell-tracking', () => {
    return HttpResponse.json({
      data: mockRecords,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      summary: mockSellSummary,
    });
  }),

  http.post('*/api/operations/sell-tracking/bulk', async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({ success: true, deleted: body.ids.length });
  }),

  http.post('*/api/operations/sell-tracking/import', () => {
    return HttpResponse.json({
      summary: { total: 3, created: 3, updated: 0, failed: 0, successRate: 100 },
      results: [
        { success: true, row: 1 },
        { success: true, row: 2 },
        { success: true, row: 3 },
      ],
    });
  }),

  http.post('*/api/operations/sell-tracking', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockRecord, ...(body as object), id: 'sell-new' } });
  }),

  http.put('*/api/operations/sell-tracking/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockRecord, ...(body as object) } });
  }),

  http.delete('*/api/operations/sell-tracking/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useSellTrackingList', () => {
  it('should fetch sell tracking records', async () => {
    const { result } = renderHook(() => useSellTrackingList(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.summary).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch with customerId filter', async () => {
    const { result } = renderHook(() => useSellTrackingList({ customerId: 'cust-1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });

  it('should fetch with period filter', async () => {
    const { result } = renderHook(
      () => useSellTrackingList({ periodFrom: '2024-01', periodTo: '2024-03' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useSellTrackingRecord', () => {
  it('should fetch single record', async () => {
    const { result } = renderHook(() => useSellTrackingRecord('sell-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.period).toBe('2024-03');
    expect(result.current.data?.sellInQty).toBe(1000);
  });

  it('should not fetch when ID is undefined', async () => {
    const { result } = renderHook(() => useSellTrackingRecord(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useSellTrackingSummary', () => {
  it('should fetch sell tracking summary', async () => {
    const { result } = renderHook(() => useSellTrackingSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.summary).toBeDefined();
    expect(result.current.data?.byCustomer).toHaveLength(1);
    expect(result.current.data?.byProduct).toHaveLength(1);
    expect(result.current.data?.alerts).toHaveLength(1);
  });
});

describe('useSellTrackingTrends', () => {
  it('should fetch sell tracking trends', async () => {
    const { result } = renderHook(() => useSellTrackingTrends(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.timeline).toHaveLength(2);
    expect(result.current.data?.overallTrend).toBeDefined();
    expect(result.current.data?.movingAverages).toHaveLength(1);
  });
});

describe('useCreateSellTracking', () => {
  it('should create a sell tracking record', async () => {
    const { result } = renderHook(() => useCreateSellTracking(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: 'cust-1',
        productId: 'prod-1',
        period: '2024-04',
        sellInQty: 1200,
        sellInValue: 60000000,
        sellOutQty: 1000,
        sellOutValue: 60000000,
        stockQty: 400,
        stockValue: 20000000,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateSellTracking', () => {
  it('should update a sell tracking record', async () => {
    const { result } = renderHook(() => useUpdateSellTracking(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'sell-1', sellOutQty: 850, sellOutValue: 51000000 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteSellTracking', () => {
  it('should delete a sell tracking record', async () => {
    const { result } = renderHook(() => useDeleteSellTracking(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('sell-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useBulkDeleteSellTracking', () => {
  it('should bulk delete sell tracking records', async () => {
    const { result } = renderHook(() => useBulkDeleteSellTracking(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(['sell-1', 'sell-2']);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.deleted).toBe(2);
  });
});

describe('useImportSellTracking', () => {
  it('should import sell tracking data', async () => {
    const { result } = renderHook(() => useImportSellTracking(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        data: [
          {
            customerCode: 'CUST001',
            productSku: 'SKU001',
            period: '2024-04',
            sellInQty: 100,
            sellInValue: 5000000,
            sellOutQty: 80,
            sellOutValue: 4800000,
            stockQty: 20,
            stockValue: 1000000,
          },
        ],
        mode: 'create',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.summary.total).toBe(3);
    expect(result.current.data?.summary.successRate).toBe(100);
  });
});

describe('useExportSellTracking', () => {
  it('should export sell tracking data', async () => {
    const { result } = renderHook(() => useExportSellTracking(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ format: 'csv' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
