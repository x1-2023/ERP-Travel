import { db } from '@/lib/db';
import { calculateHeadcountMetrics, getHeadcountTrend } from '../calculators/headcount';
import { calculateTurnoverMetrics } from '../calculators/turnover';
import { calculateAttendanceMetrics } from '../calculators/attendance';
import { calculateLaborCostMetrics } from '../calculators/labor-cost';
import { calculateCompensationMetrics } from '../calculators/compa-ratio';
import { predictTurnoverRisk } from '../predictors/turnover-risk';
import {
  HeadcountMetrics,
  TurnoverMetrics,
  AttendanceMetrics,
  LaborCostMetrics,
  CompensationMetrics,
  ExecutiveDashboardData,
  KPIData,
} from '@/types/analytics';

interface AggregatorParams {
  tenantId: string;
  year: number;
  month: number;
}

interface AggregatedMetrics {
  headcount: HeadcountMetrics;
  turnover: TurnoverMetrics;
  attendance: AttendanceMetrics;
  laborCost: LaborCostMetrics;
  compensation: CompensationMetrics;
}

export async function aggregateAllMetrics(params: AggregatorParams): Promise<AggregatedMetrics> {
  const { tenantId, year, month } = params;
  const targetDate = new Date(year, month - 1, 15); // Mid-month date

  try {
    // Run all calculators in parallel
    const [headcount, turnover, attendance, laborCost, compensation] = await Promise.all([
      calculateHeadcountMetrics({ tenantId, date: targetDate }),
      calculateTurnoverMetrics({ tenantId, date: targetDate }),
      calculateAttendanceMetrics({ tenantId, year, month }),
      calculateLaborCostMetrics({ tenantId, year, month }),
      calculateCompensationMetrics({ tenantId }),
    ]);

    // Store aggregated metrics in the database
    await storeMetrics(tenantId, year, month, {
      headcount,
      turnover,
      attendance,
      laborCost,
      compensation,
    });

    return { headcount, turnover, attendance, laborCost, compensation };
  } catch (error) {
    console.error('Error aggregating metrics:', error);
    throw new Error('Failed to aggregate analytics metrics');
  }
}

export async function getExecutiveDashboard(params: AggregatorParams): Promise<ExecutiveDashboardData> {
  const { tenantId, year, month } = params;
  const targetDate = new Date(year, month - 1, 15);

  // Previous month for comparison
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDate = new Date(prevYear, prevMonth - 1, 15);

  try {
    // Current period metrics
    const [currentHeadcount, currentTurnover, currentAttendance, currentLaborCost] = await Promise.all([
      calculateHeadcountMetrics({ tenantId, date: targetDate }),
      calculateTurnoverMetrics({ tenantId, date: targetDate }),
      calculateAttendanceMetrics({ tenantId, year, month }),
      calculateLaborCostMetrics({ tenantId, year, month }),
    ]);

    // Previous period metrics for comparison
    const [prevHeadcount, prevTurnover, prevAttendance, prevLaborCost] = await Promise.all([
      calculateHeadcountMetrics({ tenantId, date: prevDate }),
      calculateTurnoverMetrics({ tenantId, date: prevDate }),
      calculateAttendanceMetrics({ tenantId, year: prevYear, month: prevMonth }),
      calculateLaborCostMetrics({ tenantId, year: prevYear, month: prevMonth }),
    ]);

    // Build KPIs with trend comparison
    const headcountKPI = buildKPI(currentHeadcount.active, prevHeadcount.active);
    const laborCostKPI = buildKPI(currentLaborCost.total, prevLaborCost.total);
    const turnoverKPI = buildKPI(currentTurnover.rate, prevTurnover.rate, true); // Inverse - lower is better
    const attendanceKPI = buildKPI(currentAttendance.rate, prevAttendance.rate);

    // Trends
    const [headcountTrend, laborCostTrend] = await Promise.all([
      getHeadcountTrend(tenantId, 12),
      getLaborCostTrendData(tenantId, 12),
    ]);

    // Cost breakdown
    const costBreakdown = {
      salary: currentLaborCost.salaryTotal,
      bonus: currentLaborCost.bonusTotal,
      benefits: currentLaborCost.allowancesTotal,
      other: currentLaborCost.otTotal,
    };

    // Department distribution
    const departmentDistribution = Object.entries(currentHeadcount.byDepartment).map(
      ([name, count]) => ({ name, count })
    );

    // Generate alerts
    const alerts = generateAlerts(currentHeadcount, currentTurnover, currentAttendance);

    return {
      headcount: headcountKPI,
      laborCost: laborCostKPI,
      turnover: turnoverKPI,
      attendance: attendanceKPI,
      headcountTrend,
      laborCostTrend,
      costBreakdown,
      departmentDistribution,
      alerts,
    };
  } catch (error) {
    console.error('Error building executive dashboard:', error);
    throw new Error('Failed to build executive dashboard');
  }
}

