import { z } from 'zod'

export const quoteItemSchema = z.object({
  productId: z.string().cuid().optional().nullable(),
  description: z.string().max(1000).optional().or(z.literal('')),
  quantity: z.coerce.number().min(1, 'Số lượng phải >= 1'),
  unitPrice: z.coerce.number().min(0, 'Đơn giá phải >= 0'),
  discount: z.coerce.number().min(0).max(100).default(0),
})

export const createQuoteSchema = z.object({
  contactId: z.string().cuid('Vui lòng chọn khách hàng').optional().nullable(),
  companyId: z.string().cuid().optional().nullable(),
  dealId: z.string().cuid().optional().nullable(),
  currency: z.string().min(3).max(3).optional(),
  validUntil: z.coerce.date().optional().nullable(),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  taxPercent: z.coerce.number().min(0).max(100).default(10),
  notes: z.string().max(5000).optional().or(z.literal('')),
  terms: z.string().max(10000).optional().or(z.literal('')),
  items: z.array(quoteItemSchema).min(1, 'Cần ít nhất 1 sản phẩm'),
})

export const updateQuoteSchema = z.object({
  contactId: z.string().cuid().optional().nullable(),
  companyId: z.string().cuid().optional().nullable(),
  dealId: z.string().cuid().optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  taxPercent: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional(),
  terms: z.string().max(10000).optional(),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  items: z.array(quoteItemSchema).min(1).optional(),
})

export const sendQuoteSchema = z.object({
  to: z.string().email('Email không hợp lệ').optional(),
  message: z.string().max(2000).optional(),
})

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>
export type QuoteItemInput = z.infer<typeof quoteItemSchema>
export type SendQuoteInput = z.infer<typeof sendQuoteSchema>
