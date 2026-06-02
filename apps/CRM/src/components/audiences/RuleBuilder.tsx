'use client'

import { useCallback } from 'react'
import { Plus, X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/i18n'
import { useCompanies } from '@/hooks/use-companies'
import {
  AUDIENCE_FIELDS,
  getFieldDef,
  type AudienceRules,
  type AudienceRuleGroup,
  type AudienceRule,
  type Operator,
} from '@/lib/audience-fields'

interface RuleBuilderProps {
  rules: AudienceRules
  onChange: (rules: AudienceRules) => void
  previewCount?: number | null
  previewLoading?: boolean
}

function generateId() {
  return `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function RuleBuilder({ rules, onChange, previewCount, previewLoading }: RuleBuilderProps) {
  const { t } = useTranslation()
  const { data: companiesData } = useCompanies({ limit: 100 })
  const companies = companiesData?.data || []

  const updateGroup = useCallback(
    (groupId: string, updater: (g: AudienceRuleGroup) => AudienceRuleGroup) => {
      onChange({
        ...rules,
        groups: rules.groups.map((g) => (g.id === groupId ? updater(g) : g)),
      })
    },
    [rules, onChange]
  )

  const addGroup = useCallback(() => {
    onChange({
      ...rules,
      groups: [
        ...rules.groups,
        {
          id: generateId(),
          connector: 'AND',
          rules: [{ id: generateId(), field: '', operator: 'equals', value: '' }],
        },
      ],
    })
  }, [rules, onChange])

  const removeGroup = useCallback(
    (groupId: string) => {
      if (rules.groups.length <= 1) return
      onChange({
        ...rules,
        groups: rules.groups.filter((g) => g.id !== groupId),
      })
    },
    [rules, onChange]
  )

  const addRule = useCallback(
    (groupId: string) => {
      updateGroup(groupId, (g) => ({
        ...g,
        rules: [...g.rules, { id: generateId(), field: '', operator: 'equals', value: '' }],
      }))
    },
    [updateGroup]
  )

  const removeRule = useCallback(
    (groupId: string, ruleId: string) => {
      updateGroup(groupId, (g) => {
        const filtered = g.rules.filter((r) => r.id !== ruleId)
        return { ...g, rules: filtered.length > 0 ? filtered : g.rules }
      })
    },
    [updateGroup]
  )

  const updateRule = useCallback(
    (groupId: string, ruleId: string, updates: Partial<AudienceRule>) => {
      updateGroup(groupId, (g) => ({
        ...g,
        rules: g.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
      }))
    },
    [updateGroup]
  )

  const handleFieldChange = useCallback(
    (groupId: string, ruleId: string, field: string) => {
      const def = getFieldDef(field)
      const defaultOp = def?.operators[0] || 'equals'
      updateRule(groupId, ruleId, { field, operator: defaultOp, value: '' })
    },
    [updateRule]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--crm-text-primary)] flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400" />
          {t('audiences.ruleBuilder')}
        </h3>
        {previewCount !== undefined && previewCount !== null && (
          <Badge
            className="badge-premium border-0 text-xs"
            style={{ backgroundColor: '#10B98120', color: '#10B981' }}
          >
            {previewLoading ? t('audiences.previewLoading') : t('audiences.previewCount', { n: previewCount })}
          </Badge>
        )}
        {previewLoading && previewCount === undefined && (
          <Badge
            className="badge-premium border-0 text-xs"
            style={{ backgroundColor: '#6B728020', color: '#6B7280' }}
          >
            {t('audiences.previewLoading')}
          </Badge>
        )}
      </div>

      {rules.groups.map((group, gi) => (
        <div key={group.id}>
          {gi > 0 && (
            <div className="flex items-center justify-center my-3">
              <Badge className="badge-premium border-0 text-[10px] px-3" style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}>
                {t('audiences.groupConnector')}
              </Badge>
            </div>
          )}
          <div className="glass-card-static p-4 relative">
            {rules.groups.length > 1 && (
              <button
                onClick={() => removeGroup(group.id)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-[var(--crm-bg-subtle)] text-[var(--crm-text-muted)] hover:text-red-400 transition-colors"
                title={t('audiences.removeGroup')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="space-y-2">
              {group.rules.map((rule, ri) => (
                <div key={rule.id}>
                  {ri > 0 && (
                    <div className="flex items-center justify-center my-1.5">
                      <span className="text-[10px] font-medium text-[var(--crm-text-muted)] uppercase">
                        {t('audiences.ruleConnector')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {/* Field select */}
                    <Select value={rule.field || undefined} onValueChange={(v) => handleFieldChange(group.id, rule.id, v)}>
                      <SelectTrigger className="w-[160px] h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs">
                        <SelectValue placeholder={t('audiences.selectField')} />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIENCE_FIELDS.map((f) => (
                          <SelectItem key={f.key} value={f.key} className="text-xs">
                            {t(f.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Operator select */}
                    {rule.field && (
                      <Select
                        value={rule.operator}
                        onValueChange={(v) => updateRule(group.id, rule.id, { operator: v as Operator })}
                      >
                        <SelectTrigger className="w-[140px] h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs">
                          <SelectValue placeholder={t('audiences.selectOperator')} />
                        </SelectTrigger>
                        <SelectContent>
                          {(getFieldDef(rule.field)?.operators || []).map((op) => (
                            <SelectItem key={op} value={op} className="text-xs">
                              {t(`operator.${op}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Value input */}
                    {rule.field && rule.operator !== 'is_empty' && rule.operator !== 'is_not_empty' && (
                      <ValueInput
                        rule={rule}
                        companies={companies}
                        onChange={(value) => updateRule(group.id, rule.id, { value })}
                        t={t}
                      />
                    )}

                    {/* Remove rule */}
                    {group.rules.length > 1 && (
                      <button
                        onClick={() => removeRule(group.id, rule.id)}
                        className="p-1 rounded hover:bg-[var(--crm-bg-subtle)] text-[var(--crm-text-muted)] hover:text-red-400 transition-colors flex-shrink-0"
                        title={t('audiences.removeRule')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => addRule(group.id)}
              className="mt-3 text-xs text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              {t('audiences.addRule')}
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addGroup}
        className="text-xs border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
      >
        <Plus className="w-3 h-3 mr-1" />
        {t('audiences.addGroup')}
      </Button>
    </div>
  )
}

