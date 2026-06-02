/**
 * BarChart Component - Industrial Design System
 */

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { chartTheme, tooltipStyle, axisStyle, gridStyle } from './chart-theme';
import { cn } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';

export interface BarChartData {
  [key: string]: string | number | undefined;
}

interface BarChartProps {
  title?: string;
  description?: string;
  data: BarChartData[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
  formatValue?: 'currency' | 'number' | 'percent' | ((value: number) => string);
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: string[];
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

export function BarChart({
  title,
  description,
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  height = 280,
  layout = 'horizontal',
  formatValue,
  showGrid = true,
  showLegend = false,
  colors,
  className,
}: BarChartProps) {
  const isVertical = layout === 'vertical';
  const barColors = colors || chartTheme.colors.series;
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
          <RechartsBarChart
            data={data}
            layout={isVertical ? 'vertical' : 'horizontal'}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            {showGrid && (
              <CartesianGrid
                {...gridStyle}
                horizontal={!isVertical}
                vertical={isVertical}
              />
            )}

            {isVertical ? (
              <>
                <XAxis
                  type="number"
                  tick={axisStyle.tick}
                  tickFormatter={(v) => formatter(v)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey={xAxisKey}
                  width={100}
                  tick={axisStyle.tick}
                  axisLine={false}
                  tickLine={false}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  tick={axisStyle.tick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axisStyle.tick}
                  tickFormatter={(v) => formatter(v)}
                  axisLine={false}
                  tickLine={false}
                />
              </>
            )}

            <Tooltip
              {...tooltipStyle}
              cursor={tooltipStyle.cursor}
              formatter={((value: number) => [formatter(value), dataKey]) as never}
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

            <Bar
              dataKey={dataKey}
              radius={[2, 2, 0, 0]}
              animationDuration={chartTheme.animationDuration}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={(entry as any).color || barColors[index % barColors.length]}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
