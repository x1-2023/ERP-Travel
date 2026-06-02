import { z } from 'zod'

export const createDealSchema = z.object({
  title: z.string().min(1, 'Tên deal không được để trống').max(200),
  value: z.coerce.number().min(0, 'Giá trị phải >= 0').default(0),
  currency: z.string().min(3).max(3).default('VND'),
  dealType: z.enum(['GOVERNMENT', 'COMMERCIAL', 'ACADEMIC', 'PARTNER']).optional().nullable(),
  stageId: z.string().min(1, 'Vui lòng chọn giai đoạn'),
  pipelineId: z.string().min(1, 'Vui lòng chọn pipeline'),
  companyId: z.string().cuid().optional().nullable(),
  partnerId: z.string().cuid().optional().nullable(),
  expectedCloseAt: z.coerce.date().optional().nullable(),
  notes: z.string().max(5000).optional().or(z.literal('')),
  contactIds: z.array(z.string().cuid()).optional(),
  contacts: z.array(z.object({
    contactId: z.string().cuid(),
    role: z.enum(['DECISION_MAKER', 'BUDGET_HOLDER', 'TECHNICAL_EVALUATOR', 'INFLUENCER', 'CHAMPION', 'GATEKEEPER', 'END_USER', 'PROCUREMENT', 'OTHER']).default('OTHER'),
    isPrimary: z.boolean().default(false),
  })).optional(),
})

export const updateDealSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  value: z.coerce.number().min(0).optional(),
  currency: z.string().min(3).max(3).optional(),
  dealType: z.enum(['GOVERNMENT', 'COMMERCIAL', 'ACADEMIC', 'PARTNER']).optional().nullable(),
  stageId: z.string().min(1).optional(),
  pipelineId: z.string().optional(),
  companyId: z.string().cuid().optional().nullable(),
  partnerId: z.string().cuid().optional().nullable(),
  expectedCloseAt: z.coerce.date().optional().nullable(),
  closedAt: z.coerce.date().optional().nullable(),
  lostReason: z.string().max(50).optional().nullable(),
  competitorName: z.string().max(100).optional().nullable(),
  notes: z.string().max(5000).optional(),
  contactIds: z.array(z.string().cuid()).optional(),
  contacts: z.array(z.object({
    contactId: z.string().cuid(),
    role: z.enum(['DECISION_MAKER', 'BUDGET_HOLDER', 'TECHNICAL_EVALUATOR', 'INFLUENCER', 'CHAMPION', 'GATEKEEPER', 'END_USER', 'PROCUREMENT', 'OTHER']).default('OTHER'),
    isPrimary: z.boolean().default(false),
  })).optional(),
})

export const dealQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().max(200).optional(),
  stageId: z.string().optional(),
  companyId: z.string().optional(),
  ownerId: z.string().optional(),
  cursor: z.string().optional(),
})

export type CreateDealInput = z.infer<typeof createDealSchema>
export type UpdateDealInput = z.infer<typeof updateDealSchema>
