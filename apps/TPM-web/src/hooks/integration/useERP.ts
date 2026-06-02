/**
 * ERP Integration Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ERPConnection,
  ERPListParams,
  CreateERPConnectionRequest,
  UpdateERPConnectionRequest,
  SyncRequest,
  TestConnectionResult,
  ERPSyncLog,
} from '@/types/integration';

// List ERP connections
export function useERPConnections(params?: ERPListParams) {
  return useQuery({
    queryKey: ['erp-connections', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.set('type', params.type);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);

      const res = await api.get(`/integration/erp?${searchParams.toString()}`);
      return res.data as {
        data: ERPConnection[];
        summary: {
          total: number;
          active: number;
          byType: Record<string, number>;
          lastSyncErrors: number;
        };
      };
    },
  });
}

// Get single ERP connection
export function useERPConnection(id: string) {
  return useQuery({
    queryKey: ['erp-connection', id],
    queryFn: async () => {
      const res = await api.get(`/integration/erp/${id}`);
      return res.data as ERPConnection & {
        recentLogs: ERPSyncLog[];
        stats: {
          totalSyncs: number;
          successRate: number;
          avgDuration: number;
          lastErrors: string[];
        };
      };
    },
    enabled: !!id,
  });
}

// Create ERP connection
export function useCreateERPConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateERPConnectionRequest) => {
      const res = await api.post('/integration/erp', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-connections'] });
    },
  });
}

// Update ERP connection
export function useUpdateERPConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateERPConnectionRequest }) => {
      const res = await api.put(`/integration/erp/${id}`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['erp-connections'] });
      queryClient.invalidateQueries({ queryKey: ['erp-connection', id] });
    },
  });
}

// Delete ERP connection
export function useDeleteERPConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/integration/erp/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-connections'] });
    },
  });
}

// Test ERP connection
export function useTestERPConnection() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/integration/erp/${id}/test`);
      return res.data as { data: TestConnectionResult };
    },
  });
}

// Trigger ERP sync
export function useTriggerERPSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SyncRequest }) => {
      const res = await api.post(`/integration/erp/${id}/sync`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['erp-connection', id] });
      queryClient.invalidateQueries({ queryKey: ['erp-sync-logs', id] });
    },
  });
}

// Get ERP sync logs
export function useERPSyncLogs(
  connectionId: string,
  params?: {
    status?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }
) {
  return useQuery({
    queryKey: ['erp-sync-logs', connectionId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.entityType) searchParams.set('entityType', params.entityType);
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

      const res = await api.get(`/integration/erp/${connectionId}/logs?${searchParams.toString()}`);
      return res.data as {
        data: ERPSyncLog[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      };
    },
    enabled: !!connectionId,
  });
}
