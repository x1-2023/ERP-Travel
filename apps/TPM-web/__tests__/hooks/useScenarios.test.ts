/**
 * useScenarios Hook Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createWrapper } from '../test-utils';
import {
  useScenarios,
  useScenario,
  useScenarioVersions,
  useCreateScenario,
  useUpdateScenario,
  useDeleteScenario,
  useRunScenario,
  useCloneScenario,
  useRestoreScenarioVersion,
  useCompareScenarios,
  useScenarioComparison,
} from '@/hooks/planning/useScenarios';

// Mock data
const mockScenario = {
  id: 'sc-1',
  name: 'Scenario A',
  description: 'Test scenario',
  status: 'DRAFT',
  baselineId: null,
  parameters: {
    promotionType: 'DISCOUNT',
    discountPercent: 15,
    budget: 100000000,
    duration: 30,
    targetCustomers: ['cust-1'],
    targetProducts: ['prod-1'],
    startDate: '2024-04-01',
    expectedLiftPercent: 20,
    redemptionRatePercent: 60,
  },
  assumptions: {
    baselineSalesPerDay: 5000000,
    averageOrderValue: 200000,
    marginPercent: 35,
  },
  results: null,
  createdById: 'user-1',
  createdAt: '2024-03-01',
  updatedAt: '2024-03-01',
  _count: { versions: 0 },
};

const mockScenarioWithResults = {
  ...mockScenario,
  id: 'sc-2',
  name: 'Scenario B',
  status: 'COMPLETED',
  results: {
    baselineSales: 150000000,
    projectedSales: 180000000,
    incrementalSales: 30000000,
    salesLiftPercent: 20,
    promotionCost: 15000000,
    fundingRequired: 15000000,
    costPerIncrementalUnit: 50000,
    grossMargin: 63000000,
    netMargin: 48000000,
    roi: 220,
    paybackDays: 14,
    projectedUnits: 900,
    incrementalUnits: 150,
    redemptions: 540,
    dailyProjections: [],
  },
};

const mockScenarios = [mockScenario, mockScenarioWithResults];

const mockVersions = [
  {
    id: 'ver-1',
    version: 1,
    parameters: mockScenario.parameters,
    results: null,
    notes: 'Initial version',
    createdAt: '2024-03-01',
    summary: null,
  },
];

const mockCompareResult = {
  scenarios: mockScenarios,
  comparison: {
    metrics: ['roi', 'netMargin', 'salesLiftPercent'],
    values: { 'sc-1': { roi: 0, netMargin: 0, salesLiftPercent: 0 }, 'sc-2': { roi: 220, netMargin: 48000000, salesLiftPercent: 20 } },
    winner: { roi: 'sc-2', netMargin: 'sc-2', salesLiftPercent: 'sc-2' },
    rankings: { roi: ['sc-2', 'sc-1'] },
  },
  recommendation: 'Scenario B performs better across all metrics.',
};

// MSW server
const server = setupServer(
  http.get('*/api/planning/scenarios/:id/versions', () => {
    return HttpResponse.json({
      data: { scenario: { id: 'sc-1', name: 'Scenario A' }, versions: mockVersions },
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  }),

  http.get('*/api/planning/scenarios/:id', () => {
    return HttpResponse.json({ data: { ...mockScenario, versions: mockVersions } });
  }),

  http.get('*/api/planning/scenarios', () => {
    return HttpResponse.json({
      data: mockScenarios,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      summary: { total: 2, byStatus: { DRAFT: 1, COMPLETED: 1 } },
    });
  }),

  http.post('*/api/planning/scenarios/compare', () => {
    return HttpResponse.json({ data: mockCompareResult });
  }),

  http.post('*/api/planning/scenarios/:id/run', () => {
    return HttpResponse.json({
      data: mockScenarioWithResults,
      results: mockScenarioWithResults.results,
    });
  }),

  http.post('*/api/planning/scenarios/:id/clone', () => {
    return HttpResponse.json({
      data: { ...mockScenario, id: 'sc-clone', name: 'Scenario A (Copy)' },
    });
  }),

  http.post('*/api/planning/scenarios/:id/versions', () => {
    return HttpResponse.json({ data: mockScenario });
  }),

  http.post('*/api/planning/scenarios', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockScenario, ...(body as object), id: 'sc-new' } });
  }),

  http.put('*/api/planning/scenarios/:id', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: { ...mockScenario, ...(body as object) } });
  }),

  http.delete('*/api/planning/scenarios/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useScenarios', () => {
  it('should fetch scenarios list', async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.summary).toBeDefined();
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch with status filter', async () => {
    const { result } = renderHook(() => useScenarios({ status: 'DRAFT' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });

  it('should fetch with search filter', async () => {
    const { result } = renderHook(() => useScenarios({ search: 'Scenario' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useScenario', () => {
  it('should fetch single scenario', async () => {
    const { result } = renderHook(() => useScenario('sc-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Scenario A');
    expect(result.current.data?.versions).toBeDefined();
  });

  it('should not fetch when ID is undefined', async () => {
    const { result } = renderHook(() => useScenario(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useScenarioVersions', () => {
  it('should fetch scenario versions', async () => {
    const { result } = renderHook(() => useScenarioVersions('sc-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data.versions).toHaveLength(1);
  });

  it('should not fetch when ID is undefined', async () => {
    const { result } = renderHook(() => useScenarioVersions(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateScenario', () => {
  it('should create a scenario', async () => {
    const { result } = renderHook(() => useCreateScenario(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        name: 'New Scenario',
        parameters: {
          promotionType: 'DISCOUNT',
          budget: 50000000,
          duration: 14,
          targetCustomers: ['cust-1'],
          targetProducts: ['prod-1'],
          startDate: '2024-05-01',
          expectedLiftPercent: 15,
          redemptionRatePercent: 50,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateScenario', () => {
  it('should update a scenario', async () => {
    const { result } = renderHook(() => useUpdateScenario(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'sc-1', name: 'Updated Scenario Name' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteScenario', () => {
  it('should delete a scenario', async () => {
    const { result } = renderHook(() => useDeleteScenario(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate('sc-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useRunScenario', () => {
  it('should run scenario simulation', async () => {
    const { result } = renderHook(() => useRunScenario(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'sc-1', notes: 'First run' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.results).toBeDefined();
    expect(result.current.data?.results.roi).toBe(220);
  });
});

describe('useCloneScenario', () => {
  it('should clone a scenario', async () => {
    const { result } = renderHook(() => useCloneScenario(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'sc-1', name: 'Scenario A (Copy)' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useRestoreScenarioVersion', () => {
  it('should restore a scenario version', async () => {
    const { result } = renderHook(() => useRestoreScenarioVersion(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ scenarioId: 'sc-1', versionId: 'ver-1' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useCompareScenarios', () => {
  it('should compare scenarios (mutation)', async () => {
    const { result } = renderHook(() => useCompareScenarios(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(['sc-1', 'sc-2']);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.comparison).toBeDefined();
    expect(result.current.data?.recommendation).toBeDefined();
  });
});

describe('useScenarioComparison', () => {
  it('should fetch scenario comparison (query)', async () => {
    const { result } = renderHook(() => useScenarioComparison(['sc-1', 'sc-2']), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.comparison).toBeDefined();
  });

  it('should not fetch when less than 2 scenarios', async () => {
    const { result } = renderHook(() => useScenarioComparison(['sc-1']), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});
