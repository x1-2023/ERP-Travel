/**
 * Baseline React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Baseline, CreateBaselineInput } from '@/types';

export const baselineKeys = {
  all: ['baselines'] as const,
  lists: () => [...baselineKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...baselineKeys.lists(), filters] as const,
  detail: (id: string) => [...baselineKeys.all, 'detail', id] as const,
};

interface ListParams {
  page?: number;
  pageSize?: number;
  year?: number;
  period?: string;
  baselineType?: string;
  [key: string]: unknown;
}

export function useBaselines(params: ListParams = {}) {
  return useQuery({
    queryKey: baselineKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/baselines', { params });
      return response.data;
    },
    select: (response) => ({
      baselines: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useBaseline(id: string) {
  return useQuery({
    queryKey: baselineKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/baselines/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Baseline,
  });
}

export function useCreateBaseline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBaselineInput) => {
      const response = await api.post('/baselines', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baselineKeys.lists() });
    },
  });
}

export function useUpdateBaseline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBaselineInput> }) => {
      const response = await api.patch(`/baselines/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: baselineKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: baselineKeys.lists() });
    },
  });
}

export function useDeleteBaseline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/baselines/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baselineKeys.lists() });
    },
  });
}