// ── Value Input by field type ───────────────────────────────────────

interface ValueInputProps {
  rule: AudienceRule
  companies: any[]
  onChange: (value: any) => void
  t: (key: string, params?: any) => string
}

function ValueInput({ rule, companies, onChange, t }: ValueInputProps) {
  const fieldDef = getFieldDef(rule.field)
  if (!fieldDef) return null

  // Between operator: two inputs
  if (rule.operator === 'between') {
    const val = Array.isArray(rule.value) ? rule.value : ['', '']
    const inputType = fieldDef.type === 'date' ? 'date' : 'number'
    return (
      <div className="flex items-center gap-1 flex-1">
        <Input
          type={inputType}
          value={val[0] || ''}
          onChange={(e) => onChange([e.target.value, val[1]])}
          className="h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs flex-1"
          placeholder="From"
        />
        <span className="text-[10px] text-[var(--crm-text-muted)]">-</span>
        <Input
          type={inputType}
          value={val[1] || ''}
          onChange={(e) => onChange([val[0], e.target.value])}
          className="h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs flex-1"
          placeholder="To"
        />
      </div>
    )
  }

  // Enum field: select dropdown
  if (fieldDef.type === 'enum' && fieldDef.options) {
    if (rule.operator === 'in' || rule.operator === 'not_in') {
      // Multi-value: comma-separated or checkboxes
      return (
        <Input
          value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value || ''}
          onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          placeholder={fieldDef.options.map((o) => o.value).join(', ')}
          className="h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs flex-1"
        />
      )
    }
    return (
      <Select value={rule.value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-[160px] h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs">
          <SelectValue placeholder={t('audiences.enterValue')} />
        </SelectTrigger>
        <SelectContent>
          {fieldDef.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {t(opt.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Relation: companyId → company dropdown
  if (fieldDef.type === 'relation' && rule.field === 'companyId') {
    return (
      <Select value={rule.value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-[200px] h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs">
          <SelectValue placeholder={t('audiences.enterValue')} />
        </SelectTrigger>
        <SelectContent>
          {companies.map((c: any) => (
            <SelectItem key={c.id} value={c.id} className="text-xs">
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Relation: tags → text input
  if (fieldDef.type === 'relation' && rule.field === 'tags') {
    return (
      <Input
        value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value || ''}
        onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        placeholder={t('audiences.enterValue')}
        className="h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs flex-1"
      />
    )
  }

  // Date field
  if (fieldDef.type === 'date') {
    return (
      <Input
        type="date"
        value={rule.value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs flex-1"
      />
    )
  }

  // Number field
  if (fieldDef.type === 'number') {
    return (
      <Input
        type="number"
        value={rule.value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        placeholder={t('audiences.enterValue')}
        className="h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs flex-1"
      />
    )
  }

  // Default: string input
  return (
    <Input
      value={rule.value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('audiences.enterValue')}
      className="h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs flex-1"
    />
  )
}
