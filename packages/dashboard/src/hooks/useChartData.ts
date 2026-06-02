/**
 * useChartData Hook - Fetches and manages chart data
 * Hook useChartData - Tìm nạp và quản lý dữ liệu biểu đồ
 */

import { useState, useEffect, useCallback } from 'react';
import { ChartData, TimeRange, UseChartDataReturn } from '../types';

/**
 * Hook to fetch and manage chart data
 * Hook để tìm nạp và quản lý dữ liệu biểu đồ
 */
export const useChartData = (
  chartId: string,
  timeRange: TimeRange = 'MONTH',
  autoRefresh: number = 0,
): UseChartDataReturn => {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch chart data from API
   * Tìm nạp dữ liệu biểu đồ từ API
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        chartId,
        timeRange,
        timestamp: new Date().toISOString(),
      });

      // Fetch from API endpoint
      const response = await fetch(`/api/charts/${chartId}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Fallback: return mock data for development
        return {
          ok: true,
          json: async () => getMockChartData(chartId, timeRange),
        } as Response;
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.statusText}`);
      }

      const chartData: ChartData = await response.json();
      setData(chartData);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      console.error('Error fetching chart data:', errorObj);
    } finally {
      setLoading(false);
    }
  }, [chartId, timeRange]);

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
function getMockChartData(chartId: string, timeRange: TimeRange): ChartData {
  const getLabels = () => {
    if (timeRange === 'TODAY') {
      return Array.from({ length: 24 }, (_, i) => `${i}:00`);
    } else if (timeRange === 'WEEK') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (timeRange === 'MONTH') {
      return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    } else if (timeRange === 'QUARTER') {
      return Array.from({ length: 13 }, (_, i) => `Week ${i + 1}`);
    } else if (timeRange === 'YEAR') {
      return [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
    }
    return [];
  };

  const getRandomData = (count: number, min: number, max: number) => {
    return Array.from(
      { length: count },
      () => Math.round(Math.random() * (max - min) + min),
    );
  };

  const labels = getLabels();
  const dataLength = labels.length;

  // Different chart types based on chartId prefix
  if (chartId.includes('revenue')) {
    return {
      labels,
      datasets: [
        {
          label: 'Revenue | Doanh Thu',
          data: getRandomData(dataLength, 50000, 200000),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
        },
      ],
      type: 'line',
    };
  } else if (chartId.includes('sales')) {
    return {
      labels,
      datasets: [
        {
          label: 'Sales | Bán Hàng',
          data: getRandomData(dataLength, 20, 100),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] as any,
          borderColor: '#ffffff',
        },
      ],
      type: 'pie',
    };
  } else if (chartId.includes('orders')) {
    return {
      labels,
      datasets: [
        {
          label: 'Orders | Đơn Hàng',
          data: getRandomData(dataLength, 50, 300),
          backgroundColor: '#10b981',
          borderColor: '#ffffff',
        },
      ],
      type: 'bar',
    };
  } else if (chartId.includes('traffic')) {
    return {
      labels,
      datasets: [
        {
          label: 'Visitors | Khách truy cập',
          data: getRandomData(dataLength, 500, 5000),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
        },
      ],
      type: 'line',
    };
  }

  // Default chart
  return {
    labels,
    datasets: [
      {
        label: 'Data | Dữ liệu',
        data: getRandomData(dataLength, 100, 1000),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
    type: 'line',
  };
}

export default useChartData;
