'use client'

import { CheckSquare, Square, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDealChecklist, useUpdateChecklistItem } from '@/hooks/use-compliance'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n'

interface DealChecklistProps {
  dealId: string
}

export function DealChecklistPanel({ dealId }: DealChecklistProps) {
  const { t } = useTranslation()
  const { data: items = [], isLoading } = useDealChecklist(dealId)
  const updateItem = useUpdateChecklistItem()

  if (isLoading) return null
  if (items.length === 0) return null

  const completedCount = items.filter((i) => i.checked).length
  const totalCount = items.length

  const handleToggle = (key: string, currentChecked: boolean) => {
    updateItem.mutate(
      { dealId, key, checked: !currentChecked },
      {
        onError: (err) => toast({ title: t('common.error'), description: err.message, variant: 'destructive' }),
      }
    )
  }

  return (
    <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[var(--crm-text-primary)] flex items-center justify-between">
          <span>{t('compliance.checklist')}</span>
          <span className="text-xs font-normal text-[var(--crm-text-muted)]">
            {completedCount}/{totalCount}
          </span>
        </CardTitle>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[var(--crm-bg-page)] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item) => {
          const isUpdating = updateItem.isPending && updateItem.variables?.key === item.key
          return (
            <button
              key={item.key}
              className="flex items-center gap-2 w-full p-1.5 rounded-md hover:bg-[var(--crm-bg-page)] transition-colors text-left"
              onClick={() => handleToggle(item.key, item.checked)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 text-[var(--crm-text-muted)] animate-spin flex-shrink-0" />
              ) : item.checked ? (
                <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-[var(--crm-text-muted)] flex-shrink-0" />
              )}
              <span className={`text-xs ${item.checked ? 'text-[var(--crm-text-muted)] line-through' : 'text-[var(--crm-text-primary)]'}`}>
                {t(item.label)}
              </span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
