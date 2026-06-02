import { db } from '@/lib/db';

export async function createCourse(
  tenantId: string,
  userId: string,
  data: {
    code: string;
    title: string;
    description?: string;
    objectives?: string;
    categoryId?: string;
    courseType: string;
    level?: string;
    durationHours: number;
    maxParticipants?: number;
    minParticipants?: number;
    providerId?: string;
    instructorName?: string;
    costPerPerson?: number;
    prerequisites?: string;
    targetAudience?: string;
    isMandatory?: boolean;
    thumbnailUrl?: string;
    skills?: { skillId: string; levelGained: number }[];
    modules?: {
      title: string;
      description?: string;
      contentUrl?: string;
      contentType?: string;
      durationMinutes: number;
    }[];
  }
) {
  const course = await db.course.create({
    data: {
      tenantId,
      code: data.code,
      title: data.title,
      description: data.description,
      objectives: data.objectives,
      categoryId: data.categoryId,
      courseType: data.courseType as any,
      level: (data.level as any) || 'BEGINNER',
      durationHours: data.durationHours,
      maxParticipants: data.maxParticipants,
      minParticipants: data.minParticipants,
      providerId: data.providerId,
      instructorName: data.instructorName,
      costPerPerson: data.costPerPerson,
      prerequisites: data.prerequisites,
      targetAudience: data.targetAudience,
      isMandatory: data.isMandatory || false,
      thumbnailUrl: data.thumbnailUrl,
      status: 'DRAFT',
      createdById: userId,
    },
  });

  if (data.skills && data.skills.length > 0) {
    for (const s of data.skills) {
      await db.courseSkill.create({
        data: {
          courseId: course.id,
          skillId: s.skillId,
          skillLevelGained: s.levelGained,
        },
      });
    }
  }

  if (data.modules && data.modules.length > 0) {
    for (let i = 0; i < data.modules.length; i++) {
      const m = data.modules[i];
      await db.courseModule.create({
        data: {
          courseId: course.id,
          title: m.title,
          description: m.description,
          contentUrl: m.contentUrl,
          contentType: m.contentType,
          durationMinutes: m.durationMinutes,
          order: i,
        },
      });
    }
  }

  return getCourseById(course.id, tenantId);
}

export async function getCourses(
  tenantId: string,
  filters?: {
    categoryId?: string;
    courseType?: string;
    level?: string;
    status?: string;
    isMandatory?: boolean;
    search?: string;
  },
  page = 1,
  limit = 20
) {
  const where: any = { tenantId };

  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.courseType) where.courseType = filters.courseType;
  if (filters?.level) where.level = filters.level;
  if (filters?.status) where.status = filters.status;
  if (filters?.isMandatory !== undefined) where.isMandatory = filters.isMandatory;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { code: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
        _count: { select: { enrollments: true, sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.course.count({ where }),
  ]);

  return { courses, total, page, limit };
}

export async function getCourseById(id: string, tenantId: string) {
  return db.course.findFirst({
    where: { id, tenantId },
    include: {
      category: true,
      provider: true,
      modules: { orderBy: { order: 'asc' } },
      skills: { include: { skill: true } },
      _count: { select: { enrollments: true, sessions: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
}

export async function publishCourse(id: string, tenantId: string) {
  const course = await db.course.findFirst({
    where: { id, tenantId, status: 'DRAFT' },
  });
  if (!course) return null;
  return db.course.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });
}

export async function archiveCourse(id: string, tenantId: string) {
  return db.course.update({
    where: { id },
    data: { status: 'ARCHIVED', archivedAt: new Date() },
  });
}

export async function updateCourse(id: string, tenantId: string, data: Record<string, unknown>) {
  return db.course.update({
    where: { id },
    data: data as any,
  });
}

export async function getCourseCategories(tenantId: string) {
  return db.courseCategory.findMany({
    where: { tenantId },
    include: { _count: { select: { courses: true } } },
    orderBy: { order: 'asc' },
  });
}

export async function getCourseModules(courseId: string, tenantId: string) {
  const course = await db.course.findFirst({
    where: { id: courseId, tenantId },
    select: { id: true },
  });
  if (!course) return [];
  return db.courseModule.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });
}
