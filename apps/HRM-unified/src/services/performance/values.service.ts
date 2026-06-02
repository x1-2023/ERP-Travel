import { db } from '@/lib/db'

export async function listValues(tenantId: string, params: {
  search?: string
  page?: number
  pageSize?: number
}) {
  const { search, page = 1, pageSize = 20 } = params

  const where: Record<string, unknown> = { tenantId }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    db.coreValue.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { order: 'asc' },
    }),
    db.coreValue.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function createValue(tenantId: string, _userId: string, data: {
  name: string
  description?: string
  indicators?: unknown
  order?: number
}) {
  return db.coreValue.create({
    data: {
      tenantId,
      name: data.name,
      description: data.description,
      indicators: (data.indicators || []) as any,
      order: data.order || 0,
    },
  })
}

export async function updateValue(tenantId: string, _userId: string, data: {
  id: string
  name?: string
  description?: string
  indicators?: unknown
  order?: number
}) {
  const { id, ...updateData } = data
  return db.coreValue.update({
    where: { id, tenantId },
    data: updateData as any,
  })
}
