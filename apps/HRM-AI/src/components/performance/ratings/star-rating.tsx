'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RATING_SCALE } from '@/lib/performance/constants'

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number>(0)

  const displayValue = hoverValue || value
  const ratingInfo = RATING_SCALE.find((r) => r.value === Math.round(displayValue))

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              'transition-colors',
              !readonly && 'cursor-pointer hover:scale-110'
            )}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
          >
            <Star
              className={cn(
                sizeMap[size],
                star <= displayValue
                  ? 'fill-primary text-primary'
                  : 'fill-transparent text-muted-foreground/40'
              )}
            />
          </button>
        ))}
      </div>
      {showLabel && ratingInfo && (
        <span
          className="text-xs font-medium"
          style={{ color: ratingInfo.color }}
        >
          {ratingInfo.label}
        </span>
      )}
    </div>
  )
}
