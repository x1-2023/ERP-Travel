/**
 * Live Monitoring React Query Hooks
 * Pepsi V3: Live metrics + dashboard
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const monitoringKeys = {
  all: ['monitoring'] as const,
  dashboard: () => [...monitoringKeys.all, 'dashboard'] as const,
  live: (promotionId: string) => [...monitoringKeys.all, 'live', promotionId] as const,
  stores: (promotionId: string) => [...monitoringKeys.all, 'stores', promotionId] as const,
};

export function useMonitoringDashboard() {
  return useQuery({
    queryKey: monitoringKeys.dashboard(),
    queryFn: async () => {
      const response = await api.get('/monitoring/dashboard');
      return response.data;
    },
    select: (response) => response.data,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useLiveMetrics(promotionId: string) {
  return useQuery({
    queryKey: monitoringKeys.live(promotionId),
    queryFn: async () => {
      const response = await api.get(`/monitoring/live/${promotionId}`);
      return response.data;
    },
    enabled: !!promotionId,
    select: (response) => response.data,
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

export function useStorePerformance(promotionId: string) {
  return useQuery({
    queryKey: monitoringKeys.stores(promotionId),
    queryFn: async () => {
      const response = await api.get(`/monitoring/stores/${promotionId}`);
      return response.data;
    },
    enabled: !!promotionId,
    select: (response) => response.data,
  });
}
