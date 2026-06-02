import { z } from 'zod'

export const companySettingsSchema = z.object({
  name: z.string().min(1, 'Tên công ty không được trống').max(200),
  address: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  website: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  taxId: z.string().max(20).optional().or(z.literal('')),
  logo: z.string().max(1000).optional().or(z.literal('')),
})

const pipelineStageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Tên giai đoạn không được trống'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Mã màu không hợp lệ'),
  probability: z.coerce.number().min(0).max(100),
  order: z.coerce.number().min(0),
})

export const pipelineSettingsSchema = z.object({
  stages: z.array(pipelineStageSchema).min(1, 'Cần ít nhất 1 giai đoạn'),
})

export const notificationSettingsSchema = z.object({
  quoteExpiryReminder: z.boolean(),
  quoteExpiryDays: z.coerce.number().min(1).max(30),
  dealStaleAlertDays: z.coerce.number().min(1).max(90),
  emailOnNewDeal: z.boolean(),
})

export const emailSettingsSchema = z.object({
  fromName: z.string().max(100).optional().or(z.literal('')),
  fromEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  replyTo: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  signature: z.string().max(5000).optional().or(z.literal('')),
})

export const orderSettingsSchema = z.object({
  autoOrderFromQuote: z.boolean(),
})

// Map key → schema for dynamic validation
export const settingsSchemaMap: Record<string, z.ZodSchema> = {
  company: companySettingsSchema,
  pipeline: pipelineSettingsSchema,
  notifications: notificationSettingsSchema,
  email: emailSettingsSchema,
  order: orderSettingsSchema,
}
