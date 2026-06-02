'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SalaryRange {
  range: string;
  minSalary: number;
  maxSalary: number;
  count: number;
  percentage: number;
  color: string;
}

interface SalaryDistributionTableProps {
  data: SalaryRange[];
  totalEmployees: number;
  className?: string;
}

export function SalaryDistributionTable({
  data,
  totalEmployees,
  className,
}: SalaryDistributionTableProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Phân bố lương
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((range) => (
            <div key={range.range} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{range.range}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{range.count} người</span>
                  <span className="text-xs text-muted-foreground">
                    ({range.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="relative w-full bg-muted rounded-full h-5">
                <div
                  className="h-5 rounded-full flex items-center transition-all"
                  style={{
                    width: `${(range.count / maxCount) * 100}%`,
                    backgroundColor: range.color,
                    minWidth: range.count > 0 ? '20px' : '0px',
                  }}
                >
                  {range.percentage >= 10 && (
                    <span className="text-[10px] font-medium text-white px-2">
                      {range.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tổng</span>
            <span className="font-semibold">{totalEmployees} nhân viên</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
