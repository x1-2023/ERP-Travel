'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const ChartSkeleton = () => (
  <div className="glass-card-static p-3">
    <Skeleton className="h-4 w-32 mb-4" />
    <Skeleton className="h-[280px] w-full" />
  </div>
)

export const LazyPipelineFunnelChart = dynamic(
  () => import('./PipelineFunnelChart').then((mod) => ({ default: mod.PipelineFunnelChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

export const LazyDealsOverTimeChart = dynamic(
  () => import('./DealsOverTimeChart').then((mod) => ({ default: mod.DealsOverTimeChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

export const LazyQuoteStatusChart = dynamic(
  () => import('./QuoteStatusChart').then((mod) => ({ default: mod.QuoteStatusChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

export const LazyTopContactsChart = dynamic(
  () => import('./TopContactsChart').then((mod) => ({ default: mod.TopContactsChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

export const LazyCampaignPerformanceChart = dynamic(
  () => import('./CampaignPerformanceChart').then((mod) => ({ default: mod.CampaignPerformanceChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

export const LazyActivityByTypeChart = dynamic(
  () => import('./ActivityByTypeChart').then((mod) => ({ default: mod.ActivityByTypeChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)
