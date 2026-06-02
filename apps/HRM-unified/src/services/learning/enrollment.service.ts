import { db } from '@/lib/db';

export async function enrollInCourse(
  tenantId: string,
  employeeId: string,
  data: {
    courseId: string;
    sessionId?: string;
    requestId?: string;
  }
) {
  const course = await db.course.findFirst({
    where: { id: data.courseId, tenantId, status: 'PUBLISHED' },
  });
  if (!course) throw new Error('Course not found or not available');

  const existing = await db.enrollment.findFirst({
    where: {
      employeeId,
      courseId: data.courseId,
      sessionId: data.sessionId || null,
      status: { notIn: ['CANCELLED', 'REJECTED'] },
    },
  });
  if (existing) throw new Error('Already enrolled in this course');

  if (data.sessionId) {
    const session = await db.trainingSession.findFirst({
      where: { id: data.sessionId, status: 'SCHEDULED' },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!session) throw new Error('Session not found');
    if (session._count.enrollments >= session.maxParticipants) {
      throw new Error('Session is full');
    }
  }

  const needsApproval = course.costPerPerson && Number(course.costPerPerson) > 0;
  const status = needsApproval ? 'PENDING' : (data.sessionId ? 'ENROLLED' : 'IN_PROGRESS');

  return db.enrollment.create({
    data: {
      tenantId,
      employeeId,
      courseId: data.courseId,
      sessionId: data.sessionId,
      requestId: data.requestId,
      status,
      startedAt: status === 'IN_PROGRESS' ? new Date() : null,
      actualCost: course.costPerPerson,
    },
    include: { course: true, session: true },
  });
}

export async function getMyEnrollments(
  tenantId: string,
  employeeId: string,
  filters?: { status?: string; courseType?: string }
) {
  const where: any = { tenantId, employeeId };
  if (filters?.status) where.status = filters.status;
  if (filters?.courseType) {
    where.course = { courseType: filters.courseType };
  }

  return db.enrollment.findMany({
    where,
    include: {
      course: { include: { category: true, modules: { orderBy: { order: 'asc' } } } },
      session: true,
      moduleCompletions: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEnrollmentById(id: string, tenantId: string) {
  return db.enrollment.findFirst({
    where: { id, tenantId },
    include: {
      course: { include: { modules: { orderBy: { order: 'asc' } } } },
      session: true,
      moduleCompletions: true,
      employee: { select: { id: true, fullName: true, employeeCode: true } },
    },
  });
}

export async function completeModule(
  enrollmentId: string,
  moduleId: string,
  timeSpentMinutes?: number
) {
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { include: { modules: true } },
      moduleCompletions: true,
    },
  });
  if (!enrollment) throw new Error('Enrollment not found');

  await db.moduleCompletion.upsert({
    where: { enrollmentId_moduleId: { enrollmentId, moduleId } },
    create: { enrollmentId, moduleId, timeSpentMinutes },
    update: { timeSpentMinutes },
  });

  const totalModules = enrollment.course.modules.length;
  const completedModules = enrollment.moduleCompletions.length + 1;
  const progress = Math.round((completedModules / totalModules) * 100);
  const isCompleted = progress >= 100;

  return db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progress,
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      completedAt: isCompleted ? new Date() : null,
    },
  });
}

export async function approveEnrollment(id: string, tenantId: string, approvedById: string) {
  return db.enrollment.update({
    where: { id },
    data: { status: 'APPROVED', approvedById, approvedAt: new Date() },
  });
}

export async function rejectEnrollment(id: string, tenantId: string, rejectedById: string, reason: string) {
  return db.enrollment.update({
    where: { id },
    data: { status: 'REJECTED', approvedById: rejectedById, approvedAt: new Date(), rejectionReason: reason },
  });
}

export async function submitCourseFeedback(enrollmentId: string, rating: number, feedback?: string) {
  return db.enrollment.update({
    where: { id: enrollmentId },
    data: { rating, feedback },
  });
}

export async function getPendingEnrollments(tenantId: string) {
  return db.enrollment.findMany({
    where: { tenantId, status: 'PENDING' },
    include: {
      employee: { select: { id: true, fullName: true, employeeCode: true } },
      course: { select: { id: true, title: true, code: true, costPerPerson: true } },
      session: { select: { id: true, sessionCode: true, startDate: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}
