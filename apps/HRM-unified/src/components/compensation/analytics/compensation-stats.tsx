'use client';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/compensation/utils';
import { Users, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

interface CompensationStatsProps { stats: { totalEmployees: number; avgSalary: number; medianSalary: number; avgCompaRatio: number; totalPayroll: number; budgetUtilization: number; pendingReviews: number; completedReviews: number; }; }

export function CompensationStats({ stats }: CompensationStatsProps) {
  const items = [
    { icon: <Users className="w-4 h-4" />, label: 'Tổng nhân viên', value: stats.totalEmployees.toString() },
    { icon: <DollarSign className="w-4 h-4" />, label: 'Lương trung bình', value: formatCurrency(stats.avgSalary) },
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Compa-ratio TB', value: stats.avgCompaRatio.toFixed(2) },
    { icon: <BarChart3 className="w-4 h-4" />, label: 'Ngân sách sử dụng', value: `${stats.budgetUtilization.toFixed(1)}%` },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">{item.icon}<span className="text-xs">{item.label}</span></div>
          <p className="text-lg font-bold font-mono">{item.value}</p>
        </CardContent></Card>
      ))}
    </div>
  );
}
