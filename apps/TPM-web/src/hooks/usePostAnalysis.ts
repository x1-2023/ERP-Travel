/**
 * Post-Promotion Analysis React Query Hooks
 * Pepsi V3: Analysis generation + retrieval
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const analysisKeys = {
  all: ['post-analysis'] as const,
  detail: (promotionId: string) => [...analysisKeys.all, 'detail', promotionId] as const,
  summary: () => [...analysisKeys.all, 'summary'] as const,
  learnings: () => [...analysisKeys.all, 'learnings'] as const,
};

export function usePostAnalysis(promotionId: string) {
  return useQuery({
    queryKey: analysisKeys.detail(promotionId),
    queryFn: async () => {
      const response = await api.get(`/post-analysis/${promotionId}`);
      return response.data;
    },
    enabled: !!promotionId,
    select: (response) => response.data,
  });
}

export function usePostAnalysisSummary() {
  return useQuery({
    queryKey: analysisKeys.summary(),
    queryFn: async () => {
      const response = await api.get('/post-analysis/summary');
      return response.data;
    },
    select: (response) => response.data,
  });
}

export function usePostAnalysisLearnings() {
  return useQuery({
    queryKey: analysisKeys.learnings(),
    queryFn: async () => {
      const response = await api.get('/post-analysis/learnings');
      return response.data;
    },
    select: (response) => response.data,
  });
}

export function useGenerateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotionId: string) => {
      const response = await api.post(`/post-analysis/generate/${promotionId}`);
      return response.data;
    },
    onSuccess: (_, promotionId) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.detail(promotionId) });
      queryClient.invalidateQueries({ queryKey: analysisKeys.summary() });
      queryClient.invalidateQueries({ queryKey: analysisKeys.learnings() });
    },
    onError: (error: any) => {
      console.error('Generate analysis failed:', error);
    },
  });
}

export function useApplyBaseline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analysisId: string) => {
      const response = await api.post(`/post-analysis/${analysisId}/apply-baseline`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.all });
    },
    onError: (error: any) => {
      console.error('Apply baseline failed:', error);
    },
  });
}
