import { db } from '@/lib/db'

export async function getCompensationAnalytics(tenantId: string) {
  const employees = await db.employee.findMany({
    where: { tenantId, status: 'ACTIVE', deletedAt: null },
    include: {
      employeeCompensations: { where: { isCurrent: true }, include: { grade: true } },
      department: true,
    },
  })

  const withComp = employees.filter(e => e.employeeCompensations.length > 0)
  const salaries = withComp.map(e => Number(e.employeeCompensations[0].baseSalary))
  const totalPayroll = salaries.reduce((s, v) => s + v, 0)
  const avgSalary = salaries.length > 0 ? totalPayroll / salaries.length : 0
  const sortedSalaries = [...salaries].sort((a, b) => a - b)
  const medianSalary = sortedSalaries.length > 0 ? sortedSalaries[Math.floor(sortedSalaries.length / 2)] : 0

  const compaRatios = withComp
    .filter(e => e.employeeCompensations[0].grade)
    .map(e => {
      const comp = e.employeeCompensations[0]
      return Number(comp.baseSalary) / Number(comp.grade!.midSalary)
    })
  const avgCompaRatio = compaRatios.length > 0 ? compaRatios.reduce((s, v) => s + v, 0) / compaRatios.length : 0

  // Grade distribution
  const gradeMap = new Map<string, { count: number; totalSalary: number }>()
  withComp.forEach(e => {
    const grade = e.employeeCompensations[0].grade?.code || 'Ungraded'
    const entry = gradeMap.get(grade) || { count: 0, totalSalary: 0 }
    entry.count++
    entry.totalSalary += Number(e.employeeCompensations[0].baseSalary)
    gradeMap.set(grade, entry)
  })
  const gradeDistribution = Array.from(gradeMap.entries()).map(([grade, data]) => ({
    grade, count: data.count, avgSalary: Math.round(data.totalSalary / data.count),
  }))

  // Department stats
  const deptMap = new Map<string, { headcount: number; totalSalary: number; compaRatios: number[] }>()
  withComp.forEach(e => {
    const dept = e.department?.name || 'Unknown'
    const entry = deptMap.get(dept) || { headcount: 0, totalSalary: 0, compaRatios: [] }
    entry.headcount++
    const salary = Number(e.employeeCompensations[0].baseSalary)
    entry.totalSalary += salary
    if (e.employeeCompensations[0].grade) {
      entry.compaRatios.push(salary / Number(e.employeeCompensations[0].grade.midSalary))
    }
    deptMap.set(dept, entry)
  })
  const departmentStats = Array.from(deptMap.entries()).map(([department, data]) => ({
    department,
    headcount: data.headcount,
    avgSalary: Math.round(data.totalSalary / data.headcount),
    avgCompaRatio: data.compaRatios.length > 0
      ? Number((data.compaRatios.reduce((s, v) => s + v, 0) / data.compaRatios.length).toFixed(2))
      : 0,
  }))

  // Pending reviews
  const pendingReviews = await db.compensationReview.count({
    where: { tenantId, status: { in: ['PENDING_MANAGER', 'PENDING_HR', 'PENDING_CALIBRATION', 'PENDING_APPROVAL'] } },
  })
  const completedReviews = await db.compensationReview.count({
    where: { tenantId, status: { in: ['APPROVED', 'COMPLETED'] } },
  })

  // Budget utilization
  const budgets = await db.compensationBudget.findMany({ where: { tenantId } })
  const totalBudget = budgets.reduce((s, b) => s + Number(b.totalBudget), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spentAmount), 0)
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return {
    totalEmployees: employees.length,
    avgSalary: Math.round(avgSalary),
    medianSalary: Math.round(medianSalary),
    avgCompaRatio: Number(avgCompaRatio.toFixed(2)),
    totalPayroll: Math.round(totalPayroll),
    budgetUtilization: Number(budgetUtilization.toFixed(1)),
    pendingReviews,
    completedReviews,
    gradeDistribution,
    departmentStats,
  }
}

export async function getCompensationBenchmarks(tenantId: string) {
  return db.compensationBenchmark.findMany({
    where: { tenantId },
    orderBy: [{ gradeLevel: 'asc' }, { positionTitle: 'asc' }],
  })
}

export async function createBenchmark(tenantId: string, data: {
  positionTitle: string; gradeLevel?: number; industry?: string; location?: string;
  percentile25?: number; percentile50?: number; percentile75?: number; percentile90?: number;
  surveySource?: string; surveyYear?: number;
}) {
  return db.compensationBenchmark.create({ data: { ...data, tenantId } })
}
