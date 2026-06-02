/**
 * Promotion Templates React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  PromotionTemplate,
  TemplateVersion,
  TemplateListParams,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ApplyTemplateRequest,
} from '@/types/planning';

// Types for API responses
interface TemplateListResponse {
  success: boolean;
  data: PromotionTemplate[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  };
}

interface TemplateDetailResponse {
  success: boolean;
  data: PromotionTemplate & {
    versions: TemplateVersion[];
    promotions: Array<{
      id: string;
      code: string;
      name: string;
      status: string;
      startDate: string;
      endDate: string;
    }>;
  };
}

interface VersionListResponse {
  success: boolean;
  data: {
    template: { id: string; code: string; name: string };
    versions: TemplateVersion[];
    totalVersions: number;
  };
}

// Query keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (params: TemplateListParams) => [...templateKeys.lists(), params] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  versions: (id: string) => [...templateKeys.all, 'versions', id] as const,
};

// List templates
export function useTemplates(params: TemplateListParams = {}) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const response = await api.get(`/planning/templates?${searchParams.toString()}`);
      return response.data as TemplateListResponse;
    },
  });
}

// Get single template
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/planning/templates/${id}`);
      return response.data as TemplateDetailResponse;
    },
    enabled: !!id,
  });
}

// Get template versions
export function useTemplateVersions(id: string) {
  return useQuery({
    queryKey: templateKeys.versions(id),
    queryFn: async () => {
      const response = await api.get(`/planning/templates/${id}/versions`);
      return response.data as VersionListResponse;
    },
    enabled: !!id,
  });
}

// Create template
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTemplateRequest) => {
      const response = await api.post('/planning/templates', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Update template
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTemplateRequest & { id: string }) => {
      const response = await api.put(`/planning/templates/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.versions(variables.id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Delete template
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/planning/templates/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

// Apply template (create promotion from template)
export function useApplyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ApplyTemplateRequest & { id: string }) => {
      const response = await api.post(`/planning/templates/${id}/apply`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      // Also invalidate promotions since a new one was created
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}
