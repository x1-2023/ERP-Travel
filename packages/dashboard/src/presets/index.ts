/**
 * Dashboard Presets - Centralized exports
 * Các Preset Dashboard - Xuất khẩu tập trung
 */

export { executiveDashboard } from './executive';
export { operationsDashboard } from './operations';
export { hrDashboard } from './hr';

export const dashboardPresets = {
  executive: require('./executive').executiveDashboard,
  operations: require('./operations').operationsDashboard,
  hr: require('./hr').hrDashboard,
};

export default dashboardPresets;
