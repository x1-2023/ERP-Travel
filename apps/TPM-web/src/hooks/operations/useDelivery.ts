/**
 * Delivery Hooks
 * React Query hooks for delivery order management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  DeliveryOrder,
  DeliveryTracking,
  DeliveryListParams,
  DeliverySummary,
  CreateDeliveryRequest,
  UpdateStatusRequest,
  CalendarDay,
  DeliveryStatus,
} from '@/types/operations';

// ═══════════════════════════════════════════════════════════════════════════════
// LIST & DETAIL HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch delivery orders list with filters
 */
export function useDeliveryOrders(params: DeliveryListParams = {}) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') queryString.set('status', params.status);
  if (params.customerId) queryString.set('customerId', params.customerId);
  if (params.promotionId) queryString.set('promotionId', params.promotionId);
  if (params.dateFrom) queryString.set('dateFrom', params.dateFrom);
  if (params.dateTo) queryString.set('dateTo', params.dateTo);
  if (params.search) queryString.set('search', params.search);

  return useQuery({
    queryKey: ['delivery-orders', params],
    queryFn: async () => {
      const res = await api.get(`/operations/delivery?${queryString.toString()}`);
      return res.data as {
        data: DeliveryOrder[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
        summary: DeliverySummary;
      };
    },
  });
}

/**
 * Fetch single delivery order by ID
 */
export function useDeliveryOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['delivery-order', id],
    queryFn: async () => {
      const res = await api.get(`/operations/delivery/${id}`);
      return res.data.data as DeliveryOrder & {
        totalItems: number;
        totalDelivered: number;
        totalValue: number;
      };
    },
    enabled: !!id,
  });
}

/**
 * Fetch delivery tracking history
 */
export function useDeliveryTracking(id: string | undefined) {
  return useQuery({
    queryKey: ['delivery-tracking', id],
    queryFn: async () => {
      const res = await api.get(`/operations/delivery/${id}/tracking`);
      return res.data.data as {
        order: {
          id: string;
          orderNumber: string;
          currentStatus: DeliveryStatus;
          scheduledDate: string;
          deliveredAt: string | null;
        };
        timeline: Array<DeliveryTracking & { duration: string | null }>;
        summary: {
          totalEntries: number;
          totalProcessingTime: string;
          statusDurations: Record<string, string>;
        };
      };
    },
    enabled: !!id,
  });
}

/**
 * Fetch delivery calendar
 */
export function useDeliveryCalendar(month: number, year: number, customerId?: string) {
  return useQuery({
    queryKey: ['delivery-calendar', month, year, customerId],
    queryFn: async () => {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      if (customerId) params.set('customerId', customerId);

      const res = await api.get(`/operations/delivery/calendar?${params.toString()}`);
      return res.data as {
        data: {
          year: number;
          month: number;
          days: CalendarDay[];
        };
        summary: {
          totalOrders: number;
          delivered: number;
          inTransit: number;
          pending: number;
          cancelled: number;
          busiestDay: { date: string; totalOrders: number };
        };
      };
    },
  });
}

/**
 * Fetch delivery statistics
 */
export function useDeliveryStats(period = 30) {
  return useQuery({
    queryKey: ['delivery-stats', period],
    queryFn: async () => {
      const res = await api.get(`/operations/delivery/stats?period=${period}`);
      return res.data.data as {
        period: number;
        overview: {
          total: number;
          byStatus: Record<string, number>;
        };
        performance: {
          ordersInPeriod: number;
          deliveredInPeriod: number;
          onTimeRate: number;
          avgDeliveryDays: number;
        };
        trend: Array<{ date: string; created: number; delivered: number }>;
        topCustomers: Array<{
          customerId: string;
          customerName: string;
          orderCount: number;
        }>;
      };
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create delivery order
 */
export function useCreateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDeliveryRequest) => {
      const res = await api.post('/operations/delivery', data);
      return res.data.data as DeliveryOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
    },
  });
}

/**
 * Update delivery order
 */
export function useUpdateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      scheduledDate?: string;
      deliveryAddress?: string;
      contactPerson?: string;
      contactPhone?: string;
      notes?: string;
    }) => {
      const res = await api.put(`/operations/delivery/${id}`, data);
      return res.data.data as DeliveryOrder;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['delivery-calendar'] });
    },
  });
}

/**
 * Update delivery status
 */
export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateStatusRequest & { id: string }) => {
      const res = await api.put(`/operations/delivery/${id}/status`, data);
      return res.data as { data: DeliveryOrder; message: string };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['delivery-tracking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['delivery-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
    },
  });
}

/**
 * Delete delivery order
 */
export function useDeleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/operations/delivery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-stats'] });
    },
  });
}
