/**
 * AI Insights Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  AIInsight,
  InsightListParams,
  InsightListResponse,
  GenerateInsightsRequest,
  TakeActionRequest,
} from '@/types/advanced';

// List insights
export function useInsights(params?: InsightListParams) {
  return useQuery({
    queryKey: ['ai-insights', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.set('type', params.type);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.severity) searchParams.set('severity', params.severity);
      if (params?.actionRequired !== undefined) {
        searchParams.set('actionRequired', String(params.actionRequired));
      }
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

      const res = await api.get(`/ai/insights?${searchParams.toString()}`);
      return res.data as InsightListResponse;
    },
  });
}

// Get single insight
export function useInsight(id: string) {
  return useQuery({
    queryKey: ['ai-insight', id],
    queryFn: async () => {
      const res = await api.get(`/ai/insights/${id}`);
      return res.data as {
        data: AIInsight & {
          relatedEntity?: unknown;
          suggestedActions: string[];
        };
      };
    },
    enabled: !!id,
  });
}

// Generate insights
export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateInsightsRequest) => {
      const res = await api.post('/ai/insights/generate', data);
      return res.data as { generated: number; insights: AIInsight[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
  });
}

// Dismiss insight
export function useDismissInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/ai/insights/${id}/dismiss`);
      return res.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insight', id] });
    },
  });
}

// Take action on insight
export function useTakeInsightAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TakeActionRequest }) => {
      const res = await api.post(`/ai/insights/${id}/action`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insight', id] });
    },
  });
}
