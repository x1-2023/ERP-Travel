/**
 * Dashboard React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  kpi: (period: string) => [...dashboardKeys.all, 'kpi', period] as const,
  recentActivity: () => [...dashboardKeys.all, 'activity'] as const,
  chartData: (type: string) => [...dashboardKeys.all, 'chart', type] as const,
};

// Types
interface DashboardStats {
  totalPromotions: number;
  activePromotions: number;
  totalBudget: number;
  utilizedBudget: number;
  pendingClaims: number;
  totalClaims: number;
  approvedClaims: number;
  pendingApprovals: number;
  utilizationRate?: number;
  claimApprovalRate?: number;
}

interface KPIData {
  period: string;
  revenue: number;
  spend: number;
  roi: number;
  claimsProcessed: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

// Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    select: (response) => {
      const data = response.data;
      if (!data) return null;
      // Transform API response to match Dashboard expected format
      return {
        totalPromotions: data.promotions?.total || 0,
        activePromotions: data.promotions?.active || 0,
        totalBudget: data.funds?.total || data.budget?.total || 0,
        utilizedBudget: data.funds?.used || data.budget?.spent || 0,
        pendingClaims: data.claims?.pending || 0,
        totalClaims: data.claims?.total || 0,
        approvedClaims: 0,
        pendingApprovals: data.promotions?.pending || 0,
        utilizationRate: data.funds?.utilizationRate || data.budget?.utilizationRate || 0,
        claimApprovalRate: 0,
      } as DashboardStats;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useKPIData(period: 'weekly' | 'monthly' | 'quarterly' = 'monthly') {
  return useQuery({
    queryKey: dashboardKeys.kpi(period),
    queryFn: async () => {
      const response = await api.get(`/dashboard/kpi`, { params: { period } });
      return response.data;
    },
    select: (response) => response.data as KPIData[],
  });
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(),
    queryFn: async () => {
      const response = await api.get('/dashboard/activity', { params: { limit } });
      return response.data;
    },
    select: (response) => response.data as Activity[],
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function usePromotionsByStatus() {
  return useQuery({
    queryKey: dashboardKeys.chartData('promotions-by-status'),
    queryFn: async () => {
      const response = await api.get('/dashboard/charts/promotions-by-status');
      return response.data;
    },
    select: (response) => response.data?.data || [],
  });
}

export function useBudgetUtilization() {
  return useQuery({
    queryKey: dashboardKeys.chartData('budget-utilization'),
    queryFn: async () => {
      const response = await api.get('/dashboard/charts/budget-utilization');
      return response.data;
    },
    select: (response) => response.data?.data || [],
  });
}

export function useClaimsTrend(period: 'weekly' | 'monthly' = 'monthly') {
  return useQuery({
    queryKey: dashboardKeys.chartData(`claims-trend-${period}`),
    queryFn: async () => {
      const response = await api.get('/dashboard/charts/claims-trend', { params: { period } });
      return response.data;
    },
    select: (response) => response.data?.data || [],
  });
}

export function useSpendTrend() {
  return useQuery({
    queryKey: dashboardKeys.chartData('spend-trend'),
    queryFn: async () => {
      const response = await api.get('/dashboard/charts/spend-trend');
      return response.data;
    },
    select: (response) => response.data?.data || [],
  });
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: dashboardKeys.chartData('status-distribution'),
    queryFn: async () => {
      const response = await api.get('/dashboard/charts/status-distribution');
      return response.data;
    },
    select: (response) => response.data?.data || [],
  });
}

export function useTopCustomers() {
  return useQuery({
    queryKey: dashboardKeys.chartData('top-customers'),
    queryFn: async () => {
      const response = await api.get('/dashboard/charts/top-customers');
      return response.data;
    },
    select: (response) => response.data?.data || [],
  });
}
