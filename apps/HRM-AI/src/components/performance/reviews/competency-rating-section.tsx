'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { ReviewCompetency } from '@/types/performance'

interface CompetencyRatingSectionProps {
  competencies: ReviewCompetency[]
  mode: 'self' | 'manager' | 'view'
  onUpdate?: (competencyId: string, rating: number, comments: string) => void
}

function getGapColor(gap: number): string {
  if (gap >= 0) return 'text-success'
  if (gap >= -1) return 'text-yellow-400'
  return 'text-destructive'
}

export function CompetencyRatingSection({
  competencies,
  mode,
  onUpdate,
}: CompetencyRatingSectionProps) {
  const [localState, setLocalState] = useState<
    Record<string, { rating: number; comments: string }>
  >({})

  const getLocalValue = (competencyId: string) => {
    if (localState[competencyId]) return localState[competencyId]
    const c = competencies.find((x) => x.competencyId === competencyId)
    if (!c) return { rating: 0, comments: '' }
    if (mode === 'self') return { rating: c.selfRating || 0, comments: c.selfComments || '' }
    return { rating: c.managerRating || 0, comments: c.managerComments || '' }
  }

  const handleChange = (
    competencyId: string,
    field: 'rating' | 'comments',
    value: string | number
  ) => {
    const current = getLocalValue(competencyId)
    const updated = { ...current, [field]: value }
    setLocalState((prev) => ({ ...prev, [competencyId]: updated }))
    onUpdate?.(competencyId, updated.rating, updated.comments)
  }

  return (
    <div className="space-y-2">
      {competencies.map((rc) => {
        const local = getLocalValue(rc.competencyId)
        const isEditable = mode !== 'view'
        const currentRating = rc.finalRating || local.rating
        const gap = currentRating - rc.requiredLevel

        return (
          <div
            key={rc.id}
            className="p-3 rounded-sm border bg-card space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {rc.competency?.name || rc.competencyId}
                  </span>
                  {rc.competency?.category && (
                    <Badge variant="outline" className="text-[10px] py-0">
                      {rc.competency.category}
                    </Badge>
                  )}
                </div>
                {rc.competency?.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {rc.competency.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">Yêu cầu</div>
                  <div className="font-data text-sm">{rc.requiredLevel}</div>
                </div>
                {currentRating > 0 && (
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground">Gap</div>
                    <div className={cn('font-data text-sm font-bold', getGapColor(gap))}>
                      {gap > 0 ? '+' : ''}{gap}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditable ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Đánh giá:</span>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      value={local.rating || ''}
                      onChange={(e) =>
                        handleChange(rc.competencyId, 'rating', Number(e.target.value))
                      }
                      className="h-7 w-14 text-center font-data text-xs"
                    />
                  </div>
                  <Textarea
                    value={local.comments}
                    onChange={(e) =>
                      handleChange(rc.competencyId, 'comments', e.target.value)
                    }
                    placeholder="Nhận xét..."
                    rows={1}
                    className="flex-1 text-xs min-h-[28px] resize-none"
                  />
                </>
              ) : (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">
                    Đánh giá: <span className="font-data font-bold text-foreground">{currentRating || '-'}</span>
                  </span>
                  {(rc.managerComments || rc.selfComments) && (
                    <span className="text-muted-foreground">
                      {rc.managerComments || rc.selfComments}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
