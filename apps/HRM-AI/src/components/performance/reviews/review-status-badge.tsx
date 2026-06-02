'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { REVIEW_STATUS } from '@/lib/performance/constants'

interface ReviewStatusBadgeProps {
  status: string
}

const colorMap: Record<string, string> = {
  gray: 'bg-muted text-muted-foreground',
  blue: 'bg-blue-500/15 text-blue-400',
  yellow: 'bg-yellow-500/15 text-yellow-400',
  purple: 'bg-purple-500/15 text-purple-400',
  green: 'bg-success/15 text-success',
}

export function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  const statusInfo = REVIEW_STATUS[status as keyof typeof REVIEW_STATUS]

  if (!statusInfo) {
    return (
      <Badge variant="outline" className="text-xs">
        {status}
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        'border-transparent text-xs',
        colorMap[statusInfo.color] || colorMap.gray
      )}
    >
      {statusInfo.label}
    </Badge>
  )
}
