import { z } from 'zod'

export const createContactSchema = z.object({
  firstName: z.string().min(1, 'Họ không được để trống').max(100),
  lastName: z.string().min(1, 'Tên không được để trống').max(100),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z.string().max(20)
    .refine(
      (v) => !v || /^(\+84|0)[\d\s.\-()]{8,15}$/.test(v),
      'Số điện thoại không hợp lệ'
    )
    .optional().or(z.literal('')),
  mobile: z.string().max(20)
    .refine(
      (v) => !v || /^(\+84|0)[\d\s.\-()]{8,15}$/.test(v),
      'Số điện thoại không hợp lệ'
    )
    .optional().or(z.literal('')),
  jobTitle: z.string().max(200).optional().or(z.literal('')),
  department: z.string().max(200).optional().or(z.literal('')),
  companyId: z.string().cuid().optional().nullable(),
  source: z.string().max(50).optional().nullable().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD', 'CUSTOMER', 'CHURNED']).default('LEAD'),
  notes: z.string().max(5000).optional().or(z.literal('')),
  country: z.string().max(10).optional().or(z.literal('')),
})

export const updateContactSchema = createContactSchema.partial()

export const contactQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().max(200).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD', 'CUSTOMER', 'CHURNED']).optional(),
  companyId: z.string().optional(),
  cursor: z.string().optional(),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
