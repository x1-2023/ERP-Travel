'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  Eye,
  Clock,
  DollarSign,
  Calendar,
  Timer,
  Users,
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type {
  Anomaly,
  AnomalyCategory,
  AnomalySeverity,
  AnomalyDetectionResult
} from '@/lib/ai/anomaly/types'

interface AnomalyAlertsProps {
  variant?: 'full' | 'compact'
  maxItems?: number
  className?: string
}

function getSeverityIcon(severity: AnomalySeverity) {
  switch (severity) {
    case 'CRITICAL':
      return <AlertTriangle className="h-5 w-5" />
    case 'HIGH':
      return <AlertCircle className="h-5 w-5" />
    case 'MEDIUM':
      return <Info className="h-5 w-5" />
    default:
      return <Info className="h-5 w-5" />
  }
}

function getSeverityStyles(severity: AnomalySeverity) {
  const styles: Record<AnomalySeverity, { bg: string; border: string; icon: string; badge: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    CRITICAL: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600',
      badge: 'destructive'
    },
    HIGH: {
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600',
      badge: 'default'
    },
    MEDIUM: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600',
      badge: 'secondary'
    },
    LOW: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600',
      badge: 'outline'
    }
  }
  return styles[severity]
}

function getCategoryIcon(category: AnomalyCategory) {
  const icons: Record<AnomalyCategory, React.ReactNode> = {
    ATTENDANCE: <Clock className="h-4 w-4" />,
    PAYROLL: <DollarSign className="h-4 w-4" />,
    LEAVE: <Calendar className="h-4 w-4" />,
    OVERTIME: <Timer className="h-4 w-4" />,
    PERFORMANCE: <Users className="h-4 w-4" />,
    COMPLIANCE: <AlertTriangle className="h-4 w-4" />
  }
  return icons[category]
}

function getCategoryLabel(category: AnomalyCategory): string {
  const labels: Record<AnomalyCategory, string> = {
    ATTENDANCE: 'Chấm công',
    PAYROLL: 'Lương',
    LEAVE: 'Nghỉ phép',
    OVERTIME: 'Tăng ca',
    PERFORMANCE: 'Hiệu suất',
    COMPLIANCE: 'Tuân thủ'
  }
  return labels[category]
}

function getSeverityLabel(severity: AnomalySeverity): string {
  const labels: Record<AnomalySeverity, string> = {
    CRITICAL: 'Nghiêm trọng',
    HIGH: 'Cao',
    MEDIUM: 'Trung bình',
    LOW: 'Thấp'
  }
  return labels[severity]
}

function getEntityLink(anomaly: Anomaly): string | null {
  if (anomaly.entityType === 'EMPLOYEE' && anomaly.entityId) {
    return `/employees/${anomaly.entityId}`
  }
  return null
}

export function AnomalyAlerts({ variant = 'full', maxItems = 10, className }: AnomalyAlertsProps) {
  const [data, setData] = useState<AnomalyDetectionResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)

  const fetchAnomalies = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/anomalies')

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to fetch anomalies')
      }

      const result = await res.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnomalies()
  }, [])

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(Array.from(prev).concat(id)))
  }

  const visibleAnomalies = data?.anomalies
    .filter(a => !dismissedIds.has(a.id))
    .slice(0, maxItems) || []

  if (isLoading) {
    return <AnomalySkeleton variant={variant} className={className} />
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchAnomalies}>
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm">Phát hiện bất thường</CardTitle>
            </div>
            {data && (
              <Badge
                variant={data.summary.bySeverity.CRITICAL > 0 ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {data.summary.total} phát hiện
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {visibleAnomalies.length > 0 ? (
              visibleAnomalies.slice(0, 3).map(anomaly => {
                const styles = getSeverityStyles(anomaly.severity)
                return (
                  <div
                    key={anomaly.id}
                    className={cn('p-2 rounded-lg border', styles.bg, styles.border)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn('shrink-0', styles.icon)}>
                        {getSeverityIcon(anomaly.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{anomaly.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {anomaly.entityName || anomaly.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không phát hiện bất thường
              </p>
            )}
            {data && data.anomalies.length > 3 && (
              <Link
                href="/ai/anomalies"
                className="text-xs text-primary hover:underline flex items-center justify-center mt-2"
              >
                Xem tất cả ({data.anomalies.length})
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Phát hiện bất thường</CardTitle>
              <CardDescription>
                Các anomaly được phát hiện tự động
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <div className="flex items-center gap-1">
                {data.summary.bySeverity.CRITICAL > 0 && (
                  <Badge variant="destructive">{data.summary.bySeverity.CRITICAL}</Badge>
                )}
                {data.summary.bySeverity.HIGH > 0 && (
                  <Badge variant="default">{data.summary.bySeverity.HIGH}</Badge>
                )}
                {data.summary.bySeverity.MEDIUM > 0 && (
                  <Badge variant="secondary">{data.summary.bySeverity.MEDIUM}</Badge>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchAnomalies}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {visibleAnomalies.length > 0 ? (
              visibleAnomalies.map(anomaly => {
                const styles = getSeverityStyles(anomaly.severity)
                const entityLink = getEntityLink(anomaly)

                return (
                  <Card key={anomaly.id} className={cn('overflow-hidden', styles.bg, styles.border)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('shrink-0 mt-0.5', styles.icon)}>
                          {getSeverityIcon(anomaly.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm">{anomaly.title}</h4>
                              <Badge variant={styles.badge} className="text-xs">
                                {getSeverityLabel(anomaly.severity)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryIcon(anomaly.category)}
                                <span className="ml-1">{getCategoryLabel(anomaly.category)}</span>
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleDismiss(anomaly.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {anomaly.description}
                          </p>

                          {anomaly.entityName && (
                            <p className="text-sm font-medium mb-2">
                              {anomaly.entityName}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSelectedAnomaly(anomaly)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Chi tiết
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{anomaly.title}</DialogTitle>
                                  <DialogDescription>
                                    {getCategoryLabel(anomaly.category)} | {getSeverityLabel(anomaly.severity)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Mô tả</h4>
                                    <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                                  </div>

                                  {anomaly.entityName && (
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2">Đối tượng</h4>
                                      <p className="text-sm">{anomaly.entityName}</p>
                                    </div>
                                  )}

                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Chi tiết</h4>
                                    <div className="space-y-2">
                                      {anomaly.details.map((detail, idx) => (
                                        <div key={idx} className="flex justify-between text-sm p-2 bg-muted rounded">
                                          <span className="text-muted-foreground">{detail.field}</span>
                                          <div className="text-right">
                                            <span className="font-medium">{detail.actual}</span>
                                            {detail.expected !== '-' && (
                                              <span className="text-muted-foreground ml-2">
                                                (kỳ vọng: {detail.expected})
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="text-xs text-muted-foreground">
                                    Phát hiện lúc: {new Date(anomaly.detectedAt).toLocaleString('vi-VN')}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {entityLink && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={entityLink}>
                                  Xem hồ sơ
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Không phát hiện bất thường</p>
                <p className="text-sm">Mọi thứ đang hoạt động bình thường!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function AnomalySkeleton({ variant, className }: { variant: 'full' | 'compact'; className?: string }) {
  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
