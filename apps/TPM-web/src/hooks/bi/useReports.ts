/**
 * BI Reports Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Report,
  ReportListParams,
  CreateReportRequest,
  UpdateReportRequest,
  ExecuteReportParams,
  Pagination,
} from '@/types/advanced';

// List reports
export function useReports(params?: ReportListParams) {
  return useQuery({
    queryKey: ['bi-reports', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.set('type', params.type);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

      const res = await api.get(`/bi/reports?${searchParams.toString()}`);
      return res.data as {
        data: Report[];
        pagination: Pagination;
        categories: string[];
      };
    },
  });
}

// Get single report
export function useReport(id: string) {
  return useQuery({
    queryKey: ['bi-report', id],
    queryFn: async () => {
      const res = await api.get(`/bi/reports/${id}`);
      return res.data as { data: Report };
    },
    enabled: !!id,
  });
}

// Create report
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReportRequest) => {
      const res = await api.post('/bi/reports', data);
      return res.data as { data: Report };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bi-reports'] });
    },
  });
}

// Update report
export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReportRequest }) => {
      const res = await api.put(`/bi/reports/${id}`, data);
      return res.data as { data: Report };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bi-reports'] });
      queryClient.invalidateQueries({ queryKey: ['bi-report', id] });
    },
  });
}

// Delete report
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/bi/reports/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bi-reports'] });
    },
  });
}

// Execute report
export function useExecuteReport() {
  return useMutation({
    mutationFn: async ({ id, params }: { id: string; params?: ExecuteReportParams }) => {
      const searchParams = new URLSearchParams();
      if (params?.format) searchParams.set('format', params.format);
      if (params?.dateRange?.from) searchParams.set('dateFrom', params.dateRange.from);
      if (params?.dateRange?.to) searchParams.set('dateTo', params.dateRange.to);

      const res = await api.get(`/bi/reports/${id}/execute?${searchParams.toString()}`);
      return res.data as { data: unknown[]; columns?: string[] };
    },
  });
}
