/**
 * Products React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product } from '@/types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: object) => [...productKeys.lists(), filters] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

interface ListParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  [key: string]: unknown;
}

export function useProducts(params: ListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/products', { params });
      return response.data;
    },
    select: (response) => ({
      products: response.data || [],
      metadata: response.metadata,
    }),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as Product,
  });
}

/**
 * Dropdown select
 */
export function useProductOptions() {
  return useQuery({
    queryKey: [...productKeys.lists(), 'options'],
    queryFn: async () => {
      const response = await api.get('/products', {
        params: { pageSize: 1000, status: 'ACTIVE' }
      });
      return response.data;
    },
    select: (response) =>
      (response.data || []).map((p: Product) => ({
        value: p.id,
        label: `${p.sku} - ${p.name}`,
      })),
    staleTime: 1000 * 60 * 10,
  });
}
