'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { RATING_SCALE } from '@/lib/performance/constants'

interface RatingBadgeProps {
  rating: number
  size?: 'sm' | 'md'
}

export function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  const ratingInfo = RATING_SCALE.find((r) => r.value === Math.round(rating))

  if (!ratingInfo) return null

  return (
    <Badge
      className={cn(
        'border-transparent font-data',
        size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
      style={{
        backgroundColor: `${ratingInfo.color}20`,
        color: ratingInfo.color,
      }}
    >
      <span className="font-data mr-1">{rating.toFixed(1)}</span>
      <span>{ratingInfo.label}</span>
    </Badge>
  )
}
