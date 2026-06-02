/**
 * Fund Activities React Query Hooks
 * Phase 5: Budget & Target Integration (Aforza-style ROI tracking)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Types
export type FundActivityType =
  | 'promotion'
  | 'display'
  | 'sampling'
  | 'event'
  | 'listing_fee';

export type FundActivityStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface FundActivity {
  id: string;
  budgetId: string;
  budget?: {
    id: string;
    code: string;
    name: string;
    totalAmount: number;
  };
  budgetAllocationId?: string;
  budgetAllocation?: {
    id: string;
    code: string;
    allocatedAmount: number;
  };
  promotionId?: string;
  activityType: FundActivityType;
  activityName: string;
  activityCode?: string;
  allocatedAmount: number;
  spentAmount: number;
  revenueGenerated?: number;
  unitsImpacted?: number;
  roi?: number;
  startDate: string;
  endDate: string;
  status: FundActivityStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFundActivityInput {
  budgetId: string;
  budgetAllocationId?: string;
  promotionId?: string;
  activityType: FundActivityType;
  activityName: string;
  activityCode?: string;
  allocatedAmount: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateFundActivityInput {
  activityName?: string;
  activityCode?: string;
  allocatedAmount?: number;
  spentAmount?: number;
  revenueGenerated?: number;
  unitsImpacted?: number;
  startDate?: string;
  endDate?: string;
  status?: FundActivityStatus;
  notes?: string;
}

export interface FundActivitySummary {
  overview: {
    totalActivities: number;
    totalAllocated: number;
    totalSpent: number;
    totalRevenue: number;
    utilizationRate: number;
    overallRoi: number;
    avgRoi: number;
  };
  byType: Array<{
    type: string;
    label: string;
    count: number;
    totalAllocated: number;
    totalSpent: number;
    totalRevenue: number;
    avgRoi: number;
  }>;
  byStatus: Record<string, number>;
  topPerformers: Array<{
    id: string;
    activityName: string;
    activityType: string;
    spent: number;
    revenue: number;
    roi: number;
  }>;
  underperformers: Array<{
    id: string;
    activityName: string;
    activityType: string;
    spent: number;
    revenue: number;
    roi: number;
  }>;
}

// Query keys
export const fundActivityKeys = {
  all: ['fund-activities'] as const,
  lists: () => [...fundActivityKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...fundActivityKeys.lists(), filters] as const,
  details: () => [...fundActivityKeys.all, 'detail'] as const,
  detail: (id: string) => [...fundActivityKeys.details(), id] as const,
  summary: (budgetId?: string) => [...fundActivityKeys.all, 'summary', budgetId] as const,
};

interface ListParams {
  budgetId?: string;
  budgetAllocationId?: string;
  activityType?: FundActivityType;
  status?: FundActivityStatus;
  promotionId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * List fund activities with filtering
 */
export function useFundActivities(params: ListParams = {}) {
  return useQuery({
    queryKey: fundActivityKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const response = await api.get('/fund-activities', { params });
      return response.data;
    },
    select: (response) => ({
      activities: response.data as FundActivity[],
      metadata: response.metadata,
    }),
  });
}

/**
 * Get single fund activity
 */
export function useFundActivity(id: string) {
  return useQuery({
    queryKey: fundActivityKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/fund-activities/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as FundActivity,
  });
}

/**
 * Get fund activity summary/ROI analysis
 */
export function useFundActivitySummary(budgetId?: string) {
  return useQuery({
    queryKey: fundActivityKeys.summary(budgetId),
    queryFn: async () => {
      const response = await api.get('/fund-activities/summary', {
        params: budgetId ? { budgetId } : {},
      });
      return response.data;
    },
    select: (response) => response.data as FundActivitySummary,
  });
}

/**
 * Create fund activity
 */
export function useCreateFundActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFundActivityInput) => {
      const response = await api.post('/fund-activities', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: fundActivityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fundActivityKeys.summary(variables.budgetId) });
      queryClient.invalidateQueries({ queryKey: fundActivityKeys.summary(undefined) });
    },
    onError: (error: any) => {
      console.error('Create fund activity failed:', error);
    },
  });
}

/**
 * Update fund activity
 */
export function useUpdateFundActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFundActivityInput }) => {
      const response = await api.patch(`/fund-activities/${id}`, data);
      return response.data;
    },
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: fundActivityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fundActivityKeys.lists() });
      // Invalidate summary for this budget if we have it
      if (response?.data?.budgetId) {
        queryClient.invalidateQueries({
          queryKey: fundActivityKeys.summary(response.data.budgetId),
        });
      }
      queryClient.invalidateQueries({ queryKey: fundActivityKeys.summary(undefined) });
    },
    onError: (error: any) => {
      console.error('Update fund activity failed:', error);
    },
  });
}

/**
 * Delete fund activity
 */
export function useDeleteFundActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/fund-activities/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundActivityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fundActivityKeys.all });
    },
    onError: (error: any) => {
      console.error('Delete fund activity failed:', error);
    },
  });
}

// Helper functions
export function getActivityTypeLabel(type: FundActivityType): string {
  const labels: Record<FundActivityType, string> = {
    promotion: 'Khuyến mãi',
    display: 'Trưng bày',
    sampling: 'Dùng thử',
    event: 'Sự kiện',
    listing_fee: 'Phí listing',
  };
  return labels[type] || type;
}

export function getActivityTypeColor(type: FundActivityType): string {
  const colors: Record<FundActivityType, string> = {
    promotion: 'bg-blue-100 text-blue-700',
    display: 'bg-purple-100 text-purple-700',
    sampling: 'bg-green-100 text-green-700',
    event: 'bg-orange-100 text-orange-700',
    listing_fee: 'bg-muted text-foreground-muted',
  };
  return colors[type] || 'bg-muted text-foreground-muted';
}

export function getStatusLabel(status: FundActivityStatus): string {
  const labels: Record<FundActivityStatus, string> = {
    PLANNED: 'Kế hoạch',
    ACTIVE: 'Đang chạy',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return labels[status] || status;
}

export function getStatusColor(status: FundActivityStatus): string {
  const colors: Record<FundActivityStatus, string> = {
    PLANNED: 'bg-muted text-foreground-muted',
    ACTIVE: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-muted text-foreground-muted';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRoi(roi: number): string {
  if (roi >= 1) {
    return `${roi.toFixed(2)}x`;
  }
  return `${(roi * 100).toFixed(1)}%`;
}

export function getRoiStatus(roi: number): 'excellent' | 'good' | 'warning' | 'critical' {
  if (roi >= 3) return 'excellent';
  if (roi >= 1.5) return 'good';
  if (roi >= 1) return 'warning';
  return 'critical';
}
