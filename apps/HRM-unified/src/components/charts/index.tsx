"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"
import {
  CHART_COLORS,
  CHART_THEME,
  TOOLTIP_STYLE,
  AXIS_STYLE,
  GRID_STYLE,
} from "@/lib/chart-theme"

// ═══════════════════════════════════════════════════════════════
// Custom responsive wrapper – replaces Recharts ResponsiveContainer
// to avoid the "width(-1) height(-1)" warning.
// Uses ResizeObserver to measure the container and passes
// explicit pixel dimensions to the chart.
// ═══════════════════════════════════════════════════════════════

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = React.useState<{ width: number; height: number }>({ width: 0, height: 0 })

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) {
        setSize({ width: Math.floor(width), height: Math.floor(height) })
      }
    }

    update()

    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])

  return size
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM TOOLTIP
// ═══════════════════════════════════════════════════════════════

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ color?: string; name?: string; value?: number }>
  label?: string
  formatValue?: (value: number) => string
}

export function ChartTooltip({ active, payload, label, formatValue }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div style={TOOLTIP_STYLE} className="animate-fade-in-fast">
      <p className="font-medium text-foreground mb-1 text-xs">{label}</p>
      {payload.map((entry: { color?: string; name?: string; value?: number }, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">
            {formatValue && entry.value != null ? formatValue(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// AREA CHART
// ═══════════════════════════════════════════════════════════════

interface AreaChartTerminalProps {
  data: Record<string, unknown>[]
  dataKey: string
  xAxisKey?: string
  height?: number
  color?: string
  gradient?: boolean
  showGrid?: boolean
  formatValue?: (value: number) => string
  formatXAxis?: (value: string) => string
  className?: string
}

export function AreaChartTerminal({
  data,
  dataKey,
  xAxisKey = "name",
  height = 300,
  color = CHART_COLORS.primary[0],
  gradient = true,
  showGrid = true,
  formatValue,
  formatXAxis,
  className,
}: AreaChartTerminalProps) {
  const gradientId = React.useId()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { width: cw, height: ch } = useContainerSize(containerRef)

  return (
    <div ref={containerRef} className={cn("w-full", className)} style={{ height }}>
      {cw > 0 && ch > 0 && (
        <AreaChart width={cw} height={ch} data={data} margin={CHART_THEME.margin}>
          {gradient && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
          {showGrid && <CartesianGrid {...GRID_STYLE} />}
          <XAxis dataKey={xAxisKey} {...AXIS_STYLE} tickFormatter={formatXAxis} />
          <YAxis {...AXIS_STYLE} tickFormatter={formatValue} />
          <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={gradient ? `url(#${gradientId})` : color}
            fillOpacity={gradient ? 1 : 0.1}
            animationDuration={CHART_THEME.animationDuration}
            animationEasing={CHART_THEME.animationEasing}
          />
        </AreaChart>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BAR CHART
// ═══════════════════════════════════════════════════════════════

interface BarChartTerminalProps {
  data: Record<string, unknown>[]
  dataKeys: string[]
  xAxisKey?: string
  height?: number
  colors?: string[]
  stacked?: boolean
  horizontal?: boolean
  showGrid?: boolean
  showLegend?: boolean
  formatValue?: (value: number) => string
  className?: string
}

export function BarChartTerminal({
  data,
  dataKeys,
  xAxisKey = "name",
  height = 300,
  colors,
  stacked = false,
  horizontal = false,
  showGrid = true,
  showLegend = true,
  formatValue,
  className,
}: BarChartTerminalProps) {
  const chartColors = colors || CHART_COLORS.primary
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { width: cw, height: ch } = useContainerSize(containerRef)

  return (
    <div ref={containerRef} className={cn("w-full", className)} style={{ height }}>
      {cw > 0 && ch > 0 && (
        <BarChart
          width={cw}
          height={ch}
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={CHART_THEME.margin}
        >
          {showGrid && <CartesianGrid {...GRID_STYLE} />}
          {horizontal ? (
            <>
              <XAxis type="number" {...AXIS_STYLE} tickFormatter={formatValue} />
              <YAxis type="category" dataKey={xAxisKey} {...AXIS_STYLE} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} {...AXIS_STYLE} />
              <YAxis {...AXIS_STYLE} tickFormatter={formatValue} />
            </>
          )}
          <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={chartColors[index % chartColors.length]}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
              animationDuration={CHART_THEME.animationDuration}
              animationEasing={CHART_THEME.animationEasing}
            />
          ))}
        </BarChart>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LINE CHART
// ═══════════════════════════════════════════════════════════════

interface LineChartTerminalProps {
  data: Record<string, unknown>[]
  dataKeys: string[]
  xAxisKey?: string
  height?: number
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  showDots?: boolean
  formatValue?: (value: number) => string
  className?: string
}

export function LineChartTerminal({
  data,
  dataKeys,
  xAxisKey = "name",
  height = 300,
  colors,
  showGrid = true,
  showLegend = true,
  showDots = true,
  formatValue,
  className,
}: LineChartTerminalProps) {
  const chartColors = colors || CHART_COLORS.primary
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { width: cw, height: ch } = useContainerSize(containerRef)

  return (
    <div ref={containerRef} className={cn("w-full", className)} style={{ height }}>
      {cw > 0 && ch > 0 && (
        <LineChart width={cw} height={ch} data={data} margin={CHART_THEME.margin}>
          {showGrid && <CartesianGrid {...GRID_STYLE} />}
          <XAxis dataKey={xAxisKey} {...AXIS_STYLE} />
          <YAxis {...AXIS_STYLE} tickFormatter={formatValue} />
          <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={2}
              dot={showDots ? { r: 4, strokeWidth: 2 } : false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={CHART_THEME.animationDuration}
              animationEasing={CHART_THEME.animationEasing}
            />
          ))}
        </LineChart>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PIE/DONUT CHART
// ═══════════════════════════════════════════════════════════════

interface PieChartTerminalProps {
  data: { name: string; value: number }[]
  height?: number
  colors?: string[]
  donut?: boolean
  showLegend?: boolean
  showLabel?: boolean
  formatValue?: (value: number) => string
  className?: string
}

export function PieChartTerminal({
  data,
  height = 300,
  colors,
  donut = false,
  showLegend = true,
  showLabel = true,
  formatValue,
  className,
}: PieChartTerminalProps) {
  const chartColors = colors || CHART_COLORS.primary
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { width: cw, height: ch } = useContainerSize(containerRef)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as {
      cx: number
      cy: number
      midAngle: number
      innerRadius: number
      outerRadius: number
      percent: number
    }
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontFamily={CHART_THEME.fontFamilyMono}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div ref={containerRef} className={cn("w-full", className)} style={{ height }}>
      {cw > 0 && ch > 0 && (
        <PieChart width={cw} height={ch}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={donut ? "60%" : 0}
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            label={showLabel ? renderCustomLabel : false}
            labelLine={false}
            animationDuration={CHART_THEME.animationDuration}
            animationEasing={CHART_THEME.animationEasing}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          {showLegend && <Legend />}
        </PieChart>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MINI SPARKLINE
// ═══════════════════════════════════════════════════════════════

interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  className?: string
}

export function Sparkline({
  data,
  width = 100,
  height = 32,
  className,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }))
  const trend = data[data.length - 1] >= data[0] ? "up" : "down"
  const trendColor = trend === "up" ? CHART_COLORS.success : CHART_COLORS.error
  const sparkId = React.useId()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { width: cw, height: ch } = useContainerSize(containerRef)

  return (
    <div ref={containerRef} className={cn("inline-block", className)} style={{ width, height }}>
      {cw > 0 && ch > 0 && (
        <AreaChart width={cw} height={ch} data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={trendColor}
            strokeWidth={1.5}
            fill={`url(#${sparkId})`}
            animationDuration={500}
          />
        </AreaChart>
      )}
    </div>
  )
}
