/**
 * Promo Suggestions React Query Hooks
 * Pepsi V3: AI suggestion list / approve / reject / apply
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const suggestionKeys = {
  all: ['promo-suggestions'] as const,
  lists: () => [...suggestionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...suggestionKeys.lists(), filters] as const,
  details: () => [...suggestionKeys.all, 'detail'] as const,
  detail: (id: string) => [...suggestionKeys.details(), id] as const,
  contract: (contractId: string) => [...suggestionKeys.all, 'contract', contractId] as const,
};

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  customerId?: string;
  [key: string]: unknown;
}

export function usePromoSuggestions(params: ListParams = {}) {
  return useQuery({
    queryKey: suggestionKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/promo-suggestions', { params });
      return response.data;
    },
    select: (response) => ({
      suggestions: response.data || [],
      pagination: response.pagination,
    }),
  });
}

export function usePromoSuggestion(id: string) {
  return useQuery({
    queryKey: suggestionKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/promo-suggestions/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data,
  });
}

export function useContractSuggestions(contractId: string) {
  return useQuery({
    queryKey: suggestionKeys.contract(contractId),
    queryFn: async () => {
      const response = await api.get(`/promo-suggestions/contract/${contractId}`);
      return response.data;
    },
    enabled: !!contractId,
    select: (response) => response.data || [],
  });
}

export function useGenerateSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { customerId?: string; contractId?: string; type?: string }) => {
      const response = await api.post('/promo-suggestions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Generate suggestion failed:', error);
    },
  });
}

export function useApproveSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await api.put(`/promo-suggestions/${id}/approve`, { notes });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Approve suggestion failed:', error);
    },
  });
}

export function useRejectSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await api.put(`/promo-suggestions/${id}/reject`, { notes });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Reject suggestion failed:', error);
    },
  });
}

export function useApplySuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/promo-suggestions/${id}/apply`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suggestionKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Apply suggestion failed:', error);
    },
  });
}
