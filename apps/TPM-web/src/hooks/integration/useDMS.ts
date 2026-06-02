/**
 * DMS Integration Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  DMSConnection,
  CreateDMSConnectionRequest,
  DMSSyncRequest,
  DMSPushRequest,
} from '@/types/integration';

// List DMS connections
export function useDMSConnections(params?: { type?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['dms-connections', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.set('type', params.type);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);

      const res = await api.get(`/integration/dms?${searchParams.toString()}`);
      return res.data as {
        data: DMSConnection[];
        summary: {
          total: number;
          active: number;
          pendingSync: number;
        };
      };
    },
  });
}

// Get single DMS connection
export function useDMSConnection(id: string) {
  return useQuery({
    queryKey: ['dms-connection', id],
    queryFn: async () => {
      const res = await api.get(`/integration/dms/${id}`);
      return res.data as DMSConnection & {
        stats: {
          totalRecords: number;
          totalSellOut: number;
          totalValue: number;
        };
      };
    },
    enabled: !!id,
  });
}

// Create DMS connection
export function useCreateDMSConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDMSConnectionRequest) => {
      const res = await api.post('/integration/dms', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dms-connections'] });
    },
  });
}

// Update DMS connection
export function useUpdateDMSConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateDMSConnectionRequest>;
    }) => {
      const res = await api.put(`/integration/dms/${id}`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dms-connections'] });
      queryClient.invalidateQueries({ queryKey: ['dms-connection', id] });
    },
  });
}

// Delete DMS connection
export function useDeleteDMSConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/integration/dms/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dms-connections'] });
    },
  });
}

// Sync DMS data
export function useTriggerDMSSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DMSSyncRequest }) => {
      const res = await api.post(`/integration/dms/${id}/sync`, data);
      return res.data as {
        data: {
          success: boolean;
          recordsSynced: number;
          errors: string[];
        };
      };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dms-connection', id] });
    },
  });
}

// Push data to DMS
export function usePushToDMS() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DMSPushRequest }) => {
      const res = await api.post(`/integration/dms/${id}/push`, data);
      return res.data as {
        data: {
          success: boolean;
          recordsPushed: number;
          errors: string[];
        };
      };
    },
  });
}
