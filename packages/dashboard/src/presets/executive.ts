/**
 * Executive Dashboard Preset
 * Preset Dashboard Điều hành
 * Focus: Revenue, profit, top customers, sales pipeline
 */

import { DashboardPreset } from '../types';

export const executiveDashboard: DashboardPreset = {
  id: 'executive',
  name: 'Executive Dashboard',
  nameVI: 'Dashboard Điều hành',
  description:
    'High-level overview of business performance, revenue, profitability, and sales pipeline',
  descriptionVI:
    'Tổng quan cấp cao về hiệu suất kinh doanh, doanh thu, lợi nhuận và bộ bán hàng',
  defaultTimeRange: 'MONTH',
  autoRefreshInterval: 60000, // 1 minute
  layout: {
    widgets: [
      // Row 1: Key Revenue Metrics
      {
        id: 'revenue-kpi',
        type: 'kpi',
        title: 'Total Revenue | Tổng Doanh Thu',
        module: 'Sales',
        size: 'md',
        data: {
          metricKey: 'revenue',
        },
      },
      {
        id: 'profit-kpi',
        type: 'kpi',
        title: 'Net Profit | Lợi Nhuận Ròng',
        module: 'Accounting',
        size: 'md',
        data: {
          metricKey: 'profit',
        },
      },
      {
        id: 'profit-margin-kpi',
        type: 'kpi',
        title: 'Profit Margin | Tỷ Lợi Nhuận',
        module: 'Accounting',
        size: 'md',
        data: {
          metricKey: 'profitMargin',
        },
      },

      // Row 2: Revenue Trend Chart
      {
        id: 'revenue-trend',
        type: 'chart',
        title: 'Revenue Trend | Xu Hướng Doanh Thu',
        module: 'Sales',
        size: 'lg',
        data: {
          chartId: 'revenue-trend',
        },
        refreshInterval: 300000, // 5 minutes
      },

      // Row 2: Profit Trend Chart
      {
        id: 'profit-trend',
        type: 'chart',
        title: 'Profit Trend | Xu Hướng Lợi Nhuận',
        module: 'Accounting',
        size: 'lg',
        data: {
          chartId: 'profit-trend',
        },
        refreshInterval: 300000,
      },

      // Row 3: Top Customers
      {
        id: 'top-customers',
        type: 'chart',
        title: 'Top Customers by Revenue | Top Khách Hàng Theo Doanh Thu',
        module: 'Sales',
        size: 'md',
        data: {
          chartId: 'top-customers',
        },
        refreshInterval: 600000, // 10 minutes
      },

      // Row 3: Sales Pipeline
      {
        id: 'sales-pipeline',
        type: 'chart',
        title: 'Sales Pipeline | Bộ Bán Hàng',
        module: 'Sales',
        size: 'md',
        data: {
          chartId: 'sales-pipeline',
        },
        refreshInterval: 600000,
      },

      // Row 4: Module Status
      {
        id: 'module-status',
        type: 'moduleStatus',
        title: 'System Health | Sức Khỏe Hệ Thống',
        size: 'lg',
        data: {
          modules: ['Sales', 'Accounting', 'Inventory', 'HR'],
        },
        refreshInterval: 120000, // 2 minutes
      },

      // Row 5: Recent Activity
      {
        id: 'recent-activity',
        type: 'table',
        title: 'Recent Activity | Hoạt Động Gần Đây',
        size: 'xl',
        data: {
          limit: 10,
        },
        refreshInterval: 120000,
      },
    ],
    columns: 3,
    gap: 'md',
  },
};

export default executiveDashboard;
