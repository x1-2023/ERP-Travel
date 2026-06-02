/**
 * Scenario Hooks
 * React Query hooks for scenario management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScenarioParameters {
  promotionType: string;
  discountPercent?: number;
  budget: number;
  duration: number;
  targetCustomers: string[];
  targetProducts: string[];
  startDate: string;
  expectedLiftPercent: number;
  redemptionRatePercent: number;
}

export interface ScenarioAssumptions {
  baselineSalesPerDay: number;
  averageOrderValue: number;
  marginPercent: number;
  cannibalizedPercent?: number;
  haloEffectPercent?: number;
}

export interface ScenarioResults {
  baselineSales: number;
  projectedSales: number;
  incrementalSales: number;
  salesLiftPercent: number;
  promotionCost: number;
  fundingRequired: number;
  costPerIncrementalUnit: number;
  grossMargin: number;
  netMargin: number;
  roi: number;
  paybackDays: number;
  projectedUnits: number;
  incrementalUnits: number;
  redemptions: number;
  dailyProjections: DailyProjection[];
}

export interface DailyProjection {
  date: string;
  day: number;
  baselineSales: number;
  projectedSales: number;
  promotionCost: number;
  cumulativeROI: number;
  cumulativeNetMargin: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  baselineId: string | null;
  baseline?: {
    id: string;
    code: string;
    name: string;
  } | null;
  parameters: ScenarioParameters;
  assumptions: ScenarioAssumptions;
  results: ScenarioResults | null;
  createdById: string | null;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    versions: number;
  };
}

export interface ScenarioVersion {
  id: string;
  version: number;
  parameters: ScenarioParameters;
  results: ScenarioResults | null;
  notes: string | null;
  createdAt: string;
  summary?: {
    roi: number;
    netMargin: number;
    salesLiftPercent: number;
    paybackDays: number;
  } | null;
}

export interface ScenarioListParams {
  page?: number;
  limit?: number;
  status?: string;
  baselineId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CompareResult {
  scenarios: Scenario[];
  comparison: {
    metrics: string[];
    values: Record<string, Record<string, number>>;
    winner: Record<string, string>;
    rankings: Record<string, string[]>;
  };
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch scenarios list with filters
 */
export function useScenarios(params: ScenarioListParams = {}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.status) queryString.set('status', params.status);
  if (params.baselineId) queryString.set('baselineId', params.baselineId);
  if (params.search) queryString.set('search', params.search);
  if (params.sortBy) queryString.set('sortBy', params.sortBy);
  if (params.sortOrder) queryString.set('sortOrder', params.sortOrder);

  return useQuery({
    queryKey: ['scenarios', params],
    queryFn: async () => {
      const res = await api.get(`/planning/scenarios?${queryString.toString()}`);
      return res.data as {
        data: Scenario[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
        summary: {
          total: number;
          byStatus: Record<string, number>;
        };
      };
    },
  });
}

/**
 * Fetch single scenario by ID
 */
export function useScenario(id: string | undefined) {
  return useQuery({
    queryKey: ['scenario', id],
    queryFn: async () => {
      const res = await api.get(`/planning/scenarios/${id}`);
      return res.data.data as Scenario & { versions: ScenarioVersion[] };
    },
    enabled: !!id,
  });
}

/**
 * Fetch scenario versions
 */
export function useScenarioVersions(id: string | undefined, page = 1) {
  return useQuery({
    queryKey: ['scenario-versions', id, page],
    queryFn: async () => {
      const res = await api.get(`/planning/scenarios/${id}/versions?page=${page}`);
      return res.data as {
        data: {
          scenario: { id: string; name: string };
          versions: ScenarioVersion[];
        };
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    },
    enabled: !!id,
  });
}

/**
 * Create new scenario
 */
export function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      baselineId?: string;
      parameters: ScenarioParameters;
      assumptions?: Partial<ScenarioAssumptions>;
    }) => {
      const res = await api.post('/planning/scenarios', data);
      return res.data.data as Scenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

/**
 * Update scenario
 */
export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
      parameters?: ScenarioParameters;
      assumptions?: ScenarioAssumptions;
      status?: string;
    }) => {
      const res = await api.put(`/planning/scenarios/${id}`, data);
      return res.data.data as Scenario;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['scenario', variables.id] });
    },
  });
}

/**
 * Delete scenario
 */
export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/planning/scenarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

/**
 * Run scenario simulation
 */
export function useRunScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await api.post(`/planning/scenarios/${id}/run`, { notes });
      return res.data as { data: Scenario; results: ScenarioResults };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['scenario', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['scenario-versions', variables.id] });
    },
  });
}

/**
 * Clone scenario
 */
export function useCloneScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => {
      const res = await api.post(`/planning/scenarios/${id}/clone`, {
        name,
        description,
      });
      return res.data.data as Scenario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}

/**
 * Restore scenario version
 */
export function useRestoreScenarioVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scenarioId,
      versionId,
    }: {
      scenarioId: string;
      versionId: string;
    }) => {
      const res = await api.post(`/planning/scenarios/${scenarioId}/versions`, {
        versionId,
      });
      return res.data.data as Scenario;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      queryClient.invalidateQueries({ queryKey: ['scenario', variables.scenarioId] });
    },
  });
}

/**
 * Compare scenarios
 */
export function useCompareScenarios() {
  return useMutation({
    mutationFn: async (scenarioIds: string[]) => {
      const res = await api.post('/planning/scenarios/compare', { scenarioIds });
      return res.data.data as CompareResult;
    },
  });
}

/**
 * Get comparison data (for pre-selected scenarios)
 */
export function useScenarioComparison(scenarioIds: string[]) {
  return useQuery({
    queryKey: ['scenario-comparison', scenarioIds],
    queryFn: async () => {
      const res = await api.post('/planning/scenarios/compare', { scenarioIds });
      return res.data.data as CompareResult;
    },
    enabled: scenarioIds.length >= 2,
  });
}
