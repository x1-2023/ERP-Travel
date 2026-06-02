/**
 * Target React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Target, CreateTargetInput } from '@/types';

export const targetKeys = {
  all: ['targets'] as const,
  lists: () => [...targetKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...targetKeys.lists(), filters] as const,
  detail: (id: string) => [...targetKeys.all, 'detail', id] as const,
};

interface ListParams {
  page?: number;
  pageSize?: number;
  year?: number;
  month?: number;
  targetType?: string;
  status?: string;
  [key: string]: unknown;
}

export function useTargets(params: ListParams = {}) {
  return useQuery({
    queryKey: targetKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/targets', { params });
      return response.data;
    },
    select: (response) => ({
      targets: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useTarget(id: string) {
  return useQuery({
    queryKey: targetKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/targets/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Target,
  });
}

export function useCreateTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTargetInput) => {
      const response = await api.post('/targets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Create target failed:', error);
    },
  });
}

export function useUpdateTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTargetInput> }) => {
      const response = await api.patch(`/targets/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: targetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update target failed:', error);
    },
  });
}

export function useDeleteTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/targets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Delete target failed:', error);
    },
  });
}

// ============================================================
// TARGET PROGRESS HOOKS (Phase 5)
// ============================================================

export const progressKeys = {
  all: ['target-progress'] as const,
  progress: (targetId: string) => [...progressKeys.all, targetId] as const,
  allocation: (targetId: string) => [...progressKeys.all, 'allocation', targetId] as const,
};

// Types for progress response
export interface ProgressByLevel {
  id: string;
  code: string;
  name: string;
  targetValue: number;
  achievedValue: number;
  progress: number;
  status: 'ACHIEVED' | 'GOOD' | 'SLOW' | 'AT_RISK';
}

export interface TargetProgressResponse {
  target: {
    id: string;
    code: string;
    name: string;
    metric: string;
    year: number;
    quarter: number | null;
  };
  overall: {
    totalTarget: number;
    totalAchieved: number;
    progress: number;
    status: 'ACHIEVED' | 'GOOD' | 'SLOW' | 'AT_RISK';
    remaining: number;
  };
  byLevel: {
    regions: ProgressByLevel[];
    provinces: ProgressByLevel[];
    districts: ProgressByLevel[];
  };
  statusBreakdown: {
    achieved: number;
    good: number;
    slow: number;
    atRisk: number;
  };
  topPerformers: Array<{
    id: string;
    code: string;
    name: string;
    level: string;
    progress: number;
  }>;
  underperformers: Array<{
    id: string;
    code: string;
    name: string;
    level: string;
    progress: number;
  }>;
}

export interface AllocationTreeSummary {
  totalTarget: number;
  totalAllocated: number;
  totalAchieved: number;
  unallocated: number;
  overallProgress: number;
}

/**
 * Get target progress summary by geographic level
 */
export function useTargetProgress(targetId: string) {
  return useQuery({
    queryKey: progressKeys.progress(targetId),
    queryFn: async () => {
      const response = await api.get(`/targets/${targetId}/progress`);
      return response.data;
    },
    enabled: !!targetId,
    select: (response) => response.data as TargetProgressResponse,
  });
}

/**
 * Get allocation tree with summary (via nested route)
 */
export function useTargetAllocationTreeWithSummary(targetId: string) {
  return useQuery({
    queryKey: progressKeys.allocation(targetId),
    queryFn: async () => {
      const response = await api.get(`/targets/${targetId}/allocation`);
      return response.data;
    },
    enabled: !!targetId,
    select: (response) => ({
      allocations: response.data,
      summary: response.summary as AllocationTreeSummary,
    }),
  });
}

/**
 * Create allocation under a target (via nested route)
 */
export function useCreateTargetAllocationNested(targetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      geographicUnitId: string;
      parentId?: string;
      targetValue: number;
      metric?: string;
      notes?: string;
    }) => {
      const response = await api.post(`/targets/${targetId}/allocation`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.allocation(targetId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.progress(targetId) });
      queryClient.invalidateQueries({ queryKey: targetKeys.detail(targetId) });
    },
    onError: (error: any) => {
      console.error('Create target allocation failed:', error);
    },
  });
}

/**
 * Update specific allocation (via nested route)
 */
export function useUpdateTargetAllocationNested(targetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      allocId,
      data,
    }: {
      allocId: string;
      data: {
        targetValue?: number;
        notes?: string;
        status?: string;
      };
    }) => {
      const response = await api.put(`/targets/${targetId}/allocation/${allocId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.allocation(targetId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.progress(targetId) });
      queryClient.invalidateQueries({ queryKey: targetKeys.detail(targetId) });
    },
    onError: (error: any) => {
      console.error('Update target allocation failed:', error);
    },
  });
}

/**
 * Delete allocation (via nested route)
 */
export function useDeleteTargetAllocationNested(targetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (allocId: string) => {
      const response = await api.delete(`/targets/${targetId}/allocation/${allocId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.allocation(targetId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.progress(targetId) });
      queryClient.invalidateQueries({ queryKey: targetKeys.detail(targetId) });
    },
    onError: (error: any) => {
      console.error('Delete target allocation failed:', error);
    },
  });
}

/**
 * Update target progress (achieved value) - via target-allocations endpoint
 */
export function useUpdateTargetProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      allocationId,
      achievedValue,
    }: {
      allocationId: string;
      achievedValue: number;
    }) => {
      const response = await api.patch(`/target-allocations/${allocationId}`, {
        achievedValue,
      });
      return response.data;
    },
    onSuccess: (response) => {
      // Invalidate all related queries
      if (response?.data?.targetId) {
        queryClient.invalidateQueries({ queryKey: progressKeys.progress(response.data.targetId) });
        queryClient.invalidateQueries({ queryKey: progressKeys.allocation(response.data.targetId) });
        queryClient.invalidateQueries({ queryKey: targetKeys.detail(response.data.targetId) });
      }
      queryClient.invalidateQueries({ queryKey: ['target-allocations'] });
    },
    onError: (error: any) => {
      console.error('Update target progress failed:', error);
    },
  });
}

// Helper: Get status color class
export function getProgressStatusColor(status: string): string {
  switch (status) {
    case 'ACHIEVED':
      return 'text-green-600 bg-green-100';
    case 'GOOD':
      return 'text-blue-600 bg-blue-100';
    case 'SLOW':
      return 'text-yellow-600 bg-yellow-100';
    case 'AT_RISK':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-muted-foreground bg-muted';
  }
}

// Helper: Get status label in Vietnamese
export function getProgressStatusLabel(status: string): string {
  switch (status) {
    case 'ACHIEVED':
      return 'Đạt mục tiêu';
    case 'GOOD':
      return 'Tốt';
    case 'SLOW':
      return 'Chậm';
    case 'AT_RISK':
      return 'Có rủi ro';
    default:
      return status;
  }
}
