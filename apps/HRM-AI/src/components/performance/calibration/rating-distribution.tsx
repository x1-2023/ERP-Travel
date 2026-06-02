'use client'

import { cn } from '@/lib/utils'
import { RATING_SCALE, RATING_DISTRIBUTION_TARGET } from '@/lib/performance/constants'

interface RatingDistributionProps {
  distribution: { rating: number; count: number; percentage: number }[]
  target?: Record<number, number>
}

export function RatingDistribution({
  distribution,
  target = RATING_DISTRIBUTION_TARGET,
}: RatingDistributionProps) {
  const maxPercentage = Math.max(
    ...distribution.map((d) => d.percentage),
    ...Object.values(target)
  )

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 rounded-sm bg-primary" />
          <span>Thực tế</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 rounded-sm border border-dashed border-muted-foreground/50" />
          <span>Mục tiêu</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const item = distribution.find((d) => d.rating === rating)
          const actual = item?.percentage || 0
          const targetPct = target[rating] || 0
          const ratingInfo = RATING_SCALE.find((r) => r.value === rating)
          const barWidth = maxPercentage > 0 ? (actual / maxPercentage) * 100 : 0
          const targetWidth = maxPercentage > 0 ? (targetPct / maxPercentage) * 100 : 0

          return (
            <div key={rating} className="flex items-center gap-3">
              {/* Rating label */}
              <div className="w-24 shrink-0 flex items-center gap-1.5">
                <span
                  className="font-data text-sm font-bold"
                  style={{ color: ratingInfo?.color }}
                >
                  {rating}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {ratingInfo?.label}
                </span>
              </div>

              {/* Bar container */}
              <div className="flex-1 relative h-6">
                {/* Target indicator */}
                <div
                  className="absolute top-0 h-full border-r-2 border-dashed border-muted-foreground/40"
                  style={{ left: `${targetWidth}%` }}
                />
                {/* Actual bar */}
                <div
                  className="h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: ratingInfo?.color || '#FF6600',
                    opacity: 0.8,
                  }}
                />
              </div>

              {/* Values */}
              <div className="w-20 shrink-0 text-right">
                <span className="font-data text-xs">
                  {actual.toFixed(1)}%
                </span>
                <span className="text-[10px] text-muted-foreground ml-1">
                  ({item?.count || 0})
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
