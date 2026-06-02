'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { PIP_STATUS } from '@/lib/performance/constants'

interface PIPStatusBadgeProps {
  status: string
}

const colorMap: Record<string, string> = {
  gray: 'bg-muted text-muted-foreground',
  blue: 'bg-blue-500/15 text-blue-400',
  orange: 'bg-primary/15 text-primary',
  green: 'bg-success/15 text-success',
  red: 'bg-destructive/15 text-destructive',
}

export function PIPStatusBadge({ status }: PIPStatusBadgeProps) {
  const statusInfo = PIP_STATUS[status as keyof typeof PIP_STATUS]

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
