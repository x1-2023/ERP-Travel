import { z } from 'zod'

export const bundleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  sku: z.string().min(1).max(50),
  bundleType: z.enum(['PACKAGE', 'KIT', 'SERVICE_PLAN']),
  basePrice: z.number().positive(),
  currency: z.string().default('USD'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive().default(1),
    isRequired: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  })).min(1),
})

export const updateBundleSchema = bundleSchema.partial().omit({ items: true }).extend({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive().default(1),
    isRequired: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  })).min(1).optional(),
})

export const compatibilitySchema = z.object({
  productId: z.string(),
  relatedProductId: z.string(),
  type: z.enum(['COMPATIBLE', 'INCOMPATIBLE', 'REQUIRES']),
  notes: z.string().max(500).optional(),
})

export const pricingTierSchema = z.object({
  productId: z.string().optional(),
  bundleId: z.string().optional(),
  tier: z.enum(['GOVERNMENT', 'COMMERCIAL', 'ACADEMIC', 'PARTNER']),
  priceMultiplier: z.number().positive().max(2.0),
  minQuantity: z.number().int().positive().default(1),
})

export type BundleInput = z.infer<typeof bundleSchema>
export type CompatibilityInput = z.infer<typeof compatibilitySchema>
export type PricingTierInput = z.infer<typeof pricingTierSchema>
