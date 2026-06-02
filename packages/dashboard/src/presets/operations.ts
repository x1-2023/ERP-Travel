/**
 * Operations Dashboard Preset
 * Preset Dashboard Vận hành
 * Focus: Orders, inventory, production, shipping
 */

import { DashboardPreset } from '../types';

export const operationsDashboard: DashboardPreset = {
  id: 'operations',
  name: 'Operations Dashboard',
  nameVI: 'Dashboard Vận Hành',
  description:
    'Real-time view of orders, inventory levels, production status, and shipping operations',
  descriptionVI:
    'Khung nhìn thực tế của đơn hàng, mức tồn kho, trạng thái sản xuất và hoạt động vận chuyển',
  defaultTimeRange: 'TODAY',
  autoRefreshInterval: 30000, // 30 seconds
  layout: {
    widgets: [
      // Row 1: Key Operation Metrics
      {
        id: 'pending-orders-kpi',
        type: 'kpi',
        title: 'Pending Orders | Đơn Hàng Chờ Xử Lý',
        module: 'Sales',
        size: 'sm',
        data: {
          metricKey: 'pendingOrders',
        },
      },
      {
        id: 'inventory-level-kpi',
        type: 'kpi',
        title: 'Inventory Level | Mức Tồn Kho',
        module: 'Inventory',
        size: 'sm',
        data: {
          metricKey: 'inventoryLevel',
        },
      },
      {
        id: 'production-status-kpi',
        type: 'kpi',
        title: 'Production Progress | Tiến Độ Sản Xuất',
        module: 'Production',
        size: 'sm',
        data: {
          metricKey: 'productionProgress',
        },
      },
      {
        id: 'shipping-pending-kpi',
        type: 'kpi',
        title: 'Pending Shipments | Lô Hàng Chờ Vận Chuyển',
        module: 'Logistics',
        size: 'sm',
        data: {
          metricKey: 'pendingShipments',
        },
      },

      // Row 2: Orders Trend
      {
        id: 'orders-trend',
        type: 'chart',
        title: 'Orders Over Time | Đơn Hàng Theo Thời Gian',
        module: 'Sales',
        size: 'lg',
        data: {
          chartId: 'orders-trend',
        },
        refreshInterval: 60000, // 1 minute
      },

      // Row 2: Inventory by Warehouse
      {
        id: 'inventory-distribution',
        type: 'chart',
        title: 'Inventory Distribution | Phân Phối Tồn Kho',
        module: 'Inventory',
        size: 'md',
        data: {
          chartId: 'inventory-by-warehouse',
        },
        refreshInterval: 120000, // 2 minutes
      },

      // Row 3: Production Queue
      {
        id: 'production-queue',
        type: 'chart',
        title: 'Production Queue | Hàng Chờ Sản Xuất',
        module: 'Production',
        size: 'md',
        data: {
          chartId: 'production-queue',
        },
        refreshInterval: 60000,
      },

      // Row 3: Shipping Status
      {
        id: 'shipping-status',
        type: 'chart',
        title: 'Shipping Status | Trạng Thái Vận Chuyển',
        module: 'Logistics',
        size: 'md',
        data: {
          chartId: 'shipping-status',
        },
        refreshInterval: 120000,
      },

      // Row 4: Low Stock Alert
      {
        id: 'low-stock-items',
        type: 'table',
        title: 'Low Stock Items | Mặt Hàng Tồn Kho Thấp',
        module: 'Inventory',
        size: 'md',
        data: {
          limit: 10,
          filter: { stockLevel: 'low' },
        },
        refreshInterval: 300000, // 5 minutes
      },

      // Row 4: Production Issues
      {
        id: 'production-issues',
        type: 'table',
        title: 'Production Issues | Vấn Đề Sản Xuất',
        module: 'Production',
        size: 'md',
        data: {
          limit: 10,
          filter: { status: 'issue' },
        },
        refreshInterval: 120000,
      },

      // Row 5: Module Status
      {
        id: 'operations-module-status',
        type: 'moduleStatus',
        title: 'Operations System Health | Sức Khỏe Hệ Thống Vận Hành',
        size: 'lg',
        data: {
          modules: ['Sales', 'Inventory', 'Production', 'Logistics'],
        },
        refreshInterval: 60000,
      },

      // Row 6: Recent Operations Activity
      {
        id: 'operations-activity',
        type: 'table',
        title: 'Recent Operations | Các Hoạt Động Vận Hành Gần Đây',
        size: 'xl',
        data: {
          limit: 15,
          modules: ['Sales', 'Inventory', 'Production', 'Logistics'],
        },
        refreshInterval: 30000,
      },
    ],
    columns: 4,
    gap: 'md',
  },
};

export default operationsDashboard;
