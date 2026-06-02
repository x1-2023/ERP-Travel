import { db } from '@/lib/db'
import type { CreateDependentInput, UpdateDependentInput } from '@/lib/validations/dependent'

export const dependentService = {
  async findByEmployeeId(employeeId: string) {
    return db.dependent.findMany({
      where: { employeeId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string) {
    return db.dependent.findUnique({
      where: { id },
    })
  },

  async create(data: CreateDependentInput) {
    return db.dependent.create({
      data: {
        employeeId: data.employeeId,
        fullName: data.fullName,
        relationship: data.relationship,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        idNumber: data.idNumber,
        taxDeductionFrom: data.taxDeductionFrom ? new Date(data.taxDeductionFrom) : null,
        taxDeductionTo: data.taxDeductionTo ? new Date(data.taxDeductionTo) : null,
        deductionDocument: data.deductionDocument,
        isActive: data.isActive ?? true,
      },
    })
  },

  async update(id: string, data: Partial<UpdateDependentInput>) {
    const current = await db.dependent.findUnique({
      where: { id },
    })

    if (!current) {
      throw new Error('Người phụ thuộc không tồn tại')
    }

    return db.dependent.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.relationship !== undefined && { relationship: data.relationship }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null }),
        ...(data.idNumber !== undefined && { idNumber: data.idNumber }),
        ...(data.taxDeductionFrom !== undefined && { taxDeductionFrom: data.taxDeductionFrom ? new Date(data.taxDeductionFrom) : null }),
        ...(data.taxDeductionTo !== undefined && { taxDeductionTo: data.taxDeductionTo ? new Date(data.taxDeductionTo) : null }),
        ...(data.deductionDocument !== undefined && { deductionDocument: data.deductionDocument }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
  },

  async delete(id: string) {
    const dependent = await db.dependent.findUnique({
      where: { id },
    })

    if (!dependent) {
      throw new Error('Người phụ thuộc không tồn tại')
    }

    // Soft delete by setting isActive to false
    return db.dependent.update({
      where: { id },
      data: { isActive: false },
    })
  },

  async countActiveByEmployee(employeeId: string) {
    return db.dependent.count({
      where: { employeeId, isActive: true },
    })
  },
}
