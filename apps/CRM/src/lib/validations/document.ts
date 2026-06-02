import { z } from 'zod'

export const uploadDocumentSchema = z.object({
  name: z.string().min(1, 'Tên tài liệu không được để trống').max(200),
  category: z.enum(['PROPOSAL', 'CONTRACT', 'NDA', 'COMPLIANCE', 'TECHNICAL', 'CERTIFICATE', 'INVOICE', 'OTHER']).default('OTHER'),
  description: z.string().max(2000).optional().or(z.literal('')),
  dealId: z.string().cuid().optional().nullable(),
  companyId: z.string().cuid().optional().nullable(),
  contactId: z.string().cuid().optional().nullable(),
})

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.enum(['PROPOSAL', 'CONTRACT', 'NDA', 'COMPLIANCE', 'TECHNICAL', 'CERTIFICATE', 'INVOICE', 'OTHER']).optional(),
  description: z.string().max(2000).optional(),
})

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
