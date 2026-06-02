/**
 * Settlements React Query Hooks (Phase 6)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Settlement, SettlementBatch } from '@/types';

// Query keys
export const settlementKeys = {
  all: ['settlements'] as const,
  lists: () => [...settlementKeys.all, 'list'] as const,
  list: (filters: object) => [...settlementKeys.lists(), filters] as const,
  details: () => [...settlementKeys.all, 'detail'] as const,
  detail: (id: string) => [...settlementKeys.details(), id] as const,
};

export const batchKeys = {
  all: ['settlement-batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (filters: object) => [...batchKeys.lists(), filters] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
};

// Types
interface SettlementListParams {
  page?: number;
  limit?: number;
  status?: string;
  claimId?: string;
  batchId?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface BatchListParams {
  page?: number;
  limit?: number;
  status?: string;
}

// Settlement Hooks
export function useSettlements(params: SettlementListParams = {}) {
  return useQuery({
    queryKey: settlementKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/settlements', { params });
      return response.data;
    },
    select: (response) => ({
      settlements: response.data || [],
      pagination: response.pagination,
    }),
  });
}

export function useSettlement(id: string) {
  return useQuery({
    queryKey: settlementKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/settlements/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Settlement,
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { claimId: string; amount: number; paymentMethod?: string }) => {
      const response = await api.post('/settlements', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useProcessSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...paymentDetails
    }: {
      id: string;
      paymentReference?: string;
      paymentDate?: string;
      bankName?: string;
      bankAccount?: string;
      bankBranch?: string;
    }) => {
      const response = await api.post(`/settlements/${id}/process`, paymentDetails);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
    },
  });
}

export function usePostSettlementToGL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/settlements/${id}/post-gl`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
    },
  });
}

// Batch Hooks
export function useSettlementBatches(params: BatchListParams = {}) {
  return useQuery({
    queryKey: batchKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/settlement-batches', { params });
      return response.data;
    },
    select: (response) => ({
      batches: response.data || [],
      pagination: response.pagination,
    }),
  });
}

export function useSettlementBatch(id: string) {
  return useQuery({
    queryKey: batchKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/settlement-batches/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as SettlementBatch,
  });
}

export function useCreateSettlementBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { settlementIds: string[]; batchDate?: string; notes?: string }) => {
      const response = await api.post('/settlement-batches', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
    },
  });
}

export function useApproveSettlementBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/settlement-batches/${id}/approve`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: settlementKeys.lists() });
    },
  });
}
