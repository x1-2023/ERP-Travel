import { db } from '@/lib/db'

export async function getCompensationReviews(tenantId: string, filters: {
  cycleId?: string; status?: string; departmentId?: string;
}, page = 1, limit = 20) {
  const where: any = { tenantId }
  if (filters.cycleId) where.cycleId = filters.cycleId
  if (filters.status) where.status = filters.status
  if (filters.departmentId) where.employee = { departmentId: filters.departmentId }

  const [data, total] = await Promise.all([
    db.compensationReview.findMany({
      where,
      include: { employee: { include: { department: true, position: true } }, cycle: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.compensationReview.count({ where }),
  ])
  return { data, total, page, limit }
}

export async function getReviewById(id: string, tenantId: string) {
  return db.compensationReview.findFirst({
    where: { id, tenantId },
    include: { employee: { include: { department: true, position: true } }, cycle: true },
  })
}

export async function createCompensationReview(tenantId: string, data: {
  cycleId: string; employeeId: string; currentSalary: number;
  proposedSalary?: number; changeType?: string; changePercent?: number;
  performanceRating?: number; compaRatio?: number; justification?: string;
}) {
  return db.compensationReview.create({
    data: { ...data, tenantId, changeType: data.changeType as any },
  })
}

export async function updateCompensationReview(id: string, tenantId: string, data: {
  proposedSalary?: number; changeType?: string; changePercent?: number;
  justification?: string; managerComments?: string; hrComments?: string;
}) {
  return db.compensationReview.update({
    where: { id },
    data: { ...data, changeType: data.changeType as any },
  })
}

export async function submitReview(id: string, tenantId: string) {
  return db.compensationReview.update({
    where: { id },
    data: { status: 'PENDING_MANAGER', submittedAt: new Date() },
  })
}

export async function approveReview(id: string, tenantId: string, userId: string, data: {
  approvedSalary: number; comments?: string; nextStatus: string;
}) {
  return db.compensationReview.update({
    where: { id },
    data: {
      status: data.nextStatus as any,
      approvedSalary: data.approvedSalary,
      hrComments: data.comments,
      approvedById: userId,
      approvedAt: new Date(),
    },
  })
}

export async function rejectReview(id: string, tenantId: string, userId: string, comments: string) {
  return db.compensationReview.update({
    where: { id },
    data: { status: 'REJECTED', hrComments: comments, approvedById: userId },
  })
}
