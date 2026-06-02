'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Threshold {
  value: number;
  color: string;
  label: string;
}

interface GaugeChartProps {
  title: string;
  value: number;
  max: number;
  thresholds: Threshold[];
  className?: string;
}

export function GaugeChart({
  title,
  value,
  max,
  thresholds,
  className,
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180; // 0 to 180 degrees for semi-circle

  // SVG dimensions
  const width = 200;
  const height = 120;
  const cx = width / 2;
  const cy = height - 10;
  const radius = 80;
  const strokeWidth = 16;

  // Calculate arc path
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    r: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  // Get current threshold color
  const currentThreshold = thresholds
    .sort((a, b) => a.value - b.value)
    .reduce((prev, curr) => (value >= curr.value ? curr : prev), thresholds[0]);

  // Needle end point
  const needleEnd = polarToCartesian(cx, cy, radius - strokeWidth - 5, angle);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background arc segments based on thresholds */}
          {thresholds.map((threshold, index) => {
            const prevValue = index === 0 ? 0 : thresholds[index - 1].value;
            const startAngle = (prevValue / max) * 180;
            const endAngle = (threshold.value / max) * 180;
            return (
              <path
                key={threshold.label}
                d={describeArc(startAngle, Math.min(endAngle, 180))}
                fill="none"
                stroke={threshold.color}
                strokeWidth={strokeWidth}
                opacity={0.3}
                strokeLinecap="round"
              />
            );
          })}

          {/* Value arc */}
          <path
            d={describeArc(0, angle)}
            fill="none"
            stroke={currentThreshold?.color || '#3b82f6'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={4} fill="hsl(var(--foreground))" />

          {/* Value text */}
          <text
            x={cx}
            y={cy - 20}
            textAnchor="middle"
            className="fill-foreground text-lg font-bold"
            fontSize={18}
          >
            {value.toLocaleString('vi-VN')}
          </text>

          {/* Min/Max labels */}
          <text
            x={cx - radius}
            y={cy + 15}
            textAnchor="start"
            className="fill-muted-foreground"
            fontSize={10}
          >
            0
          </text>
          <text
            x={cx + radius}
            y={cy + 15}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={10}
          >
            {max}
          </text>
        </svg>

        {/* Threshold Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          {thresholds.map((threshold) => (
            <div key={threshold.label} className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: threshold.color }}
              />
              <span className="text-muted-foreground">{threshold.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
