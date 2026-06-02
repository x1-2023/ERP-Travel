'use client'

import { cn } from '@/lib/utils'

interface GoalProgressProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-success'
  if (progress >= 70) return 'bg-blue-500'
  if (progress >= 40) return 'bg-yellow-500'
  return 'bg-destructive'
}

export function GoalProgress({
  progress,
  size = 'md',
  showLabel = false,
}: GoalProgressProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-sm bg-secondary',
          sizeMap[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300',
            getProgressColor(progress)
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-data text-muted-foreground whitespace-nowrap">
          {progress}%
        </span>
      )}
    </div>
  )
}
