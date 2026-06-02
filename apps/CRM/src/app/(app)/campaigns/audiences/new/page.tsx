'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Filter } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useContacts } from '@/hooks/use-contacts'
import { useCreateAudience, usePreviewAudienceCount } from '@/hooks/use-campaigns'
import { useTranslation } from '@/i18n'
import { RuleBuilder } from '@/components/audiences/RuleBuilder'
import type { AudienceRules } from '@/lib/audience-fields'

const EMPTY_RULES: AudienceRules = {
  connector: 'OR',
  groups: [
    {
      id: 'g_initial',
      connector: 'AND',
      rules: [{ id: 'r_initial', field: '', operator: 'equals', value: '' }],
    },
  ],
}

export default function NewAudiencePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: contactsData, isLoading: contactsLoading } = useContacts({ limit: 200 })
  const createAudience = useCreateAudience()
  const preview = usePreviewAudienceCount()

  const [type, setType] = useState<'STATIC' | 'DYNAMIC'>('STATIC')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [rules, setRules] = useState<AudienceRules>(EMPTY_RULES)

  const contacts = contactsData?.data || []
  const filtered = search
    ? contacts.filter((c: any) =>
        `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : contacts

  // Debounced preview for dynamic rules
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (type !== 'DYNAMIC') return
    // Check if rules have any valid field set
    const hasValidRule = rules.groups.some((g) => g.rules.some((r) => r.field))
    if (!hasValidRule) return

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      preview.mutate(rules)
    }, 600)
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, type])

  const toggleContact = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = () => {
    if (type === 'DYNAMIC') {
      createAudience.mutate(
        { name, description, type: 'DYNAMIC', rules },
        { onSuccess: () => router.push('/campaigns/audiences') }
      )
    } else {
      createAudience.mutate(
        { name, description, type: 'STATIC', contactIds: Array.from(selectedIds) },
        { onSuccess: () => router.push('/campaigns/audiences') }
      )
    }
  }

  const hasValidRules = rules.groups.some((g) => g.rules.some((r) => r.field && r.operator))
  const canSubmit =
    name &&
    !createAudience.isPending &&
    (type === 'STATIC' ? selectedIds.size > 0 : hasValidRules)

  return (
    <PageShell
      title={t('audiences.create')}
      actions={
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('common.back')}
        </Button>
      }
    >
      {/* Basic info */}
      <div className="glass-card-static p-6 space-y-5 max-w-2xl">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('audiences.audienceName')}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('audiences.audienceNamePlaceholder')}
            className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">{t('common.description')}</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('audiences.descriptionPlaceholder')}
            className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
          />
        </div>
      </div>

      {/* Type selector */}
      <div className="mt-4">
        <Label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide mb-2 block">
          {t('audiences.typeSelector')}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          <button
            onClick={() => setType('STATIC')}
            className={`p-4 rounded-lg border text-left transition-colors ${
              type === 'STATIC'
                ? 'border-[#3B82F6]/40 bg-[#3B82F6]/10'
                : 'border-[var(--crm-border)] hover:bg-[var(--glass-bg)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className={`w-4 h-4 ${type === 'STATIC' ? 'text-blue-400' : 'text-[var(--crm-text-muted)]'}`} />
              <span className="text-sm font-medium text-[var(--crm-text-primary)]">{t('audiences.typeStatic')}</span>
            </div>
            <p className="text-xs text-[var(--crm-text-muted)]">{t('audiences.typeStaticDesc')}</p>
          </button>
          <button
            onClick={() => setType('DYNAMIC')}
            className={`p-4 rounded-lg border text-left transition-colors ${
              type === 'DYNAMIC'
                ? 'border-purple-500/40 bg-purple-500/10'
                : 'border-[var(--crm-border)] hover:bg-[var(--glass-bg)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Filter className={`w-4 h-4 ${type === 'DYNAMIC' ? 'text-purple-400' : 'text-[var(--crm-text-muted)]'}`} />
              <span className="text-sm font-medium text-[var(--crm-text-primary)]">{t('audiences.typeDynamic')}</span>
            </div>
            <p className="text-xs text-[var(--crm-text-muted)]">{t('audiences.typeDynamicDesc')}</p>
          </button>
        </div>
      </div>

      {/* Dynamic: Rule Builder */}
      {type === 'DYNAMIC' && (
        <div className="mt-4 max-w-2xl">
          <RuleBuilder
            rules={rules}
            onChange={setRules}
            previewCount={preview.data?.count ?? undefined}
            previewLoading={preview.isPending}
          />
        </div>
      )}

      {/* Static: Contact selector */}
      {type === 'STATIC' && (
        <div className="glass-card-static p-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">{t('audiences.selectContacts', { n: selectedIds.size })}</h3>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('audiences.searchPlaceholder')}
              className="input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)] w-64"
            />
          </div>

          {contactsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-[var(--crm-bg-subtle)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filtered.map((contact: any) => (
                <button
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    selectedIds.has(contact.id)
                      ? 'bg-[#10B981]/10 border border-[#10B981]/20'
                      : 'hover:bg-[var(--glass-bg)] border border-transparent'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedIds.has(contact.id)
                      ? 'border-[#10B981] bg-[#10B981]'
                      : 'border-white/[0.12]'
                  }`}>
                    {selectedIds.has(contact.id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--crm-text-primary)]">{contact.firstName} {contact.lastName}</p>
                    <p className="text-xs text-[var(--crm-text-muted)] truncate">{contact.email || '--'}</p>
                  </div>
                  {contact.company && (
                    <span className="text-xs text-[var(--crm-text-muted)] truncate">{contact.company.name}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <Button
          onClick={handleCreate}
          disabled={!canSubmit}
          className="btn-accent-glow"
        >
          {createAudience.isPending
            ? t('common.creating')
            : type === 'STATIC'
              ? t('audiences.createWithCount', { n: selectedIds.size })
              : t('audiences.create')
          }
        </Button>
      </div>
    </PageShell>
  )
}
