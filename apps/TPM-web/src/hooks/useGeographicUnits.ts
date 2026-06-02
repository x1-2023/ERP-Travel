/**
 * Geographic Units React Query Hooks
 * Phase 5: Budget & Target Integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Types
export interface GeographicUnit {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  level: 'COUNTRY' | 'REGION' | 'PROVINCE' | 'DISTRICT' | 'DEALER';
  parentId?: string;
  parent?: GeographicUnit;
  children?: GeographicUnit[];
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    children: number;
    budgetAllocations: number;
    targetAllocations: number;
  };
}

export interface CreateGeographicUnitInput {
  code: string;
  name: string;
  nameEn?: string;
  level: GeographicUnit['level'];
  parentId?: string;
  latitude?: number;
  longitude?: number;
  sortOrder?: number;
}

export interface UpdateGeographicUnitInput {
  name?: string;
  nameEn?: string;
  parentId?: string;
  latitude?: number;
  longitude?: number;
  sortOrder?: number;
  isActive?: boolean;
}

// Query keys
export const geographicUnitKeys = {
  all: ['geographic-units'] as const,
  lists: () => [...geographicUnitKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...geographicUnitKeys.lists(), filters] as const,
  tree: () => [...geographicUnitKeys.all, 'tree'] as const,
  details: () => [...geographicUnitKeys.all, 'detail'] as const,
  detail: (id: string) => [...geographicUnitKeys.details(), id] as const,
};

interface ListParams {
  level?: GeographicUnit['level'];
  parentId?: string;
  search?: string;
  [key: string]: unknown;
}

// Hooks
export function useGeographicUnits(params: ListParams = {}) {
  return useQuery({
    queryKey: geographicUnitKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/geographic-units', { params });
      return response.data;
    },
    select: (response) => response.data as GeographicUnit[],
  });
}

export function useGeographicUnitsTree() {
  return useQuery({
    queryKey: geographicUnitKeys.tree(),
    queryFn: async () => {
      const response = await api.get('/geographic-units', { params: { tree: 'true' } });
      return response.data;
    },
    select: (response) => response.data as GeographicUnit[],
  });
}

export function useGeographicUnit(id: string, includeTree = false) {
  return useQuery({
    queryKey: geographicUnitKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/geographic-units/${id}`, {
        params: includeTree ? { includeTree: 'true' } : {},
      });
      return response.data;
    },
    enabled: !!id,
    select: (response) => response.data as GeographicUnit,
  });
}

export function useCreateGeographicUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGeographicUnitInput) => {
      const response = await api.post('/geographic-units', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: geographicUnitKeys.tree() });
    },
  });
}

export function useUpdateGeographicUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGeographicUnitInput }) => {
      const response = await api.patch(`/geographic-units/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: geographicUnitKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: geographicUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: geographicUnitKeys.tree() });
    },
  });
}

export function useDeleteGeographicUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/geographic-units/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: geographicUnitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: geographicUnitKeys.tree() });
    },
  });
}

// Helper function to flatten tree for select options
export function flattenGeographicTree(
  units: GeographicUnit[],
  level = 0
): Array<GeographicUnit & { depth: number }> {
  const result: Array<GeographicUnit & { depth: number }> = [];

  for (const unit of units) {
    result.push({ ...unit, depth: level });
    if (unit.children && unit.children.length > 0) {
      result.push(...flattenGeographicTree(unit.children, level + 1));
    }
  }

  return result;
}
