/**
 * TPO Engine React Hooks
 * React Query hooks for TPO API integration
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { tpoApi } from '@/services/tpoApi';
import type {
  ROIPredictionRequest,
  ROIPredictionResponse,
  BudgetOptimizationRequest,
  BudgetOptimizationResponse,
  PromotionSuggestionRequest,
  PromotionSuggestionResponse,
  WhatIfRequest,
  WhatIfResponse,
  MechanicInfo,
  ChannelInfo,
} from '@/types/tpo';

// Health Check Hook
export function useTPOHealth() {
  return useQuery({
    queryKey: ['tpo', 'health'],
    queryFn: () => tpoApi.healthCheck(),
    staleTime: 30000, // 30 seconds
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Mechanics Hook
export function useTPOMechanics() {
  return useQuery({
    queryKey: ['tpo', 'mechanics'],
    queryFn: async () => {
      const response = await tpoApi.getMechanics();
      return response.mechanics;
    },
    staleTime: Infinity, // Static data
  });
}

// Channels Hook
export function useTPOChannels() {
  return useQuery({
    queryKey: ['tpo', 'channels'],
    queryFn: async () => {
      const response = await tpoApi.getChannels();
      return response.channels;
    },
    staleTime: Infinity,
  });
}

// ROI Prediction Hook
export function useROIPrediction() {
  const [result, setResult] = useState<ROIPredictionResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (data: ROIPredictionRequest) => tpoApi.predictROI(data),
    onSuccess: (data) => setResult(data),
  });

  const predict = useCallback(
    (data: ROIPredictionRequest) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return {
    predict,
    result,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      setResult(null);
      mutation.reset();
    },
  };
}

// Budget Optimization Hook
export function useBudgetOptimization() {
  const [result, setResult] = useState<BudgetOptimizationResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (data: BudgetOptimizationRequest) => tpoApi.optimizeBudget(data),
    onSuccess: (data) => setResult(data),
  });

  const optimize = useCallback(
    (data: BudgetOptimizationRequest) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return {
    optimize,
    result,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      setResult(null);
      mutation.reset();
    },
  };
}

// Promotion Suggestions Hook
export function usePromotionSuggestions() {
  const [suggestions, setSuggestions] = useState<PromotionSuggestionResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (data: PromotionSuggestionRequest) => tpoApi.suggestPromotions(data),
    onSuccess: (data) => setSuggestions(data),
  });

  const getSuggestions = useCallback(
    (data: PromotionSuggestionRequest) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return {
    getSuggestions,
    suggestions,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      setSuggestions(null);
      mutation.reset();
    },
  };
}

// What-If Simulation Hook
export function useWhatIfSimulation() {
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (data: WhatIfRequest) => tpoApi.simulateWhatIf(data),
    onSuccess: (data) => setResult(data),
  });

  const simulate = useCallback(
    (data: WhatIfRequest) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return {
    simulate,
    result,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      setResult(null);
      mutation.reset();
    },
  };
}

// Combined TPO Hook (convenience hook)
export function useTPO() {
  const health = useTPOHealth();
  const mechanics = useTPOMechanics();
  const channels = useTPOChannels();
  const roi = useROIPrediction();
  const budget = useBudgetOptimization();
  const suggestions = usePromotionSuggestions();
  const whatIf = useWhatIfSimulation();

  return {
    isConnected: health.isSuccess && health.data?.status === 'healthy',
    isLoading: health.isLoading,
    error: health.error,
    mechanics: mechanics.data || ([] as MechanicInfo[]),
    channels: channels.data || ([] as ChannelInfo[]),
    roi,
    budget,
    suggestions,
    whatIf,
  };
}
