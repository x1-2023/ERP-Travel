/**
 * Target Allocations React Query Hooks
 * Phase 5: Budget & Target Integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { GeographicUnit } from './useGeographicUnits';

// Types - reuse AllocationStatus from budget allocations
import type { AllocationStatus } from './useBudgetAllocations';
export type TargetMetric = 'CASES' | 'VOLUME_LITERS' | 'REVENUE_VND' | 'UNITS';

export interface TargetAllocation {
  id: string;
  code: string;
  targetId: string;
  target?: {
    id: string;
    code: string;
    name: string;
    totalTarget: number;
    metric: TargetMetric;
    year?: number;
  };
  geographicUnitId: string;
  geographicUnit?: GeographicUnit;
  parentId?: string;
  parent?: TargetAllocation;
  children?: TargetAllocation[];
  targetValue: number;
  achievedValue: number;
  metric: TargetMetric;
  childrenTarget: number;
  progressPercent: number;
  status: AllocationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  _count?: {
    children: number;
  };
}

export interface CreateTargetAllocationInput {
  targetId: string;
  geographicUnitId: string;
  parentId?: string;
  targetValue: number;
  metric?: TargetMetric;
  notes?: string;
}

export interface UpdateTargetAllocationInput {
  targetValue?: number;
  achievedValue?: number;
  notes?: string;
  status?: AllocationStatus;
}

// Query keys
export const targetAllocationKeys = {
  all: ['target-allocations'] as const,
  lists: () => [...targetAllocationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...targetAllocationKeys.lists(), filters] as const,
  tree: (targetId: string) => [...targetAllocationKeys.all, 'tree', targetId] as const,
  details: () => [...targetAllocationKeys.all, 'detail'] as const,
  detail: (id: string) => [...targetAllocationKeys.details(), id] as const,
};

interface ListParams {
  targetId?: string;
  parentId?: string;
  status?: AllocationStatus;
  geographicUnitId?: string;
  [key: string]: unknown;
}

// Hooks
export function useTargetAllocations(params: ListParams = {}) {
  return useQuery({
    queryKey: targetAllocationKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/target-allocations', { params });
      return response.data;
    },
    select: (response) => response.data as TargetAllocation[],
  });
}

export function useTargetAllocationTree(targetId: string) {
  return useQuery({
    queryKey: targetAllocationKeys.tree(targetId),
    queryFn: async () => {
      const response = await api.get('/target-allocations', {
        params: { targetId, tree: 'true' },
      });
      return response.data;
    },
    enabled: !!targetId,
    select: (response) => response.data as TargetAllocation[],
  });
}

export function useTargetAllocation(id: string, includeTree = false) {
  return useQuery({
    queryKey: targetAllocationKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/target-allocations/${id}`, {
        params: includeTree ? { includeTree: 'true' } : {},
      });
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as TargetAllocation,
  });
}

export function useCreateTargetAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTargetAllocationInput) => {
      const response = await api.post('/target-allocations', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: targetAllocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: targetAllocationKeys.tree(variables.targetId) });
      // Also invalidate parent allocation if exists
      if (variables.parentId) {
        queryClient.invalidateQueries({ queryKey: targetAllocationKeys.detail(variables.parentId) });
      }
    },
  });
}

export function useUpdateTargetAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTargetAllocationInput }) => {
      const response = await api.patch(`/target-allocations/${id}`, data);
      return response.data;
    },
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: targetAllocationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: targetAllocationKeys.lists() });
      // Invalidate tree for the target
      if (response?.data?.targetId) {
        queryClient.invalidateQueries({ queryKey: targetAllocationKeys.tree(response.data.targetId) });
      }
    },
  });
}

export function useDeleteTargetAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/target-allocations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetAllocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: targetAllocationKeys.all });
    },
  });
}

// Helper functions
export function getProgressStatus(progressPercent: number): 'success' | 'warning' | 'danger' | 'default' {
  if (progressPercent >= 100) return 'success';
  if (progressPercent >= 75) return 'warning';
  if (progressPercent >= 50) return 'default';
  return 'danger';
}

export function getMetricLabel(metric: TargetMetric): string {
  const labels: Record<TargetMetric, string> = {
    CASES: 'Thùng',
    VOLUME_LITERS: 'Lít',
    REVENUE_VND: 'VND',
    UNITS: 'Đơn vị',
  };
  return labels[metric] || metric;
}

export function formatTargetValue(value: number, metric: TargetMetric): string {
  if (metric === 'REVENUE_VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('vi-VN').format(value);
}

// Flatten allocation tree for table view
export function flattenTargetAllocationTree(
  allocations: TargetAllocation[],
  level = 0
): Array<TargetAllocation & { depth: number }> {
  const result: Array<TargetAllocation & { depth: number }> = [];

  for (const allocation of allocations) {
    result.push({ ...allocation, depth: level });
    if (allocation.children && allocation.children.length > 0) {
      result.push(...flattenTargetAllocationTree(allocation.children, level + 1));
    }
  }

  return result;
}
