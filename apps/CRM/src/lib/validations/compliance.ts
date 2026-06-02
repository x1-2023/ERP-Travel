import { z } from 'zod'

export const screenEntitySchema = z.object({
  entityType: z.enum(['DEAL', 'CONTACT', 'COMPANY']),
  entityId: z.string().cuid(),
  name: z.string().min(1),
  country: z.string().min(2).max(3),
})

export const updateChecklistItemSchema = z.object({
  checked: z.boolean(),
  notes: z.string().max(2000).optional(),
})

export type ScreenEntityInput = z.infer<typeof screenEntitySchema>
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>
