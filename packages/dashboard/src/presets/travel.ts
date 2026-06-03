/**
 * Travel Back-Office Dashboard Preset
 * Focus: AnVoyages booking channel, TravelOps, Accounting, HRM, PM, CRM, ExcelAI, and direct channel control.
 */

import { DashboardPreset } from '../types';

export const travelDashboard: DashboardPreset = {
  id: 'travel',
  name: 'Travel Back-Office Dashboard',
  nameVI: 'Dashboard Back-Office Du Lich',
  description:
    'Unified travel ERP dashboard covering public booking, operations, accounting, HRM, PM, CRM, ExcelAI, documents, and direct channel control',
  descriptionVI:
    'Dashboard ERP tong hop cho booking public, van hanh tour, ke toan, nhan su, du an, CRM, ExcelAI, tai lieu va dieu khien kenh truc tiep',
  defaultTimeRange: 'TODAY',
  autoRefreshInterval: 30000,
  layout: {
    widgets: [
      {
        id: 'travel-new-bookings',
        type: 'kpi',
        title: 'New Web Bookings | Booking Web Moi',
        module: 'AnVoyages Booking CRM',
        size: 'sm',
        data: {
          metricKey: 'newWebBookings',
          sourceModule: 'apps/AnVoyages-Booking-CRM',
        },
      },
      {
        id: 'travel-confirmed-bookings',
        type: 'kpi',
        title: 'Confirmed Bookings | Booking Da Xac Nhan',
        module: 'TravelOps',
        size: 'sm',
        data: {
          metricKey: 'confirmedBookings',
        },
      },
      {
        id: 'travel-deposit-cash',
        type: 'kpi',
        title: 'Deposits Collected | Tien Coc Da Thu',
        module: 'Accounting',
        size: 'sm',
        data: {
          metricKey: 'bookingDeposits',
        },
      },
      {
        id: 'travel-margin',
        type: 'kpi',
        title: 'Departure Margin | Loi Nhuan Tour',
        module: 'Accounting',
        size: 'sm',
        data: {
          metricKey: 'departureMargin',
        },
      },
      {
        id: 'travel-pickup-trend',
        type: 'chart',
        title: 'Booking Pickup | Toc Do Len Booking',
        module: 'AnVoyages Booking CRM',
        size: 'lg',
        data: {
          chartId: 'travel-booking-pickup',
        },
        refreshInterval: 60000,
      },
      {
        id: 'travel-yield-analysis',
        type: 'chart',
        title: 'Price and Occupancy Yield | Gia Va Cong Suat',
        module: 'ExcelAI',
        size: 'lg',
        data: {
          chartId: 'travel-yield-analysis',
        },
        refreshInterval: 300000,
      },
      {
        id: 'travel-direct-channel-status',
        type: 'moduleStatus',
        title: 'Travel Module Health | Suc Khoe Module Du Lich',
        size: 'xl',
        data: {
          modules: [
            'AnVoyages Booking CRM',
            'TravelOps',
            'Accounting',
            'HRM',
            'PM',
            'CRM',
            'ExcelAI',
            'Documents',
            'Notifications',
          ],
        },
        refreshInterval: 60000,
      },
      {
        id: 'travel-inventory-alerts',
        type: 'table',
        title: 'Inventory and Stop-Sell Alerts | Canh Bao Ton Phong',
        module: 'TravelOps',
        size: 'lg',
        data: {
          entity: 'TravelInventoryBlock',
          filter: { status: ['STOP_SELL', 'REQUEST_ONLY', 'CLOSED'] },
          limit: 12,
        },
        refreshInterval: 60000,
      },
      {
        id: 'travel-rate-rules',
        type: 'table',
        title: 'Active Seasonal Rate Rules | Rule Gia Mua Vu Dang Chay',
        module: 'TravelOps',
        size: 'lg',
        data: {
          entity: 'TravelRateRule',
          filter: { isActive: true },
          limit: 12,
        },
        refreshInterval: 300000,
      },
      {
        id: 'travel-operations-checklist',
        type: 'table',
        title: 'Departure Operations | Viec Van Hanh Chuyen Di',
        module: 'PM',
        size: 'xl',
        data: {
          modules: ['TravelOps', 'PM', 'HRM', 'Documents'],
          limit: 15,
        },
        refreshInterval: 60000,
      },
    ],
    columns: 4,
    gap: 'md',
  },
};

export default travelDashboard;
