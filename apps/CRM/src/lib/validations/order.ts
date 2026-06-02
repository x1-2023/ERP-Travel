import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().cuid().optional().nullable(),
  description: z.string().max(1000).optional().or(z.literal('')),
  quantity: z.coerce.number().min(1, 'Số lượng phải >= 1'),
  unitPrice: z.coerce.number().min(0, 'Đơn giá phải >= 0'),
  total: z.coerce.number().min(0).optional(),
})

export const createOrderSchema = z.object({
  companyId: z.string().cuid().optional().nullable(),
  dealId: z.string().cuid().optional().nullable(),
  quoteId: z.string().cuid().optional().nullable(),
  shippingAddress: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
  items: z.array(orderItemSchema).optional(),
})

export const updateOrderSchema = z.object({
  status: z.enum([
    'PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
  ]).optional(),
  shippingAddress: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
  paidAt: z.coerce.date().optional().nullable(),
  shippedAt: z.coerce.date().optional().nullable(),
  deliveredAt: z.coerce.date().optional().nullable(),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  cursor: z.string().optional(),
})

export const orderTransitionSchema = z.object({
  toStatus: z.enum([
    'PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
  ]),
  note: z.string().max(1000).optional().or(z.literal('')),
  cancellationReason: z.string().max(1000).optional().or(z.literal('')),
  refundAmount: z.coerce.number().min(0).optional(),
  trackingNumber: z.string().max(200).optional().or(z.literal('')),
  shippingProvider: z.string().max(200).optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.toStatus === 'CANCELLED' && !data.cancellationReason?.trim()) return false
    return true
  },
  { message: 'Lý do hủy đơn là bắt buộc', path: ['cancellationReason'] }
).refine(
  (data) => {
    if (data.toStatus === 'REFUNDED' && (data.refundAmount === undefined || data.refundAmount <= 0)) return false
    return true
  },
  { message: 'Số tiền hoàn là bắt buộc', path: ['refundAmount'] }
)

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type OrderTransitionInput = z.infer<typeof orderTransitionSchema>
