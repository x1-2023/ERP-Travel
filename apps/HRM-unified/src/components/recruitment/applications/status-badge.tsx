'use client'

import { Badge } from '@/components/ui/badge'
import { APPLICATION_STATUS } from '@/lib/recruitment/constants'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = APPLICATION_STATUS[status] || { label: status, color: 'gray' }

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    green: 'bg-green-100 text-green-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  }

  return (
    <Badge className={`${colorMap[config.color] || colorMap.gray} ${className || ''}`}>
      {config.label}
    </Badge>
  )
}
