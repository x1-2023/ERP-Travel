import { db } from '@/lib/db';
import { subMonths, format } from 'date-fns';
import { LaborCostMetrics } from '@/types/analytics';

interface LaborCostParams {
  tenantId: string;
  year: number;
  month: number;
}

export async function calculateLaborCostMetrics(params: LaborCostParams): Promise<LaborCostMetrics> {
  const { tenantId, year, month } = params;

  try {
    // Find payroll period for the given month
    const payrollPeriod = await db.payrollPeriod.findFirst({
      where: {
        tenantId,
        year,
        month,
      },
      include: {
        payrolls: {
          select: {
            grossSalary: true,
            baseSalary: true,
            departmentName: true,
          },
        },
      },
    });

    if (!payrollPeriod || payrollPeriod.payrolls.length === 0) {
      return {
        total: 0,
        avgPerEmployee: 0,
        salaryTotal: 0,
        allowancesTotal: 0,
        bonusTotal: 0,
        otTotal: 0,
        byDepartment: {},
        trend: [],
      };
    }

    const payrolls = payrollPeriod.payrolls;
    let salaryTotal = 0;
    let total = 0;

    const byDepartment: Record<string, number> = {};

    for (const payroll of payrolls) {
      const grossSalary = Number(payroll.grossSalary) || 0;
      const baseSalary = Number(payroll.baseSalary) || 0;

      salaryTotal += baseSalary;
      total += grossSalary;

      const deptName = payroll.departmentName || 'Unknown';
      byDepartment[deptName] = (byDepartment[deptName] || 0) + grossSalary;
    }

    // Allowances approximated as total - base salary
    const allowancesTotal = Math.max(0, total - salaryTotal);
    const avgPerEmployee = payrolls.length > 0 ? total / payrolls.length : 0;

    // Get trend (last 12 months)
    const trend = await getLaborCostTrend(tenantId, 12);

    return {
      total: Math.round(total),
      avgPerEmployee: Math.round(avgPerEmployee),
      salaryTotal: Math.round(salaryTotal),
      allowancesTotal: Math.round(allowancesTotal),
      bonusTotal: 0,
      otTotal: 0,
      byDepartment: Object.fromEntries(
        Object.entries(byDepartment).map(([key, value]) => [key, Math.round(value)])
      ),
      trend,
    };
  } catch (error) {
    console.error('Error calculating labor cost metrics:', error);
    throw new Error('Failed to calculate labor cost metrics');
  }
}

export async function getLaborCostTrend(
  tenantId: string,
  months: number = 12
): Promise<Array<{ month: string; value: number }>> {
  const trend: Array<{ month: string; value: number }> = [];
  const now = new Date();

  try {
    for (let i = months - 1; i >= 0; i--) {
      const targetDate = subMonths(now, i);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1;

      const payrollPeriod = await db.payrollPeriod.findFirst({
        where: {
          tenantId,
          year: targetYear,
          month: targetMonth,
        },
        select: {
          totalGross: true,
        },
      });

      const monthTotal = Number(payrollPeriod?.totalGross) || 0;

      trend.push({
        month: format(targetDate, 'MMM yyyy'),
        value: Math.round(monthTotal),
      });
    }

    return trend;
  } catch (error) {
    console.error('Error calculating labor cost trend:', error);
    throw new Error('Failed to calculate labor cost trend');
  }
}
