import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { TurnoverMetrics } from '@/types/analytics';

interface TurnoverParams {
  tenantId: string;
  date?: Date;
}

export async function calculateTurnoverMetrics(params: TurnoverParams): Promise<TurnoverMetrics> {
  const { tenantId, date = new Date() } = params;
  const periodStart = startOfMonth(date);
  const periodEnd = endOfMonth(date);

  try {
    // Employees who resigned in this period
    const terminatedEmployees = await db.employee.findMany({
      where: {
        tenantId,
        resignationDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        department: true,
      },
    });

    const terminatedCount = terminatedEmployees.length;

    // Calculate average headcount: (beginning + ending) / 2
    const beginningCount = await db.employee.count({
      where: {
        tenantId,
        hireDate: { lte: periodStart },
        OR: [
          { resignationDate: null },
          { resignationDate: { gt: periodStart } },
        ],
      },
    });

    const endingCount = await db.employee.count({
      where: {
        tenantId,
        hireDate: { lte: periodEnd },
        OR: [
          { resignationDate: null },
          { resignationDate: { gt: periodEnd } },
        ],
      },
    });

    const avgHeadcount = (beginningCount + endingCount) / 2;
    const rate = avgHeadcount > 0 ? (terminatedCount / avgHeadcount) * 100 : 0;

    // Voluntary vs involuntary (based on resignationReason)
    const voluntaryReasons = ['PERSONAL', 'BETTER_OPPORTUNITY', 'RELOCATION', 'CAREER_CHANGE', 'RETIREMENT'];
    const voluntaryCount = terminatedEmployees.filter(
      (emp) => emp.resignationReason && voluntaryReasons.includes(emp.resignationReason)
    ).length;
    const involuntaryCount = terminatedCount - voluntaryCount;

    const voluntaryRate = avgHeadcount > 0 ? (voluntaryCount / avgHeadcount) * 100 : 0;
    const involuntaryRate = avgHeadcount > 0 ? (involuntaryCount / avgHeadcount) * 100 : 0;

    // By department
    const byDepartment: Record<string, { rate: number; count: number }> = {};
    const departmentCounts: Record<string, number> = {};

    for (const emp of terminatedEmployees) {
      const deptName = emp.department?.name || 'Unknown';
      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
    }

    // Get department headcounts for rate calculation
    const departments = await db.department.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });

    for (const dept of departments) {
      const deptHeadcount = await db.employee.count({
        where: {
          tenantId,
          departmentId: dept.id,
          status: 'ACTIVE',
        },
      });

      const deptTerminated = departmentCounts[dept.name] || 0;
      const deptRate = deptHeadcount > 0 ? (deptTerminated / deptHeadcount) * 100 : 0;

      if (deptTerminated > 0 || deptHeadcount > 0) {
        byDepartment[dept.name] = {
          rate: Math.round(deptRate * 100) / 100,
          count: deptTerminated,
        };
      }
    }

    // By reason
    const byReason: Record<string, number> = {};
    for (const emp of terminatedEmployees) {
      const reason = emp.resignationReason || 'Unknown';
      byReason[reason] = (byReason[reason] || 0) + 1;
    }

    // Trend (last 12 months)
    const trend = await getTurnoverTrend(tenantId, 12);

    return {
      rate: Math.round(rate * 100) / 100,
      voluntaryRate: Math.round(voluntaryRate * 100) / 100,
      involuntaryRate: Math.round(involuntaryRate * 100) / 100,
      terminatedCount,
      avgHeadcount: Math.round(avgHeadcount),
      byDepartment,
      byReason,
      trend,
    };
  } catch (error) {
    console.error('Error calculating turnover metrics:', error);
    throw new Error('Failed to calculate turnover metrics');
  }
}

export async function getTurnoverTrend(
  tenantId: string,
  months: number = 12
): Promise<Array<{ month: string; rate: number }>> {
  const trend: Array<{ month: string; rate: number }> = [];
  const now = new Date();

  try {
    for (let i = months - 1; i >= 0; i--) {
      const targetDate = subMonths(now, i);
      const monthStart = startOfMonth(targetDate);
      const monthEnd = endOfMonth(targetDate);

      // Count resignations in this month
      const resigned = await db.employee.count({
        where: {
          tenantId,
          resignationDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      // Average headcount for the month
      const beginCount = await db.employee.count({
        where: {
          tenantId,
          hireDate: { lte: monthStart },
          OR: [
            { resignationDate: null },
            { resignationDate: { gt: monthStart } },
          ],
        },
      });

      const endCount = await db.employee.count({
        where: {
          tenantId,
          hireDate: { lte: monthEnd },
          OR: [
            { resignationDate: null },
            { resignationDate: { gt: monthEnd } },
          ],
        },
      });

      const avg = (beginCount + endCount) / 2;
      const monthRate = avg > 0 ? (resigned / avg) * 100 : 0;

      trend.push({
        month: format(targetDate, 'MMM yyyy'),
        rate: Math.round(monthRate * 100) / 100,
      });
    }

    return trend;
  } catch (error) {
    console.error('Error calculating turnover trend:', error);
    throw new Error('Failed to calculate turnover trend');
  }
}
