'use client';

import { useState } from 'react';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RiskEmployee {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
  tenure: number; // months
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  topFactor: string;
}

interface TurnoverRiskTableProps {
  data: RiskEmployee[];
  onAction?: (employeeId: string, action: string) => void;
  className?: string;
}

const riskLevelConfig = {
  high: {
    label: 'Cao',
    variant: 'destructive' as const,
  },
  medium: {
    label: 'Trung bình',
    variant: 'secondary' as const,
  },
  low: {
    label: 'Thấp',
    variant: 'outline' as const,
  },
};

type SortField = 'name' | 'department' | 'tenure' | 'riskScore';
type SortDirection = 'asc' | 'desc';

export function TurnoverRiskTable({
  data,
  onAction,
  className,
}: TurnoverRiskTableProps) {
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'name') return multiplier * a.name.localeCompare(b.name);
    if (sortField === 'department') return multiplier * a.department.localeCompare(b.department);
    if (sortField === 'tenure') return multiplier * (a.tenure - b.tenure);
    return multiplier * (a.riskScore - b.riskScore);
  });

  const formatTenure = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} tháng`;
    if (remainingMonths === 0) return `${years} năm`;
    return `${years} năm ${remainingMonths} tháng`;
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Dự đoán rủi ro nghỉ việc
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Nhân viên
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('department')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Phòng ban
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('tenure')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Thâm niên
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('riskScore')}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Điểm rủi ro
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Yếu tố chính</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((employee) => {
                const config = riskLevelConfig[employee.riskLevel];
                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{employee.employeeCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{employee.department}</TableCell>
                    <TableCell className="text-sm">{formatTenure(employee.tenure)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5">
                          <div
                            className={cn(
                              'h-1.5 rounded-full',
                              employee.riskScore >= 70 && 'bg-red-500',
                              employee.riskScore >= 40 && employee.riskScore < 70 && 'bg-yellow-500',
                              employee.riskScore < 40 && 'bg-green-500'
                            )}
                            style={{ width: `${employee.riskScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{employee.riskScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {employee.topFactor}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAction?.(employee.id, 'view')}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
