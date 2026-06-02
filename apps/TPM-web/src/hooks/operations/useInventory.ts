/**
 * Inventory Hooks
 * React Query hooks for inventory management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  InventorySnapshot,
  InventoryParams,
  InventorySummary,
  InventoryAlert,
} from '@/types/operations';

// ═══════════════════════════════════════════════════════════════════════════════
// LIST & DETAIL HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch inventory snapshots with filters
 */
export function useInventoryList(params: InventoryParams = {}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.customerId) queryString.set('customerId', params.customerId);
  if (params.productId) queryString.set('productId', params.productId);
  if (params.categoryId) queryString.set('categoryId', params.categoryId);
  if (params.status && params.status !== 'all') queryString.set('status', params.status);
  if (params.lowStock) queryString.set('lowStock', 'true');
  if (params.nearExpiry) queryString.set('nearExpiry', 'true');

  return useQuery({
    queryKey: ['inventory', params],
    queryFn: async () => {
      const res = await api.get(`/operations/inventory?${queryString.toString()}`);
      return res.data as {
        data: InventorySnapshot[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
        summary: InventorySummary;
      };
    },
  });
}

/**
 * Fetch single inventory snapshot
 */
export function useInventorySnapshot(id: string | undefined) {
  return useQuery({
    queryKey: ['inventory-snapshot', id],
    queryFn: async () => {
      const res = await api.get(`/operations/inventory/${id}`);
      return res.data.data as InventorySnapshot;
    },
    enabled: !!id,
  });
}

/**
 * Fetch inventory summary & alerts
 */
export function useInventorySummary(params: {
  customerId?: string;
  productId?: string;
  location?: string;
} = {}) {
  const queryString = new URLSearchParams();
  if (params.customerId) queryString.set('customerId', params.customerId);
  if (params.productId) queryString.set('productId', params.productId);
  if (params.location) queryString.set('location', params.location);

  return useQuery({
    queryKey: ['inventory-summary', params],
    queryFn: async () => {
      const res = await api.get(`/operations/inventory/summary?${queryString.toString()}`);
      return res.data as {
        summary: InventorySummary;
        byCustomer: Array<{
          customerId: string;
          customerName: string;
          totalQuantity: number;
          totalValue: number;
          productCount: number;
        }>;
        byProduct: Array<{
          productId: string;
          productName: string;
          productSku: string;
          category: string;
          totalQuantity: number;
          totalValue: number;
        }>;
        byLocation: Array<{
          location: string;
          totalQuantity: number;
          totalValue: number;
          productCount: number;
        }>;
        alerts: InventoryAlert[];
      };
    },
  });
}

/**
 * Fetch inventory history/trends
 */
export function useInventoryHistory(params: {
  customerId?: string;
  productId?: string;
  days?: number;
} = {}) {
  const queryString = new URLSearchParams();
  if (params.customerId) queryString.set('customerId', params.customerId);
  if (params.productId) queryString.set('productId', params.productId);
  if (params.days) queryString.set('days', String(params.days));

  return useQuery({
    queryKey: ['inventory-history', params],
    queryFn: async () => {
      const res = await api.get(`/operations/inventory/history?${queryString.toString()}`);
      return res.data as {
        timeline: Array<{
          date: string;
          totalQuantity: number;
          totalValue: number;
          snapshotCount: number;
        }>;
        changes: Array<{
          date: string;
          quantityChange: number | null;
          valueChange: number | null;
        }>;
        movingAverages: Array<{
          date: string;
          ma7Quantity: number | null;
          ma7Value: number | null;
        }>;
        overallTrend: {
          quantityGrowth: number;
          valueGrowth: number;
          avgDailyQuantity: number;
          avgDailyValue: number;
        } | null;
        currentStatus: {
          date: string;
          totalQuantity: number;
          totalValue: number;
          snapshotCount: number;
        };
      };
    },
    enabled: !!(params.customerId || params.productId),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create inventory snapshot
 */
export function useCreateInventorySnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      productId: string;
      snapshotDate: string;
      quantity: number;
      value: number;
      location?: string;
      batchNumber?: string;
      expiryDate?: string;
    }) => {
      const res = await api.post('/operations/inventory', data);
      return res.data.data as InventorySnapshot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
    },
  });
}

/**
 * Update inventory snapshot
 */
export function useUpdateInventorySnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      quantity?: number;
      value?: number;
      location?: string;
      batchNumber?: string;
      expiryDate?: string;
    }) => {
      const res = await api.put(`/operations/inventory/${id}`, data);
      return res.data.data as InventorySnapshot;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-snapshot', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
    },
  });
}

/**
 * Delete inventory snapshot
 */
export function useDeleteInventorySnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/operations/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
    },
  });
}

/**
 * Bulk delete inventory snapshots
 */
export function useBulkDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await api.post('/operations/inventory/bulk', {
        action: 'delete',
        ids,
      });
      return res.data as { success: boolean; deleted: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
    },
  });
}

/**
 * Bulk update inventory snapshots
 */
export function useBulkUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      ids: string[];
      data: {
        quantity?: number;
        value?: number;
        location?: string;
      };
    }) => {
      const res = await api.post('/operations/inventory/bulk', {
        action: 'update',
        ids: params.ids,
        data: params.data,
      });
      return res.data as { success: boolean; updated: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
    },
  });
}

/**
 * Import inventory data
 */
export function useImportInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      data: Array<{
        customerCode: string;
        productSku: string;
        snapshotDate: string;
        quantity: number;
        value: number;
        location?: string;
        batchNumber?: string;
        expiryDate?: string;
      }>;
      mode?: 'create' | 'replace';
    }) => {
      const res = await api.post('/operations/inventory/import', data);
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
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
    },
  });
}

/**
 * Export inventory data
 */
export function useExportInventory() {
  return useMutation({
    mutationFn: async (params: {
      format?: 'csv' | 'json';
      customerId?: string;
      productId?: string;
      snapshotDateFrom?: string;
      snapshotDateTo?: string;
      location?: string;
    }) => {
      const queryString = new URLSearchParams();
      if (params.format) queryString.set('format', params.format);
      if (params.customerId) queryString.set('customerId', params.customerId);
      if (params.productId) queryString.set('productId', params.productId);
      if (params.snapshotDateFrom) queryString.set('snapshotDateFrom', params.snapshotDateFrom);
      if (params.snapshotDateTo) queryString.set('snapshotDateTo', params.snapshotDateTo);
      if (params.location) queryString.set('location', params.location);

      const res = await api.get(`/operations/inventory/export?${queryString.toString()}`, {
        responseType: 'blob',
      });
      return res.data;
    },
  });
}
