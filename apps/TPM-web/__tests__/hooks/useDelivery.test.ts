/**
 * useDelivery Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useDeliveryOrders,
  useDeliveryOrder,
  useDeliveryTracking,
  useDeliveryCalendar,
  useDeliveryStats,
  useCreateDelivery,
  useUpdateDelivery,
  useUpdateDeliveryStatus,
  useDeleteDelivery,
} from '@/hooks/operations/useDelivery';

// Mock data
const mockDeliveryOrder = {
  id: 'del-1',
  orderNumber: 'DO-001',
  customerId: 'cust-1',
  customerName: 'ABC Corp',
  status: 'PENDING',
  scheduledDate: '2024-03-15',
  deliveryAddress: '123 Main St',
  contactPerson: 'John Doe',
  contactPhone: '0901234567',
  items: [
    { productId: 'prod-1', productName: 'Product A', quantity: 100, deliveredQuantity: 0 },
  ],
  createdAt: '2024-03-01',
  updatedAt: '2024-03-01',
};

const mockDeliveryOrders = [
  mockDeliveryOrder,
  { ...mockDeliveryOrder, id: 'del-2', orderNumber: 'DO-002', status: 'IN_TRANSIT' },
];

const mockSummary = {
  total: 20,
  pending: 5,
  inTransit: 3,
  delivered: 10,
  cancelled: 2,
};

const mockTracking = {
  order: {
    id: 'del-1',
    orderNumber: 'DO-001',
    currentStatus: 'IN_TRANSIT',
    scheduledDate: '2024-03-15',
    deliveredAt: null,
  },
  timeline: [
    { id: 'track-1', status: 'PENDING', timestamp: '2024-03-01', notes: 'Order created', duration: '2 days' },
    { id: 'track-2', status: 'IN_TRANSIT', timestamp: '2024-03-03', notes: 'Dispatched', duration: null },
  ],
  summary: {
    totalEntries: 2,
    totalProcessingTime: '2 days',
    statusDurations: { PENDING: '2 days' },
  },
};

const mockCalendar = {
  data: {
    year: 2024,
    month: 3,
    days: [
      { date: '2024-03-15', orders: 3, delivered: 1, pending: 2 },
    ],
  },
  summary: {
    totalOrders: 20,
    delivered: 10,
    inTransit: 3,
    pending: 5,
    cancelled: 2,
    busiestDay: { date: '2024-03-15', totalOrders: 3 },
  },
};

const mockStats = {
  data: {
    period: 30,
    overview: { total: 50, byStatus: { PENDING: 5, DELIVERED: 30, IN_TRANSIT: 10, CANCELLED: 5 } },
    performance: { ordersInPeriod: 50, deliveredInPeriod: 30, onTimeRate: 85.5, avgDeliveryDays: 3.2 },
    trend: [{ date: '2024-03-01', created: 5, delivered: 3 }],
    topCustomers: [{ customerId: 'cust-1', customerName: 'ABC Corp', orderCount: 15 }],
  },
};

// MSW server
const server = setupServer(
  http.get('*/api/operations/delivery/calendar', () => {
    return HttpResponse.json(mockCalendar);
  }),

  http.get('*/api/operations/delivery/stats', () => {
    return HttpResponse.json(mockStats);
  }),

  http.get('*/api/operations/delivery/:id/tracking', () => {
    return HttpResponse.json({ data: mockTracking });
  }),

  http.get('*/api/operations/delivery/:id', () => {
    return HttpResponse.json({
      data: { ...mockDeliveryOrder, totalItems: 100, totalDelivered: 0, totalValue: 5000000 },
    });
  }),

  http.get('*/api/operations/delivery', () => {
    return HttpResponse.json({
      data: mockDeliveryOrders,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      summary: mockSummary,
    });
  }),

  http.post('*/api/operations/delivery', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockDeliveryOrder, ...(body as object), id: 'del-new' } });
  }),

  http.put('*/api/operations/delivery/:id/status', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockDeliveryOrder, ...(body as object) }, message: 'Status updated' });
  }),

  http.put('*/api/operations/delivery/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockDeliveryOrder, ...(body as object) } });
  }),

  http.delete('*/api/operations/delivery/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useDeliveryOrders', () => {
  it('should fetch delivery orders list', async () => {
    const { result } = renderHook(() => useDeliveryOrders(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.summary).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch with status filter', async () => {
    const { result } = renderHook(() => useDeliveryOrders({ status: 'PENDING' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });

  it('should fetch with search filter', async () => {
    const { result } = renderHook(() => useDeliveryOrders({ search: 'ABC' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useDeliveryOrder', () => {
  it('should fetch single delivery order', async () => {
    const { result } = renderHook(() => useDeliveryOrder('del-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.orderNumber).toBe('DO-001');
    expect(result.current.data?.totalItems).toBe(100);
  });

  it('should not fetch when ID is undefined', async () => {
    const { result } = renderHook(() => useDeliveryOrder(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useDeliveryTracking', () => {
  it('should fetch delivery tracking', async () => {
    const { result } = renderHook(() => useDeliveryTracking('del-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.timeline).toHaveLength(2);
    expect(result.current.data?.summary.totalEntries).toBe(2);
  });

  it('should not fetch when ID is undefined', async () => {
    const { result } = renderHook(() => useDeliveryTracking(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useDeliveryCalendar', () => {
  it('should fetch delivery calendar', async () => {
    const { result } = renderHook(() => useDeliveryCalendar(3, 2024), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.year).toBe(2024);
    expect(result.current.data?.data.month).toBe(3);
    expect(result.current.data?.summary).toBeDefined();
  });
});

describe('useDeliveryStats', () => {
  it('should fetch delivery stats', async () => {
    const { result } = renderHook(() => useDeliveryStats(30), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.period).toBe(30);
    expect(result.current.data?.performance.onTimeRate).toBe(85.5);
  });
});

describe('useCreateDelivery', () => {
  it('should create a delivery order', async () => {
    const { result } = renderHook(() => useCreateDelivery(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        customerId: 'cust-1',
        scheduledDate: '2024-04-01',
        deliveryAddress: '456 Oak Ave',
        items: [{ productId: 'prod-1', quantity: 50 }],
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateDelivery', () => {
  it('should update a delivery order', async () => {
    const { result } = renderHook(() => useUpdateDelivery(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'del-1', notes: 'Updated delivery notes' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateDeliveryStatus', () => {
  it('should update delivery status', async () => {
    const { result } = renderHook(() => useUpdateDeliveryStatus(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'del-1', status: 'IN_TRANSIT', notes: 'Dispatched' } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteDelivery', () => {
  it('should delete a delivery order', async () => {
    const { result } = renderHook(() => useDeleteDelivery(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('del-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
