'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ReviewValue } from '@/types/performance'

interface ValuesRatingSectionProps {
  values: ReviewValue[]
  mode: 'self' | 'manager' | 'view'
  onUpdate?: (coreValueId: string, rating: number, comments: string) => void
}

export function ValuesRatingSection({
  values,
  mode,
  onUpdate,
}: ValuesRatingSectionProps) {
  const [localState, setLocalState] = useState<
    Record<string, { rating: number; comments: string }>
  >({})

  const getLocalValue = (coreValueId: string) => {
    if (localState[coreValueId]) return localState[coreValueId]
    const v = values.find((x) => x.coreValueId === coreValueId)
    if (!v) return { rating: 0, comments: '' }
    if (mode === 'self') return { rating: v.selfRating || 0, comments: v.selfComments || '' }
    return { rating: v.managerRating || 0, comments: v.managerComments || '' }
  }

  const handleChange = (
    coreValueId: string,
    field: 'rating' | 'comments',
    value: string | number
  ) => {
    const current = getLocalValue(coreValueId)
    const updated = { ...current, [field]: value }
    setLocalState((prev) => ({ ...prev, [coreValueId]: updated }))
    onUpdate?.(coreValueId, updated.rating, updated.comments)
  }

  return (
    <div className="space-y-2">
      {values.map((rv) => {
        const local = getLocalValue(rv.coreValueId)
        const isEditable = mode !== 'view'
        const displayRating = rv.finalRating || local.rating

        return (
          <div
            key={rv.id}
            className="p-3 rounded-sm border bg-card space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">
                  {rv.coreValue?.name || rv.coreValueId}
                </span>
                {rv.coreValue?.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {rv.coreValue.description}
                  </p>
                )}
              </div>
              {!isEditable && displayRating > 0 && (
                <div className="font-data text-sm font-bold shrink-0">
                  {displayRating}/5
                </div>
              )}
            </div>

            {isEditable ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground">Đánh giá:</span>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    value={local.rating || ''}
                    onChange={(e) =>
                      handleChange(rv.coreValueId, 'rating', Number(e.target.value))
                    }
                    className="h-7 w-14 text-center font-data text-xs"
                  />
                  <span className="text-xs text-muted-foreground">/5</span>
                </div>
                <Textarea
                  value={local.comments}
                  onChange={(e) =>
                    handleChange(rv.coreValueId, 'comments', e.target.value)
                  }
                  placeholder="Nhận xét về giá trị này..."
                  rows={1}
                  className="flex-1 text-xs min-h-[28px] resize-none"
                />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {rv.managerComments || rv.selfComments || 'Chưa có nhận xét'}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
