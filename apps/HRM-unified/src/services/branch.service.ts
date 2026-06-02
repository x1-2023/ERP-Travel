import { db } from '@/lib/db'
import type { CreateBranchInput, UpdateBranchInput } from '@/lib/validations/branch'

export const branchService = {
  async findAll(tenantId: string, includeInactive = false) {
    return db.branch.findMany({
      where: {
        tenantId,
        ...(!includeInactive && { isActive: true }),
      },
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: [{ isHeadquarters: 'desc' }, { name: 'asc' }],
    })
  },

  async findById(tenantId: string, id: string) {
    return db.branch.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    })
  },

  async create(tenantId: string, data: CreateBranchInput) {
    // Check for duplicate code
    const existing = await db.branch.findFirst({
      where: { tenantId, code: data.code },
    })

    if (existing) {
      throw new Error('Mã chi nhánh đã tồn tại')
    }

    // If this is headquarters, unset other headquarters
    if (data.isHeadquarters) {
      await db.branch.updateMany({
        where: { tenantId, isHeadquarters: true },
        data: { isHeadquarters: false },
      })
    }

    return db.branch.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
        isHeadquarters: data.isHeadquarters ?? false,
        isActive: data.isActive ?? true,
      },
    })
  },

  async update(tenantId: string, id: string, data: Partial<UpdateBranchInput>) {
    const current = await db.branch.findFirst({
      where: { id, tenantId },
    })

    if (!current) {
      throw new Error('Chi nhánh không tồn tại')
    }

    // Check for duplicate code if code is being updated
    if (data.code && data.code !== current.code) {
      const existing = await db.branch.findFirst({
        where: { tenantId, code: data.code, id: { not: id } },
      })

      if (existing) {
        throw new Error('Mã chi nhánh đã tồn tại')
      }
    }

    // If setting as headquarters, unset other headquarters
    if (data.isHeadquarters && !current.isHeadquarters) {
      await db.branch.updateMany({
        where: { tenantId, isHeadquarters: true, id: { not: id } },
        data: { isHeadquarters: false },
      })
    }

    return db.branch.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.isHeadquarters !== undefined && { isHeadquarters: data.isHeadquarters }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  },

  async delete(tenantId: string, id: string) {
    const branch = await db.branch.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    })

    if (!branch) {
      throw new Error('Chi nhánh không tồn tại')
    }

    if (branch._count.employees > 0) {
      throw new Error('Không thể xóa chi nhánh đang có nhân viên')
    }

    return db.branch.delete({
      where: { id },
    })
  },
}
