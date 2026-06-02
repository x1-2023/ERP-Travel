// src/services/analytics/hr-analytics.service.ts
// HR Analytics Service - Workforce Composition

import { db } from '@/lib/db'
import { calculateHeadcountMetrics } from '@/lib/analytics/calculators/headcount'

export interface WorkforceComposition {
  genderDistribution: Array<{ gender: string; count: number; percentage: number }>
  ageGroups: Array<{ group: string; count: number; percentage: number }>
  tenureDistribution: Array<{ range: string; count: number; percentage: number }>
  departmentBreakdown: Array<{
    department: string
    departmentId: string
    headcount: number
    percentage: number
    avgAge: number
    avgTenure: number
  }>
  headcount: {
    total: number
    active: number
    newHires: number
    terminated: number
    netChange: number
  }
}

export async function getWorkforceComposition(
  tenantId: string,
  date: Date = new Date()
): Promise<WorkforceComposition> {
  const employees = await db.employee.findMany({
    where: {
      tenantId,
      status: { in: ['ACTIVE', 'PROBATION'] },
      deletedAt: null,
    },
    include: {
      department: true,
    },
  })

  const totalCount = employees.length

  // Gender distribution
  const genderMap = new Map<string, number>()
  employees.forEach((emp) => {
    const gender = emp.gender || 'OTHER'
    genderMap.set(gender, (genderMap.get(gender) || 0) + 1)
  })
  const genderDistribution = Array.from(genderMap.entries()).map(([gender, count]) => ({
    gender,
    count,
    percentage: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0,
  }))

  // Age groups
  const now = new Date()
  const ageGroups = getAgeGroupDistribution(employees, now, totalCount)

  // Tenure distribution
  const tenureDistribution = getTenureDistribution(employees, now, totalCount)

  // Department breakdown
  const deptMap = new Map<string, { id: string; employees: typeof employees }>()
  employees.forEach((emp) => {
    const deptName = emp.department?.name || 'Chưa phân bổ'
    const deptId = emp.departmentId || 'unassigned'
    if (!deptMap.has(deptName)) {
      deptMap.set(deptName, { id: deptId, employees: [] })
    }
    deptMap.get(deptName)!.employees.push(emp)
  })

  const departmentBreakdown = Array.from(deptMap.entries()).map(([dept, data]) => {
    const deptEmployees = data.employees
    const avgAge = calculateAvgAge(deptEmployees, now)
    const avgTenure = calculateAvgTenure(deptEmployees, now)

    return {
      department: dept,
      departmentId: data.id,
      headcount: deptEmployees.length,
      percentage: totalCount > 0 ? Math.round((deptEmployees.length / totalCount) * 1000) / 10 : 0,
      avgAge: Math.round(avgAge * 10) / 10,
      avgTenure: Math.round(avgTenure * 10) / 10,
    }
  }).sort((a, b) => b.headcount - a.headcount)

  // Headcount from calculator
  const headcount = await calculateHeadcountMetrics({ tenantId, date })

  return {
    genderDistribution,
    ageGroups,
    tenureDistribution,
    departmentBreakdown,
    headcount,
  }
}

function getAgeGroupDistribution(
  employees: Array<{ dateOfBirth: Date | null }>,
  now: Date,
  totalCount: number
) {
  const groups: Record<string, number> = {
    '18-25': 0,
    '26-30': 0,
    '31-35': 0,
    '36-40': 0,
    '41-45': 0,
    '46-50': 0,
    '51-55': 0,
    '56+': 0,
  }

  employees.forEach((emp) => {
    if (!emp.dateOfBirth) return
    const age = Math.floor(
      (now.getTime() - emp.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    )
    if (age <= 25) groups['18-25']++
    else if (age <= 30) groups['26-30']++
    else if (age <= 35) groups['31-35']++
    else if (age <= 40) groups['36-40']++
    else if (age <= 45) groups['41-45']++
    else if (age <= 50) groups['46-50']++
    else if (age <= 55) groups['51-55']++
    else groups['56+']++
  })

  return Object.entries(groups).map(([group, count]) => ({
    group,
    count,
    percentage: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0,
  }))
}

function getTenureDistribution(
  employees: Array<{ hireDate: Date }>,
  now: Date,
  totalCount: number
) {
  const ranges: Record<string, number> = {
    '<1 năm': 0,
    '1-2 năm': 0,
    '2-3 năm': 0,
    '3-5 năm': 0,
    '5-10 năm': 0,
    '10+ năm': 0,
  }

  employees.forEach((emp) => {
    const years = (now.getTime() - emp.hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    if (years < 1) ranges['<1 năm']++
    else if (years < 2) ranges['1-2 năm']++
    else if (years < 3) ranges['2-3 năm']++
    else if (years < 5) ranges['3-5 năm']++
    else if (years < 10) ranges['5-10 năm']++
    else ranges['10+ năm']++
  })

  return Object.entries(ranges).map(([range, count]) => ({
    range,
    count,
    percentage: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0,
  }))
}

function calculateAvgAge(
  employees: Array<{ dateOfBirth: Date | null }>,
  now: Date
): number {
  const withDob = employees.filter((e) => e.dateOfBirth)
  if (withDob.length === 0) return 0
  const totalAge = withDob.reduce((sum, emp) => {
    return sum + (now.getTime() - emp.dateOfBirth!.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  }, 0)
  return totalAge / withDob.length
}

function calculateAvgTenure(
  employees: Array<{ hireDate: Date }>,
  now: Date
): number {
  if (employees.length === 0) return 0
  const totalTenure = employees.reduce((sum, emp) => {
    return sum + (now.getTime() - emp.hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  }, 0)
  return totalTenure / employees.length
}

export const hrAnalyticsService = {
  getWorkforceComposition,
}
