/**
 * Claims React Query Hooks (Phase 6 Enhanced)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Claim } from '@/types';

// Query keys
export const claimKeys = {
  all: ['claims'] as const,
  lists: () => [...claimKeys.all, 'list'] as const,
  list: (filters: object) => [...claimKeys.lists(), filters] as const,
  details: () => [...claimKeys.all, 'detail'] as const,
  detail: (id: string) => [...claimKeys.details(), id] as const,
  matches: (id: string) => [...claimKeys.all, 'matches', id] as const,
  auditLog: (id: string) => [...claimKeys.all, 'audit-log', id] as const,
};

// Types
interface ListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  promotionId?: string;
  customerId?: string;
  search?: string;
  type?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface CreateClaimInput {
  code?: string;
  promotionId?: string;
  customerId?: string;
  claimDate: string;
  amount?: number;
  claimAmount?: number;
  description?: string;
  type?: string;
  source?: string;
  invoiceNumber?: string;
  claimPeriodStart?: string;
  claimPeriodEnd?: string;
  dueDate?: string;
  priority?: number;
  customerNotes?: string;
  lineItems?: Array<{
    productId?: string;
    productName?: string;
    productSku?: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
    description?: string;
  }>;
  evidenceUrls?: string[];
}

// Hooks
export function useClaims(params: ListParams = {}) {
  return useQuery({
    queryKey: claimKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/claims', { params });
      return response.data;
    },
    select: (response) => ({
      claims: response.data || [],
      metadata: response.pagination || response.metadata,
    }),
  });
}

export function useClaim(id: string) {
  return useQuery({
    queryKey: claimKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/claims/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Claim,
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClaimInput) => {
      const response = await api.post('/claims', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useUpdateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateClaimInput> & { updatedAt?: string } }) => {
      const response = await api.patch(`/claims/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useDeleteClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/claims/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/claims/${id}/submit`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useApproveClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approvedAmount, comments }: { id: string; approvedAmount: number; comments?: string }) => {
      const response = await api.post(`/claims/${id}/approve`, { approvedAmount, comments });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

export function useRejectClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/claims/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}

// Phase 6: New hooks
export function useClaimMatches(claimId: string) {
  return useQuery({
    queryKey: claimKeys.matches(claimId),
    queryFn: async () => {
      const response = await api.get(`/claims/${claimId}/matches`);
      return response.data;
    },
    enabled: !!claimId,
    select: (response) => response.data || [],
  });
}

export function useClaimAuditLog(claimId: string) {
  return useQuery({
    queryKey: claimKeys.auditLog(claimId),
    queryFn: async () => {
      const response = await api.get(`/claims/${claimId}/audit-log`);
      return response.data;
    },
    enabled: !!claimId,
    select: (response) => response.data || [],
  });
}

export function useRunAIMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string) => {
      const response = await api.post(`/claims/${claimId}/match`);
      return response.data;
    },
    onSuccess: (_, claimId) => {
      queryClient.invalidateQueries({ queryKey: claimKeys.detail(claimId) });
      queryClient.invalidateQueries({ queryKey: claimKeys.matches(claimId) });
      queryClient.invalidateQueries({ queryKey: claimKeys.lists() });
    },
  });
}
