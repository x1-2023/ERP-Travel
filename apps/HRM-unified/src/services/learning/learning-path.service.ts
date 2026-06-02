import { db } from '@/lib/db';

export async function createLearningPath(tenantId: string, userId: string, data: {
  name: string;
  description?: string;
  targetPosition?: string;
  targetLevel?: string;
  estimatedMonths?: number;
  stages?: { name: string; description?: string; targetMonths?: number; courses?: { courseId: string; isRequired?: boolean }[] }[];
}) {
  const path = await db.learningPath.create({
    data: {
      tenantId,
      name: data.name,
      description: data.description,
      targetPosition: data.targetPosition,
      targetLevel: data.targetLevel,
      estimatedMonths: data.estimatedMonths,
      createdById: userId,
    },
  });

  if (data.stages) {
    for (let i = 0; i < data.stages.length; i++) {
      const s = data.stages[i];
      const stage = await db.learningPathStage.create({
        data: { pathId: path.id, name: s.name, description: s.description, targetMonths: s.targetMonths, order: i },
      });
      if (s.courses) {
        for (let j = 0; j < s.courses.length; j++) {
          await db.learningPathCourse.create({
            data: { stageId: stage.id, courseId: s.courses[j].courseId, isRequired: s.courses[j].isRequired ?? true, order: j },
          });
        }
      }
    }
  }

  return getLearningPathById(path.id, tenantId);
}

export async function getLearningPaths(tenantId: string, filters?: { isActive?: boolean; search?: string }, page = 1, limit = 20) {
  const where: any = { tenantId };
  if (filters?.isActive !== undefined) where.isActive = filters.isActive;
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [paths, total] = await Promise.all([
    db.learningPath.findMany({
      where,
      include: { stages: { include: { courses: true }, orderBy: { order: 'asc' } }, _count: { select: { enrollments: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.learningPath.count({ where }),
  ]);

  return { paths, total, page, limit };
}

export async function getLearningPathById(id: string, tenantId: string) {
  return db.learningPath.findFirst({
    where: { id, tenantId },
    include: {
      stages: { include: { courses: { include: { course: true } } }, orderBy: { order: 'asc' } },
      _count: { select: { enrollments: true } },
    },
  });
}

export async function enrollInPath(tenantId: string, employeeId: string, pathId: string, assignedById?: string) {
  return db.learningPathEnrollment.create({
    data: { tenantId, employeeId, pathId, assignedById, status: 'NOT_STARTED' },
    include: { path: true },
  });
}

export async function getMyPathEnrollments(tenantId: string, employeeId: string) {
  return db.learningPathEnrollment.findMany({
    where: { tenantId, employeeId },
    include: { path: { include: { stages: { include: { courses: { include: { course: true } } }, orderBy: { order: 'asc' } } } } },
    orderBy: { createdAt: 'desc' },
  });
}
