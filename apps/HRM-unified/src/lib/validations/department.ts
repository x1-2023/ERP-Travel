import { z } from 'zod'

export const departmentSchema = z.object({
  name: z.string().min(1, 'Tên phòng ban là bắt buộc').max(100),
  code: z.string().min(1, 'Mã phòng ban là bắt buộc').max(20),
  description: z.string().max(500).optional().nullable(),
  parentId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  costCenterCode: z.string().max(20).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export const createDepartmentSchema = departmentSchema

export const updateDepartmentSchema = departmentSchema.partial().extend({
  id: z.string(),
})

export type DepartmentFormData = z.infer<typeof departmentSchema>
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>
