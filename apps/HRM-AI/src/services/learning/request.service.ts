import { db } from '@/lib/db';

export async function createTrainingRequest(tenantId: string, employeeId: string, data: {
  courseId?: string;
  externalCourseName?: string;
  externalProvider?: string;
  externalUrl?: string;
  reason: string;
  expectedOutcome?: string;
  preferredStartDate?: Date;
  preferredEndDate?: Date;
  estimatedCost?: number;
}) {
  const count = await db.trainingRequest.count({ where: { tenantId } });
  const requestCode = `TR-${String(count + 1).padStart(5, '0')}`;

  return db.trainingRequest.create({
    data: { tenantId, employeeId, requestCode, status: 'PENDING_MANAGER', ...data } as any,
    include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
  });
}

export async function getTrainingRequests(tenantId: string, filters?: {
  employeeId?: string;
  status?: string;
}, page = 1, limit = 20) {
  const where: any = { tenantId };
  if (filters?.employeeId) where.employeeId = filters.employeeId;
  if (filters?.status) where.status = filters.status;

  const [requests, total] = await Promise.all([
    db.trainingRequest.findMany({
      where,
      include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.trainingRequest.count({ where }),
  ]);

  return { requests, total, page, limit };
}

export async function getRequestById(id: string, tenantId: string) {
  return db.trainingRequest.findFirst({
    where: { id, tenantId },
    include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
  });
}

export async function approveTrainingRequest(id: string, tenantId: string, userId: string, role: 'manager' | 'hr', comments?: string) {
  const request = await db.trainingRequest.findFirst({ where: { id, tenantId } });
  if (!request) throw new Error('Request not found');

  if (role === 'manager') {
    return db.trainingRequest.update({
      where: { id },
      data: { status: 'PENDING_HR', managerApprovedById: userId, managerApprovedAt: new Date(), managerComments: comments },
    });
  } else {
    return db.trainingRequest.update({
      where: { id },
      data: { status: 'APPROVED', hrApprovedById: userId, hrApprovedAt: new Date(), hrComments: comments },
    });
  }
}

export async function rejectTrainingRequest(id: string, tenantId: string, userId: string, reason: string) {
  return db.trainingRequest.update({
    where: { id },
    data: { status: 'REJECTED', rejectedById: userId, rejectedAt: new Date(), rejectionReason: reason },
  });
}
