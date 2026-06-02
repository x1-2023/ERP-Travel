// src/services/analytics/compensation.service.ts
// Compensation Analytics Service

import { db } from '@/lib/db'

export interface SalaryDistribution {
  ranges: Array<{
    range: string
    min: number
    max: number
    count: number
    percentage: number
  }>
  statistics: {
    mean: number
    median: number
    min: number
    max: number
    standardDeviation: number
  }
  byDepartment: Array<{
    department: string
    avgSalary: number
    minSalary: number
    maxSalary: number
    headcount: number
  }>
}

export interface PayEquityResult {
  overallGap: number // percentage difference (negative means women earn less)
  gapByDepartment: Array<{
    department: string
    maleAvg: number
    femaleAvg: number
    gap: number
  }>
  gapByLevel: Array<{
    level: string
    maleAvg: number
    femaleAvg: number
    gap: number
  }>
  compaRatios: Array<{
    department: string
    position: string
    avgCompaRatio: number
    employeeCount: number
  }>
}

export async function getSalaryDistribution(
  tenantId: string
): Promise<SalaryDistribution> {
  const employees = await db.employee.findMany({
    where: {
      tenantId,
      status: { in: ['ACTIVE', 'PROBATION'] },
      deletedAt: null,
    },
    include: {
      contracts: {
        where: { status: 'ACTIVE' },
        orderBy: { startDate: 'desc' },
        take: 1,
      },
      department: true,
    },
  })

  // Extract salaries from active contracts
  const salaries: Array<{ salary: number; department: string; departmentId: string }> = []
  employees.forEach((emp) => {
    const activeContract = emp.contracts[0]
    if (activeContract) {
      salaries.push({
        salary: Number(activeContract.baseSalary),
        department: emp.department?.name || 'Chưa phân bổ',
        departmentId: emp.departmentId || 'unassigned',
      })
    }
  })

  if (salaries.length === 0) {
    return {
      ranges: [],
      statistics: { mean: 0, median: 0, min: 0, max: 0, standardDeviation: 0 },
      byDepartment: [],
    }
  }

  // Calculate salary ranges
  const sortedSalaries = salaries.map((s) => s.salary).sort((a, b) => a - b)
  const min = sortedSalaries[0]
  const max = sortedSalaries[sortedSalaries.length - 1]

  // Define ranges in VND (millions)
  const rangeDefinitions = [
    { range: '< 10 triệu', min: 0, max: 10_000_000 },
    { range: '10-15 triệu', min: 10_000_000, max: 15_000_000 },
    { range: '15-20 triệu', min: 15_000_000, max: 20_000_000 },
    { range: '20-30 triệu', min: 20_000_000, max: 30_000_000 },
    { range: '30-50 triệu', min: 30_000_000, max: 50_000_000 },
    { range: '50-80 triệu', min: 50_000_000, max: 80_000_000 },
    { range: '> 80 triệu', min: 80_000_000, max: Infinity },
  ]

  const ranges = rangeDefinitions.map((rd) => {
    const count = salaries.filter(
      (s) => s.salary >= rd.min && s.salary < rd.max
    ).length
    return {
      range: rd.range,
      min: rd.min,
      max: rd.max === Infinity ? max : rd.max,
      count,
      percentage: salaries.length > 0 ? Math.round((count / salaries.length) * 1000) / 10 : 0,
    }
  })

  // Statistics
  const mean = sortedSalaries.reduce((a, b) => a + b, 0) / sortedSalaries.length
  const median =
    sortedSalaries.length % 2 === 0
      ? (sortedSalaries[sortedSalaries.length / 2 - 1] +
          sortedSalaries[sortedSalaries.length / 2]) /
        2
      : sortedSalaries[Math.floor(sortedSalaries.length / 2)]
  const variance =
    sortedSalaries.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
    sortedSalaries.length
  const standardDeviation = Math.sqrt(variance)

  // By department
  const deptMap = new Map<string, number[]>()
  salaries.forEach((s) => {
    if (!deptMap.has(s.department)) deptMap.set(s.department, [])
    deptMap.get(s.department)!.push(s.salary)
  })

  const byDepartment = Array.from(deptMap.entries())
    .map(([department, deptSalaries]) => ({
      department,
      avgSalary: Math.round(deptSalaries.reduce((a, b) => a + b, 0) / deptSalaries.length),
      minSalary: Math.min(...deptSalaries),
      maxSalary: Math.max(...deptSalaries),
      headcount: deptSalaries.length,
    }))
    .sort((a, b) => b.avgSalary - a.avgSalary)

  return {
    ranges,
    statistics: {
      mean: Math.round(mean),
      median: Math.round(median),
      min,
      max,
      standardDeviation: Math.round(standardDeviation),
    },
    byDepartment,
  }
}

