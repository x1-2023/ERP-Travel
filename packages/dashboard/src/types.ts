/**
 * Type definitions for Dashboard components and data structures
 * Đặc tả kiểu dữ liệu cho các thành phần Dashboard
 */

/**
 * KPI Card properties
 * Thuộc tính Thẻ KPI
 */
export interface KPICard {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'flat';
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  module?: string;
  link?: string; // Navigation link to module
}

/**
 * Dataset for charts
 * Bộ dữ liệu cho biểu đồ
 */
export interface ChartDataset {
  label: string;
  data: (number | null)[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}

/**
 * Chart data structure
 * Cấu trúc dữ liệu biểu đồ
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  type: 'line' | 'bar' | 'pie' | 'doughnut';
}

/**
 * Dashboard widget configuration
 * Cấu hình widget Dashboard
 */
export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'moduleStatus' | 'custom';
  title: string;
  module?: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  data?: Record<string, unknown>;
  refreshInterval?: number; // milliseconds
  loading?: boolean;
  error?: string | null;
}

/**
 * Dashboard layout configuration
 * Cấu hình bố cục Dashboard
 */
export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: 1 | 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg';
}

/**
 * Time range for data queries
 * Khoảng thời gian cho truy vấn dữ liệu
 */
export type TimeRange = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

/**
 * Custom time range
 * Khoảng thời gian tùy chỉnh
 */
export interface CustomTimeRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Table row data
 * Dữ liệu hàng bảng
 */
export interface TableRow {
  id: string;
  timestamp: Date;
  module: string;
  action: string;
  entity: string;
  user: string;
  [key: string]: unknown;
}

/**
 * Module health/status
 * Sức khỏe/Trạng thái mô-đun
 */
export interface ModuleStatus {
  moduleName: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number; // percentage
  lastError?: string;
  lastErrorTime?: Date;
  responseTime?: number; // milliseconds
}

/**
 * Aggregated dashboard data
 * Dữ liệu Dashboard được tổng hợp
 */
export interface DashboardData {
  revenue?: number;
  profit?: number;
  orders?: number;
  newCustomers?: number;
  activeProjects?: number;
  openTasks?: number;
  pendingInvoices?: number;
  inventory?: number;
  productionStatus?: string;
  shippingStatus?: string;
  headcount?: number;
  attendance?: number;
  payrollStatus?: string;
  topCustomers?: Array<{
    id: string;
    name: string;
    revenue: number;
  }>;
  salesPipeline?: Array<{
    stage: string;
    value: number;
    opportunities: number;
  }>;
  recentActivity?: TableRow[];
  moduleStatus?: ModuleStatus[];
  kpis?: Record<string, KPICard>;
}

/**
 * Dashboard preset configuration
 * Cấu hình Preset Dashboard
 */
export interface DashboardPreset {
  id: string;
  name: string;
  nameVI?: string;
  description: string;
  descriptionVI?: string;
  layout: DashboardLayout;
  defaultTimeRange: TimeRange;
  autoRefreshInterval?: number;
}

/**
 * Hook return type for dashboard data
 * Kiểu trả về Hook cho dữ liệu Dashboard
 */
export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook return type for chart data
 * Kiểu trả về Hook cho dữ liệu biểu đồ
 */
export interface UseChartDataReturn {
  data: ChartData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
