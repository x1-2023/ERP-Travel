import { db } from '@/lib/db';
import { CompensationMetrics } from '@/types/analytics';
import { SALARY_RANGES } from '../constants';

interface CompaRatioParams {
  tenantId: string;
}

export async function calculateCompensationMetrics(params: CompaRatioParams): Promise<CompensationMetrics> {
  const { tenantId } = params;

  try {
    // Get active employees with salary info from contracts
    const rawEmployees = await db.employee.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        gender: true,
        department: {
          select: { name: true },
        },
        position: {
          select: { name: true, level: true },
        },
        contracts: {
          where: { status: 'ACTIVE' },
          select: { baseSalary: true },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });

    const employees = rawEmployees.map((emp) => ({
      ...emp,
      baseSalary: emp.contracts[0]?.baseSalary ?? 0,
    }));

    // Salary distribution
    const salaryDistribution = calculateSalaryDistribution(employees);

    // Pay equity
    const payEquity = calculatePayEquity(employees);

    // Compa-ratio using salary benchmarks
    const compaRatio = await calculateCompaRatio(tenantId, employees);

    return {
      salaryDistribution,
      payEquity,
      compaRatio,
    };
  } catch (error) {
    console.error('Error calculating compensation metrics:', error);
    throw new Error('Failed to calculate compensation metrics');
  }
}

function calculateSalaryDistribution(
  employees: Array<{ baseSalary: unknown; [key: string]: unknown }>
): Array<{ range: string; count: number; percent: number }> {
  const total = employees.length;
  if (total === 0) return [];

  const distribution = SALARY_RANGES.map((range) => {
    const count = employees.filter((emp) => {
      const salary = Number(emp.baseSalary) || 0;
      return salary >= range.min && salary < range.max;
    }).length;

    return {
      range: range.label,
      count,
      percent: Math.round((count / total) * 100 * 100) / 100,
    };
  });

  return distribution;
}

function calculatePayEquity(
  employees: Array<{ baseSalary: unknown; gender: string | null; department: { name: string } | null; [key: string]: unknown }>
): { genderGap: number; byDepartment: Record<string, number> } {
  // Gender pay gap
  const maleEmployees = employees.filter((e) => e.gender === 'MALE');
  const femaleEmployees = employees.filter((e) => e.gender === 'FEMALE');

  const maleAvg = maleEmployees.length > 0
    ? maleEmployees.reduce((sum, e) => sum + (Number(e.baseSalary) || 0), 0) / maleEmployees.length
    : 0;

  const femaleAvg = femaleEmployees.length > 0
    ? femaleEmployees.reduce((sum, e) => sum + (Number(e.baseSalary) || 0), 0) / femaleEmployees.length
    : 0;

  const genderGap = maleAvg > 0 ? Math.round(((maleAvg - femaleAvg) / maleAvg) * 100 * 100) / 100 : 0;

  // By department gap
  const byDepartment: Record<string, number> = {};
  const departmentEmployees: Record<string, { male: number[]; female: number[] }> = {};

  for (const emp of employees) {
    const dept = emp.department?.name || 'Unknown';
    if (!departmentEmployees[dept]) {
      departmentEmployees[dept] = { male: [], female: [] };
    }

    const salary = Number(emp.baseSalary) || 0;
    if (emp.gender === 'MALE') {
      departmentEmployees[dept].male.push(salary);
    } else if (emp.gender === 'FEMALE') {
      departmentEmployees[dept].female.push(salary);
    }
  }

  for (const [dept, data] of Object.entries(departmentEmployees)) {
    const deptMaleAvg = data.male.length > 0
      ? data.male.reduce((a, b) => a + b, 0) / data.male.length
      : 0;
    const deptFemaleAvg = data.female.length > 0
      ? data.female.reduce((a, b) => a + b, 0) / data.female.length
      : 0;

    if (deptMaleAvg > 0 && deptFemaleAvg > 0) {
      byDepartment[dept] = Math.round(((deptMaleAvg - deptFemaleAvg) / deptMaleAvg) * 100 * 100) / 100;
    }
  }

  return { genderGap, byDepartment };
}

async function calculateCompaRatio(
  tenantId: string,
  employees: Array<{ baseSalary: unknown; position: { name: string; level: number } | null; [key: string]: unknown }>
): Promise<Array<{
  level: string;
  marketMin: number;
  marketMid: number;
  marketMax: number;
  internalAvg: number;
  ratio: number;
}>> {
  try {
    // Fetch salary benchmarks
    const benchmarks = await db.salaryBenchmark.findMany({
      where: { tenantId },
    });

    if (benchmarks.length === 0) {
      return [];
    }

    // Group employees by position level
    const levelSalaries: Record<string, number[]> = {};
    for (const emp of employees) {
      const level = emp.position?.level != null ? String(emp.position.level) : 'Unknown';
      if (!levelSalaries[level]) {
        levelSalaries[level] = [];
      }
      levelSalaries[level].push(Number(emp.baseSalary) || 0);
    }

    // Match benchmarks to levels
    const compaRatios: Array<{
      level: string;
      marketMin: number;
      marketMid: number;
      marketMax: number;
      internalAvg: number;
      ratio: number;
    }> = [];

    for (const benchmark of benchmarks) {
      const level = (benchmark as { level?: string }).level || (benchmark as { positionLevel?: string }).positionLevel || 'Unknown';
      const marketMin = Number((benchmark as { minSalary?: unknown }).minSalary || (benchmark as { marketMin?: unknown }).marketMin) || 0;
      const marketMax = Number((benchmark as { maxSalary?: unknown }).maxSalary || (benchmark as { marketMax?: unknown }).marketMax) || 0;
      const marketMid = Number((benchmark as { midSalary?: unknown }).midSalary || (benchmark as { marketMid?: unknown }).marketMid) || ((marketMin + marketMax) / 2);

      const salaries = levelSalaries[level] || [];
      const internalAvg = salaries.length > 0
        ? salaries.reduce((a, b) => a + b, 0) / salaries.length
        : 0;

      const ratio = marketMid > 0 ? Math.round((internalAvg / marketMid) * 100) / 100 : 0;

      compaRatios.push({
        level,
        marketMin: Math.round(marketMin),
        marketMid: Math.round(marketMid),
        marketMax: Math.round(marketMax),
        internalAvg: Math.round(internalAvg),
        ratio,
      });
    }

    return compaRatios;
  } catch (error) {
    console.error('Error calculating compa-ratio:', error);
    return [];
  }
}
