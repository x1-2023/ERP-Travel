import { db } from '@/lib/db';

export async function createSession(tenantId: string, userId: string, data: {
  courseId: string;
  sessionCode: string;
  title?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  room?: string;
  isVirtual?: boolean;
  virtualLink?: string;
  providerId?: string;
  instructorName?: string;
  instructorEmail?: string;
  maxParticipants: number;
  minParticipants?: number;
  totalCost?: number;
  costPerPerson?: number;
  enrollmentDeadline?: Date;
  autoConfirm?: boolean;
  notes?: string;
}) {
  return db.trainingSession.create({
    data: { tenantId, createdById: userId, ...data } as any,
    include: { course: { select: { id: true, title: true, code: true } } },
  });
}

export async function getSessions(tenantId: string, filters?: {
  courseId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}, page = 1, limit = 20) {
  const where: any = { tenantId };
  if (filters?.courseId) where.courseId = filters.courseId;
  if (filters?.status) where.status = filters.status;
  if (filters?.startDate || filters?.endDate) {
    where.startDate = {};
    if (filters.startDate) where.startDate.gte = filters.startDate;
    if (filters.endDate) where.startDate.lte = filters.endDate;
  }

  const [sessions, total] = await Promise.all([
    db.trainingSession.findMany({
      where,
      include: {
        course: { select: { id: true, title: true, code: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.trainingSession.count({ where }),
  ]);

  return { sessions, total, page, limit };
}

export async function getSessionById(id: string, tenantId: string) {
  return db.trainingSession.findFirst({
    where: { id, tenantId },
    include: {
      course: true,
      provider: true,
      enrollments: {
        include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
      },
      attendance: {
        include: { employee: { select: { id: true, fullName: true } } },
      },
    },
  });
}

export async function recordAttendance(sessionId: string, employeeId: string, data: {
  date: Date;
  attended: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
}) {
  return db.sessionAttendance.upsert({
    where: { sessionId_employeeId_date: { sessionId, employeeId, date: data.date } },
    create: { sessionId, employeeId, ...data },
    update: data,
  });
}
