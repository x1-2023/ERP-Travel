'use client'

import { useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GoalProgress } from './goal-progress'
import type { KeyResult } from '@/types/performance'

interface KeyResultItemProps {
  keyResult: KeyResult
  onUpdateProgress?: (value: number) => void
  readonly?: boolean
}

export function KeyResultItem({
  keyResult,
  onUpdateProgress,
  readonly = false,
}: KeyResultItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<number>(keyResult.currentValue)

  const handleSave = () => {
    onUpdateProgress?.(editValue)
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-sm border bg-card">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">{keyResult.title}</span>
          {keyResult.weight > 0 && (
            <span className="text-[10px] font-data text-muted-foreground ml-2 shrink-0">
              {keyResult.weight}%
            </span>
          )}
        </div>
        <GoalProgress progress={keyResult.progress} size="sm" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(Number(e.target.value))}
                className="h-6 w-16 text-xs font-data"
                autoFocus
              />
              <span className="font-data">/ {keyResult.targetValue} {keyResult.unit}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-success"
                onClick={handleSave}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-data">
                {keyResult.currentValue} / {keyResult.targetValue} {keyResult.unit}
              </span>
              {!readonly && onUpdateProgress && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          <span className="font-data">{keyResult.progress}%</span>
        </div>
      </div>
    </div>
  )
}
