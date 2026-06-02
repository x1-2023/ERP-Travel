/**
 * AI Recommendations Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  AIRecommendation,
  RecommendationListParams,
  RecommendationListResponse,
  GenerateRecommendationsRequest,
  RejectRecommendationRequest,
  PredictRequest,
  PredictResponse,
} from '@/types/advanced';

// List recommendations
export function useRecommendations(params?: RecommendationListParams) {
  return useQuery({
    queryKey: ['ai-recommendations', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.set('type', params.type);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.entityType) searchParams.set('entityType', params.entityType);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

      const res = await api.get(`/ai/recommendations?${searchParams.toString()}`);
      return res.data as RecommendationListResponse;
    },
  });
}

// Get single recommendation
export function useRecommendation(id: string) {
  return useQuery({
    queryKey: ['ai-recommendation', id],
    queryFn: async () => {
      const res = await api.get(`/ai/recommendations/${id}`);
      return res.data as { data: AIRecommendation };
    },
    enabled: !!id,
  });
}

// Generate recommendations
export function useGenerateRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateRecommendationsRequest) => {
      const res = await api.post('/ai/recommendations/generate', data);
      return res.data as { generated: number; recommendations: AIRecommendation[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    },
  });
}

// Accept recommendation
export function useAcceptRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/ai/recommendations/${id}/accept`);
      return res.data as { data: AIRecommendation };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendation', id] });
    },
  });
}

// Reject recommendation
export function useRejectRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RejectRecommendationRequest }) => {
      const res = await api.post(`/ai/recommendations/${id}/reject`, data);
      return res.data as { data: AIRecommendation };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendation', id] });
    },
  });
}

// Predict (ROI, Sales, Redemption)
export function usePrediction() {
  return useMutation({
    mutationFn: async (data: PredictRequest) => {
      const res = await api.post('/ai/predict', data);
      return res.data as { data: PredictResponse };
    },
  });
}
