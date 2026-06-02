"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { MetricCard } from "@/components/ui/metric-card"
import { staggerStyle } from "@/lib/animation"

interface Stat {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
}

interface StatsGridProps {
  stats: Stat[]
  columns?: 2 | 3 | 4
  loading?: boolean
  className?: string
}

export function StatsGrid({
  stats,
  columns = 4,
  loading = false,
  className,
}: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-3 sm:gap-4", gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <MetricCard
          key={stat.title}
          {...stat}
          loading={loading}
          className="animate-fade-in-up"
          style={staggerStyle(index)}
        />
      ))}
    </div>
  )
}
