/**
 * PieChart Component - Industrial Design System
 */

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { chartTheme, tooltipStyle } from './chart-theme';
import { cn } from '@/lib/utils';
import { formatCurrencyCompact } from '@/components/ui/currency-display';

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title?: string;
  description?: string;
  data: PieChartData[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number | string;
  outerRadius?: number | string;
  donut?: boolean;
  formatValue?: 'currency' | 'number' | 'percent' | ((value: number) => string);
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
      return (value: number) => value.toLocaleString();
  }
};

export function PieChart({
  title,
  description,
  data,
  height = 280,
  showLegend = true,
  innerRadius,
  outerRadius = '80%',
  donut = true,
  formatValue,
  className,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  // Get formatter based on type or custom function
  const formatter = getFormatter(formatValue);

  // Calculate inner radius based on donut prop or explicit value
  const calculatedInnerRadius = innerRadius ?? (donut ? '55%' : 0);

  // Custom label renderer
  const renderCustomLabel = ({ percent }: { name: string; percent: number }) => {
    if (percent < 0.05) return null; // Hide small slices
    return `${(percent * 100).toFixed(0)}%`;
  };

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
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={calculatedInnerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              label={renderCustomLabel as never}
              labelLine={false}
              animationDuration={chartTheme.animationDuration}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || chartTheme.colors.series[index % chartTheme.colors.series.length]}
                  stroke={chartTheme.colors.background}
                  strokeWidth={2}
                />
              ))}
            </Pie>

            <Tooltip
              {...tooltipStyle}
              cursor={tooltipStyle.cursor}
              formatter={((value: number, name: string) => {
                const percentage = ((value / total) * 100).toFixed(1);
                return [`${formatter(value)} (${percentage}%)`, name];
              }) as never}
            />

            {showLegend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingTop: 16,
                  fontFamily: chartTheme.fontFamily,
                  fontSize: chartTheme.fontSize.legend,
                  color: chartTheme.colors.text,
                }}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
