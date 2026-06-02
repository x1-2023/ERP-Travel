import { z } from 'zod'

export const positionSchema = z.object({
  name: z.string().min(1, 'Tên chức danh là bắt buộc').max(100),
  code: z.string().min(1, 'Mã chức danh là bắt buộc').max(20),
  level: z.coerce.number().int().min(1).max(20).default(1),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
})

export const createPositionSchema = positionSchema

export const updatePositionSchema = positionSchema.partial().extend({
  id: z.string(),
})

export type PositionFormData = z.infer<typeof positionSchema>
export type CreatePositionInput = z.infer<typeof createPositionSchema>
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>
