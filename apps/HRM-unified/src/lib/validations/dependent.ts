import { z } from 'zod'

export const dependentSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'OTHER'], {
    message: 'Quan hệ là bắt buộc',
  }),
  dateOfBirth: z.coerce.date().optional().nullable(),
  idNumber: z.string().max(20).optional().nullable(),
  taxDeductionFrom: z.coerce.date().optional().nullable(),
  taxDeductionTo: z.coerce.date().optional().nullable(),
  deductionDocument: z.string().max(100).optional().nullable(),
  isActive: z.boolean().default(true),
})

export const createDependentSchema = dependentSchema

export const updateDependentSchema = dependentSchema.partial().extend({
  id: z.string(),
})

export type DependentFormData = z.infer<typeof dependentSchema>
export type CreateDependentInput = z.infer<typeof createDependentSchema>
export type UpdateDependentInput = z.infer<typeof updateDependentSchema>
