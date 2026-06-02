import { db } from '@/lib/db'

export async function getPayEquityAnalyses(tenantId: string, departmentId?: string) {
  const where: any = { tenantId }
  if (departmentId) where.departmentId = departmentId
  return db.payEquityAnalysis.findMany({
    where,
    include: { department: true },
    orderBy: { analysisDate: 'desc' },
    take: 20,
  })
}

export async function runPayEquityAnalysis(tenantId: string, departmentId?: string) {
  const where: any = { tenantId, status: 'ACTIVE', deletedAt: null }
  if (departmentId) where.departmentId = departmentId

  const employees = await db.employee.findMany({
    where,
    include: {
      employeeCompensations: { where: { isCurrent: true } },
    },
  })

  const withSalary = employees.filter(e => e.employeeCompensations.length > 0)
  const maleEmployees = withSalary.filter(e => e.gender === 'MALE')
  const femaleEmployees = withSalary.filter(e => e.gender === 'FEMALE')

  const getMaleSalary = (e: any) => Number(e.employeeCompensations[0]?.baseSalary || 0)
  const avgMale = maleEmployees.length > 0 ? maleEmployees.reduce((s, e) => s + getMaleSalary(e), 0) / maleEmployees.length : null
  const avgFemale = femaleEmployees.length > 0 ? femaleEmployees.reduce((s, e) => s + getMaleSalary(e), 0) / femaleEmployees.length : null
  const genderGap = avgMale && avgFemale ? ((avgMale - avgFemale) / avgMale) * 100 : null

  const allSalaries = withSalary.map(e => getMaleSalary(e)).sort((a, b) => a - b)
  const medianSalary = allSalaries.length > 0 ? allSalaries[Math.floor(allSalaries.length / 2)] : null

  return db.payEquityAnalysis.create({
    data: {
      tenantId,
      analysisDate: new Date(),
      departmentId: departmentId || null,
      genderGap,
      avgMaleSalary: avgMale,
      avgFemaleSalary: avgFemale,
      medianSalary,
      headcount: withSalary.length,
      findings: { maleCount: maleEmployees.length, femaleCount: femaleEmployees.length },
    },
  })
}
