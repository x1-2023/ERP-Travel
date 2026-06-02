/**
 * Promotions React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Promotion } from '@/types';

// ============================================
// QUERY KEYS
// ============================================
export const promotionKeys = {
  all: ['promotions'] as const,
  lists: () => [...promotionKeys.all, 'list'] as const,
  list: (filters: object) => [...promotionKeys.lists(), filters] as const,
  details: () => [...promotionKeys.all, 'detail'] as const,
  detail: (id: string) => [...promotionKeys.details(), id] as const,
};

// ============================================
// TYPES
// ============================================
interface ListParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  fundId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

interface CreatePromotionInput {
  code: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget: number;
  customerId: string;
  fundId: string;
  promotionType: string;
  mechanicType?: string;
}

type UpdatePromotionInput = Partial<CreatePromotionInput>;

// ============================================
// HOOKS
// ============================================

/**
 * Get list of promotions with pagination & filters
 */
export function usePromotions(params: ListParams = {}) {
  return useQuery({
    queryKey: promotionKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/promotions', { params });
      return response.data;
    },
    select: (response) => ({
      promotions: response.data || [],
      metadata: response.metadata,
    }),
  });
}

/**
 * Get single promotion by ID
 */
export function usePromotion(id: string) {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/promotions/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Promotion,
  });
}

/**
 * Create new promotion
 */
export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePromotionInput) => {
      const response = await api.post('/promotions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

/**
 * Update promotion
 */
export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePromotionInput }) => {
      const response = await api.patch(`/promotions/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

/**
 * Delete promotion
 */
export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/promotions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

/**
 * Submit promotion for approval
 */
export function useSubmitPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/promotions/${id}/submit`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

/**
 * Approve promotion
 */
export function useApprovePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const response = await api.post(`/promotions/${id}/approve`, { comment });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

/**
 * Reject promotion
 */
export function useRejectPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/promotions/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
    },
  });
}

/**
 * Dropdown select - no pagination
 */
export function usePromotionOptions() {
  return useQuery({
    queryKey: [...promotionKeys.lists(), 'options'],
    queryFn: async () => {
      const response = await api.get('/promotions', {
        params: { pageSize: 1000, status: 'APPROVED' }
      });
      return response.data;
    },
    select: (response) =>
      (response.data || []).map((p: Promotion) => ({
        value: p.id,
        label: `${p.code} - ${p.name}`,
        budget: p.budget,
        availableBudget: p.budget - (p.actualSpend || 0),
      })),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
