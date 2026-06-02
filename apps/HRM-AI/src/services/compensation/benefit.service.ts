import { db } from '@/lib/db'

export async function getBenefitPlans(tenantId: string, type?: string) {
  const where: any = { tenantId, isActive: true }
  if (type) where.type = type
  return db.benefitPlan.findMany({
    where,
    include: { _count: { select: { enrollments: true } } },
    orderBy: { type: 'asc' },
  })
}

export async function getBenefitPlanById(id: string, tenantId: string) {
  return db.benefitPlan.findFirst({
    where: { id, tenantId },
    include: { enrollments: { include: { employee: { select: { fullName: true, employeeCode: true } } } } },
  })
}

export async function createBenefitPlan(tenantId: string, data: {
  name: string; code: string; type: string; description?: string;
  employerContribution?: number; employeeContribution?: number;
  contributionPercent?: number; ceilingAmount?: number;
  eligibilityCriteria?: any; effectiveFrom?: Date; effectiveTo?: Date;
}) {
  return db.benefitPlan.create({
    data: { ...data, tenantId, type: data.type as any },
  })
}

export async function updateBenefitPlan(id: string, tenantId: string, data: {
  name?: string; description?: string;
  employerContribution?: number; employeeContribution?: number;
  isActive?: boolean;
}) {
  return db.benefitPlan.update({ where: { id }, data })
}

export async function getEmployeeBenefitEnrollments(tenantId: string, employeeId: string) {
  return db.benefitEnrollment.findMany({
    where: { tenantId, employeeId },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function enrollInBenefit(tenantId: string, employeeId: string, data: {
  planId: string; effectiveDate?: Date; notes?: string;
}) {
  const plan = await db.benefitPlan.findFirst({ where: { id: data.planId, tenantId } })
  return db.benefitEnrollment.create({
    data: {
      tenantId,
      employeeId,
      planId: data.planId,
      status: 'ACTIVE',
      enrollmentDate: new Date(),
      effectiveDate: data.effectiveDate || new Date(),
      employerAmount: plan?.employerContribution,
      employeeAmount: plan?.employeeContribution,
      notes: data.notes,
    },
  })
}

export async function cancelBenefitEnrollment(id: string, tenantId: string) {
  return db.benefitEnrollment.update({
    where: { id },
    data: { status: 'CANCELLED', endDate: new Date() },
  })
}
