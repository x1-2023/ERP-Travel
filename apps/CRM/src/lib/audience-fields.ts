import { CONTACT_STATUSES, LEAD_SOURCES, COMPANY_SIZES } from './constants'

// ── Types ───────────────────────────────────────────────────────────

export type FieldType = 'enum' | 'string' | 'number' | 'date' | 'relation'

export type Operator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty'
  | 'between'

export interface AudienceRule {
  id: string
  field: string
  operator: Operator
  value: any
}

export interface AudienceRuleGroup {
  id: string
  connector: 'AND' | 'OR'
  rules: AudienceRule[]
}

export interface AudienceRules {
  connector: 'AND' | 'OR'
  groups: AudienceRuleGroup[]
}

export interface AudienceFieldOption {
  value: string
  labelKey: string
}

export interface AudienceFieldDef {
  key: string
  labelKey: string
  type: FieldType
  operators: Operator[]
  options?: readonly { value: string; labelKey: string }[]
}

// ── Field definitions ───────────────────────────────────────────────

export const AUDIENCE_FIELDS: AudienceFieldDef[] = [
  {
    key: 'status',
    labelKey: 'audienceField.status',
    type: 'enum',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: CONTACT_STATUSES,
  },
  {
    key: 'source',
    labelKey: 'audienceField.source',
    type: 'enum',
    operators: ['equals', 'not_equals', 'in', 'not_in', 'is_empty', 'is_not_empty'],
    options: LEAD_SOURCES,
  },
  {
    key: 'companyId',
    labelKey: 'audienceField.company',
    type: 'relation',
    operators: ['equals', 'not_equals', 'is_empty', 'is_not_empty'],
  },
  {
    key: 'company.industry',
    labelKey: 'audienceField.companyIndustry',
    type: 'string',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'],
  },
  {
    key: 'company.size',
    labelKey: 'audienceField.companySize',
    type: 'enum',
    operators: ['equals', 'not_equals', 'in', 'not_in', 'is_empty', 'is_not_empty'],
    options: COMPANY_SIZES,
  },
  {
    key: 'company.city',
    labelKey: 'audienceField.companyCity',
    type: 'string',
    operators: ['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'],
  },
  {
    key: 'score',
    labelKey: 'audienceField.score',
    type: 'number',
    operators: ['equals', 'not_equals', 'greater_than', 'less_than', 'between'],
  },
  {
    key: 'lastActivityAt',
    labelKey: 'audienceField.lastActivity',
    type: 'date',
    operators: ['greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty'],
  },
  {
    key: 'createdAt',
    labelKey: 'audienceField.createdAt',
    type: 'date',
    operators: ['greater_than', 'less_than', 'between'],
  },
  {
    key: 'tags',
    labelKey: 'audienceField.tags',
    type: 'relation',
    operators: ['in', 'not_in', 'is_empty', 'is_not_empty'],
  },
]

// ── Helpers ─────────────────────────────────────────────────────────

export function getFieldDef(key: string): AudienceFieldDef | undefined {
  return AUDIENCE_FIELDS.find((f) => f.key === key)
}
