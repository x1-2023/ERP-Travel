/**
 * BI Hooks Tests
 * Tests for useAnalytics and useReports hooks
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useDashboard,
  useKPIs,
  useTrends,
  useExport,
} from '@/hooks/bi/useAnalytics';
import {
  useReports,
  useReport,
  useCreateReport,
  useUpdateReport,
  useDeleteReport,
  useExecuteReport,
} from '@/hooks/bi/useReports';

// Mock data
const mockDashboard = {
  summary: {
    totalPromotions: 45,
    activePromotions: 12,
    totalBudget: 5000000,
    totalSpend: 3200000,
    avgRoi: 2.8,
  },
  charts: {
    spendByMonth: [
      { month: 'Jan', amount: 500000 },
      { month: 'Feb', amount: 600000 },
    ],
    roiByType: [
      { type: 'DISCOUNT', roi: 3.2 },
      { type: 'REBATE', roi: 2.5 },
    ],
  },
};

const mockKPIs = [
  { id: 'kpi-1', name: 'Total ROI', value: 2.8, target: 3.0, unit: 'x', trend: 'UP' },
  { id: 'kpi-2', name: 'Budget Utilization', value: 64, target: 80, unit: '%', trend: 'UP' },
  { id: 'kpi-3', name: 'Active Promotions', value: 12, target: 15, unit: '', trend: 'STABLE' },
];

const mockTrends = [
  { date: '2024-01', value: 2.1, metric: 'roi' },
  { date: '2024-02', value: 2.3, metric: 'roi' },
  { date: '2024-03', value: 2.8, metric: 'roi' },
];

const mockReport = {
  id: 'report-1',
  name: 'Monthly Performance',
  description: 'Monthly promotion performance report',
  type: 'PERFORMANCE',
  query: 'SELECT * FROM promotions',
  schedule: 'MONTHLY',
  isActive: true,
  lastRunAt: '2024-06-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
};

const mockReports = [
  mockReport,
  {
    ...mockReport,
    id: 'report-2',
    name: 'ROI Analysis',
    type: 'ANALYTICS',
    schedule: 'WEEKLY',
  },
];

// Server setup
const server = setupServer(
  // Dashboard
  http.get('*/bi/analytics/dashboard', () => {
    return HttpResponse.json(mockDashboard);
  }),

  // KPIs
  http.get('*/bi/analytics/kpis', () => {
    return HttpResponse.json({ data: mockKPIs });
  }),

  // Trends
  http.get('*/bi/analytics/trends', () => {
    return HttpResponse.json({ data: mockTrends });
  }),

  // Export
  http.post('*/bi/export', () => {
    return HttpResponse.json({
      success: true,
      url: 'https://example.com/export/file.xlsx',
      filename: 'export-123.xlsx',
    });
  }),

  // Reports list
  http.get('*/bi/reports', () => {
    return HttpResponse.json({
      data: mockReports,
      pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
      categories: ['PERFORMANCE', 'ANALYTICS'],
    });
  }),

  // Single report
  http.get('*/bi/reports/:id/execute', () => {
    return HttpResponse.json({
      data: [
        { promotion: 'Summer Sale', roi: 3.2, spend: 100000 },
        { promotion: 'Winter Campaign', roi: 2.1, spend: 80000 },
      ],
      columns: ['promotion', 'roi', 'spend'],
    });
  }),

  http.get('*/bi/reports/:id', () => {
    return HttpResponse.json({ data: mockReport });
  }),

  // Create report
  http.post('*/bi/reports', () => {
    return HttpResponse.json({
      data: { ...mockReport, id: 'report-new' },
    });
  }),

  // Update report
  http.put('*/bi/reports/:id', () => {
    return HttpResponse.json({
      data: { ...mockReport, name: 'Updated Report' },
    });
  }),

  // Delete report
  http.delete('*/bi/reports/:id', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================================================
// useDashboard
// ============================================================================
describe('useDashboard', () => {
  it('should fetch dashboard data', async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.summary.totalPromotions).toBe(45);
    expect(result.current.data?.summary.activePromotions).toBe(12);
  });

  it('should fetch with date parameters', async () => {
    const { result } = renderHook(
      () => useDashboard({ dateFrom: '2024-01-01', dateTo: '2024-06-30' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

// ============================================================================
// useKPIs
// ============================================================================
describe('useKPIs', () => {
  it('should fetch KPIs', async () => {
    const { result } = renderHook(() => useKPIs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(3);
    expect(result.current.data?.data[0].name).toBe('Total ROI');
  });

  it('should fetch KPIs with date range', async () => {
    const { result } = renderHook(
      () => useKPIs({ dateFrom: '2024-01-01', dateTo: '2024-06-30' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

// ============================================================================
// useTrends
// ============================================================================
describe('useTrends', () => {
  it('should fetch trend data', async () => {
    const { result } = renderHook(() => useTrends(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(3);
    expect(result.current.data?.data[0].metric).toBe('roi');
  });

  it('should fetch with metric parameter', async () => {
    const { result } = renderHook(
      () => useTrends({ metric: 'roi' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

// ============================================================================
// useExport
// ============================================================================
describe('useExport', () => {
  it('should provide a mutate function', () => {
    const { result } = renderHook(
      () => useExport(),
      { wrapper: createWrapper() }
    );

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isIdle).toBe(true);
  });

  it('should call the export endpoint', async () => {
    const { result } = renderHook(
      () => useExport(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        format: 'JSON',
        reportId: 'report-1',
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useReports
// ============================================================================
describe('useReports', () => {
  it('should fetch reports list', async () => {
    const { result } = renderHook(() => useReports(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.data[0].name).toBe('Monthly Performance');
  });

  it('should fetch with type filter', async () => {
    const { result } = renderHook(
      () => useReports({ type: 'PERFORMANCE' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });

  it('should include categories in response', async () => {
    const { result } = renderHook(() => useReports(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.categories).toContain('PERFORMANCE');
    expect(result.current.data?.categories).toContain('ANALYTICS');
  });
});

// ============================================================================
// useReport
// ============================================================================
describe('useReport', () => {
  it('should fetch a single report', async () => {
    const { result } = renderHook(
      () => useReport('report-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.name).toBe('Monthly Performance');
    expect(result.current.data?.data.type).toBe('PERFORMANCE');
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(
      () => useReport(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ============================================================================
// useCreateReport
// ============================================================================
describe('useCreateReport', () => {
  it('should provide a mutate function', () => {
    const { result } = renderHook(
      () => useCreateReport(),
      { wrapper: createWrapper() }
    );

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isIdle).toBe(true);
  });

  it('should call the create endpoint', async () => {
    const { result } = renderHook(
      () => useCreateReport(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        name: 'New Report',
        type: 'PERFORMANCE',
        query: 'SELECT * FROM promotions',
      } as any);
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useUpdateReport
// ============================================================================
describe('useUpdateReport', () => {
  it('should update a report', async () => {
    const { result } = renderHook(
      () => useUpdateReport(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        id: 'report-1',
        data: { name: 'Updated Report' } as any,
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useDeleteReport
// ============================================================================
describe('useDeleteReport', () => {
  it('should delete a report', async () => {
    const { result } = renderHook(
      () => useDeleteReport(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate('report-1');
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});

// ============================================================================
// useExecuteReport
// ============================================================================
describe('useExecuteReport', () => {
  it('should execute a report', async () => {
    const { result } = renderHook(
      () => useExecuteReport(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        id: 'report-1',
        params: { format: 'JSON' },
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });

  it('should execute with date range', async () => {
    const { result } = renderHook(
      () => useExecuteReport(),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.mutate({
        id: 'report-1',
        params: {
          format: 'JSON',
          dateRange: { from: '2024-01-01', to: '2024-06-30' },
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isIdle).toBe(false);
    });
  });
});
