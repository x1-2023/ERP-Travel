/**
 * Deductions React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DeductionStatus } from '@/types/finance';

// Query keys
export const deductionKeys = {
  all: ['deductions'] as const,
  lists: () => [...deductionKeys.all, 'list'] as const,
  list: (filters: object) => [...deductionKeys.lists(), filters] as const,
  details: () => [...deductionKeys.all, 'detail'] as const,
  detail: (id: string) => [...deductionKeys.details(), id] as const,
  suggestions: (id: string) => [...deductionKeys.all, 'suggestions', id] as const,
};

// Types
interface DeductionListParams {
  page?: number;
  limit?: number;
  status?: DeductionStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface CreateDeductionInput {
  code?: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  reason?: string;
}

interface MatchDeductionInput {
  id: string;
  claimId: string;
}

interface DisputeDeductionInput {
  id: string;
  reason: string;
}

interface ResolveDeductionInput {
  id: string;
  resolution: 'ACCEPT' | 'REJECT' | 'PARTIAL';
  amount?: number;
  notes?: string;
}

// Hooks
export function useDeductions(params: DeductionListParams = {}) {
  return useQuery({
    queryKey: deductionKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/finance/deductions', { params });
      return response.data;
    },
    select: (response) => ({
      deductions: response.data || [],
      pagination: response.pagination,
      summary: response.summary,
    }),
  });
}

export function useDeduction(id: string) {
  return useQuery({
    queryKey: deductionKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/finance/deductions/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data,
  });
}

export function useMatchingSuggestions(id: string) {
  return useQuery({
    queryKey: deductionKeys.suggestions(id),
    queryFn: async () => {
      const response = await api.get(`/finance/deductions/${id}/suggestions`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data || [],
  });
}

export function useCreateDeduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDeductionInput) => {
      const response = await api.post('/finance/deductions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() });
    },
  });
}

export function useUpdateDeduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateDeductionInput> }) => {
      const response = await api.put(`/finance/deductions/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() });
    },
  });
}

export function useDeleteDeduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/finance/deductions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() });
    },
  });
}

export function useMatchDeduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, claimId }: MatchDeductionInput) => {
      const response = await api.post(`/finance/deductions/${id}/match`, { claimId });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deductionKeys.suggestions(id) });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useDisputeDeduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: DisputeDeductionInput) => {
      const response = await api.post(`/finance/deductions/${id}/dispute`, { reason });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() });
    },
  });
}

export function useResolveDeduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, resolution, amount, notes }: ResolveDeductionInput) => {
      const response = await api.post(`/finance/deductions/${id}/resolve`, {
        resolution,
        amount,
        notes,
      });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() });
    },
  });
}

// Phase 6: Convert deduction to claim
export function useConvertDeduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/finance/deductions/${id}/convert`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: deductionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deductionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}
