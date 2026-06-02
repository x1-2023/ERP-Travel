/**
 * Industrial chart theme configuration
 * Using solid colors that work in both light and dark modes
 */

// Helper to get CSS variable value (for non-fill properties)
const getCSSVar = (name: string) => `var(--color-${name})`;

// Chart colors - using solid values that work in SVG fills
// These are bright colors that work well on both light and dark backgrounds
const CHART_COLORS = {
  blue: '#3b82f6',      // Blue 500
  emerald: '#10b981',   // Emerald 500
  amber: '#f59e0b',     // Amber 500
  purple: '#a855f7',    // Purple 500
  cyan: '#06b6d4',      // Cyan 500
  red: '#ef4444',       // Red 500
  pink: '#ec4899',      // Pink 500
  indigo: '#6366f1',    // Indigo 500
};

export const chartTheme = {
  // Colors for chart fills - using solid hex values for Recharts compatibility
  colors: {
    primary: CHART_COLORS.blue,
    secondary: CHART_COLORS.cyan,
    success: CHART_COLORS.emerald,
    warning: CHART_COLORS.amber,
    danger: CHART_COLORS.red,
    purple: CHART_COLORS.purple,

    // Chart series - solid colors for bar/pie/line fills
    series: [
      CHART_COLORS.blue,
      CHART_COLORS.emerald,
      CHART_COLORS.amber,
      CHART_COLORS.purple,
      CHART_COLORS.cyan,
      CHART_COLORS.red,
      CHART_COLORS.pink,
      CHART_COLORS.indigo,
    ],

    // Background & grid - using CSS variables (these work fine)
    background: getCSSVar('card'),
    grid: getCSSVar('surface-border'),
    axis: getCSSVar('foreground-subtle'),
    text: getCSSVar('foreground-muted'),
    tooltip: getCSSVar('popover'),
  },

  // Typography
  fontSize: {
    axis: 10,
    label: 11,
    legend: 11,
  },

  fontFamily: 'JetBrains Mono, IBM Plex Mono, monospace',

  // Stroke widths
  strokeWidth: {
    line: 2,
    area: 1,
    bar: 0,
  },

  // Animation
  animationDuration: 400,
};

// Tooltip styles for Recharts - theme aware
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: getCSSVar('popover'),
    border: `1px solid ${getCSSVar('surface-border')}`,
    borderRadius: '4px',
    padding: '8px 12px',
    boxShadow: 'var(--shadow-lg)',
  },
  labelStyle: {
    color: getCSSVar('foreground'),
    fontFamily: chartTheme.fontFamily,
    fontSize: chartTheme.fontSize.label,
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: getCSSVar('foreground-muted'),
    fontFamily: chartTheme.fontFamily,
    fontSize: chartTheme.fontSize.label,
  },
  cursor: {
    fill: 'var(--chart-cursor-fill, rgba(128, 128, 128, 0.1))',
  },
};

// Axis styles - theme aware
export const axisStyle = {
  tick: {
    fontSize: chartTheme.fontSize.axis,
    fill: getCSSVar('foreground-subtle'),
    fontFamily: chartTheme.fontFamily,
  },
  axisLine: {
    stroke: getCSSVar('surface-border'),
  },
  tickLine: {
    stroke: getCSSVar('surface-border'),
  },
};

// Grid styles - theme aware
export const gridStyle = {
  stroke: getCSSVar('surface-border'),
  strokeDasharray: '3 3',
};
