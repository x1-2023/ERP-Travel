import { db } from '@/lib/db';
import { differenceInMonths } from 'date-fns';
import { TurnoverRiskPrediction } from '@/types/analytics';
import { RISK_LEVEL_CONFIG } from '../constants';

interface TurnoverRiskParams {
  tenantId: string;
}

interface RiskFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
}

// 6-factor risk scoring weights
const RISK_FACTORS = {
  TENURE: { weight: 0.20, label: 'Tenure Risk' },
  ATTENDANCE: { weight: 0.15, label: 'Attendance Pattern' },
  LEAVE_USAGE: { weight: 0.15, label: 'Leave Usage' },
  SALARY_COMPETITIVENESS: { weight: 0.20, label: 'Salary Competitiveness' },
  OVERTIME: { weight: 0.15, label: 'Overtime Burden' },
  DEPARTMENT_TURNOVER: { weight: 0.15, label: 'Department Turnover History' },
} as const;

export async function predictTurnoverRisk(params: TurnoverRiskParams): Promise<TurnoverRiskPrediction[]> {
  const { tenantId } = params;

  try {
    // Fetch active employees with related data
    const employees = await db.employee.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      include: {
        department: true,
        position: true,
        contracts: {
          where: { status: 'ACTIVE' },
          select: { baseSalary: true },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
        leaveBalances: {
          include: {
            policy: true,
          },
        },
        attendanceSummaries: {
          orderBy: { year: 'desc' },
          take: 6,
        },
      },
    });

    if (employees.length === 0) {
      return [];
    }

    // Get department turnover history
    const departmentTurnoverRates = await calculateDepartmentTurnoverRates(tenantId);

    // Get salary benchmarks for competitiveness scoring
    const avgSalaryByPosition = await getAvgSalaryByPosition(tenantId);

    const predictions: TurnoverRiskPrediction[] = [];

    for (const emp of employees) {
      const factors: RiskFactor[] = [];

      // Factor 1: Tenure Risk
      const tenureScore = calculateTenureRisk(emp.hireDate);
      factors.push({
        factor: RISK_FACTORS.TENURE.label,
        score: tenureScore,
        weight: RISK_FACTORS.TENURE.weight,
        description: getTenureRiskDescription(emp.hireDate),
      });

      // Factor 2: Attendance Pattern
      const attendanceScore = calculateAttendanceRisk(emp.attendanceSummaries);
      factors.push({
        factor: RISK_FACTORS.ATTENDANCE.label,
        score: attendanceScore,
        weight: RISK_FACTORS.ATTENDANCE.weight,
        description: getAttendanceRiskDescription(attendanceScore),
      });

      // Factor 3: Leave Usage
      const leaveScore = calculateLeaveUsageRisk(emp.leaveBalances);
      factors.push({
        factor: RISK_FACTORS.LEAVE_USAGE.label,
        score: leaveScore,
        weight: RISK_FACTORS.LEAVE_USAGE.weight,
        description: getLeaveRiskDescription(leaveScore),
      });

      // Factor 4: Salary Competitiveness
      const positionName = emp.position?.name || 'Unknown';
      const empSalary = Number(emp.contracts[0]?.baseSalary) || 0;
      const salaryScore = calculateSalaryRisk(
        empSalary,
        avgSalaryByPosition[positionName] || 0
      );
      factors.push({
        factor: RISK_FACTORS.SALARY_COMPETITIVENESS.label,
        score: salaryScore,
        weight: RISK_FACTORS.SALARY_COMPETITIVENESS.weight,
        description: getSalaryRiskDescription(salaryScore),
      });

      // Factor 5: Overtime Burden
      const overtimeScore = calculateOvertimeRisk(emp.attendanceSummaries);
      factors.push({
        factor: RISK_FACTORS.OVERTIME.label,
        score: overtimeScore,
        weight: RISK_FACTORS.OVERTIME.weight,
        description: getOvertimeRiskDescription(overtimeScore),
      });

      // Factor 6: Department Turnover History
      const deptName = emp.department?.name || 'Unknown';
      const deptTurnoverScore = calculateDepartmentTurnoverRisk(
        departmentTurnoverRates[deptName] || 0
      );
      factors.push({
        factor: RISK_FACTORS.DEPARTMENT_TURNOVER.label,
        score: deptTurnoverScore,
        weight: RISK_FACTORS.DEPARTMENT_TURNOVER.weight,
        description: getDepartmentRiskDescription(deptTurnoverScore),
      });

      // Calculate overall risk score (weighted average)
      const riskScore = Math.round(
        factors.reduce((sum, f) => sum + f.score * f.weight, 0)
      );

      const riskLevel = getRiskLevel(riskScore);
      const recommendations = generateRecommendations(factors, riskLevel);
      const tenureMonths = emp.hireDate ? differenceInMonths(new Date(), emp.hireDate) : 0;

      predictions.push({
        employeeId: emp.id,
        employeeName: emp.fullName,
        employeeCode: emp.employeeCode || '',
        department: deptName,
        position: emp.position?.name || 'Unknown',
        tenure: tenureMonths,
        riskScore,
        riskLevel,
        factors,
        recommendations,
      });
    }

    // Sort by risk score descending
    predictions.sort((a, b) => b.riskScore - a.riskScore);

    // Save predictions to database
    await savePredictions(tenantId, predictions);

    return predictions;
  } catch (error) {
    console.error('Error predicting turnover risk:', error);
    throw new Error('Failed to predict turnover risk');
  }
}

