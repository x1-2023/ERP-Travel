export const METRIC_LABELS: Record<string, string> = {
  headcount: 'Headcount',
  turnover: 'Turnover Rate',
  attendance: 'Attendance Rate',
  laborCost: 'Labor Cost',
  newHires: 'New Hires',
  terminated: 'Terminated',
  lateRate: 'Late Rate',
  overtimeHours: 'Overtime Hours',
  avgSalary: 'Average Salary',
  compaRatio: 'Compa-Ratio',
};

export const PERIOD_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export const RISK_LEVEL_CONFIG = {
  LOW: { label: 'Low', color: '#22c55e', threshold: 25 },
  MEDIUM: { label: 'Medium', color: '#f59e0b', threshold: 50 },
  HIGH: { label: 'High', color: '#f97316', threshold: 75 },
  CRITICAL: { label: 'Critical', color: '#ef4444', threshold: 100 },
} as const;

export const AGE_GROUPS = [
  { label: '18-25', min: 18, max: 25 },
  { label: '26-35', min: 26, max: 35 },
  { label: '36-45', min: 36, max: 45 },
  { label: '46-55', min: 46, max: 55 },
  { label: '56+', min: 56, max: 100 },
] as const;

export const TENURE_GROUPS = [
  { label: '<1 year', minMonths: 0, maxMonths: 12 },
  { label: '1-2 years', minMonths: 12, maxMonths: 24 },
  { label: '2-5 years', minMonths: 24, maxMonths: 60 },
  { label: '5-10 years', minMonths: 60, maxMonths: 120 },
  { label: '10+ years', minMonths: 120, maxMonths: Infinity },
] as const;

export const SALARY_RANGES = [
  { label: '<10M', min: 0, max: 10_000_000 },
  { label: '10-20M', min: 10_000_000, max: 20_000_000 },
  { label: '20-30M', min: 20_000_000, max: 30_000_000 },
  { label: '30-50M', min: 30_000_000, max: 50_000_000 },
  { label: '50-80M', min: 50_000_000, max: 80_000_000 },
  { label: '80M+', min: 80_000_000, max: Infinity },
] as const;

export const WIDGET_TYPES = {
  KPI_CARD: 'kpi_card',
  LINE_CHART: 'line_chart',
  BAR_CHART: 'bar_chart',
  PIE_CHART: 'pie_chart',
  DONUT_CHART: 'donut_chart',
  HEATMAP: 'heatmap',
  TABLE: 'table',
  GAUGE: 'gauge',
  TREND: 'trend',
  DISTRIBUTION: 'distribution',
} as const;

export const DEFAULT_WIDGET_SIZES: Record<string, { width: number; height: number }> = {
  [WIDGET_TYPES.KPI_CARD]: { width: 3, height: 2 },
  [WIDGET_TYPES.LINE_CHART]: { width: 6, height: 4 },
  [WIDGET_TYPES.BAR_CHART]: { width: 6, height: 4 },
  [WIDGET_TYPES.PIE_CHART]: { width: 4, height: 4 },
  [WIDGET_TYPES.DONUT_CHART]: { width: 4, height: 4 },
  [WIDGET_TYPES.HEATMAP]: { width: 8, height: 4 },
  [WIDGET_TYPES.TABLE]: { width: 6, height: 5 },
  [WIDGET_TYPES.GAUGE]: { width: 3, height: 3 },
  [WIDGET_TYPES.TREND]: { width: 6, height: 3 },
  [WIDGET_TYPES.DISTRIBUTION]: { width: 6, height: 4 },
};
