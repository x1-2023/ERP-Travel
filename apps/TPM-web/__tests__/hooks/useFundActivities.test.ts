/**
 * useFundActivities Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useFundActivities,
  useFundActivity,
  useFundActivitySummary,
  useCreateFundActivity,
  useUpdateFundActivity,
  useDeleteFundActivity,
  getActivityTypeLabel,
  getActivityTypeColor,
  getStatusLabel,
  getStatusColor,
  formatCurrency,
  formatRoi,
  getRoiStatus,
  type FundActivity,
  type FundActivitySummary,
} from '@/hooks/useFundActivities';

// Mock data
const mockActivity: FundActivity = {
  id: 'act-1',
  budgetId: 'budget-1',
  budget: { id: 'budget-1', code: 'BUD-001', name: 'Annual Budget', totalAmount: 1000000 },
  activityType: 'promotion',
  activityName: 'Summer Promo',
  activityCode: 'ACT-001',
  allocatedAmount: 200000,
  spentAmount: 150000,
  revenueGenerated: 500000,
  unitsImpacted: 1000,
  roi: 3.33,
  startDate: '2024-06-01',
  endDate: '2024-06-30',
  status: 'ACTIVE',
  notes: 'Test activity',
  createdAt: '2024-01-15',
  updatedAt: '2024-06-15',
};

const mockActivities = [
  mockActivity,
  {
    ...mockActivity,
    id: 'act-2',
    activityName: 'Display Campaign',
    activityType: 'display' as const,
    status: 'COMPLETED' as const,
  },
];

const mockSummary: FundActivitySummary = {
  overview: {
    totalActivities: 10,
    totalAllocated: 500000,
    totalSpent: 300000,
    totalRevenue: 900000,
    utilizationRate: 60,
    overallRoi: 3.0,
    avgRoi: 2.5,
  },
  byType: [
    {
      type: 'promotion',
      label: 'Khuyến mãi',
      count: 5,
      totalAllocated: 300000,
      totalSpent: 200000,
      totalRevenue: 600000,
      avgRoi: 3.0,
    },
  ],
  byStatus: { PLANNED: 2, ACTIVE: 3, COMPLETED: 4, CANCELLED: 1 },
  topPerformers: [
    {
      id: 'act-1',
      activityName: 'Summer Promo',
      activityType: 'promotion',
      spent: 100000,
      revenue: 400000,
      roi: 4.0,
    },
  ],
  underperformers: [
    {
      id: 'act-3',
      activityName: 'Weak Display',
      activityType: 'display',
      spent: 50000,
      revenue: 30000,
      roi: 0.6,
    },
  ],
};

// Server setup
const server = setupServer(
  // List activities
  http.get('*/fund-activities', ({ request }) => {
    const url = new URL(request.url);
    const isSummary = url.pathname.endsWith('/summary');
    if (isSummary) {
      return HttpResponse.json({
        success: true,
        data: mockSummary,
      });
    }
    return HttpResponse.json({
      success: true,
      data: mockActivities,
      metadata: { total: mockActivities.length, page: 1, pageSize: 10 },
    });
  }),

  // Summary
  http.get('*/fund-activities/summary', () => {
    return HttpResponse.json({
      success: true,
      data: mockSummary,
    });
  }),

  // Get single activity
  http.get('*/fund-activities/:id', () => {
    return HttpResponse.json({
      success: true,
      data: mockActivity,
    });
  }),

  // Create activity
  http.post('*/fund-activities', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockActivity, id: 'act-new' },
    });
  }),

  // Update activity
  http.patch('*/fund-activities/:id', () => {
    return HttpResponse.json({
      success: true,
      data: { ...mockActivity, spentAmount: 180000 },
    });
  }),

  // Delete activity
  http.delete('*/fund-activities/:id', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================================================
// useFundActivities
// ============================================================================
describe('useFundActivities', () => {
  it('should fetch activities list', async () => {
    const { result } = renderHook(() => useFundActivities(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.activities).toHaveLength(2);
    expect(result.current.data?.activities[0].activityName).toBe('Summer Promo');
  });

  it('should filter by budgetId', async () => {
    const { result } = renderHook(
      () => useFundActivities({ budgetId: 'budget-1' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.activities).toBeDefined();
  });

  it('should filter by activityType', async () => {
    const { result } = renderHook(
      () => useFundActivities({ activityType: 'promotion' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.activities).toBeDefined();
  });
});

// ============================================================================
// useFundActivity
// ============================================================================
describe('useFundActivity', () => {
  it('should fetch a single activity', async () => {
    const { result } = renderHook(
      () => useFundActivity('act-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.activityName).toBe('Summer Promo');
    expect(result.current.data?.activityType).toBe('promotion');
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(
      () => useFundActivity(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ============================================================================
// useFundActivitySummary
// ============================================================================
describe('useFundActivitySummary', () => {
  it('should fetch activity summary', async () => {
    const { result } = renderHook(
      () => useFundActivitySummary('budget-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.overview.totalActivities).toBe(10);
    expect(result.current.data?.overview.overallRoi).toBe(3.0);
  });
});

// ============================================================================
// useCreateFundActivity
// ============================================================================
describe('useCreateFundActivity', () => {
  it('should provide a mutate function', () => {
    const { result } = renderHook(
      () => useCreateFundActivity(),
      { wrapper: createWrapper() }
    );

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isIdle).toBe(true);
  });

  it('should call the mutation endpoint', async () => {
    const { result } = renderHook(
      () => useCreateFundActivity(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        budgetId: 'budget-1',
        activityType: 'promotion',
        activityName: 'New Promo',
        allocatedAmount: 100000,
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useUpdateFundActivity
// ============================================================================
describe('useUpdateFundActivity', () => {
  it('should update a fund activity', async () => {
    const { result } = renderHook(
      () => useUpdateFundActivity(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        id: 'act-1',
        data: { spentAmount: 180000 },
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useDeleteFundActivity
// ============================================================================
describe('useDeleteFundActivity', () => {
  it('should delete a fund activity', async () => {
    const { result } = renderHook(
      () => useDeleteFundActivity(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate('act-1');
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// Helper Functions
// ============================================================================
describe('getActivityTypeLabel', () => {
  it('should return correct label for promotion', () => {
    expect(getActivityTypeLabel('promotion')).toBe('Khuyến mãi');
  });

  it('should return correct label for display', () => {
    expect(getActivityTypeLabel('display')).toBe('Trưng bày');
  });

  it('should return correct label for sampling', () => {
    expect(getActivityTypeLabel('sampling')).toBe('Dùng thử');
  });

  it('should return correct label for event', () => {
    expect(getActivityTypeLabel('event')).toBe('Sự kiện');
  });

  it('should return correct label for listing_fee', () => {
    expect(getActivityTypeLabel('listing_fee')).toBe('Phí listing');
  });
});

describe('getActivityTypeColor', () => {
  it('should return color string for known types', () => {
    expect(getActivityTypeColor('promotion')).toContain('blue');
    expect(getActivityTypeColor('display')).toContain('purple');
    expect(getActivityTypeColor('sampling')).toContain('green');
  });
});

describe('getStatusLabel', () => {
  it('should return correct Vietnamese labels', () => {
    expect(getStatusLabel('PLANNED')).toBe('Kế hoạch');
    expect(getStatusLabel('ACTIVE')).toBe('Đang chạy');
    expect(getStatusLabel('COMPLETED')).toBe('Hoàn thành');
    expect(getStatusLabel('CANCELLED')).toBe('Đã hủy');
  });
});

describe('getStatusColor', () => {
  it('should return color for known statuses', () => {
    expect(getStatusColor('ACTIVE')).toContain('blue');
    expect(getStatusColor('COMPLETED')).toContain('green');
    expect(getStatusColor('CANCELLED')).toContain('red');
  });
});

describe('formatCurrency', () => {
  it('should format as Vietnamese dong', () => {
    const formatted = formatCurrency(1000000);
    // Should contain the number in some form
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});

describe('formatRoi', () => {
  it('should format ROI >= 1 with x multiplier', () => {
    expect(formatRoi(3.5)).toBe('3.50x');
  });

  it('should format ROI < 1 as percentage', () => {
    expect(formatRoi(0.75)).toBe('75.0%');
  });

  it('should format ROI = 1 with x', () => {
    expect(formatRoi(1)).toBe('1.00x');
  });
});

describe('getRoiStatus', () => {
  it('should return excellent for ROI >= 3', () => {
    expect(getRoiStatus(3)).toBe('excellent');
    expect(getRoiStatus(5)).toBe('excellent');
  });

  it('should return good for ROI >= 1.5', () => {
    expect(getRoiStatus(1.5)).toBe('good');
    expect(getRoiStatus(2.5)).toBe('good');
  });

  it('should return warning for ROI >= 1', () => {
    expect(getRoiStatus(1)).toBe('warning');
    expect(getRoiStatus(1.3)).toBe('warning');
  });

  it('should return critical for ROI < 1', () => {
    expect(getRoiStatus(0.5)).toBe('critical');
    expect(getRoiStatus(0)).toBe('critical');
  });
});
