import { z } from 'zod'

export const partnerSchema = z.object({
  companyId: z.string(),
  partnerType: z.enum(['RESELLER', 'INTEGRATOR', 'DISTRIBUTOR', 'REFERRAL', 'OEM', 'CONSULTANT']),
  territory: z.string().max(100).optional(),
  commissionRate: z.number().min(0).max(100),
  certificationLevel: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).default('BRONZE'),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
})

export const updatePartnerSchema = partnerSchema.partial()

export const dealRegistrationSchema = z.object({
  dealId: z.string(),
  partnerId: z.string(),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
})

export const registrationActionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionNote: z.string().max(500).optional(),
})

export const commissionUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'PAID', 'CANCELLED']),
  invoiceNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export type PartnerInput = z.infer<typeof partnerSchema>
export type DealRegistrationInput = z.infer<typeof dealRegistrationSchema>
