'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HeatmapDataItem {
  day: number;
  hour: number;
  value: number;
}

interface HeatmapChartProps {
  title: string;
  data: HeatmapDataItem[];
  height?: number;
  className?: string;
}

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7-19

function getCellColor(value: number, max: number): string {
  if (max === 0) return 'bg-gray-100 dark:bg-gray-800';
  const ratio = value / max;
  if (ratio >= 0.8) return 'bg-red-500 text-white';
  if (ratio >= 0.6) return 'bg-orange-400 text-white';
  if (ratio >= 0.4) return 'bg-yellow-400 text-gray-900';
  if (ratio >= 0.2) return 'bg-green-300 text-gray-900';
  return 'bg-green-100 dark:bg-green-900 text-gray-700 dark:text-gray-300';
}

export function HeatmapChart({
  title,
  data,
  height,
  className,
}: HeatmapChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getValue = (day: number, hour: number): number => {
    const item = data.find((d) => d.day === day && d.hour === hour);
    return item?.value ?? 0;
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" style={height ? { maxHeight: height } : undefined}>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-1 text-left text-muted-foreground">Giờ</th>
                {DAYS.map((day) => (
                  <th key={day} className="p-1 text-center text-muted-foreground">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <td className="p-1 text-muted-foreground font-medium">
                    {hour}:00
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const value = getValue(dayIndex, hour);
                    return (
                      <td key={`${dayIndex}-${hour}`} className="p-0.5">
                        <div
                          className={cn(
                            'flex h-7 w-full items-center justify-center rounded text-xs font-medium',
                            getCellColor(value, maxValue)
                          )}
                          title={`${DAYS[dayIndex]} ${hour}:00 - ${value}`}
                        >
                          {value > 0 ? value : ''}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Thấp</span>
            <div className="flex gap-0.5">
              <div className="h-4 w-6 rounded bg-green-100 dark:bg-green-900" />
              <div className="h-4 w-6 rounded bg-green-300" />
              <div className="h-4 w-6 rounded bg-yellow-400" />
              <div className="h-4 w-6 rounded bg-orange-400" />
              <div className="h-4 w-6 rounded bg-red-500" />
            </div>
            <span>Cao</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
