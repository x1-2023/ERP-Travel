import { db } from '@/lib/db'

export async function getEmployeeCompensation(tenantId: string, employeeId: string) {
  return db.employeeCompensation.findFirst({
    where: { tenantId, employeeId, isCurrent: true },
    include: { grade: true, employee: { include: { department: true, position: true } } },
  })
}

export async function getCompensationHistory(tenantId: string, employeeId: string) {
  return db.employeeCompensation.findMany({
    where: { tenantId, employeeId },
    include: { grade: true },
    orderBy: { effectiveDate: 'desc' },
  })
}

export async function setEmployeeCompensation(tenantId: string, employeeId: string, data: {
  baseSalary: number; gradeId?: string; effectiveDate: Date;
  salaryType?: string; payFrequency?: string; currency?: string;
}) {
  // Mark previous as not current
  await db.employeeCompensation.updateMany({
    where: { tenantId, employeeId, isCurrent: true },
    data: { isCurrent: false },
  })
  return db.employeeCompensation.create({
    data: { ...data, tenantId, employeeId, isCurrent: true, salaryType: (data.salaryType || 'GROSS') as any },
  })
}

export async function getCompensationChanges(tenantId: string, employeeId?: string) {
  const where: any = { tenantId }
  if (employeeId) where.employeeId = employeeId
  return db.compensationChange.findMany({
    where,
    include: { employee: { select: { fullName: true, employeeCode: true } } },
    orderBy: { effectiveDate: 'desc' },
    take: 50,
  })
}

export async function recordCompensationChange(tenantId: string, data: {
  employeeId: string; changeType: string; effectiveDate: Date;
  previousSalary: number; newSalary: number; changePercent: number;
  previousGradeId?: string; newGradeId?: string; reason?: string; approvedById?: string;
}) {
  return db.compensationChange.create({
    data: { ...data, tenantId, changeType: data.changeType as any },
  })
}
