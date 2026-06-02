'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/compensation/utils';
import { TotalRewardsStatement } from '@/types/compensation';
import { DollarSign, Gift, Shield, Wallet } from 'lucide-react';

interface TotalRewardsCardProps { statement: TotalRewardsStatement; }

export function TotalRewardsCard({ statement }: TotalRewardsCardProps) {
  const items = [
    { icon: <DollarSign className="w-4 h-4" />, label: 'Lương cơ bản (năm)', value: statement.baseSalary * 12, color: 'text-blue-600' },
    { icon: <Wallet className="w-4 h-4" />, label: 'Phụ cấp', value: statement.totalAllowances, color: 'text-green-600' },
    { icon: <Gift className="w-4 h-4" />, label: 'Phúc lợi', value: statement.totalBenefitsValue, color: 'text-purple-600' },
    { icon: <Shield className="w-4 h-4" />, label: 'BHXH (Công ty)', value: statement.employerContributions, color: 'text-orange-600' },
  ];
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Tổng đãi ngộ {statement.year}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className={item.color}>{item.icon}</span><span className="text-sm">{item.label}</span></div>
            <span className="text-sm font-medium font-mono">{formatCurrency(item.value)}</span>
          </div>
        ))}
        <div className="border-t pt-3 flex items-center justify-between">
          <span className="font-semibold">Tổng cộng</span>
          <span className="font-bold text-lg text-primary font-mono">{formatCurrency(statement.totalRewards)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
