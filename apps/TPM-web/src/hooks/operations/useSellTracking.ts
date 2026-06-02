/**
 * Sell Tracking Hooks
 * React Query hooks for sell-in/sell-out tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  SellTracking,
  SellTrackingParams,
  SellTrackingSummary,
  ComparisonData,
  SellAlert,
} from '@/types/operations';

// ═══════════════════════════════════════════════════════════════════════════════
// LIST & DETAIL HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch sell tracking records with filters
 */
export function useSellTrackingList(params: SellTrackingParams = {}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.customerId) queryString.set('customerId', params.customerId);
  if (params.productId) queryString.set('productId', params.productId);
  if (params.period) queryString.set('period', params.period);
  if (params.periodFrom) queryString.set('periodFrom', params.periodFrom);
  if (params.periodTo) queryString.set('periodTo', params.periodTo);

  return useQuery({
    queryKey: ['sell-tracking', params],
    queryFn: async () => {
      const res = await api.get(`/operations/sell-tracking?${queryString.toString()}`);
      return res.data as {
        data: SellTracking[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
        summary: SellTrackingSummary;
      };
    },
  });
}

/**
 * Fetch single sell tracking record
 */
export function useSellTrackingRecord(id: string | undefined) {
  return useQuery({
    queryKey: ['sell-tracking-record', id],
    queryFn: async () => {
      const res = await api.get(`/operations/sell-tracking/${id}`);
      return res.data.data as SellTracking;
    },
    enabled: !!id,
  });
}

/**
 * Fetch sell tracking summary & analytics
 */
export function useSellTrackingSummary(params: {
  customerId?: string;
  productId?: string;
  periodFrom?: string;
  periodTo?: string;
} = {}) {
  const queryString = new URLSearchParams();
  if (params.customerId) queryString.set('customerId', params.customerId);
  if (params.productId) queryString.set('productId', params.productId);
  if (params.periodFrom) queryString.set('periodFrom', params.periodFrom);
  if (params.periodTo) queryString.set('periodTo', params.periodTo);

  return useQuery({
    queryKey: ['sell-tracking-summary', params],
    queryFn: async () => {
      const res = await api.get(`/operations/sell-tracking/summary?${queryString.toString()}`);
      return res.data as {
        summary: SellTrackingSummary;
        comparison: ComparisonData[];
        byCustomer: Array<{
          customerId: string;
          customerName: string;
          sellInQty: number;
          sellOutQty: number;
          stockQty: number;
          sellThroughRate: number;
        }>;
        byProduct: Array<{
          productId: string;
          productName: string;
          sellInQty: number;
          sellOutQty: number;
          stockQty: number;
          sellThroughRate: number;
        }>;
        alerts: SellAlert[];
      };
    },
  });
}

/**
 * Fetch sell tracking trends
 */
export function useSellTrackingTrends(params: {
  customerId?: string;
  productId?: string;
  periods?: number;
} = {}) {
  const queryString = new URLSearchParams();
  if (params.customerId) queryString.set('customerId', params.customerId);
  if (params.productId) queryString.set('productId', params.productId);
  if (params.periods) queryString.set('periods', String(params.periods));

  return useQuery({
    queryKey: ['sell-tracking-trends', params],
    queryFn: async () => {
      const res = await api.get(`/operations/sell-tracking/trends?${queryString.toString()}`);
      return res.data as {
        timeline: Array<{
          period: string;
          sellInQty: number;
          sellInValue: number;
          sellOutQty: number;
          sellOutValue: number;
          stockQty: number;
          stockValue: number;
          sellThroughRate: number;
        }>;
        movingAverages: Array<{
          period: string;
          ma3SellIn: number | null;
          ma3SellOut: number | null;
          ma3SellThrough: number | null;
        }>;
        changes: Array<{
          period: string;
          sellInChange: number | null;
          sellOutChange: number | null;
          stockChange: number | null;
        }>;
        overallTrend: {
          sellInGrowth: number;
          sellOutGrowth: number;
          avgSellThrough: number;
        } | null;
      };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create sell tracking record
 */
export function useCreateSellTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      productId: string;
      period: string;
      sellInQty: number;
      sellInValue: number;
      sellOutQty: number;
      sellOutValue: number;
      stockQty: number;
      stockValue: number;
    }) => {
      const res = await api.post('/operations/sell-tracking', data);
      return res.data.data as SellTracking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sell-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-trends'] });
    },
  });
}

/**
 * Update sell tracking record
 */
export function useUpdateSellTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      sellInQty?: number;
      sellInValue?: number;
      sellOutQty?: number;
      sellOutValue?: number;
      stockQty?: number;
      stockValue?: number;
    }) => {
      const res = await api.put(`/operations/sell-tracking/${id}`, data);
      return res.data.data as SellTracking;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sell-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-record', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-trends'] });
    },
  });
}

/**
 * Delete sell tracking record
 */
export function useDeleteSellTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/operations/sell-tracking/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sell-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-trends'] });
    },
  });
}

/**
 * Bulk delete sell tracking records
 */
export function useBulkDeleteSellTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await api.post('/operations/sell-tracking/bulk', {
        action: 'delete',
        ids,
      });
      return res.data as { success: boolean; deleted: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sell-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-trends'] });
    },
  });
}

/**
 * Import sell tracking data
 */
export function useImportSellTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      data: Array<{
        customerCode: string;
        productSku: string;
        period: string;
        sellInQty: number;
        sellInValue: number;
        sellOutQty: number;
        sellOutValue: number;
        stockQty: number;
        stockValue: number;
      }>;
      mode?: 'create' | 'upsert';
    }) => {
      const res = await api.post('/operations/sell-tracking/import', data);
      return res.data as {
        summary: {
          total: number;
          created: number;
          updated: number;
          failed: number;
          successRate: number;
        };
        results: Array<{
          success: boolean;
          row: number;
          error?: string;
        }>;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sell-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sell-tracking-trends'] });
    },
  });
}

/**
 * Export sell tracking data
 */
export function useExportSellTracking() {
  return useMutation({
    mutationFn: async (params: {
      format?: 'csv' | 'json';
      customerId?: string;
      productId?: string;
      periodFrom?: string;
      periodTo?: string;
    }) => {
      const queryString = new URLSearchParams();
      if (params.format) queryString.set('format', params.format);
      if (params.customerId) queryString.set('customerId', params.customerId);
      if (params.productId) queryString.set('productId', params.productId);
      if (params.periodFrom) queryString.set('periodFrom', params.periodFrom);
      if (params.periodTo) queryString.set('periodTo', params.periodTo);

      const res = await api.get(`/operations/sell-tracking/export?${queryString.toString()}`, {
        responseType: 'blob',
      });
      return res.data;
    },
  });
}
