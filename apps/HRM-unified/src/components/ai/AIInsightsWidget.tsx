'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIInsightCard, AIInsightCardCompact } from './AIInsightCard'
import Link from 'next/link'
import type { InsightsResult } from '@/lib/ai/insights/types'

interface AIInsightsWidgetProps {
  variant?: 'full' | 'compact'
  maxItems?: number
  className?: string
}

export function AIInsightsWidget({
  variant = 'full',
  maxItems = 5,
  className
}: AIInsightsWidgetProps) {
  const [data, setData] = useState<InsightsResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const fetchInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/insights')

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to fetch insights')
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
    fetchInsights()
  }, [])

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(Array.from(prev).concat(id)))
  }

  const visibleInsights = data?.insights
    .filter(i => !dismissedIds.has(i.id))
    .slice(0, maxItems) || []

  if (isLoading) {
    return <InsightsWidgetSkeleton variant={variant} className={className} />
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchInsights}>
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
              <Sparkles className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm">AI Insights</CardTitle>
            </div>
            {data && (
              <Badge variant="secondary" className="text-xs">
                {data.summary.critical + data.summary.warning} cần chú ý
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {visibleInsights.length > 0 ? (
              <>
                {visibleInsights.map(insight => (
                  <AIInsightCardCompact
                    key={insight.id}
                    insight={insight}
                    onDismiss={handleDismiss}
                  />
                ))}
                {data && data.insights.length > maxItems && (
                  <Link
                    href="/ai/insights"
                    className="text-xs text-primary hover:underline flex items-center justify-center mt-2"
                  >
                    Xem tất cả ({data.insights.length} insights)
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Không có insight mới
              </p>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Phân tích thông minh về tình hình nhân sự
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <div className="flex items-center gap-1">
                {data.summary.critical > 0 && (
                  <Badge variant="destructive">{data.summary.critical}</Badge>
                )}
                {data.summary.warning > 0 && (
                  <Badge variant="default">{data.summary.warning}</Badge>
                )}
                {data.summary.info > 0 && (
                  <Badge variant="outline">{data.summary.info}</Badge>
                )}
                {data.summary.success > 0 && (
                  <Badge variant="secondary">{data.summary.success}</Badge>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchInsights}
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
            {visibleInsights.length > 0 ? (
              visibleInsights.map(insight => (
                <AIInsightCard
                  key={insight.id}
                  insight={insight}
                  onDismiss={handleDismiss}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Không có insight mới</p>
                <p className="text-sm">Mọi thứ đang hoạt động tốt!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function InsightsWidgetSkeleton({
  variant,
  className
}: {
  variant: 'full' | 'compact'
  className?: string
}) {
  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
            <Skeleton className="h-5 w-24 mb-1" />
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
