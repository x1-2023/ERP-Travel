/**
 * Funds React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Fund } from '@/types';

// Query keys
export const fundKeys = {
  all: ['funds'] as const,
  lists: () => [...fundKeys.all, 'list'] as const,
  list: (filters: object) => [...fundKeys.lists(), filters] as const,
  details: () => [...fundKeys.all, 'detail'] as const,
  detail: (id: string) => [...fundKeys.details(), id] as const,
};

// Types
interface ListParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  fundType?: string;
  search?: string;
  [key: string]: unknown;
}

interface CreateFundInput {
  code: string;
  name: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  fundType: string;
}

// Hooks
export function useFunds(params: ListParams = {}) {
  return useQuery({
    queryKey: fundKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/funds', { params });
      return response.data;
    },
    select: (response) => ({
      funds: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useFund(id: string) {
  return useQuery({
    queryKey: fundKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/funds/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Fund,
  });
}

export function useCreateFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFundInput) => {
      const response = await api.post('/funds', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundKeys.lists() });
    },
  });
}

export function useUpdateFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateFundInput> }) => {
      const response = await api.patch(`/funds/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fundKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fundKeys.lists() });
    },
  });
}

export function useDeleteFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/funds/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundKeys.lists() });
    },
  });
}

/**
 * Get fund utilization stats
 */
export function useFundUtilization(id: string) {
  return useQuery({
    queryKey: [...fundKeys.detail(id), 'utilization'],
    queryFn: async () => {
      const response = await api.get(`/funds/${id}/utilization`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Dropdown select - no pagination
 */
export function useFundOptions() {
  return useQuery({
    queryKey: [...fundKeys.lists(), 'options'],
    queryFn: async () => {
      const response = await api.get('/funds', {
        params: { pageSize: 1000 }
      });
      return response.data;
    },
    select: (response) =>
      (response.data || []).map((f: Fund) => ({
        value: f.id,
        label: `${f.code} - ${f.name}`,
      })),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
