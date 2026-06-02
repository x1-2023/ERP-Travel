export interface KPIData {
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface HeadcountMetrics {
  total: number;
  active: number;
  newHires: number;
  terminated: number;
  netChange: number;
  byDepartment: Record<string, number>;
  byGender: Record<string, number>;
  byAgeGroup: Record<string, number>;
  byTenure: Record<string, number>;
}

export interface TurnoverMetrics {
  rate: number;
  voluntaryRate: number;
  involuntaryRate: number;
  terminatedCount: number;
  avgHeadcount: number;
  byDepartment: Record<string, { rate: number; count: number }>;
  byReason: Record<string, number>;
  trend: Array<{ month: string; rate: number }>;
}

export interface AttendanceMetrics {
  rate: number;
  totalWorkDays: number;
  totalActualDays: number;
  lateCount: number;
  lateRate: number;
  byDepartment: Record<string, { rate: number; lateRate: number }>;
  heatmap: Array<{ day: number; hour: number; value: number }>;
  dailyPattern: Array<{ day: string; rate: number }>;
}

export interface LaborCostMetrics {
  total: number;
  avgPerEmployee: number;
  salaryTotal: number;
  allowancesTotal: number;
  bonusTotal: number;
  otTotal: number;
  byDepartment: Record<string, number>;
  trend: Array<{ month: string; value: number }>;
}

export interface CompensationMetrics {
  salaryDistribution: Array<{ range: string; count: number; percent: number }>;
  payEquity: {
    genderGap: number;
    byDepartment: Record<string, number>;
  };
  compaRatio: Array<{
    level: string;
    marketMin: number;
    marketMid: number;
    marketMax: number;
    internalAvg: number;
    ratio: number;
  }>;
}

export interface TurnoverRiskPrediction {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  tenure: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: Array<{ factor: string; score: number; weight: number; description: string }>;
  recommendations: string[];
}

export interface ExecutiveDashboardData {
  headcount: KPIData;
  laborCost: KPIData;
  turnover: KPIData;
  attendance: KPIData;
  headcountTrend: Array<{ month: string; value: number }>;
  laborCostTrend: Array<{ month: string; value: number }>;
  costBreakdown: { salary: number; bonus: number; benefits: number; other: number };
  departmentDistribution: Array<{ name: string; count: number }>;
  alerts: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'critical' }>;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  config: Record<string, unknown>;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
  rowHeight: number;
}