export async function runFullAnalytics(tenantId: string, year: number, month: number): Promise<void> {
  try {
    // Step 1: Aggregate all metrics
    await aggregateAllMetrics({ tenantId, year, month });

    // Step 2: Run turnover risk predictions
    await predictTurnoverRisk({ tenantId });

  } catch (error) {
    console.error('Error running full analytics:', error);
    throw new Error('Failed to run full analytics');
  }
}

// Helper functions

function buildKPI(currentValue: number, previousValue: number, inverseIsBetter: boolean = false): KPIData {
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0
    ? Math.round((change / previousValue) * 100 * 100) / 100
    : 0;

  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(changePercent) < 1) {
    trend = 'stable';
  } else if (inverseIsBetter) {
    trend = change > 0 ? 'down' : 'up'; // For turnover, increase is bad
  } else {
    trend = change > 0 ? 'up' : 'down';
  }

  return {
    value: Math.round(currentValue * 100) / 100,
    previousValue: Math.round(previousValue * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent,
    trend,
  };
}

function generateAlerts(
  headcount: HeadcountMetrics,
  turnover: TurnoverMetrics,
  attendance: AttendanceMetrics,
): Array<{ type: string; message: string; severity: 'info' | 'warning' | 'critical' }> {
  const alerts: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'critical' }> = [];

  // High turnover alert
  if (turnover.rate > 15) {
    alerts.push({
      type: 'turnover',
      message: `Monthly turnover rate is ${turnover.rate}% - significantly above healthy threshold`,
      severity: 'critical',
    });
  } else if (turnover.rate > 8) {
    alerts.push({
      type: 'turnover',
      message: `Monthly turnover rate is ${turnover.rate}% - approaching warning threshold`,
      severity: 'warning',
    });
  }

  // Low attendance alert
  if (attendance.rate < 85) {
    alerts.push({
      type: 'attendance',
      message: `Attendance rate is ${attendance.rate}% - below acceptable threshold`,
      severity: 'critical',
    });
  } else if (attendance.rate < 92) {
    alerts.push({
      type: 'attendance',
      message: `Attendance rate is ${attendance.rate}% - monitor closely`,
      severity: 'warning',
    });
  }

  // High late rate
  if (attendance.lateRate > 20) {
    alerts.push({
      type: 'attendance',
      message: `Late rate is ${attendance.lateRate}% - review punctuality policies`,
      severity: 'warning',
    });
  }

  // Negative net change (losing more than gaining)
  if (headcount.netChange < -5) {
    alerts.push({
      type: 'headcount',
      message: `Net headcount change is ${headcount.netChange} - significant workforce reduction`,
      severity: 'critical',
    });
  } else if (headcount.netChange < 0) {
    alerts.push({
      type: 'headcount',
      message: `Net headcount change is ${headcount.netChange} - workforce shrinking`,
      severity: 'info',
    });
  }

  // Department with high turnover
  for (const [dept, data] of Object.entries(turnover.byDepartment)) {
    if (data.rate > 20) {
      alerts.push({
        type: 'department',
        message: `${dept} department has ${data.rate}% turnover rate - investigate immediately`,
        severity: 'critical',
      });
    }
  }

  return alerts;
}

async function storeMetrics(
  tenantId: string,
  year: number,
  month: number,
  metrics: AggregatedMetrics
): Promise<void> {
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0, 23, 59, 59);

  try {
    const metricEntries: Array<{ metricType: 'HEADCOUNT' | 'TURNOVER' | 'ATTENDANCE' | 'LABOR_COST'; value: number; breakdown: unknown }> = [
      { metricType: 'HEADCOUNT', value: metrics.headcount.total, breakdown: metrics.headcount },
      { metricType: 'TURNOVER', value: metrics.turnover.rate, breakdown: metrics.turnover },
      { metricType: 'ATTENDANCE', value: metrics.attendance.rate, breakdown: metrics.attendance },
      { metricType: 'LABOR_COST', value: metrics.laborCost.total, breakdown: metrics.laborCost },
    ];

    for (const entry of metricEntries) {
      const existing = await db.analyticsMetric.findFirst({
        where: {
          tenantId,
          metricType: entry.metricType,
          period: 'MONTHLY',
          periodStart,
          departmentId: null,
        },
      });

      if (existing) {
        await db.analyticsMetric.update({
          where: { id: existing.id },
          data: {
            value: entry.value,
            breakdown: entry.breakdown as object,
            calculatedAt: new Date(),
          },
        });
      } else {
        await db.analyticsMetric.create({
          data: {
            tenantId,
            metricType: entry.metricType,
            period: 'MONTHLY',
            periodStart,
            periodEnd,
            value: entry.value,
            breakdown: entry.breakdown as object,
            calculatedAt: new Date(),
          },
        });
      }
    }
  } catch (error) {
    console.error('Error storing analytics metrics:', error);
  }
}

async function getLaborCostTrendData(
  tenantId: string,
  months: number
): Promise<Array<{ month: string; value: number }>> {
  // Re-use the labor cost trend function
  const { getLaborCostTrend } = await import('../calculators/labor-cost');
  return getLaborCostTrend(tenantId, months);
}
