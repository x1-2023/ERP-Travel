import { z } from 'zod'

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Tên chiến dịch không được trống').max(200),
  type: z.enum(['EMAIL', 'SMS', 'PUSH']).default('EMAIL'),
  subject: z.string().min(1, 'Tiêu đề không được trống').max(200).optional(),
  content: z.string().optional(),
  audienceId: z.string().cuid().optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
})

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().max(200).optional(),
  content: z.string().optional(),
  status: z.string().optional(),
  audienceId: z.string().cuid().optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
  externalTpmPromoId: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.scheduledAt && data.scheduledAt instanceof Date) {
      return data.scheduledAt > new Date()
    }
    return true
  },
  { message: 'Thời gian gửi phải trong tương lai', path: ['scheduledAt'] }
)

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
