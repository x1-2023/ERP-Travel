/**
 * LineChart Component - Industrial Design System
 */

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartTheme, tooltipStyle, axisStyle, gridStyle } from './chart-theme';
import { cn } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';

interface LineChartProps {
  title?: string;
  description?: string;
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  stroke?: string;
  formatValue?: 'currency' | 'number' | 'percent' | ((value: number) => string);
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
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

export function LineChart({
  title,
  description,
  data,
  dataKey,
  xAxisKey = 'name',
  stroke = chartTheme.colors.primary,
  formatValue,
  height = 280,
  showGrid = true,
  showLegend = false,
  className,
}: LineChartProps) {
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
          <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={chartTheme.strokeWidth.line}
              dot={{ fill: stroke, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: stroke }}
              animationDuration={chartTheme.animationDuration}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
