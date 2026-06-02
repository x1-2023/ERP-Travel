/**
 * Chart Widget Component
 * Simple chart visualization using divs (can be replaced with recharts/chart.js)
 */

import { cn } from '@/lib/utils';
import type { ChartType, ChartDataPoint } from '@/types/advanced';

interface ChartWidgetProps {
  type: ChartType;
  data: ChartDataPoint[];
  height?: number;
  className?: string;
}

export function ChartWidget({ type, data, height = 300, className }: ChartWidgetProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center bg-muted/50 rounded-lg', className)}
        style={{ height }}
      >
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  switch (type) {
    case 'BAR':
      return (
        <div className={cn('space-y-2', className)} style={{ minHeight: height }}>
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24 truncate">{item.label}</span>
              <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-16 text-right">
                {new Intl.NumberFormat('vi-VN').format(item.value)}
              </span>
            </div>
          ))}
        </div>
      );

    case 'PIE':
      const total = data.reduce((sum, d) => sum + d.value, 0);
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

      return (
        <div className={cn('flex gap-8 items-center', className)} style={{ minHeight: height }}>
          {/* Simple circle representation */}
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full bg-muted" />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              return (
                <div
                  key={index}
                  className={cn(
                    'absolute inset-2 rounded-full',
                    colors[index % colors.length]
                  )}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((percentage * Math.PI * 2) / 100)}% ${50 - 50 * Math.cos((percentage * Math.PI * 2) / 100)}%, 50% 50%)`,
                    transform: `rotate(${data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0)}deg)`,
                  }}
                />
              );
            })}
          </div>
          {/* Legend */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', colors[index % colors.length])} />
                <span className="text-sm">{item.label}</span>
                <span className="text-sm font-medium ml-auto">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'LINE':
    case 'AREA':
      const lineMaxValue = Math.max(...data.map((d) => d.value)) * 1.1;
      return (
        <div className={cn('relative', className)} style={{ height }}>
          <div className="absolute inset-0 flex items-end">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end"
                style={{ height: '100%' }}
              >
                <div
                  className={cn(
                    'w-full',
                    type === 'AREA' ? 'bg-primary/20' : 'bg-primary',
                    type === 'LINE' ? 'h-1' : ''
                  )}
                  style={{
                    height: type === 'AREA' ? `${(item.value / lineMaxValue) * 100}%` : undefined,
                  }}
                />
                {type === 'LINE' && index < data.length - 1 && (
                  <div className="absolute w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            ))}
          </div>
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex">
            {data.map((item, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div
          className={cn('flex items-center justify-center bg-muted/50 rounded-lg', className)}
          style={{ height }}
        >
          <p className="text-muted-foreground">Unsupported chart type: {type}</p>
        </div>
      );
  }
}