export async function getPayEquity(
  tenantId: string
): Promise<PayEquityResult> {
  const employees = await db.employee.findMany({
    where: {
      tenantId,
      status: { in: ['ACTIVE', 'PROBATION'] },
      deletedAt: null,
      gender: { in: ['MALE', 'FEMALE'] },
    },
    include: {
      contracts: {
        where: { status: 'ACTIVE' },
        orderBy: { startDate: 'desc' },
        take: 1,
      },
      department: true,
      position: true,
    },
  })

  const employeesWithSalary = employees
    .filter((emp) => emp.contracts.length > 0)
    .map((emp) => ({
      gender: emp.gender!,
      salary: Number(emp.contracts[0].baseSalary),
      department: emp.department?.name || 'Chưa phân bổ',
      position: emp.position?.name || 'Chưa xác định',
    }))

  // Overall gender pay gap
  const maleSalaries = employeesWithSalary
    .filter((e) => e.gender === 'MALE')
    .map((e) => e.salary)
  const femaleSalaries = employeesWithSalary
    .filter((e) => e.gender === 'FEMALE')
    .map((e) => e.salary)

  const maleAvg = maleSalaries.length > 0
    ? maleSalaries.reduce((a, b) => a + b, 0) / maleSalaries.length
    : 0
  const femaleAvg = femaleSalaries.length > 0
    ? femaleSalaries.reduce((a, b) => a + b, 0) / femaleSalaries.length
    : 0

  const overallGap = maleAvg > 0
    ? Math.round(((femaleAvg - maleAvg) / maleAvg) * 1000) / 10
    : 0

  // Gap by department
  const deptGenderMap = new Map<string, { male: number[]; female: number[] }>()
  employeesWithSalary.forEach((e) => {
    if (!deptGenderMap.has(e.department)) {
      deptGenderMap.set(e.department, { male: [], female: [] })
    }
    const group = deptGenderMap.get(e.department)!
    if (e.gender === 'MALE') group.male.push(e.salary)
    else group.female.push(e.salary)
  })

  const gapByDepartment = Array.from(deptGenderMap.entries())
    .map(([department, data]) => {
      const deptMaleAvg = data.male.length > 0
        ? data.male.reduce((a, b) => a + b, 0) / data.male.length
        : 0
      const deptFemaleAvg = data.female.length > 0
        ? data.female.reduce((a, b) => a + b, 0) / data.female.length
        : 0
      const gap = deptMaleAvg > 0
        ? Math.round(((deptFemaleAvg - deptMaleAvg) / deptMaleAvg) * 1000) / 10
        : 0
      return {
        department,
        maleAvg: Math.round(deptMaleAvg),
        femaleAvg: Math.round(deptFemaleAvg),
        gap,
      }
    })
    .filter((d) => d.maleAvg > 0 || d.femaleAvg > 0)

  // Gap by position level (using position as level proxy)
  const levelGenderMap = new Map<string, { male: number[]; female: number[] }>()
  employeesWithSalary.forEach((e) => {
    if (!levelGenderMap.has(e.position)) {
      levelGenderMap.set(e.position, { male: [], female: [] })
    }
    const group = levelGenderMap.get(e.position)!
    if (e.gender === 'MALE') group.male.push(e.salary)
    else group.female.push(e.salary)
  })

  const gapByLevel = Array.from(levelGenderMap.entries())
    .map(([level, data]) => {
      const lvlMaleAvg = data.male.length > 0
        ? data.male.reduce((a, b) => a + b, 0) / data.male.length
        : 0
      const lvlFemaleAvg = data.female.length > 0
        ? data.female.reduce((a, b) => a + b, 0) / data.female.length
        : 0
      const gap = lvlMaleAvg > 0
        ? Math.round(((lvlFemaleAvg - lvlMaleAvg) / lvlMaleAvg) * 1000) / 10
        : 0
      return {
        level,
        maleAvg: Math.round(lvlMaleAvg),
        femaleAvg: Math.round(lvlFemaleAvg),
        gap,
      }
    })
    .filter((d) => d.maleAvg > 0 || d.femaleAvg > 0)

  // Compa-ratios (compare internal salary to market benchmarks)
  const benchmarks = await db.salaryBenchmark.findMany({
    where: { tenantId },
  })

  const compaRatios: PayEquityResult['compaRatios'] = []

  if (benchmarks.length > 0) {
    const positionDeptMap = new Map<string, { salaries: number[]; position: string; department: string }>()
    employeesWithSalary.forEach((e) => {
      const key = `${e.position}:${e.department}`
      if (!positionDeptMap.has(key)) {
        positionDeptMap.set(key, { salaries: [], position: e.position, department: e.department })
      }
      positionDeptMap.get(key)!.salaries.push(e.salary)
    })

    positionDeptMap.forEach((data) => {
      const benchmark = benchmarks.find(
        (b) => b.position === data.position && (b.department === data.department || !b.department)
      )
      if (benchmark) {
        const avgSalary = data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length
        const marketMid = Number(benchmark.marketMid)
        const compaRatio = marketMid > 0 ? Math.round((avgSalary / marketMid) * 100) / 100 : 0
        compaRatios.push({
          department: data.department,
          position: data.position,
          avgCompaRatio: compaRatio,
          employeeCount: data.salaries.length,
        })
      }
    })
  }

  return {
    overallGap,
    gapByDepartment,
    gapByLevel,
    compaRatios,
  }
}

export const compensationService = {
  getSalaryDistribution,
  getPayEquity,
}
