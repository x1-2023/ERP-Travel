'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'
import { usePipeline } from '@/hooks/use-pipeline'
import { useMoveDeal } from '@/hooks/use-deals'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n'

export default function PipelinePage() {
  const { t } = useTranslation()
  const { data: pipelineData, isLoading, error } = usePipeline()
  const moveDeal = useMoveDeal()
  const { canCreate } = usePermissions()

  const handleMoveDeal = useCallback(
    (dealId: string, newStageId: string) => {
      moveDeal.mutate(
        { id: dealId, stageId: newStageId },
        {
          onError: (err) => {
            toast({
              title: 'Lỗi',
              description: err.message || 'Không thể di chuyển deal',
              variant: 'destructive',
            })
          },
        }
      )
    },
    [moveDeal]
  )

  const stages = pipelineData?.stages ?? []

  return (
    <PageShell
      title="Pipeline"
      actions={
        canCreate ? (
          <Button asChild size="sm">
            <Link href="/pipeline/new">
              <Plus className="w-4 h-4" />
              {t('pipeline.addDeal')}
            </Link>
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <PipelineSkeleton />
      ) : error ? (
        <div className="glass-card-static">
          <div className="p-8 text-center">
            <p className="text-sm text-red-400">
              Không thể tải dữ liệu pipeline. Vui lòng thử lại.
            </p>
          </div>
        </div>
      ) : stages.length === 0 ? (
        <div className="glass-card-static">
          <div className="p-8 text-center space-y-3">
            <p className="text-sm text-[var(--crm-text-secondary)]">
              {t('pipeline.empty')}
            </p>
            <Button asChild size="sm">
              <Link href="/settings">{t('pipeline.setupPipeline')}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <KanbanBoard stages={stages} onMoveDeal={handleMoveDeal} />
      )}
    </PageShell>
  )
}

function PipelineSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="kanban-column flex flex-col"
        >
          <div className="px-3 py-3 border-b border-[var(--crm-border-subtle)] space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="p-2 space-y-2">
            {Array.from({ length: 3 - i % 2 }).map((_, j) => (
              <div
                key={j}
                className="deal-card space-y-2"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
