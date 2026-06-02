'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Mail, Copy, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useDeleteEmailTemplate,
} from '@/hooks/use-email-templates'
import { useTranslation } from '@/i18n'
import { useToast } from '@/hooks/use-toast'

const CATEGORY_COLORS: Record<string, string> = {
  campaign: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  transactional: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  notification: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function TemplatesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const { data: templates, isLoading } = useEmailTemplates()
  const createTemplate = useCreateEmailTemplate()
  const deleteTemplate = useDeleteEmailTemplate()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreate = () => {
    createTemplate.mutate(
      {
        name: 'Mẫu mới',
        subject: '',
        body: '',
        category: 'campaign',
      },
      {
        onSuccess: (data: any) => {
          router.push(`/campaigns/templates/${data.id}`)
        },
      }
    )
  }

  const handleDuplicate = (tpl: any) => {
    createTemplate.mutate(
      {
        name: `${tpl.name} (copy)`,
        subject: tpl.subject,
        body: tpl.body,
        category: tpl.category,
      },
      {
        onSuccess: () => {
          toast({ title: t('templates.duplicated') })
        },
      }
    )
  }

  const handleDelete = (tpl: any) => {
    if (!confirm(t('templates.confirmDelete', { name: tpl.name }))) return
    setDeletingId(tpl.id)
    deleteTemplate.mutate(tpl.id, {
      onSuccess: () => {
        toast({ title: t('templates.deleted') })
        setDeletingId(null)
      },
      onError: () => setDeletingId(null),
    })
  }

  const getCategoryKey = (cat: string | null) => {
    if (cat === 'transactional') return 'templates.categoryTransactional'
    if (cat === 'notification') return 'templates.categoryNotification'
    return 'templates.categoryCampaign'
  }

  return (
    <PageShell
      title={t('templates.title')}
      description={t('templates.description')}
      actions={
        <Button
          onClick={handleCreate}
          disabled={createTemplate.isPending}
          className="btn-accent-glow"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t('templates.create')}
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg bg-[var(--crm-bg-subtle)]" />
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Mail className="w-12 h-12 text-[var(--crm-text-muted)] mb-3" />
          <p className="text-sm font-medium text-[var(--crm-text-primary)]">{t('templates.empty')}</p>
          <p className="text-xs text-[var(--crm-text-muted)] mt-1">{t('templates.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tpl: any) => (
            <div
              key={tpl.id}
              className="glass-card-static p-4 flex flex-col gap-3 group cursor-pointer hover:border-[#10B981]/30 transition-colors"
              onClick={() => router.push(`/campaigns/templates/${tpl.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--crm-text-muted)]" />
                  <h3 className="text-sm font-medium text-[var(--crm-text-primary)] line-clamp-1">
                    {tpl.name}
                  </h3>
                </div>
                {tpl.isDefault && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {t('templates.default')}
                  </span>
                )}
              </div>

              {tpl.subject && (
                <p className="text-xs text-[var(--crm-text-secondary)] line-clamp-1">
                  {tpl.subject}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${CATEGORY_COLORS[tpl.category || 'campaign'] || CATEGORY_COLORS.campaign}`}>
                    {t(getCategoryKey(tpl.category))}
                  </span>
                  <span className="text-[10px] text-[var(--crm-text-muted)]">
                    {t('templates.lastUpdated', {
                      time: formatDistanceToNow(new Date(tpl.updatedAt), { locale: vi, addSuffix: false }),
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDuplicate(tpl)}
                    className="p-1.5 rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-hover)]"
                    title={t('templates.duplicate')}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {!tpl.isDefault && (
                    <button
                      onClick={() => handleDelete(tpl)}
                      disabled={deletingId === tpl.id}
                      className="p-1.5 rounded text-[var(--crm-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
