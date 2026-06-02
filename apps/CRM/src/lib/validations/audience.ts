import { z } from 'zod'

// ── Rule schemas ────────────────────────────────────────────────────

const VALID_FIELDS = [
  'status', 'source', 'companyId', 'company.industry', 'company.size',
  'company.city', 'score', 'lastActivityAt', 'createdAt', 'tags',
] as const

const VALID_OPERATORS = [
  'equals', 'not_equals', 'contains', 'not_contains',
  'greater_than', 'less_than', 'in', 'not_in',
  'is_empty', 'is_not_empty', 'between',
] as const

export const audienceRuleSchema = z.object({
  id: z.string(),
  field: z.enum(VALID_FIELDS),
  operator: z.enum(VALID_OPERATORS),
  value: z.any(),
})

export const audienceRuleGroupSchema = z.object({
  id: z.string(),
  connector: z.enum(['AND', 'OR']),
  rules: z.array(audienceRuleSchema).min(1),
})

export const audienceRulesSchema = z.object({
  connector: z.enum(['AND', 'OR']),
  groups: z.array(audienceRuleGroupSchema).min(1),
})

// ── Create / Update schemas ─────────────────────────────────────────

export const createAudienceSchema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: z.enum(['STATIC', 'DYNAMIC']),
    rules: audienceRulesSchema.optional(),
    contactIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'DYNAMIC') return !!data.rules
      return true
    },
    { message: 'Dynamic audiences require rules', path: ['rules'] }
  )
  .refine(
    (data) => {
      if (data.type === 'STATIC') return data.contactIds && data.contactIds.length > 0
      return true
    },
    { message: 'Static audiences require contacts', path: ['contactIds'] }
  )

export const updateAudienceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  rules: audienceRulesSchema.optional(),
})

// ── Inferred types ──────────────────────────────────────────────────

export type AudienceRuleInput = z.infer<typeof audienceRuleSchema>
export type AudienceRuleGroupInput = z.infer<typeof audienceRuleGroupSchema>
export type AudienceRulesInput = z.infer<typeof audienceRulesSchema>
export type CreateAudienceInput = z.infer<typeof createAudienceSchema>
export type UpdateAudienceInput = z.infer<typeof updateAudienceSchema>
