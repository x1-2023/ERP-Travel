import { db } from '@/lib/db'

export async function createFramework(
  tenantId: string,
  data: {
    name: string
    description?: string
    isActive?: boolean
  }
) {
  return db.competencyFramework.create({
    data: {
      tenantId,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
    },
    include: {
      competencies: {
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function getFrameworks(tenantId: string) {
  return db.competencyFramework.findMany({
    where: { tenantId },
    include: {
      competencies: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createCompetency(
  frameworkId: string,
  data: {
    name: string
    description?: string
    category?: string
    levels: Record<string, string>
    isCore?: boolean
    order?: number
  }
) {
  // Get max order for the framework
  const maxOrder = await db.competency.aggregate({
    where: { frameworkId },
    _max: { order: true },
  })

  return db.competency.create({
    data: {
      frameworkId,
      name: data.name,
      description: data.description,
      category: data.category,
      levels: data.levels as any,
      isCore: data.isCore ?? false,
      order: data.order ?? (maxOrder._max.order ?? -1) + 1,
    },
    include: {
      framework: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function updateCompetency(
  id: string,
  data: {
    name?: string
    description?: string
    category?: string
    levels?: Record<string, string>
    isCore?: boolean
    order?: number
  }
) {
  return db.competency.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.levels !== undefined && { levels: data.levels as any }),
      ...(data.isCore !== undefined && { isCore: data.isCore }),
      ...(data.order !== undefined && { order: data.order }),
    },
    include: {
      framework: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function listCompetencies(tenantId: string, params: {
  category?: string
  frameworkId?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  const { category, frameworkId, search, page = 1, pageSize = 20 } = params

  const where: Record<string, unknown> = {
    framework: { tenantId },
  }
  if (category) where.category = category
  if (frameworkId) where.frameworkId = frameworkId
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    db.competency.findMany({
      where,
      include: {
        framework: { select: { id: true, name: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { order: 'asc' },
    }),
    db.competency.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getPositionCompetencies(
  tenantId: string,
  position: string
) {
  const positionCompetencies = await db.positionCompetency.findMany({
    where: {
      tenantId,
      position,
    },
    include: {
      competency: {
        include: {
          framework: {
            select: { id: true, name: true, isActive: true },
          },
        },
      },
    },
    orderBy: {
      competency: { order: 'asc' },
    },
  })

  return positionCompetencies.map(pc => ({
    id: pc.id,
    competencyId: pc.competencyId,
    position: pc.position,
    requiredLevel: pc.requiredLevel,
    competency: pc.competency,
  }))
}
