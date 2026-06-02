'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Insight } from '@/types/insight'
import { AlertTriangle, TrendingUp, Lightbulb, AlertCircle, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface InsightCardProps {
  insight: Insight
  onDismiss?: (id: string) => void
}

const typeIcons = {
  ANOMALY: AlertTriangle,
  TREND: TrendingUp,
  SUGGESTION: Lightbulb,
  WARNING: AlertCircle,
}

const severityConfig = {
  CRITICAL: { label: 'Nghiêm trọng', className: 'bg-red-500 text-white' },
  HIGH: { label: 'Cao', className: 'bg-orange-500 text-white' },
  MEDIUM: { label: 'Trung bình', className: 'bg-yellow-500 text-white' },
  LOW: { label: 'Thấp', className: 'bg-blue-500 text-white' },
}

const typeLabels = {
  ANOMALY: 'Bất thường',
  TREND: 'Xu hướng',
  SUGGESTION: 'Gợi ý',
  WARNING: 'Cảnh báo',
}

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const Icon = typeIcons[insight.type]
  const severity = severityConfig[insight.severity]

  return (
    <Card className={cn('relative', !insight.isRead && 'border-l-4 border-l-primary')}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {typeLabels[insight.type]}
            </Badge>
            <Badge className={cn('text-xs', severity.className)}>
              {severity.label}
            </Badge>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDismiss(insight.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardTitle className="text-base mt-2">{insight.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{insight.description}</p>

        {insight.suggestions && insight.suggestions.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Gợi ý:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              {insight.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {insight.referenceType && insight.referenceId && (
          <div className="pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={getRefLink(insight.referenceType, insight.referenceId)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Xem chi tiết
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getRefLink(type: string, id: string): string {
  switch (type) {
    case 'EMPLOYEE':
      return `/admin/employees/${id}`
    case 'DEPARTMENT':
      return `/admin/departments/${id}`
    case 'LEAVE_REQUEST':
      return `/ess/leave/${id}`
    default:
      return '#'
  }
}
