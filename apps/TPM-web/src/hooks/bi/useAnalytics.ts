/**
 * BI Analytics Hooks
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  DashboardParams,
  DashboardResponse,
  KPI,
  TrendData,
  ExportRequest,
  ExportResponse,
} from '@/types/advanced';

// Get dashboard data
export function useDashboard(params?: DashboardParams) {
  return useQuery({
    queryKey: ['bi-dashboard', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);

      const res = await api.get(`/bi/analytics/dashboard?${searchParams.toString()}`);
      return res.data as DashboardResponse;
    },
  });
}

// Get KPIs
export function useKPIs(params?: DashboardParams) {
  return useQuery({
    queryKey: ['bi-kpis', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);

      const res = await api.get(`/bi/analytics/kpis?${searchParams.toString()}`);
      return res.data as { data: KPI[] };
    },
  });
}

// Get trends
export function useTrends(params?: DashboardParams & { metric?: string }) {
  return useQuery({
    queryKey: ['bi-trends', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
      if (params?.metric) searchParams.set('metric', params.metric);

      const res = await api.get(`/bi/analytics/trends?${searchParams.toString()}`);
      return res.data as { data: TrendData[] };
    },
  });
}

// Export data
export function useExport() {
  return useMutation({
    mutationFn: async (data: ExportRequest) => {
      const res = await api.post('/bi/export', data, {
        responseType: data.format === 'PDF' || data.format === 'EXCEL' ? 'blob' : 'json',
      });

      // If blob response, create download URL
      if (res.data instanceof Blob) {
        const url = URL.createObjectURL(res.data);
        const extension = data.format.toLowerCase();
        const filename = `export-${Date.now()}.${extension === 'excel' ? 'xlsx' : extension}`;
        return { success: true, url, filename } as ExportResponse;
      }

      return res.data as ExportResponse;
    },
  });
}
