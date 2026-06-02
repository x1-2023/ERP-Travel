'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DepartmentMetric {
  department: string;
  headcount: number;
  avgSalary: number;
  turnoverRate: number;
  attendanceRate: number;
}

interface DepartmentComparisonTableProps {
  data: DepartmentMetric[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} tr`;
  }
  return value.toLocaleString('vi-VN');
}

export function DepartmentComparisonTable({
  data,
  className,
}: DepartmentComparisonTableProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          So sánh phòng ban
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phòng ban</TableHead>
                <TableHead className="text-right">Nhân sự</TableHead>
                <TableHead className="text-right">Lương TB</TableHead>
                <TableHead className="text-right">Nghỉ việc</TableHead>
                <TableHead className="text-right">Chuyên cần</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((dept) => (
                <TableRow key={dept.department}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell className="text-right">
                    {dept.headcount.toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(dept.avgSalary)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-medium',
                        dept.turnoverRate >= 15 && 'text-red-600',
                        dept.turnoverRate >= 8 && dept.turnoverRate < 15 && 'text-yellow-600',
                        dept.turnoverRate < 8 && 'text-green-600'
                      )}
                    >
                      {dept.turnoverRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-medium',
                        dept.attendanceRate >= 95 && 'text-green-600',
                        dept.attendanceRate >= 85 && dept.attendanceRate < 95 && 'text-yellow-600',
                        dept.attendanceRate < 85 && 'text-red-600'
                      )}
                    >
                      {dept.attendanceRate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
