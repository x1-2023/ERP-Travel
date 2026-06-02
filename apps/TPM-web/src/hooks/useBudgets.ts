/**
 * Budget React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types';

export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...budgetKeys.lists(), filters] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
};

interface ListParams {
  page?: number;
  pageSize?: number;
  year?: number;
  status?: string;
  category?: string;
  search?: string;
  [key: string]: unknown;
}

export function useBudgets(params: ListParams = {}) {
  return useQuery({
    queryKey: budgetKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/budgets', { params });
      return response.data;
    },
    select: (response) => ({
      budgets: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/budgets/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Budget,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetInput) => {
      const response = await api.post('/budgets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Create budget failed:', error);
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBudgetInput }) => {
      const response = await api.patch(`/budgets/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update budget failed:', error);
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Delete budget failed:', error);
    },
  });
}

export function useBudgetYears() {
  return useQuery({
    queryKey: [...budgetKeys.all, 'years'],
    queryFn: async () => {
      const response = await api.get('/budgets/years');
      return response.data;
    },
    select: (response) => response.data as number[],
  });
}

// ============================================================
// APPROVAL WORKFLOW HOOKS (Aforza-style)
// ============================================================

export const approvalKeys = {
  all: ['budget-approvals'] as const,
  history: (budgetId: string) => [...approvalKeys.all, 'history', budgetId] as const,
  healthScore: (budgetId: string) => [...approvalKeys.all, 'health-score', budgetId] as const,
  comparison: (budgetId: string) => [...approvalKeys.all, 'comparison', budgetId] as const,
};

/**
 * Submit budget for approval
 */
export function useSubmitBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetId: string) => {
      const response = await api.post(`/budgets/${budgetId}/submit`);
      return response.data;
    },
    onSuccess: (_, budgetId) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budgetId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.history(budgetId) });
    },
    onError: (error: any) => {
      console.error('Submit budget failed:', error);
    },
  });
}

/**
 * Review budget (approve/reject/revision_needed)
 */
export function useReviewBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      budgetId,
      action,
      comments,
    }: {
      budgetId: string;
      action: 'approve' | 'reject' | 'revision_needed';
      comments?: string;
    }) => {
      const response = await api.post(`/budgets/${budgetId}/review`, {
        action,
        comments,
      });
      return response.data;
    },
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budgetId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.history(budgetId) });
    },
    onError: (error: any) => {
      console.error('Review budget failed:', error);
    },
  });
}

/**
 * Get approval history for a budget
 */
export function useApprovalHistory(budgetId: string) {
  return useQuery({
    queryKey: approvalKeys.history(budgetId),
    queryFn: async () => {
      const response = await api.get(`/budgets/${budgetId}/approval-history`);
      return response.data;
    },
    enabled: !!budgetId,
    select: (response) => response.data,
  });
}

/**
 * Get fund health score for a budget (Aforza-style)
 */
export function useFundHealthScore(budgetId: string) {
  return useQuery({
    queryKey: approvalKeys.healthScore(budgetId),
    queryFn: async () => {
      const response = await api.get(`/budgets/${budgetId}/health-score`);
      return response.data;
    },
    enabled: !!budgetId,
    select: (response) => response.data,
  });
}

/**
 * Get budget comparison with previous period (Aforza-style)
 */
export function useBudgetComparison(budgetId: string) {
  return useQuery({
    queryKey: approvalKeys.comparison(budgetId),
    queryFn: async () => {
      const response = await api.get(`/budgets/${budgetId}/comparison`);
      return response.data;
    },
    enabled: !!budgetId,
    select: (response) => response.data,
  });
}

// Types for approval workflow
export interface ApprovalHistoryItem {
  id: string;
  step: number;
  level: number;
  role: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED';
  reviewer: string | null;
  comments: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  duration: number | null;
}

export interface ApprovalWorkflow {
  status: string;
  currentLevel: number;
  requiredLevels: number;
  progress: number;
  levels: Array<{
    level: number;
    role: string;
    status: string;
  }>;
}

export interface ApprovalHistoryResponse {
  budget: {
    id: string;
    code: string;
    name: string;
    totalAmount: number;
  };
  workflow: ApprovalWorkflow;
  timeline: ApprovalHistoryItem[];
  summary: {
    totalSteps: number;
    approved: number;
    pending: number;
    rejected: number;
    avgReviewTimeHours: number | null;
  };
}

export interface HealthScoreResponse {
  budgetId: string;
  healthScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  breakdown: {
    utilization: { score: number; weight: string; rate: number; optimal: string };
    timeliness: { score: number; weight: string; expectedRate: number; actualRate: number };
    roi: { score: number; weight: string; ratio: string; revenue: number; spent: number };
    coverage: { score: number; weight: string; activeAllocations: number; totalAllocations: number };
  };
  alerts: Array<{ type: string; severity: string; message: string }>;
  recommendations: string[];
}

export interface BudgetComparisonResponse {
  current: {
    id: string;
    code: string;
    name: string;
    period: string;
    totalAmount: number;
    spentAmount: number;
    utilization: number;
  };
  previous: {
    id: string;
    code: string;
    name: string;
    period: string;
    totalAmount: number;
    spentAmount: number;
    utilization: number;
  } | null;
  changes: {
    amount: number | null;
    amountPercent: number | null;
    utilization: number | null;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'N/A';
  };
  byRegion: Array<{
    code: string;
    name: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number | null;
  }>;
  trending: Array<{
    period: string;
    totalAmount: number;
    spentAmount: number;
    utilization: number;
  }>;
}