function calculateTenureRisk(hireDate: Date | null): number {
  if (!hireDate) return 50;

  const tenureMonths = differenceInMonths(new Date(), hireDate);

  // Highest risk: 6-18 months (new enough to leave, settled enough to have options)
  if (tenureMonths < 6) return 40;
  if (tenureMonths < 12) return 75;
  if (tenureMonths < 18) return 65;
  if (tenureMonths < 24) return 50;
  if (tenureMonths < 60) return 30;
  return 15; // Long tenure = lower risk
}

function calculateAttendanceRisk(
  summaries: Array<{ workingDays: unknown; actualWorkDays: unknown; absentDays: unknown; [key: string]: unknown }>
): number {
  if (!summaries || summaries.length === 0) return 30;

  let totalAbsent = 0;
  let totalStandard = 0;
  let totalActual = 0;

  for (const summary of summaries) {
    totalAbsent += Number(summary.absentDays) || 0;
    totalStandard += Number(summary.workingDays) || 0;
    totalActual += Number(summary.actualWorkDays) || 0;
  }

  const attendanceRate = totalStandard > 0 ? totalActual / totalStandard : 1;
  const avgAbsentPerMonth = totalAbsent / summaries.length;

  // Poor attendance indicates disengagement
  if (attendanceRate < 0.85) return 90;
  if (attendanceRate < 0.90) return 70;
  if (avgAbsentPerMonth > 5) return 75;
  if (avgAbsentPerMonth > 3) return 55;
  if (attendanceRate < 0.95) return 40;
  return 15;
}

function calculateLeaveUsageRisk(
  leaveBalances: Array<{ entitlement?: unknown; used?: unknown; available?: unknown; [key: string]: unknown }>
): number {
  if (!leaveBalances || leaveBalances.length === 0) return 30;

  let totalEntitled = 0;
  let totalUsed = 0;

  for (const lb of leaveBalances) {
    const entitled = Number(lb.entitlement) || 0;
    const used = Number(lb.used) || 0;
    totalEntitled += entitled;
    totalUsed += used;
  }

  if (totalEntitled === 0) return 30;

  const usageRate = totalUsed / totalEntitled;

  // Very high usage might indicate burnout; very low might indicate saving for departure
  if (usageRate > 0.9) return 70; // Burning through leave
  if (usageRate < 0.1) return 60; // Saving leave (possible departure planning)
  if (usageRate > 0.75) return 45;
  return 20;
}

function calculateSalaryRisk(employeeSalary: number, avgPositionSalary: number): number {
  if (avgPositionSalary === 0 || employeeSalary === 0) return 40;

  const ratio = employeeSalary / avgPositionSalary;

  // Below market = higher risk
  if (ratio < 0.7) return 90;
  if (ratio < 0.8) return 75;
  if (ratio < 0.9) return 55;
  if (ratio < 1.0) return 35;
  return 10; // Above market = low risk
}

function calculateOvertimeRisk(
  summaries: Array<{ totalOtHours: unknown }>
): number {
  if (!summaries || summaries.length === 0) return 20;

  const totalOtHours = summaries.reduce(
    (sum, s) => sum + (Number(s.totalOtHours) || 0),
    0
  );
  const avgMonthlyOt = totalOtHours / summaries.length;

  // High overtime = burnout risk
  if (avgMonthlyOt > 40) return 90;
  if (avgMonthlyOt > 30) return 75;
  if (avgMonthlyOt > 20) return 55;
  if (avgMonthlyOt > 10) return 35;
  return 15;
}

function calculateDepartmentTurnoverRisk(departmentTurnoverRate: number): number {
  // High department turnover indicates cultural or management issues
  if (departmentTurnoverRate > 25) return 85;
  if (departmentTurnoverRate > 15) return 65;
  if (departmentTurnoverRate > 10) return 45;
  if (departmentTurnoverRate > 5) return 25;
  return 10;
}

function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= RISK_LEVEL_CONFIG.CRITICAL.threshold - 25) return 'CRITICAL';
  if (score >= RISK_LEVEL_CONFIG.HIGH.threshold - 25) return 'HIGH';
  if (score >= RISK_LEVEL_CONFIG.MEDIUM.threshold - 25) return 'MEDIUM';
  return 'LOW';
}

