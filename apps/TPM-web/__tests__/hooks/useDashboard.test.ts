/**
 * useDashboard Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useDashboardStats,
  useKPIData,
  useRecentActivity,
  usePromotionsByStatus,
  useBudgetUtilization,
  useClaimsTrend,
  useSpendTrend,
  useStatusDistribution,
  useTopCustomers,
} from '@/hooks/useDashboard';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useDashboardStats', () => {
  it('should fetch dashboard stats', async () => {
    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useKPIData', () => {
  it('should fetch KPI data with default period', async () => {
    const { result } = renderHook(() => useKPIData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should fetch KPI data with weekly period', async () => {
    const { result } = renderHook(() => useKPIData('weekly'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should fetch KPI data with quarterly period', async () => {
    const { result } = renderHook(() => useKPIData('quarterly'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useRecentActivity', () => {
  it('should fetch recent activity', async () => {
    const { result } = renderHook(() => useRecentActivity(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should accept custom limit', async () => {
    const { result } = renderHook(() => useRecentActivity(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('usePromotionsByStatus', () => {
  it('should fetch promotions by status chart data', async () => {
    const { result } = renderHook(() => usePromotionsByStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useBudgetUtilization', () => {
  it('should fetch budget utilization chart data', async () => {
    const { result } = renderHook(() => useBudgetUtilization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useClaimsTrend', () => {
  it('should fetch claims trend data with default period', async () => {
    const { result } = renderHook(() => useClaimsTrend(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should accept weekly period', async () => {
    const { result } = renderHook(() => useClaimsTrend('weekly'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useSpendTrend', () => {
  it('should fetch spend trend data', async () => {
    const { result } = renderHook(() => useSpendTrend(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useStatusDistribution', () => {
  it('should fetch status distribution data', async () => {
    const { result } = renderHook(() => useStatusDistribution(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useTopCustomers', () => {
  it('should fetch top customers data', async () => {
    const { result } = renderHook(() => useTopCustomers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
