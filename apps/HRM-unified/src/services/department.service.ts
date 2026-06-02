import { db } from '@/lib/db'
import type { CreateDepartmentInput, UpdateDepartmentInput } from '@/lib/validations/department'
import type { DepartmentWithRelations } from '@/types'

export const departmentService = {
  async findAll(tenantId: string, includeInactive = false): Promise<DepartmentWithRelations[]> {
    return db.department.findMany({
      where: {
        tenantId,
        ...(!includeInactive && { isActive: true }),
      },
      include: {
        parent: true,
        children: {
          where: includeInactive ? {} : { isActive: true },
        },
        manager: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
          },
        },
        _count: {
          select: { employees: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }) as Promise<DepartmentWithRelations[]>
  },

  async findById(tenantId: string, id: string): Promise<DepartmentWithRelations | null> {
    return db.department.findFirst({
      where: { id, tenantId },
      include: {
        parent: true,
        children: true,
        manager: true,
        _count: {
          select: { employees: true },
        },
      },
    }) as Promise<DepartmentWithRelations | null>
  },

  async create(tenantId: string, data: CreateDepartmentInput) {
    // Check for duplicate code
    const existing = await db.department.findFirst({
      where: { tenantId, code: data.code },
    })

    if (existing) {
      throw new Error('Mã phòng ban đã tồn tại')
    }

    return db.department.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        description: data.description,
        parentId: data.parentId,
        managerId: data.managerId,
        costCenterCode: data.costCenterCode,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
      include: {
        parent: true,
        manager: true,
      },
    })
  },

  async update(tenantId: string, id: string, data: Partial<UpdateDepartmentInput>) {
    const current = await db.department.findFirst({
      where: { id, tenantId },
    })

    if (!current) {
      throw new Error('Phòng ban không tồn tại')
    }

    // Check for duplicate code if code is being updated
    if (data.code && data.code !== current.code) {
      const existing = await db.department.findFirst({
        where: { tenantId, code: data.code, id: { not: id } },
      })

      if (existing) {
        throw new Error('Mã phòng ban đã tồn tại')
      }
    }

    // Prevent circular parent reference
    if (data.parentId === id) {
      throw new Error('Không thể chọn chính phòng ban này làm phòng ban cha')
    }

    return db.department.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.managerId !== undefined && { managerId: data.managerId }),
        ...(data.costCenterCode !== undefined && { costCenterCode: data.costCenterCode }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        parent: true,
        manager: true,
      },
    })
  },

  async delete(tenantId: string, id: string) {
    const department = await db.department.findFirst({
      where: { id, tenantId },
      include: {
        children: true,
        _count: {
          select: { employees: true },
        },
      },
    })

    if (!department) {
      throw new Error('Phòng ban không tồn tại')
    }

    if (department.children.length > 0) {
      throw new Error('Không thể xóa phòng ban có phòng ban con')
    }

    if (department._count.employees > 0) {
      throw new Error('Không thể xóa phòng ban đang có nhân viên')
    }

    return db.department.delete({
      where: { id },
    })
  },

  async getTree(tenantId: string): Promise<DepartmentWithRelations[]> {
    const all = await this.findAll(tenantId)

    // Build tree structure
    const map = new Map<string, DepartmentWithRelations>()
    const roots: DepartmentWithRelations[] = []

    all.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] })
    })

    all.forEach((dept) => {
      const node = map.get(dept.id)!
      if (dept.parentId && map.has(dept.parentId)) {
        const parent = map.get(dept.parentId)!
        parent.children = parent.children || []
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  },
}
