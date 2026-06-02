/**
 * useVolumeContracts Hook Tests
 * Tests for src/hooks/useVolumeContracts.ts
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useVolumeContracts,
  useVolumeContract,
  useCreateVolumeContract,
  useUpdateVolumeContract,
  useDeleteVolumeContract,
  useContractProgress,
  useRecordProgress,
  useGapAnalysis,
  useAchieveMilestone,
  useContractDashboard,
  contractKeys,
} from '@/hooks/useVolumeContracts';
import { createWrapper } from '../test-utils';

// Mock data
const mockContracts = [
  {
    id: 'contract-1',
    code: 'VC-2024-001',
    customerId: 'cust-1',
    customerName: 'ABC Corp',
    targetVolume: 100000,
    currentVolume: 65000,
    status: 'ACTIVE',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    rebateRate: 5,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'contract-2',
    code: 'VC-2024-002',
    customerId: 'cust-2',
    customerName: 'XYZ Ltd',
    targetVolume: 50000,
    currentVolume: 20000,
    status: 'ACTIVE',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    rebateRate: 3,
    createdAt: '2024-01-15T00:00:00Z',
  },
];

const mockContractDetail = {
  ...mockContracts[0],
  milestones: [
    { id: 'ms-1', volume: 25000, rebateRate: 3, achieved: true, achievedAt: '2024-03-15' },
    { id: 'ms-2', volume: 50000, rebateRate: 4, achieved: true, achievedAt: '2024-06-01' },
    { id: 'ms-3', volume: 75000, rebateRate: 5, achieved: false },
  ],
  progressHistory: [],
};

const mockProgress = [
  { id: 'prog-1', volume: 15000, date: '2024-01-31', cumulative: 15000 },
  { id: 'prog-2', volume: 20000, date: '2024-02-28', cumulative: 35000 },
  { id: 'prog-3', volume: 30000, date: '2024-03-31', cumulative: 65000 },
];

const mockGapAnalysis = {
  contractId: 'contract-1',
  targetVolume: 100000,
  currentVolume: 65000,
  remainingVolume: 35000,
  completionRate: 65,
  daysRemaining: 180,
  requiredDailyRate: 194.4,
  currentDailyRate: 180,
  projectedEndVolume: 97400,
  onTrack: false,
  gapPercent: -2.6,
  recommendation: 'Slightly below target pace. Consider increasing sell-in efforts.',
};

const mockDashboard = {
  totalContracts: 15,
  activeContracts: 12,
  totalTargetVolume: 500000,
  totalCurrentVolume: 320000,
  avgCompletionRate: 64,
  atRiskContracts: 3,
  upcomingMilestones: 5,
};

const server = setupServer(
  http.get('*/api/contracts/dashboard', () => {
    return HttpResponse.json({
      success: true,
      data: mockDashboard,
    });
  }),

  http.get('*/api/contracts/:id/progress', () => {
    return HttpResponse.json({ success: true, data: mockProgress });
  }),

  http.get('*/api/contracts/:id/gap-analysis', () => {
    return HttpResponse.json({ success: true, data: mockGapAnalysis });
  }),

  http.get('*/api/contracts/:id', ({ params }) => {
    if (params.id === 'contract-1') {
      return HttpResponse.json({ success: true, data: mockContractDetail });
    }
    return HttpResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Contract not found' } },
      { status: 404 },
    );
  }),

  http.get('*/api/contracts', () => {
    return HttpResponse.json({
      success: true,
      data: mockContracts,
      pagination: { page: 1, pageSize: 10, totalCount: 2, totalPages: 1 },
    });
  }),

  http.post('*/api/contracts/:contractId/milestones/:milestoneId/achieve', () => {
    return HttpResponse.json({
      success: true,
      data: { achieved: true, achievedAt: new Date().toISOString() },
    });
  }),

  http.post('*/api/contracts/:id/progress', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: 'prog-new', ...body },
    });
  }),

  http.post('*/api/contracts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        success: true,
        data: { id: 'contract-new', ...body, status: 'DRAFT', createdAt: new Date().toISOString() },
      },
      { status: 201 },
    );
  }),

  http.put('*/api/contracts/:id', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: params.id, ...body, updatedAt: new Date().toISOString() },
    });
  }),

  http.delete('*/api/contracts/:id', () => {
    return HttpResponse.json({ success: true });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('contractKeys', () => {
  it('should define all query key factory functions', () => {
    expect(contractKeys.all).toEqual(['contracts']);
    expect(contractKeys.lists()).toEqual(['contracts', 'list']);
    expect(contractKeys.list({ status: 'ACTIVE' })).toEqual(['contracts', 'list', { status: 'ACTIVE' }]);
    expect(contractKeys.details()).toEqual(['contracts', 'detail']);
    expect(contractKeys.detail('c1')).toEqual(['contracts', 'detail', 'c1']);
    expect(contractKeys.progress('c1')).toEqual(['contracts', 'progress', 'c1']);
    expect(contractKeys.gapAnalysis('c1')).toEqual(['contracts', 'gap-analysis', 'c1']);
    expect(contractKeys.dashboard()).toEqual(['contracts', 'dashboard']);
  });
});

describe('useVolumeContracts', () => {
  it('should fetch contracts list', async () => {
    const { result } = renderHook(() => useVolumeContracts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data!.contracts).toHaveLength(2);
    expect(result.current.data!.contracts[0].id).toBe('contract-1');
  });

  it('should pass params to API', async () => {
    const { result } = renderHook(
      () => useVolumeContracts({ status: 'ACTIVE', page: 1 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useVolumeContract', () => {
  it('should fetch a single contract', async () => {
    const { result } = renderHook(() => useVolumeContract('contract-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockContractDetail);
    expect(result.current.data.milestones).toHaveLength(3);
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useVolumeContract(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should handle not found errors', async () => {
    const { result } = renderHook(() => useVolumeContract('nonexistent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useCreateVolumeContract', () => {
  it('should create a new contract', async () => {
    const { result } = renderHook(() => useCreateVolumeContract(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        customerId: 'cust-1',
        targetVolume: 100000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateVolumeContract', () => {
  it('should update an existing contract', async () => {
    const { result } = renderHook(() => useUpdateVolumeContract(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: 'contract-1',
        data: { targetVolume: 120000 },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteVolumeContract', () => {
  it('should delete a contract', async () => {
    const { result } = renderHook(() => useDeleteVolumeContract(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('contract-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useContractProgress', () => {
  it('should fetch progress for a contract', async () => {
    const { result } = renderHook(() => useContractProgress('contract-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProgress);
    expect(result.current.data).toHaveLength(3);
    expect(result.current.data[2].cumulative).toBe(65000);
  });

  it('should not fetch when contractId is empty', () => {
    const { result } = renderHook(() => useContractProgress(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useRecordProgress', () => {
  it('should record new progress', async () => {
    const { result } = renderHook(() => useRecordProgress(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        contractId: 'contract-1',
        data: { volume: 10000, date: '2024-04-30' },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useGapAnalysis', () => {
  it('should fetch gap analysis for a contract', async () => {
    const { result } = renderHook(() => useGapAnalysis('contract-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockGapAnalysis);
    expect(result.current.data.completionRate).toBe(65);
    expect(result.current.data.onTrack).toBe(false);
    expect(result.current.data.gapPercent).toBe(-2.6);
  });

  it('should not fetch when contractId is empty', () => {
    const { result } = renderHook(() => useGapAnalysis(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useAchieveMilestone', () => {
  it('should achieve a milestone', async () => {
    const { result } = renderHook(() => useAchieveMilestone(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        contractId: 'contract-1',
        milestoneId: 'ms-3',
        achievedVolume: 75000,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle achievement errors', async () => {
    server.use(
      http.post('*/api/contracts/:contractId/milestones/:milestoneId/achieve', () => {
        return HttpResponse.json(
          { success: false, error: { code: 'INVALID', message: 'Volume threshold not met' } },
          { status: 400 },
        );
      }),
    );

    const { result } = renderHook(() => useAchieveMilestone(), {
      wrapper: createWrapper(),
    });

    try {
      await act(async () => {
        await result.current.mutateAsync({
          contractId: 'contract-1',
          milestoneId: 'ms-3',
          achievedVolume: 50000,
        });
      });
    } catch {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useContractDashboard', () => {
  it('should fetch contract dashboard data', async () => {
    const { result } = renderHook(() => useContractDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDashboard);
    expect(result.current.data.totalContracts).toBe(15);
    expect(result.current.data.activeContracts).toBe(12);
    expect(result.current.data.atRiskContracts).toBe(3);
  });
});
