/**
 * useInventory Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useInventoryList,
  useInventorySnapshot,
  useInventorySummary,
  useInventoryHistory,
  useCreateInventorySnapshot,
  useUpdateInventorySnapshot,
  useDeleteInventorySnapshot,
  useBulkDeleteInventory,
  useBulkUpdateInventory,
  useImportInventory,
  useExportInventory,
} from '@/hooks/operations/useInventory';

// Mock data
const mockSnapshot = {
  id: 'inv-1',
  customerId: 'cust-1',
  customerName: 'ABC Corp',
  productId: 'prod-1',
  productName: 'Product A',
  snapshotDate: '2024-03-01',
  quantity: 500,
  value: 25000000,
  location: 'Warehouse A',
  batchNumber: 'BATCH-001',
  createdAt: '2024-03-01',
  updatedAt: '2024-03-01',
};

const mockSnapshots = [
  mockSnapshot,
  { ...mockSnapshot, id: 'inv-2', productId: 'prod-2', productName: 'Product B', quantity: 300 },
];

const mockInventorySummary = {
  totalProducts: 50,
  totalQuantity: 5000,
  totalValue: 250000000,
  lowStockCount: 3,
  nearExpiryCount: 2,
};

const mockSummaryResponse = {
  summary: mockInventorySummary,
  byCustomer: [{ customerId: 'cust-1', customerName: 'ABC Corp', totalQuantity: 2000, totalValue: 100000000, productCount: 20 }],
  byProduct: [{ productId: 'prod-1', productName: 'Product A', productSku: 'SKU001', category: 'Beverages', totalQuantity: 500, totalValue: 25000000 }],
  byLocation: [{ location: 'Warehouse A', totalQuantity: 3000, totalValue: 150000000, productCount: 30 }],
  alerts: [{ type: 'LOW_STOCK', message: 'Product A is low on stock', productId: 'prod-1' }],
};

const mockHistory = {
  timeline: [{ date: '2024-03-01', totalQuantity: 5000, totalValue: 250000000, snapshotCount: 50 }],
  changes: [{ date: '2024-03-01', quantityChange: 100, valueChange: 5000000 }],
  movingAverages: [{ date: '2024-03-01', ma7Quantity: 4500, ma7Value: 225000000 }],
  overallTrend: { quantityGrowth: 5.2, valueGrowth: 3.8, avgDailyQuantity: 4800, avgDailyValue: 240000000 },
  currentStatus: { date: '2024-03-01', totalQuantity: 5000, totalValue: 250000000, snapshotCount: 50 },
};

// MSW server
const server = setupServer(
  http.get('*/api/operations/inventory/summary', () => {
    return HttpResponse.json(mockSummaryResponse);
  }),

  http.get('*/api/operations/inventory/history', () => {
    return HttpResponse.json(mockHistory);
  }),

  http.get('*/api/operations/inventory/export', () => {
    return new HttpResponse('csv,data', { headers: { 'Content-Type': 'text/csv' } });
  }),

  http.get('*/api/operations/inventory/:id', () => {
    return HttpResponse.json({ data: mockSnapshot });
  }),

  http.get('*/api/operations/inventory', () => {
    return HttpResponse.json({
      data: mockSnapshots,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      summary: mockInventorySummary,
    });
  }),

  http.post('*/api/operations/inventory/bulk', async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.action === 'delete') {
      return HttpResponse.json({ success: true, deleted: body.ids.length });
    }
    return HttpResponse.json({ success: true, updated: body.ids.length });
  }),

  http.post('*/api/operations/inventory/import', () => {
    return HttpResponse.json({
      summary: { total: 5, created: 4, updated: 0, failed: 1, successRate: 80 },
      results: [
        { success: true, row: 1 },
        { success: true, row: 2 },
        { success: true, row: 3 },
        { success: true, row: 4 },
        { success: false, row: 5, error: 'Invalid SKU' },
      ],
    });
  }),

  http.post('*/api/operations/inventory', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockSnapshot, ...(body as object), id: 'inv-new' } });
  }),

  http.put('*/api/operations/inventory/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockSnapshot, ...(body as object) } });
  }),

  http.delete('*/api/operations/inventory/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useInventoryList', () => {
  it('should fetch inventory list', async () => {
    const { result } = renderHook(() => useInventoryList(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.summary).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch with customerId filter', async () => {
    const { result } = renderHook(() => useInventoryList({ customerId: 'cust-1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });

  it('should fetch with lowStock filter', async () => {
    const { result } = renderHook(() => useInventoryList({ lowStock: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useInventorySnapshot', () => {
  it('should fetch single snapshot', async () => {
    const { result } = renderHook(() => useInventorySnapshot('inv-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.quantity).toBe(500);
  });

  it('should not fetch when ID is undefined', async () => {
    const { result } = renderHook(() => useInventorySnapshot(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useInventorySummary', () => {
  it('should fetch inventory summary', async () => {
    const { result } = renderHook(() => useInventorySummary(), {
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

describe('useInventoryHistory', () => {
  it('should fetch inventory history with customerId', async () => {
    const { result } = renderHook(() => useInventoryHistory({ customerId: 'cust-1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.timeline).toHaveLength(1);
    expect(result.current.data?.overallTrend).toBeDefined();
  });

  it('should not fetch when no customerId or productId', async () => {
    const { result } = renderHook(() => useInventoryHistory(), {
      wrapper: createWrapper(),
    });

    // enabled is false when neither customerId nor productId provided
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateInventorySnapshot', () => {
  it('should create a snapshot', async () => {
    const { result } = renderHook(() => useCreateInventorySnapshot(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: 'cust-1',
        productId: 'prod-1',
        snapshotDate: '2024-04-01',
        quantity: 200,
        value: 10000000,
        location: 'Warehouse B',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateInventorySnapshot', () => {
  it('should update a snapshot', async () => {
    const { result } = renderHook(() => useUpdateInventorySnapshot(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'inv-1', quantity: 600, value: 30000000 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteInventorySnapshot', () => {
  it('should delete a snapshot', async () => {
    const { result } = renderHook(() => useDeleteInventorySnapshot(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('inv-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useBulkDeleteInventory', () => {
  it('should bulk delete snapshots', async () => {
    const { result } = renderHook(() => useBulkDeleteInventory(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(['inv-1', 'inv-2']);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.deleted).toBe(2);
  });
});

describe('useBulkUpdateInventory', () => {
  it('should bulk update snapshots', async () => {
    const { result } = renderHook(() => useBulkUpdateInventory(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ ids: ['inv-1', 'inv-2'], data: { location: 'Warehouse C' } });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.updated).toBe(2);
  });
});

describe('useImportInventory', () => {
  it('should import inventory data', async () => {
    const { result } = renderHook(() => useImportInventory(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        data: [
          {
            customerCode: 'CUST001',
            productSku: 'SKU001',
            snapshotDate: '2024-04-01',
            quantity: 100,
            value: 5000000,
          },
        ],
        mode: 'create',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.summary.total).toBe(5);
    expect(result.current.data?.summary.successRate).toBe(80);
  });
});

describe('useExportInventory', () => {
  it('should export inventory data', async () => {
    const { result } = renderHook(() => useExportInventory(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ format: 'csv', customerId: 'cust-1' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
