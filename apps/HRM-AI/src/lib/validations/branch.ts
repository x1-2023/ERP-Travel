import { z } from 'zod'

export const branchSchema = z.object({
  name: z.string().min(1, 'Tên chi nhánh là bắt buộc').max(100),
  code: z.string().min(1, 'Mã chi nhánh là bắt buộc').max(20),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
  isHeadquarters: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const createBranchSchema = branchSchema

export const updateBranchSchema = branchSchema.partial().extend({
  id: z.string(),
})

export type BranchFormData = z.infer<typeof branchSchema>
export type CreateBranchInput = z.infer<typeof createBranchSchema>
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>
