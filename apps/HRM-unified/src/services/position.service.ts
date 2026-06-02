import { db } from '@/lib/db'
import type { CreatePositionInput, UpdatePositionInput } from '@/lib/validations/position'

export const positionService = {
  async findAll(tenantId: string, includeInactive = false) {
    return db.position.findMany({
      where: {
        tenantId,
        ...(!includeInactive && { isActive: true }),
      },
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    })
  },

  async findById(tenantId: string, id: string) {
    return db.position.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    })
  },

  async create(tenantId: string, data: CreatePositionInput) {
    // Check for duplicate code
    const existing = await db.position.findFirst({
      where: { tenantId, code: data.code },
    })

    if (existing) {
      throw new Error('Mã chức danh đã tồn tại')
    }

    return db.position.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        level: data.level ?? 1,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    })
  },

  async update(tenantId: string, id: string, data: Partial<UpdatePositionInput>) {
    const current = await db.position.findFirst({
      where: { id, tenantId },
    })

    if (!current) {
      throw new Error('Chức danh không tồn tại')
    }

    // Check for duplicate code if code is being updated
    if (data.code && data.code !== current.code) {
      const existing = await db.position.findFirst({
        where: { tenantId, code: data.code, id: { not: id } },
      })

      if (existing) {
        throw new Error('Mã chức danh đã tồn tại')
      }
    }

    return db.position.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  },

  async delete(tenantId: string, id: string) {
    const position = await db.position.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    })

    if (!position) {
      throw new Error('Chức danh không tồn tại')
    }

    if (position._count.employees > 0) {
      throw new Error('Không thể xóa chức danh đang có nhân viên')
    }

    return db.position.delete({
      where: { id },
    })
  },
}
