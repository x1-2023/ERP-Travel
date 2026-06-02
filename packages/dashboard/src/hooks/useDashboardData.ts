/**
 * useDashboardData Hook - Fetches aggregated KPIs from all modules
 * Hook useDashboardData - Tìm nạp KPI tổng hợp từ tất cả các mô-đun
 */

import { useState, useEffect, useCallback } from 'react';
import { DashboardData, TimeRange, UseDashboardDataReturn } from '../types';

/**
 * Hook to fetch and manage dashboard data
 * Hook để tìm nạp và quản lý dữ liệu dashboard
 */
export const useDashboardData = (
  timeRange: TimeRange = 'MONTH',
  autoRefresh: number = 0,
): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch dashboard data from API
   * Tìm nạp dữ liệu dashboard từ API
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        timeRange,
        timestamp: new Date().toISOString(),
      });

      // Fetch from API endpoint
      // In real implementation, this would call an aggregation endpoint
      const response = await fetch(`/api/dashboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Fallback: return mock data for development
        return {
          ok: true,
          json: async () => getMockDashboardData(timeRange),
        } as Response;
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      console.error('Error fetching dashboard data:', errorObj);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  /**
   * Refetch data manually
   * Tìm nạp lại dữ liệu thủ công
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefresh <= 0) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, autoRefresh);

    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Mock data generator for development
 * Trình tạo dữ liệu giả cho phát triển
 */
function getMockDashboardData(timeRange: TimeRange): DashboardData {
  const now = new Date();
  const baseRevenue = 1000000;
  const multiplier = timeRange === 'TODAY' ? 0.1 : timeRange === 'WEEK' ? 0.3 : 1;

  return {
    revenue: Math.round(baseRevenue * multiplier + Math.random() * 50000),
    profit: Math.round(baseRevenue * 0.3 * multiplier + Math.random() * 20000),
    orders: Math.round(500 * multiplier + Math.random() * 100),
    newCustomers: Math.round(50 * multiplier + Math.random() * 20),
    activeProjects: Math.round(25 + Math.random() * 10),
    openTasks: Math.round(120 + Math.random() * 50),
    pendingInvoices: Math.round(15 + Math.random() * 10),
    inventory: Math.round(5000 + Math.random() * 1000),
    productionStatus: Math.random() > 0.1 ? 'On Track' : 'At Risk',
    shippingStatus: Math.random() > 0.05 ? 'Normal' : 'Delayed',
    headcount: Math.round(150 + Math.random() * 20),
    attendance: Math.round(92 + Math.random() * 5),
    payrollStatus: 'Processed',
    topCustomers: [
      {
        id: '1',
        name: 'Acme Corp',
        revenue: Math.round(250000 * multiplier),
      },
      {
        id: '2',
        name: 'Tech Solutions Ltd',
        revenue: Math.round(180000 * multiplier),
      },
      {
        id: '3',
        name: 'Global Industries',
        revenue: Math.round(150000 * multiplier),
      },
    ],
    salesPipeline: [
      {
        stage: 'Prospect',
        value: Math.round(200000 * multiplier),
        opportunities: 15,
      },
      {
        stage: 'Qualified',
        value: Math.round(300000 * multiplier),
        opportunities: 10,
      },
      {
        stage: 'Proposal',
        value: Math.round(250000 * multiplier),
        opportunities: 5,
      },
      {
        stage: 'Negotiation',
        value: Math.round(150000 * multiplier),
        opportunities: 2,
      },
    ],
    recentActivity: [
      {
        id: '1',
        timestamp: new Date(now.getTime() - 5 * 60000),
        module: 'Sales',
        action: 'Order Created',
        entity: 'Order #ORD-2024-001',
        user: 'John Doe',
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 15 * 60000),
        module: 'Inventory',
        action: 'Stock Updated',
        entity: 'Product SKU-123',
        user: 'Jane Smith',
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() - 30 * 60000),
        module: 'Accounting',
        action: 'Invoice Generated',
        entity: 'Invoice #INV-2024-001',
        user: 'Bob Wilson',
      },
      {
        id: '4',
        timestamp: new Date(now.getTime() - 60 * 60000),
        module: 'HR',
        action: 'Employee Added',
        entity: 'Employee #EMP-001',
        user: 'HR Admin',
      },
      {
        id: '5',
        timestamp: new Date(now.getTime() - 2 * 60 * 60000),
        module: 'Production',
        action: 'Production Order Completed',
        entity: 'PO #PROD-2024-001',
        user: 'Factory Manager',
      },
    ],
    moduleStatus: [
      {
        moduleName: 'Sales CRM',
        status: 'online',
        uptime: 99.95,
        responseTime: 145,
      },
      {
        moduleName: 'Accounting',
        status: 'online',
        uptime: 99.98,
        responseTime: 123,
      },
      {
        moduleName: 'Inventory',
        status: 'online',
        uptime: 99.90,
        responseTime: 167,
      },
      {
        moduleName: 'HR',
        status: 'degraded',
        uptime: 98.5,
        responseTime: 450,
        lastError: 'Database connection pool exhausted',
        lastErrorTime: new Date(now.getTime() - 15 * 60000),
      },
      {
        moduleName: 'Production',
        status: 'online',
        uptime: 99.85,
        responseTime: 234,
      },
      {
        moduleName: 'E-Commerce',
        status: 'online',
        uptime: 99.99,
        responseTime: 89,
      },
    ],
    kpis: {
      totalRevenue: {
        title: 'Total Revenue | Tổng Doanh Thu',
        value: `$${(Math.round(baseRevenue * multiplier) / 1000000).toFixed(2)}M`,
        change: 12.5,
        trend: 'up',
        color: 'success',
        module: 'Sales',
        link: '/sales',
      },
      orderCount: {
        title: 'Total Orders | Tổng Đơn Hàng',
        value: '487',
        change: 8.3,
        trend: 'up',
        color: 'primary',
        module: 'Sales',
        link: '/sales/orders',
      },
      inventoryValue: {
        title: 'Inventory Value | Giá Trị Hàng Tồn Kho',
        value: '$245K',
        change: -3.2,
        trend: 'down',
        color: 'warning',
        module: 'Inventory',
        link: '/inventory',
      },
      pendingTasks: {
        title: 'Open Tasks | Các Tác Vụ Mở',
        value: '156',
        change: 5.1,
        trend: 'up',
        color: 'warning',
        module: 'Projects',
        link: '/projects/tasks',
      },
    },
  };
}

export default useDashboardData;
