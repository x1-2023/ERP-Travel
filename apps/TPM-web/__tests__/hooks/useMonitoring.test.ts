/**
 * useLiveMonitoring Hook Tests
 * Tests for src/hooks/useLiveMonitoring.ts
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useMonitoringDashboard,
  useLiveMetrics,
  useStorePerformance,
  monitoringKeys,
} from '@/hooks/useLiveMonitoring';
import { createWrapper } from '../test-utils';

// Mock data
const mockDashboardData = {
  activePromotions: 12,
  totalStores: 450,
  avgComplianceRate: 87.5,
  alertCount: 3,
  recentAlerts: [
    { id: 'alert-1', title: 'Low compliance detected', severity: 'WARNING' },
  ],
  topPerformers: [
    { storeId: 'store-1', name: 'Store A', salesUplift: 35 },
  ],
};

const mockLiveMetrics = {
  promotionId: 'promo-1',
  currentSales: 15000000,
  targetSales: 20000000,
  upliftPercent: 22.5,
  redemptionRate: 0.68,
  storeCount: 120,
  lastUpdated: '2024-02-01T12:00:00Z',
  hourlyTrend: [
    { hour: '08:00', sales: 500000 },
    { hour: '09:00', sales: 750000 },
  ],
};

const mockStorePerformance = [
  {
    storeId: 'store-1',
    name: 'ABC Mart',
    region: 'North',
    sales: 5000000,
    target: 6000000,
    compliance: 92,
    rank: 1,
  },
  {
    storeId: 'store-2',
    name: 'XYZ Shop',
    region: 'South',
    sales: 3000000,
    target: 4000000,
    compliance: 78,
    rank: 2,
  },
];

const server = setupServer(
  http.get('*/api/monitoring/dashboard', () => {
    return HttpResponse.json({
      success: true,
      data: mockDashboardData,
    });
  }),

  http.get('*/api/monitoring/live/:promotionId', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { ...mockLiveMetrics, promotionId: params.promotionId },
    });
  }),

  http.get('*/api/monitoring/stores/:promotionId', () => {
    return HttpResponse.json({
      success: true,
      data: mockStorePerformance,
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('monitoringKeys', () => {
  it('should define all query key factory functions', () => {
    expect(monitoringKeys.all).toEqual(['monitoring']);
    expect(monitoringKeys.dashboard()).toEqual(['monitoring', 'dashboard']);
    expect(monitoringKeys.live('promo-1')).toEqual(['monitoring', 'live', 'promo-1']);
    expect(monitoringKeys.stores('promo-1')).toEqual(['monitoring', 'stores', 'promo-1']);
  });

  it('should create unique keys per promotion', () => {
    const key1 = monitoringKeys.live('promo-1');
    const key2 = monitoringKeys.live('promo-2');
    expect(key1).not.toEqual(key2);
  });
});

describe('useMonitoringDashboard', () => {
  it('should fetch monitoring dashboard data', async () => {
    const { result } = renderHook(() => useMonitoringDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDashboardData);
    expect(result.current.data.activePromotions).toBe(12);
    expect(result.current.data.totalStores).toBe(450);
    expect(result.current.data.avgComplianceRate).toBe(87.5);
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('*/api/monitoring/dashboard', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'SERVER_ERROR', message: 'Error' } },
          { status: 500 },
        );
      }),
    );

    const { result } = renderHook(() => useMonitoringDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useLiveMetrics', () => {
  it('should fetch live metrics for a promotion', async () => {
    const { result } = renderHook(() => useLiveMetrics('promo-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data.promotionId).toBe('promo-1');
    expect(result.current.data.currentSales).toBe(15000000);
    expect(result.current.data.upliftPercent).toBe(22.5);
  });

  it('should not fetch when promotionId is empty', () => {
    const { result } = renderHook(() => useLiveMetrics(''), {
      wrapper: createWrapper(),
    });

    // Query should be disabled
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('*/api/monitoring/live/:promotionId', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } },
          { status: 404 },
        );
      }),
    );

    const { result } = renderHook(() => useLiveMetrics('nonexistent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useStorePerformance', () => {
  it('should fetch store performance for a promotion', async () => {
    const { result } = renderHook(() => useStorePerformance('promo-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStorePerformance);
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].storeId).toBe('store-1');
    expect(result.current.data[0].compliance).toBe(92);
  });

  it('should not fetch when promotionId is empty', () => {
    const { result } = renderHook(() => useStorePerformance(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('*/api/monitoring/stores/:promotionId', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Not found' } },
          { status: 404 },
        );
      }),
    );

    const { result } = renderHook(() => useStorePerformance('nonexistent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
