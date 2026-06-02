/**
 * Customers React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Customer } from '@/types';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: object) => [...customerKeys.lists(), filters] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

interface ListParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  channel?: string;
  [key: string]: unknown;
}

export function useCustomers(params: ListParams = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/customers', { params });
      return response.data;
    },
    select: (response) => ({
      customers: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Customer,
  });
}

/**
 * Dropdown select - no pagination, just active customers
 */
export function useCustomerOptions() {
  return useQuery({
    queryKey: [...customerKeys.lists(), 'options'],
    queryFn: async () => {
      const response = await api.get('/customers', {
        params: { pageSize: 1000, status: 'ACTIVE' }
      });
      return response.data;
    },
    select: (response) =>
      (response.data || []).map((c: Customer) => ({
        value: c.id,
        label: `${c.code} - ${c.name}`,
      })),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