function generateRecommendations(factors: RiskFactor[], riskLevel: string): string[] {
  const recommendations: string[] = [];

  // Sort factors by weighted score (score * weight) descending
  const sortedFactors = [...factors].sort((a, b) => (b.score * b.weight) - (a.score * a.weight));
  const topRiskFactors = sortedFactors.slice(0, 3);

  for (const factor of topRiskFactors) {
    if (factor.score < 40) continue;

    switch (factor.factor) {
      case RISK_FACTORS.TENURE.label:
        recommendations.push('Schedule career development discussion with manager');
        break;
      case RISK_FACTORS.ATTENDANCE.label:
        recommendations.push('Review attendance pattern and conduct engagement check-in');
        break;
      case RISK_FACTORS.LEAVE_USAGE.label:
        recommendations.push('Assess work-life balance and discuss workload management');
        break;
      case RISK_FACTORS.SALARY_COMPETITIVENESS.label:
        recommendations.push('Review compensation against market benchmarks and consider adjustment');
        break;
      case RISK_FACTORS.OVERTIME.label:
        recommendations.push('Evaluate workload distribution and consider hiring or reassignment');
        break;
      case RISK_FACTORS.DEPARTMENT_TURNOVER.label:
        recommendations.push('Investigate department culture and management effectiveness');
        break;
    }
  }

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendations.push('Prioritize retention interview within 2 weeks');
  }

  return recommendations;
}

async function calculateDepartmentTurnoverRates(tenantId: string): Promise<Record<string, number>> {
  const rates: Record<string, number> = {};

  try {
    const departments = await db.department.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    for (const dept of departments) {
      const resigned = await db.employee.count({
        where: {
          tenantId,
          departmentId: dept.id,
          resignationDate: { gte: twelveMonthsAgo },
        },
      });

      const currentCount = await db.employee.count({
        where: {
          tenantId,
          departmentId: dept.id,
          status: 'ACTIVE',
        },
      });

      const avgCount = currentCount + resigned / 2;
      rates[dept.name] = avgCount > 0 ? (resigned / avgCount) * 100 : 0;
    }
  } catch (error) {
    console.error('Error calculating department turnover rates:', error);
  }

  return rates;
}

async function getAvgSalaryByPosition(tenantId: string): Promise<Record<string, number>> {
  const avgSalaries: Record<string, number> = {};

  try {
    const employees = await db.employee.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      select: {
        position: {
          select: { name: true },
        },
        contracts: {
          where: { status: 'ACTIVE' },
          select: { baseSalary: true },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });

    const positionSalaries: Record<string, number[]> = {};
    for (const emp of employees) {
      const posName = emp.position?.name || 'Unknown';
      if (!positionSalaries[posName]) {
        positionSalaries[posName] = [];
      }
      positionSalaries[posName].push(Number(emp.contracts[0]?.baseSalary) || 0);
    }

    for (const [pos, salaries] of Object.entries(positionSalaries)) {
      avgSalaries[pos] = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    }
  } catch (error) {
    console.error('Error calculating avg salary by position:', error);
  }

  return avgSalaries;
}

async function savePredictions(tenantId: string, predictions: TurnoverRiskPrediction[]): Promise<void> {
  try {
    // Delete old predictions for this tenant
    await db.turnoverPrediction.deleteMany({
      where: { tenantId },
    });

    // Insert new predictions
    for (const prediction of predictions) {
      await db.turnoverPrediction.create({
        data: {
          tenantId,
          employeeId: prediction.employeeId,
          riskScore: prediction.riskScore,
          riskLevel: prediction.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          factors: JSON.parse(JSON.stringify(prediction.factors)),
          recommendations: prediction.recommendations,
          predictedAt: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    }
  } catch (error) {
    console.error('Error saving turnover predictions:', error);
    // Non-critical error, don't throw
  }
}

// Description helper functions
function getTenureRiskDescription(hireDate: Date | null): string {
  if (!hireDate) return 'Hire date unknown';
  const months = differenceInMonths(new Date(), hireDate);
  if (months < 12) return `Short tenure (${months} months) - higher flight risk`;
  if (months < 24) return `Moderate tenure (${months} months) - transition period`;
  return `Established tenure (${Math.round(months / 12)} years) - lower risk`;
}

function getAttendanceRiskDescription(score: number): string {
  if (score > 70) return 'Poor attendance pattern detected - possible disengagement';
  if (score > 40) return 'Moderate attendance concerns - monitor closely';
  return 'Healthy attendance pattern';
}

function getLeaveRiskDescription(score: number): string {
  if (score > 60) return 'Unusual leave usage pattern - may indicate burnout or exit planning';
  if (score > 40) return 'Moderate leave usage - within acceptable range';
  return 'Normal leave usage pattern';
}

function getSalaryRiskDescription(score: number): string {
  if (score > 70) return 'Salary significantly below market rate - high risk of competing offers';
  if (score > 40) return 'Salary slightly below market - monitor for competitor offers';
  return 'Salary competitive with market';
}

function getOvertimeRiskDescription(score: number): string {
  if (score > 70) return 'Excessive overtime - high burnout risk';
  if (score > 40) return 'Moderate overtime - monitor workload';
  return 'Reasonable working hours';
}

function getDepartmentRiskDescription(score: number): string {
  if (score > 60) return 'Department has high historical turnover - systemic issues likely';
  if (score > 40) return 'Department has moderate turnover - some concerns';
  return 'Department has healthy retention';
}
