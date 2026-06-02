/**
 * Volume Contracts React Query Hooks
 * Pepsi V3: Contract CRUD + progress + gap analysis
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Query keys
export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...contractKeys.lists(), filters] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
  progress: (id: string) => [...contractKeys.all, 'progress', id] as const,
  gapAnalysis: (id: string) => [...contractKeys.all, 'gap-analysis', id] as const,
  dashboard: () => [...contractKeys.all, 'dashboard'] as const,
};

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  search?: string;
  [key: string]: unknown;
}

export function useVolumeContracts(params: ListParams = {}) {
  return useQuery({
    queryKey: contractKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/contracts', { params });
      return response.data;
    },
    select: (response) => ({
      contracts: response.data || [],
      pagination: response.pagination,
    }),
  });
}

export function useVolumeContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/contracts/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data,
  });
}

export function useCreateVolumeContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await api.post('/contracts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractKeys.dashboard() });
    },
    onError: (error: any) => {
      console.error('Create contract failed:', error);
    },
  });
}

export function useUpdateVolumeContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await api.put(`/contracts/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractKeys.dashboard() });
    },
    onError: (error: any) => {
      console.error('Update contract failed:', error);
    },
  });
}

export function useDeleteVolumeContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/contracts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractKeys.dashboard() });
    },
    onError: (error: any) => {
      console.error('Delete contract failed:', error);
    },
  });
}

export function useContractProgress(contractId: string) {
  return useQuery({
    queryKey: contractKeys.progress(contractId),
    queryFn: async () => {
      const response = await api.get(`/contracts/${contractId}/progress`);
      return response.data;
    },
    enabled: !!contractId,
    select: (response) => response.data || [],
  });
}

export function useRecordProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contractId, data }: { contractId: string; data: Record<string, unknown> }) => {
      const response = await api.post(`/contracts/${contractId}/progress`, data);
      return response.data;
    },
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.progress(contractId) });
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(contractId) });
      queryClient.invalidateQueries({ queryKey: contractKeys.gapAnalysis(contractId) });
      queryClient.invalidateQueries({ queryKey: contractKeys.dashboard() });
    },
    onError: (error: any) => {
      console.error('Record progress failed:', error);
    },
  });
}

export function useGapAnalysis(contractId: string) {
  return useQuery({
    queryKey: contractKeys.gapAnalysis(contractId),
    queryFn: async () => {
      const response = await api.get(`/contracts/${contractId}/gap-analysis`);
      return response.data;
    },
    enabled: !!contractId,
    select: (response) => response.data,
  });
}

export function useAchieveMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contractId, milestoneId, achievedVolume }: {
      contractId: string;
      milestoneId: string;
      achievedVolume?: number;
    }) => {
      const response = await api.post(
        `/contracts/${contractId}/milestones/${milestoneId}/achieve`,
        { achievedVolume }
      );
      return response.data;
    },
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(contractId) });
      queryClient.invalidateQueries({ queryKey: contractKeys.gapAnalysis(contractId) });
      queryClient.invalidateQueries({ queryKey: contractKeys.dashboard() });
    },
    onError: (error: any) => {
      console.error('Achieve milestone failed:', error);
    },
  });
}

export function useContractDashboard() {
  return useQuery({
    queryKey: contractKeys.dashboard(),
    queryFn: async () => {
      const response = await api.get('/contracts/dashboard');
      return response.data;
    },
    select: (response) => response.data,
  });
}
