'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/compensation/utils';
import { CompaRatioBadge } from '../common/compa-ratio-badge';

interface DepartmentComparisonProps { data: { department: string; headcount: number; avgSalary: number; avgCompaRatio: number }[]; }

export function DepartmentComparison({ data }: DepartmentComparisonProps) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">So sánh theo phòng ban</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {data.map((dept) => (
          <div key={dept.department} className="flex items-center justify-between p-3 border rounded-md">
            <div><p className="text-sm font-medium">{dept.department}</p><p className="text-xs text-muted-foreground">{dept.headcount} nhân viên</p></div>
            <div className="text-right"><p className="text-sm font-medium font-mono">{formatCurrency(dept.avgSalary)}</p><CompaRatioBadge value={dept.avgCompaRatio} /></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
