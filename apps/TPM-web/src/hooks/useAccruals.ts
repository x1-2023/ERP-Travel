/**
 * Accruals React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AccrualStatus } from '@/types/finance';

// Query keys
export const accrualKeys = {
  all: ['accruals'] as const,
  lists: () => [...accrualKeys.all, 'list'] as const,
  list: (filters: object) => [...accrualKeys.lists(), filters] as const,
  details: () => [...accrualKeys.all, 'detail'] as const,
  detail: (id: string) => [...accrualKeys.details(), id] as const,
};

// Types
interface AccrualListParams {
  page?: number;
  limit?: number;
  status?: AccrualStatus;
  promotionId?: string;
  period?: string;
}

interface CalculateAccrualsInput {
  period: string;
  method: 'PERCENTAGE' | 'PRO_RATA';
  promotionIds?: string[];
  preview?: boolean;
}

interface PostAccrualInput {
  id: string;
  glAccountDebit: string;
  glAccountCredit: string;
}

interface PostBatchInput {
  accrualIds: string[];
  glAccountDebit: string;
  glAccountCredit: string;
}

interface ReverseAccrualInput {
  id: string;
  reason?: string;
}

// Hooks
export function useAccruals(params: AccrualListParams = {}) {
  return useQuery({
    queryKey: accrualKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/finance/accruals', { params });
      return response.data;
    },
    select: (response) => ({
      accruals: response.data || [],
      pagination: response.pagination,
      summary: response.summary,
    }),
  });
}

export function useAccrual(id: string) {
  return useQuery({
    queryKey: accrualKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/finance/accruals/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data,
  });
}

export function useCalculateAccruals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CalculateAccrualsInput) => {
      const response = await api.post('/finance/accruals/calculate', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accrualKeys.lists() });
    },
  });
}

export function usePreviewAccruals() {
  return useMutation({
    mutationFn: async (data: Omit<CalculateAccrualsInput, 'preview'>) => {
      const response = await api.post('/finance/accruals/calculate', { ...data, preview: true });
      return response.data;
    },
  });
}

export function useUpdateAccrual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { amount?: number; notes?: string } }) => {
      const response = await api.put(`/finance/accruals/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: accrualKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: accrualKeys.lists() });
    },
  });
}

export function useDeleteAccrual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/finance/accruals/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accrualKeys.lists() });
    },
  });
}

export function usePostAccrual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, glAccountDebit, glAccountCredit }: PostAccrualInput) => {
      const response = await api.post(`/finance/accruals/${id}/post`, {
        glAccountDebit,
        glAccountCredit,
      });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: accrualKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: accrualKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
    },
  });
}

export function usePostAccrualBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PostBatchInput) => {
      const response = await api.post('/finance/accruals/post-batch', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accrualKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
    },
  });
}

export function useReverseAccrual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: ReverseAccrualInput) => {
      const response = await api.post(`/finance/accruals/${id}/reverse`, { reason });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: accrualKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: accrualKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
    },
  });
}
