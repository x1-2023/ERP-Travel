import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths, differenceInMonths, differenceInYears } from 'date-fns';
import { HeadcountMetrics } from '@/types/analytics';
import { AGE_GROUPS, TENURE_GROUPS } from '../constants';

interface HeadcountParams {
  tenantId: string;
  date?: Date;
}

export async function calculateHeadcountMetrics(params: HeadcountParams): Promise<HeadcountMetrics> {
  const { tenantId, date = new Date() } = params;
  const periodStart = startOfMonth(date);
  const periodEnd = endOfMonth(date);

  try {
    // Total active employees
    const active = await db.employee.count({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
    });

    // Total employees (all statuses)
    const total = await db.employee.count({
      where: { tenantId },
    });

    // New hires in the period
    const newHires = await db.employee.count({
      where: {
        tenantId,
        hireDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    // Terminated in the period (using resignationDate)
    const terminated = await db.employee.count({
      where: {
        tenantId,
        resignationDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    const netChange = newHires - terminated;

    // By department
    const departmentGroups = await db.employee.groupBy({
      by: ['departmentId'],
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      _count: { id: true },
    });

    const departments = await db.department.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });

    const departmentMap = new Map(departments.map((d) => [d.id, d.name]));
    const byDepartment: Record<string, number> = {};
    for (const group of departmentGroups) {
      if (group.departmentId) {
        const name = departmentMap.get(group.departmentId) || 'Unknown';
        byDepartment[name] = group._count.id;
      }
    }

    // By gender
    const genderGroups = await db.employee.groupBy({
      by: ['gender'],
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      _count: { id: true },
    });

    const byGender: Record<string, number> = {};
    for (const group of genderGroups) {
      const genderLabel = group.gender || 'Unknown';
      byGender[genderLabel] = group._count.id;
    }

    // By age group
    const activeEmployees = await db.employee.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      select: {
        dateOfBirth: true,
        hireDate: true,
      },
    });

    const byAgeGroup: Record<string, number> = {};
    for (const ageGroup of AGE_GROUPS) {
      byAgeGroup[ageGroup.label] = 0;
    }

    const now = new Date();
    for (const emp of activeEmployees) {
      if (emp.dateOfBirth) {
        const age = differenceInYears(now, emp.dateOfBirth);
        for (const ageGroup of AGE_GROUPS) {
          if (age >= ageGroup.min && age <= ageGroup.max) {
            byAgeGroup[ageGroup.label]++;
            break;
          }
        }
      }
    }

    // By tenure
    const byTenure: Record<string, number> = {};
    for (const tenureGroup of TENURE_GROUPS) {
      byTenure[tenureGroup.label] = 0;
    }

    for (const emp of activeEmployees) {
      if (emp.hireDate) {
        const tenureMonths = differenceInMonths(now, emp.hireDate);
        for (const tenureGroup of TENURE_GROUPS) {
          if (tenureMonths >= tenureGroup.minMonths && tenureMonths < tenureGroup.maxMonths) {
            byTenure[tenureGroup.label]++;
            break;
          }
        }
      }
    }

    return {
      total,
      active,
      newHires,
      terminated,
      netChange,
      byDepartment,
      byGender,
      byAgeGroup,
      byTenure,
    };
  } catch (error) {
    console.error('Error calculating headcount metrics:', error);
    throw new Error('Failed to calculate headcount metrics');
  }
}

export async function getHeadcountTrend(
  tenantId: string,
  months: number = 12
): Promise<Array<{ month: string; value: number }>> {
  const trend: Array<{ month: string; value: number }> = [];
  const now = new Date();

  try {
    for (let i = months - 1; i >= 0; i--) {
      const targetDate = subMonths(now, i);
      const periodEnd = endOfMonth(targetDate);

      // Count employees who were active at the end of this month
      // Active means: hired before or on periodEnd AND (no resignationDate OR resignationDate after periodEnd)
      const count = await db.employee.count({
        where: {
          tenantId,
          hireDate: { lte: periodEnd },
          OR: [
            { resignationDate: null },
            { resignationDate: { gt: periodEnd } },
          ],
        },
      });

      const monthLabel = targetDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });

      trend.push({ month: monthLabel, value: count });
    }

    return trend;
  } catch (error) {
    console.error('Error calculating headcount trend:', error);
    throw new Error('Failed to calculate headcount trend');
  }
}
