'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  ChevronRight,
  Users,
  Clock,
  Calendar,
  FileText,
  Shield,
  DollarSign,
  Target,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardInsight, InsightCategory, InsightSeverity } from '@/lib/ai/insights/types'

interface AIInsightCardProps {
  insight: DashboardInsight
  onDismiss?: (id: string) => void
}

function getSeverityIcon(severity: InsightSeverity) {
  switch (severity) {
    case 'CRITICAL':
      return <AlertTriangle className="h-5 w-5" />
    case 'WARNING':
      return <AlertCircle className="h-5 w-5" />
    case 'SUCCESS':
      return <CheckCircle className="h-5 w-5" />
    default:
      return <Info className="h-5 w-5" />
  }
}

function getSeverityStyles(severity: InsightSeverity) {
  const styles: Record<InsightSeverity, { bg: string; border: string; icon: string; badge: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    CRITICAL: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600',
      badge: 'destructive'
    },
    WARNING: {
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600',
      badge: 'default'
    },
    SUCCESS: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600',
      badge: 'secondary'
    },
    INFO: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600',
      badge: 'outline'
    }
  }
  return styles[severity]
}

function getCategoryIcon(category: InsightCategory) {
  const icons: Record<InsightCategory, React.ReactNode> = {
    WORKFORCE: <Users className="h-4 w-4" />,
    ATTENDANCE: <Clock className="h-4 w-4" />,
    LEAVE: <Calendar className="h-4 w-4" />,
    PERFORMANCE: <Target className="h-4 w-4" />,
    PAYROLL: <DollarSign className="h-4 w-4" />,
    RECRUITMENT: <Briefcase className="h-4 w-4" />,
    COMPLIANCE: <Shield className="h-4 w-4" />,
    GENERAL: <FileText className="h-4 w-4" />
  }
  return icons[category]
}

function getCategoryLabel(category: InsightCategory): string {
  const labels: Record<InsightCategory, string> = {
    WORKFORCE: 'Nhân sự',
    ATTENDANCE: 'Chấm công',
    LEAVE: 'Nghỉ phép',
    PERFORMANCE: 'Hiệu suất',
    PAYROLL: 'Lương',
    RECRUITMENT: 'Tuyển dụng',
    COMPLIANCE: 'Tuân thủ',
    GENERAL: 'Chung'
  }
  return labels[category]
}

function TrendIndicator({ trend, changePercent }: { trend?: 'up' | 'down' | 'stable'; changePercent?: number }) {
  if (!trend) return null

  return (
    <span className={cn(
      'flex items-center gap-1 text-sm',
      trend === 'up' && 'text-green-600',
      trend === 'down' && 'text-red-600',
      trend === 'stable' && 'text-gray-500'
    )}>
      {trend === 'up' && <TrendingUp className="h-3 w-3" />}
      {trend === 'down' && <TrendingDown className="h-3 w-3" />}
      {trend === 'stable' && <Minus className="h-3 w-3" />}
      {changePercent !== undefined && (
        <span>{changePercent > 0 ? '+' : ''}{changePercent}%</span>
      )}
    </span>
  )
}

export function AIInsightCard({ insight, onDismiss }: AIInsightCardProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const styles = getSeverityStyles(insight.severity)

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.(insight.id)
  }

  return (
    <Card className={cn('relative overflow-hidden', styles.bg, styles.border)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('shrink-0 mt-0.5', styles.icon)}>
            {getSeverityIcon(insight.severity)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <Badge variant={styles.badge} className="text-xs">
                  {getCategoryIcon(insight.category)}
                  <span className="ml-1">{getCategoryLabel(insight.category)}</span>
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 -mt-1 -mr-1"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Message */}
            <p className="text-sm text-muted-foreground mb-2">
              {insight.message}
            </p>

            {/* Metric */}
            {insight.metric && (
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{insight.metric.value}</span>
                  <span className="text-sm text-muted-foreground">{insight.metric.label}</span>
                </div>
                <TrendIndicator
                  trend={insight.metric.trend}
                  changePercent={insight.metric.changePercent}
                />
              </div>
            )}

            {/* Actions */}
            {insight.actions && insight.actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {insight.actions.map((action, idx) => (
                  action.url ? (
                    <Button
                      key={idx}
                      variant="secondary"
                      size="sm"
                      asChild
                    >
                      <Link href={action.url}>
                        {action.label}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                    >
                      {action.label}
                    </Button>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for dashboard sidebar
export function AIInsightCardCompact({ insight, onDismiss }: AIInsightCardProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const styles = getSeverityStyles(insight.severity)

  if (isDismissed) return null

  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn('shrink-0', styles.icon)}>
          {getSeverityIcon(insight.severity)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{insight.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {insight.message}
          </p>
          {insight.actions?.[0]?.url && (
            <Link
              href={insight.actions[0].url}
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              Xem chi tiết →
            </Link>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0"
          onClick={() => {
            setIsDismissed(true)
            onDismiss?.(insight.id)
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
