/**
 * Claims AI React Query Hooks
 * Pepsi V3: AI processing + match results + stats
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const claimsAIKeys = {
  all: ['claims-ai'] as const,
  stats: () => [...claimsAIKeys.all, 'stats'] as const,
  pending: (filters: Record<string, unknown>) => [...claimsAIKeys.all, 'pending', filters] as const,
  match: (claimId: string) => [...claimsAIKeys.all, 'match', claimId] as const,
};

export function useClaimsAIStats() {
  return useQuery({
    queryKey: claimsAIKeys.stats(),
    queryFn: async () => {
      const response = await api.get('/claims-ai/stats');
      return response.data;
    },
    select: (response) => response.data,
  });
}

export function usePendingClaims(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: claimsAIKeys.pending(params),
    queryFn: async () => {
      const response = await api.get('/claims-ai/pending', { params });
      return response.data;
    },
    select: (response) => ({
      claims: response.data || [],
      pagination: response.pagination,
    }),
  });
}

export function useClaimMatch(claimId: string) {
  return useQuery({
    queryKey: claimsAIKeys.match(claimId),
    queryFn: async () => {
      const response = await api.get(`/claims-ai/match/${claimId}`);
      return response.data;
    },
    enabled: !!claimId,
    select: (response) => response.data,
  });
}

export function useProcessClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string) => {
      const response = await api.post('/claims-ai/process', { claimId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsAIKeys.stats() });
      queryClient.invalidateQueries({ queryKey: claimsAIKeys.all });
    },
    onError: (error: any) => {
      console.error('Process claim failed:', error);
    },
  });
}

export function useBatchProcessClaims() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimIds: string[]) => {
      const response = await api.post('/claims-ai/batch-process', { claimIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsAIKeys.stats() });
      queryClient.invalidateQueries({ queryKey: claimsAIKeys.all });
    },
    onError: (error: any) => {
      console.error('Batch process failed:', error);
    },
  });
}
