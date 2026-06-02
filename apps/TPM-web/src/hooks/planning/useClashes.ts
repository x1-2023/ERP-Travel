/**
 * Clash Detection Hooks
 * React Query hooks for promotion clash management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PromotionSummary {
  id: string;
  code: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  products?: Array<{
    id: string;
    code: string;
    name: string;
  }>;
}

export interface Clash {
  id: string;
  promotionAId: string;
  promotionBId: string;
  promotionA: PromotionSummary;
  promotionB: PromotionSummary;
  clashType: 'FULL_OVERLAP' | 'CUSTOMER_OVERLAP' | 'PRODUCT_OVERLAP';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'DETECTED' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  description: string;
  overlapStart: string;
  overlapEnd: string;
  affectedCustomers: string[];
  affectedProducts: string[];
  potentialImpact: number;
  resolution?: string;
  notes?: string;
  resolvedAt?: string;
  resolvedBy?: {
    id: string;
    name: string;
  };
  detectedAt: string;
  analysis?: ClashAnalysis;
}

export interface ClashAnalysis {
  overlapDays: number;
  budgetAtRisk: {
    promotionA: number;
    promotionB: number;
    total: number;
  };
  overlapPercentage: {
    promotionA: number;
    promotionB: number;
  };
  recommendations: string[];
}

export interface ClashListParams {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  promotionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ClashStats {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recentClashes: number;
  unresolvedHigh: number;
  resolutionRate: number;
  totalPotentialImpact: number;
}

export type ResolutionType = 'ADJUST_DATES' | 'MERGE' | 'CANCEL_ONE' | 'ACCEPT_OVERLAP' | 'OTHER';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch clashes list with filters
 */
export function useClashes(params: ClashListParams = {}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.status) queryString.set('status', params.status);
  if (params.severity) queryString.set('severity', params.severity);
  if (params.promotionId) queryString.set('promotionId', params.promotionId);
  if (params.startDate) queryString.set('startDate', params.startDate);
  if (params.endDate) queryString.set('endDate', params.endDate);

  return useQuery({
    queryKey: ['clashes', params],
    queryFn: async () => {
      const res = await api.get(`/planning/clashes?${queryString.toString()}`);
      return res.data as {
        data: Clash[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
        summary: {
          total: number;
          byStatus: Record<string, number>;
          bySeverity: Record<string, number>;
        };
      };
    },
  });
}

/**
 * Fetch single clash by ID
 */
export function useClash(id: string | undefined) {
  return useQuery({
    queryKey: ['clash', id],
    queryFn: async () => {
      const res = await api.get(`/planning/clashes/${id}`);
      return res.data.data as Clash;
    },
    enabled: !!id,
  });
}

/**
 * Fetch clash statistics
 */
export function useClashStats() {
  return useQuery({
    queryKey: ['clash-stats'],
    queryFn: async () => {
      const res = await api.get('/planning/clashes/stats');
      return res.data.data as ClashStats;
    },
  });
}

/**
 * Detect clashes
 */
export function useDetectClashes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: {
      promotionIds?: string[];
      dateRange?: {
        startDate: string;
        endDate: string;
      };
    }) => {
      const res = await api.post('/planning/clashes', data || {});
      return res.data as {
        data: Clash[];
        summary: {
          checked: number;
          clashesFound: number;
          bySeverity: Record<string, number>;
        };
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clashes'] });
      queryClient.invalidateQueries({ queryKey: ['clash-stats'] });
    },
  });
}

/**
 * Update clash status
 */
export function useUpdateClash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      status?: string;
      resolution?: string;
      notes?: string;
    }) => {
      const res = await api.put(`/planning/clashes/${id}`, data);
      return res.data.data as Clash;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clashes'] });
      queryClient.invalidateQueries({ queryKey: ['clash', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['clash-stats'] });
    },
  });
}

/**
 * Resolve clash with action
 */
export function useResolveClash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      resolution,
      action,
      notes,
    }: {
      id: string;
      resolution: ResolutionType;
      action?: {
        promotionId: string;
        newStartDate?: string;
        newEndDate?: string;
        cancel?: boolean;
      };
      notes?: string;
    }) => {
      const res = await api.post(`/planning/clashes/${id}/resolve`, {
        resolution,
        action,
        notes,
      });
      return res.data as {
        data: Clash;
        actionResult: any;
        message: string;
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clashes'] });
      queryClient.invalidateQueries({ queryKey: ['clash', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['clash-stats'] });
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

/**
 * Dismiss clash
 */
export function useDismissClash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/planning/clashes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clashes'] });
      queryClient.invalidateQueries({ queryKey: ['clash-stats'] });
    },
  });
}
