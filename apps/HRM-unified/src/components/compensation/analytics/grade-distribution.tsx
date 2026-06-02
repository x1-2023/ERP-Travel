'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/compensation/utils';

interface GradeDistributionProps { data: { grade: string; count: number; avgSalary: number }[]; }

export function GradeDistribution({ data }: GradeDistributionProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Phân bổ theo bậc lương</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.grade} className="space-y-1">
            <div className="flex items-center justify-between text-sm"><span className="font-medium">{item.grade}</span><span className="text-muted-foreground text-xs">{item.count} người - {formatCurrency(item.avgSalary)} TB</span></div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(item.count / maxCount) * 100}%` }} /></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
