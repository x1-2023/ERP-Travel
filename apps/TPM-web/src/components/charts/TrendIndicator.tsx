/**
 * TrendIndicator Component
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendIndicatorProps {
  value: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function TrendIndicator({
  value,
  label,
  size = 'md',
  showIcon = true,
  className,
}: TrendIndicatorProps) {
  const isPositive = value > 0
  const isNegative = value < 0
  const isNeutral = value === 0

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        sizeClasses[size],
        isPositive && 'text-green-600',
        isNegative && 'text-red-600',
        isNeutral && 'text-gray-500',
        className
      )}
    >
      {showIcon && (
        <>
          {isPositive && <TrendingUp className={iconSizes[size]} />}
          {isNegative && <TrendingDown className={iconSizes[size]} />}
          {isNeutral && <Minus className={iconSizes[size]} />}
        </>
      )}
      <span>
        {isPositive && '+'}
        {value.toFixed(1)}%
      </span>
      {label && <span className="text-muted-foreground ml-1">{label}</span>}
    </div>
  )
}
