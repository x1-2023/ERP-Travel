import { z } from 'zod'

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Tên công ty không được để trống').max(200),
  domain: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  industry: z.string().max(100).optional().nullable().or(z.literal('')),
  size: z.enum(['SOLO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional().nullable(),
  phone: z.string().max(20)
    .refine(
      (v) => !v || /^(\+84|0)[\d\s.\-()]{8,15}$/.test(v),
      'Số điện thoại không hợp lệ'
    )
    .optional().or(z.literal('')),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  website: z.string().max(500).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  province: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  taxCode: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
  logoUrl: z.string().max(500).optional().or(z.literal('')),
  parentId: z.string().cuid().optional().nullable(),
})

export const updateCompanySchema = createCompanySchema.partial()

export const companyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().max(200).optional(),
  industry: z.string().optional(),
  size: z.enum(['SOLO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  cursor: z.string().optional(),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
