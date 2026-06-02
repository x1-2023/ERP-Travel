/**
 * Webhooks Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  WebhookEndpoint,
  WebhookDelivery,
  CreateWebhookRequest,
  UpdateWebhookRequest,
} from '@/types/integration';

// List webhook endpoints
export function useWebhooks(params?: { isActive?: boolean; search?: string }) {
  return useQuery({
    queryKey: ['webhooks', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      if (params?.search) searchParams.set('search', params.search);

      const res = await api.get(`/integration/webhooks?${searchParams.toString()}`);
      return res.data as {
        data: WebhookEndpoint[];
        summary: {
          total: number;
          active: number;
          deliveredToday: number;
          failedToday: number;
        };
      };
    },
  });
}

// Get single webhook endpoint
export function useWebhook(id: string) {
  return useQuery({
    queryKey: ['webhook', id],
    queryFn: async () => {
      const res = await api.get(`/integration/webhooks/${id}`);
      return res.data as WebhookEndpoint & {
        recentDeliveries: WebhookDelivery[];
        stats: {
          totalDeliveries: number;
          successfulDeliveries: number;
          failedDeliveries: number;
          successRate: number;
        };
      };
    },
    enabled: !!id,
  });
}

// Create webhook endpoint
export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWebhookRequest) => {
      const res = await api.post('/integration/webhooks', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

// Update webhook endpoint
export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWebhookRequest }) => {
      const res = await api.put(`/integration/webhooks/${id}`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook', id] });
    },
  });
}

// Delete webhook endpoint
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/integration/webhooks/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

// Test webhook endpoint
export function useTestWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/integration/webhooks/${id}/test`);
      return res.data as {
        data: {
          delivered: boolean;
          responseStatus?: number;
          latency: number;
          error?: string;
        };
      };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['webhook', id] });
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries', id] });
    },
  });
}

// Get webhook deliveries
export function useWebhookDeliveries(
  endpointId: string,
  params?: {
    status?: string;
    event?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }
) {
  return useQuery({
    queryKey: ['webhook-deliveries', endpointId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.event) searchParams.set('event', params.event);
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

      const res = await api.get(
        `/integration/webhooks/${endpointId}/deliveries?${searchParams.toString()}`
      );
      return res.data as {
        data: WebhookDelivery[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      };
    },
    enabled: !!endpointId,
  });
}

// Retry failed delivery
export function useRetryDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ endpointId, deliveryId }: { endpointId: string; deliveryId: string }) => {
      const res = await api.post(`/integration/webhooks/${endpointId}/retry`, { deliveryId });
      return res.data;
    },
    onSuccess: (_, { endpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['webhook', endpointId] });
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries', endpointId] });
    },
  });
}
