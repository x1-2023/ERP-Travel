import { z } from 'zod'

export const createExchangeRateSchema = z.object({
  currency: z.string().min(3).max(3, 'Mã tiền tệ phải là 3 ký tự'),
  symbol: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  rateToBase: z.coerce.number().min(0, 'Tỷ giá phải >= 0'),
  isBase: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const updateExchangeRateSchema = z.object({
  rateToBase: z.coerce.number().min(0, 'Tỷ giá phải >= 0').optional(),
  isActive: z.boolean().optional(),
  isBase: z.boolean().optional(),
})

export type CreateExchangeRateInput = z.infer<typeof createExchangeRateSchema>
export type UpdateExchangeRateInput = z.infer<typeof updateExchangeRateSchema>
