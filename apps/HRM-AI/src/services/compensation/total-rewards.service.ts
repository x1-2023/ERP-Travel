import { db } from '@/lib/db'

export async function getTotalRewardsStatement(tenantId: string, employeeId: string, year?: number) {
  const targetYear = year || new Date().getFullYear()
  return db.totalRewardsStatement.findFirst({
    where: { tenantId, employeeId, year: targetYear },
    include: { employee: { include: { department: true } } },
  })
}

export async function generateTotalRewardsStatement(tenantId: string, employeeId: string, year?: number) {
  const targetYear = year || new Date().getFullYear()

  const compensation = await db.employeeCompensation.findFirst({
    where: { tenantId, employeeId, isCurrent: true },
  })
  const baseSalary = compensation ? Number(compensation.baseSalary) : 0

  const allowances = await db.employeeAllowance.findMany({
    where: { tenantId, employeeId, isActive: true },
    include: { allowanceType: true },
  })
  const totalAllowances = allowances.reduce((sum, a) => {
    const amount = Number(a.amount)
    if (a.frequency === 'MONTHLY') return sum + amount * 12
    if (a.frequency === 'QUARTERLY') return sum + amount * 4
    return sum + amount
  }, 0)

  const enrollments = await db.benefitEnrollment.findMany({
    where: { tenantId, employeeId, status: 'ACTIVE' },
  })
  const totalBenefitsValue = enrollments.reduce((sum, e) => sum + Number(e.employerAmount || 0), 0) * 12

  // Vietnamese mandatory insurance employer contributions (annual)
  const ceiling = 36000000
  const monthlyBase = Math.min(baseSalary, ceiling)
  const employerContributions = monthlyBase * (17.5 + 3 + 1) / 100 * 12

  const totalRewards = baseSalary * 12 + totalAllowances + totalBenefitsValue + employerContributions

  const details = {
    baseSalaryAnnual: baseSalary * 12,
    allowances: allowances.map(a => ({ name: a.allowanceType.name, amount: Number(a.amount), frequency: a.frequency })),
    benefits: enrollments.length,
    insuranceEmployer: employerContributions,
  }

  return db.totalRewardsStatement.upsert({
    where: { tenantId_employeeId_year: { tenantId, employeeId, year: targetYear } },
    update: { baseSalary, totalAllowances, totalBenefitsValue, employerContributions, totalRewards, details, generatedAt: new Date() },
    create: { tenantId, employeeId, year: targetYear, baseSalary, totalAllowances, totalBenefitsValue, employerContributions, totalRewards, details },
  })
}

export async function getTotalRewardsStatements(tenantId: string, year?: number) {
  const targetYear = year || new Date().getFullYear()
  return db.totalRewardsStatement.findMany({
    where: { tenantId, year: targetYear },
    include: { employee: { include: { department: true } } },
    orderBy: { totalRewards: 'desc' },
  })
}
