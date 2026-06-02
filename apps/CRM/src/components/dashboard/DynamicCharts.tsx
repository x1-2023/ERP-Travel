'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const ChartSkeleton = () => (
  <div className="chart-container">
    <Skeleton className="h-4 w-32 mb-4" />
    <Skeleton className="h-[280px] w-full" />
  </div>
)

export const LazyFunnelChart = dynamic(
  () => import('./FunnelChart').then((mod) => ({ default: mod.FunnelChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)

export const LazyRevenueChart = dynamic(
  () => import('./RevenueChart').then((mod) => ({ default: mod.RevenueChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
)
