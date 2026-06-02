"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

function ChartLoader() {
  return (
    <div className="flex items-center justify-center h-[300px] bg-elevated rounded-lg border border-border">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  )
}

function TableLoader() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-elevated rounded-md animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  )
}

export const LazyAreaChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.AreaChartTerminal })),
  { loading: () => <ChartLoader />, ssr: false }
)

export const LazyBarChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.BarChartTerminal })),
  { loading: () => <ChartLoader />, ssr: false }
)

export const LazyLineChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.LineChartTerminal })),
  { loading: () => <ChartLoader />, ssr: false }
)

export const LazyPieChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.PieChartTerminal })),
  { loading: () => <ChartLoader />, ssr: false }
)

export const LazySparkline = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.Sparkline })),
  { loading: () => <div className="h-8 w-20 bg-elevated rounded animate-pulse" />, ssr: false }
)

export { ChartLoader, TableLoader }
