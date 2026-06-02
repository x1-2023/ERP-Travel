import { z } from 'zod'

export const createWebhookSchema = z.object({
  name: z.string().min(1, 'Tên webhook không được để trống').max(100),
  url: z.string().url('URL không hợp lệ'),
  events: z.array(z.string()).min(1, 'Chọn ít nhất 1 sự kiện'),
})

export const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
})

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>
