import { z } from 'zod'

export const createActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE', 'LUNCH', 'DEMO', 'FOLLOW_UP']),
  subject: z.string().min(1, 'Tiêu đề không được trống').max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  dueAt: z.coerce.date().optional().nullable(),
  duration: z.coerce.number().min(0).optional().nullable(),
  contactId: z.string().cuid().optional().nullable(),
  companyId: z.string().cuid().optional().nullable(),
  dealId: z.string().cuid().optional().nullable(),
})

export const updateActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE', 'LUNCH', 'DEMO', 'FOLLOW_UP']).optional(),
  subject: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  dueAt: z.coerce.date().optional().nullable(),
  duration: z.coerce.number().min(0).optional().nullable(),
  isCompleted: z.boolean().optional(),
  contactId: z.string().cuid().optional().nullable(),
  companyId: z.string().cuid().optional().nullable(),
  dealId: z.string().cuid().optional().nullable(),
})

export const activityQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  userId: z.string().optional(),
  isCompleted: z.string().optional(), // parsed as string from searchParams
  cursor: z.string().optional(),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>
