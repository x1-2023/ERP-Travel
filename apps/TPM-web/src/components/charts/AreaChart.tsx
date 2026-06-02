/**
 * AreaChart Component - Industrial Design System
 */

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { chartTheme, tooltipStyle, axisStyle, gridStyle } from './chart-theme';
import { cn } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';

export interface AreaChartData {
  [key: string]: string | number;
}

interface AreaChartProps {
  title?: string;
  description?: string;
  data: AreaChartData[];
  dataKeys: {
    key: string;
    color?: string;
    name?: string;
  }[];
  xAxisKey?: string;
  height?: number;
  formatValue?: 'currency' | 'number' | 'percent' | ((value: number) => string);
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
}

// Get formatter based on type or use custom function
const getFormatter = (formatValue?: 'currency' | 'number' | 'percent' | ((value: number) => string)) => {
  if (typeof formatValue === 'function') return formatValue;
  switch (formatValue) {
    case 'currency':
      return (value: number) => formatCurrencyCompact(value, 'VND');
    case 'percent':
      return (value: number) => `${value.toFixed(1)}%`;
    case 'number':
    default:
      return (value: number) => {
        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toLocaleString();
      };
  }
};

export function AreaChart({
  title,
  description,
  data,
  dataKeys,
  xAxisKey = 'name',
  height = 280,
  formatValue,
  showGrid = true,
  showLegend = false,
  stacked = false,
  className,
}: AreaChartProps) {
  // Get formatter based on type or custom function
  const formatter = getFormatter(formatValue);

  return (
    <div className={cn(
      'rounded-2xl overflow-hidden',
      // Clean modern design
      'bg-card',
      'border border-surface-border',
      // Soft shadow
      'shadow-sm',
      className
    )}>
      {title && (
        <div className="px-4 py-3 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            {title}
          </h3>
          {description && (
            <p className="text-2xs text-foreground-muted mt-0.5">{description}</p>
          )}
        </div>
      )}
      <div className="p-4" style={{ minHeight: height }}>
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {dataKeys.map((dk, index) => {
                const color = dk.color || chartTheme.colors.series[index];
                return (
                  <linearGradient key={dk.key} id={`gradient-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>

            {showGrid && <CartesianGrid {...gridStyle} vertical={false} />}

            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tick={axisStyle.tick}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={axisStyle.tick}
              tickFormatter={(value) => formatter(value)}
              dx={-10}
            />

            <Tooltip
              {...tooltipStyle}
              cursor={tooltipStyle.cursor}
              formatter={((value: number, name: string) => [formatter(value), name]) as never}
            />

            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: 16,
                  fontFamily: chartTheme.fontFamily,
                  fontSize: chartTheme.fontSize.legend,
                }}
              />
            )}

            {dataKeys.map((dk, index) => {
              const color = dk.color || chartTheme.colors.series[index];
              return (
                <Area
                  key={dk.key}
                  type="monotone"
                  dataKey={dk.key}
                  name={dk.name || dk.key}
                  stackId={stacked ? 'stack' : undefined}
                  stroke={color}
                  strokeWidth={chartTheme.strokeWidth.line}
                  fill={`url(#gradient-${dk.key})`}
                  animationDuration={chartTheme.animationDuration}
                />
              );
            })}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
