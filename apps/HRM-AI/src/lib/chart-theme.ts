// ═══════════════════════════════════════════════════════════════
// BLOOMBERG CHART THEME FOR RECHARTS
// ═══════════════════════════════════════════════════════════════

import type React from "react"

// Color Palette
export const CHART_COLORS = {
  // Primary palette (for series)
  primary: [
    "#f97316", // Bloomberg Orange
    "#3b82f6", // Blue
    "#10b981", // Green
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#6366f1", // Indigo
  ],

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Neutral
  neutral: "#6b7280",
  muted: "#4b5563",

  // Grid
  gridLine: "rgba(75, 85, 99, 0.3)",
  gridLineDark: "rgba(75, 85, 99, 0.2)",
}

// Get color by index
export function getChartColor(index: number): string {
  return CHART_COLORS.primary[index % CHART_COLORS.primary.length]
}

// Theme configuration
export const CHART_THEME = {
  fontFamily: "IBM Plex Sans, system-ui, sans-serif",
  fontFamilyMono: "IBM Plex Mono, Consolas, monospace",

  fontSize: {
    xs: 10,
    sm: 11,
    base: 12,
    lg: 14,
  },

  margin: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },

  animationDuration: 800,
  animationEasing: "ease-out" as const,
}

// Tooltip styles
export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "hsl(220 33% 10%)",
  border: "1px solid hsl(220 15% 18%)",
  borderRadius: "8px",
  padding: "12px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
  fontFamily: CHART_THEME.fontFamily,
  fontSize: CHART_THEME.fontSize.sm,
}

// Axis styles
export const AXIS_STYLE = {
  fontSize: CHART_THEME.fontSize.sm,
  fontFamily: CHART_THEME.fontFamily,
  fill: "#6b7280",
  tickLine: false as const,
  axisLine: false as const,
}

// Grid styles
export const GRID_STYLE = {
  strokeDasharray: "3 3",
  stroke: CHART_COLORS.gridLine,
  vertical: false as const,
}
