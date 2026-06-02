import { z } from 'zod'

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, 'Tên mẫu không được trống').max(200),
  subject: z.string().min(1, 'Tiêu đề không được trống').max(200),
  body: z.string().min(1, 'Nội dung không được trống'),
  category: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
})

export const updateEmailTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(200).optional(),
  body: z.string().optional(),
  category: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
})

export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>
