'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GoalProgress } from '../goals/goal-progress'
import type { ReviewGoal } from '@/types/performance'

interface GoalRatingSectionProps {
  goals: ReviewGoal[]
  mode: 'self' | 'manager' | 'view'
  onUpdate?: (goalId: string, score: number, comments: string) => void
}

export function GoalRatingSection({ goals, mode, onUpdate }: GoalRatingSectionProps) {
  const [localState, setLocalState] = useState<
    Record<string, { score: number; comments: string }>
  >({})

  const getLocalValue = (goalId: string) => {
    if (localState[goalId]) return localState[goalId]
    const g = goals.find((x) => x.goalId === goalId)
    if (!g) return { score: 0, comments: '' }
    if (mode === 'self') return { score: g.selfScore || 0, comments: g.selfComments || '' }
    return { score: g.managerScore || 0, comments: g.managerComments || '' }
  }

  const handleChange = (goalId: string, field: 'score' | 'comments', value: string | number) => {
    const current = getLocalValue(goalId)
    const updated = { ...current, [field]: value }
    setLocalState((prev) => ({ ...prev, [goalId]: updated }))
    onUpdate?.(goalId, updated.score, updated.comments)
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground border-b">
        <div className="col-span-4">Mục tiêu</div>
        <div className="col-span-2">Tiến độ</div>
        <div className="col-span-1 text-center">Trọng số</div>
        <div className="col-span-1 text-center">Điểm (1-5)</div>
        <div className="col-span-4">Nhận xét</div>
      </div>

      {/* Rows */}
      {goals.map((reviewGoal) => {
        const local = getLocalValue(reviewGoal.goalId)
        const isEditable = mode !== 'view'

        return (
          <div
            key={reviewGoal.id}
            className="grid grid-cols-12 gap-2 px-3 py-2 items-center border-b border-border/50"
          >
            <div className="col-span-4">
              <span className="text-sm font-medium line-clamp-2">
                {reviewGoal.goal?.title || reviewGoal.goalId}
              </span>
            </div>
            <div className="col-span-2">
              <GoalProgress
                progress={reviewGoal.goal?.progress || 0}
                size="sm"
                showLabel
              />
            </div>
            <div className="col-span-1 text-center">
              <span className="text-xs font-data">
                {reviewGoal.goal?.weight || 0}%
              </span>
            </div>
            <div className="col-span-1 text-center">
              {isEditable ? (
                <Input
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  value={local.score || ''}
                  onChange={(e) =>
                    handleChange(reviewGoal.goalId, 'score', Number(e.target.value))
                  }
                  className="h-7 w-14 text-center font-data text-xs mx-auto"
                />
              ) : (
                <span className="font-data text-sm">
                  {reviewGoal.finalScore || local.score || '-'}
                </span>
              )}
            </div>
            <div className="col-span-4">
              {isEditable ? (
                <Textarea
                  value={local.comments}
                  onChange={(e) =>
                    handleChange(reviewGoal.goalId, 'comments', e.target.value)
                  }
                  placeholder="Nhận xét..."
                  rows={1}
                  className="text-xs min-h-[28px] resize-none"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {mode === 'view'
                    ? reviewGoal.managerComments || reviewGoal.selfComments || '-'
                    : local.comments || '-'}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
