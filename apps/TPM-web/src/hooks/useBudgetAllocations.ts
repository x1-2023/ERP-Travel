/**
 * Budget Allocations React Query Hooks
 * Phase 5: Budget & Target Integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { GeographicUnit } from './useGeographicUnits';

// Types
export type AllocationStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'LOCKED';

export interface BudgetAllocation {
  id: string;
  code: string;
  budgetId: string;
  budget?: {
    id: string;
    code: string;
    name: string;
    totalAmount: number;
    year?: number;
  };
  geographicUnitId: string;
  geographicUnit?: GeographicUnit;
  parentId?: string;
  parent?: BudgetAllocation;
  children?: BudgetAllocation[];
  allocatedAmount: number;
  spentAmount: number;
  childrenAllocated: number;
  availableToAllocate: number;
  status: AllocationStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  _count?: {
    children: number;
  };
}

export interface CreateBudgetAllocationInput {
  budgetId: string;
  geographicUnitId: string;
  parentId?: string;
  allocatedAmount: number;
  notes?: string;
}

export interface UpdateBudgetAllocationInput {
  allocatedAmount?: number;
  notes?: string;
  status?: AllocationStatus;
}

// Query keys
export const budgetAllocationKeys = {
  all: ['budget-allocations'] as const,
  lists: () => [...budgetAllocationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...budgetAllocationKeys.lists(), filters] as const,
  tree: (budgetId: string) => [...budgetAllocationKeys.all, 'tree', budgetId] as const,
  details: () => [...budgetAllocationKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetAllocationKeys.details(), id] as const,
};

interface ListParams {
  budgetId?: string;
  parentId?: string;
  status?: AllocationStatus;
  geographicUnitId?: string;
  [key: string]: unknown;
}

// Hooks
export function useBudgetAllocations(params: ListParams = {}) {
  return useQuery({
    queryKey: budgetAllocationKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/budget-allocations', { params });
      return response.data;
    },
    select: (response) => response.data as BudgetAllocation[],
  });
}

export function useBudgetAllocationTree(budgetId: string) {
  return useQuery({
    queryKey: budgetAllocationKeys.tree(budgetId),
    queryFn: async () => {
      const response = await api.get('/budget-allocations', {
        params: { budgetId, tree: 'true' },
      });
      return response.data;
    },
    enabled: !!budgetId,
    select: (response) => response.data as BudgetAllocation[],
  });
}

export function useBudgetAllocation(id: string, includeTree = false) {
  return useQuery({
    queryKey: budgetAllocationKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/budget-allocations/${id}`, {
        params: includeTree ? { includeTree: 'true' } : {},
      });
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as BudgetAllocation,
  });
}

export function useCreateBudgetAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetAllocationInput) => {
      const response = await api.post('/budget-allocations', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.tree(variables.budgetId) });
      // Also invalidate parent allocation if exists
      if (variables.parentId) {
        queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.detail(variables.parentId) });
      }
    },
  });
}

export function useUpdateBudgetAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBudgetAllocationInput }) => {
      const response = await api.patch(`/budget-allocations/${id}`, data);
      return response.data;
    },
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.lists() });
      // Invalidate tree for the budget
      if (response?.data?.budgetId) {
        queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.tree(response.data.budgetId) });
      }
    },
  });
}

export function useDeleteBudgetAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/budget-allocations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: budgetAllocationKeys.all });
    },
  });
}

// Helper functions
export function calculateAllocationProgress(allocation: BudgetAllocation): number {
  if (allocation.allocatedAmount <= 0) return 0;
  return (allocation.spentAmount / allocation.allocatedAmount) * 100;
}

export function calculateAllocationUtilization(allocation: BudgetAllocation): number {
  if (allocation.allocatedAmount <= 0) return 0;
  return (allocation.childrenAllocated / allocation.allocatedAmount) * 100;
}

// Flatten allocation tree for table view
export function flattenAllocationTree(
  allocations: BudgetAllocation[],
  level = 0
): Array<BudgetAllocation & { depth: number }> {
  const result: Array<BudgetAllocation & { depth: number }> = [];

  for (const allocation of allocations) {
    result.push({ ...allocation, depth: level });
    if (allocation.children && allocation.children.length > 0) {
      result.push(...flattenAllocationTree(allocation.children, level + 1));
    }
  }

  return result;
}
