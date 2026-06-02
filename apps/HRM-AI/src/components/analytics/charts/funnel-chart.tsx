'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FunnelDataItem {
  name: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  title: string;
  data: FunnelDataItem[];
  className?: string;
}

export function FunnelChart({ title, data, className }: FunnelChartProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-1">
          {data.map((item, index) => {
            const minWidth = 30;
            const calculatedWidth = Math.max(
              minWidth,
              ((data.length - index) / data.length) * 100
            );

            return (
              <div
                key={item.name}
                className="flex items-center gap-3 w-full"
              >
                <div
                  className="relative flex items-center justify-center rounded py-3 text-sm font-medium text-white transition-all mx-auto"
                  style={{
                    width: `${calculatedWidth}%`,
                    backgroundColor: item.color,
                    clipPath:
                      index < data.length - 1
                        ? 'polygon(2% 0%, 98% 0%, 95% 100%, 5% 100%)'
                        : 'polygon(5% 0%, 95% 0%, 92% 100%, 8% 100%)',
                  }}
                >
                  <span className="z-10 text-center">
                    {item.name}: {item.value.toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
