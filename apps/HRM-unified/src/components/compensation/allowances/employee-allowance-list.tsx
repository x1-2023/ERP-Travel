'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ALLOWANCE_FREQUENCY } from '@/lib/compensation/constants';
import { formatCurrency } from '@/lib/compensation/utils';
import { EmployeeAllowance } from '@/types/compensation';

interface EmployeeAllowanceListProps { allowances: EmployeeAllowance[]; }

export function EmployeeAllowanceList({ allowances }: EmployeeAllowanceListProps) {
  const totalMonthly = allowances.reduce((sum, a) => {
    if (a.frequency === 'MONTHLY') return sum + a.amount;
    if (a.frequency === 'QUARTERLY') return sum + a.amount / 3;
    if (a.frequency === 'ANNUAL') return sum + a.amount / 12;
    return sum;
  }, 0);
  return (
    <Card>
      <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Phụ cấp</CardTitle><span className="text-sm font-medium font-mono">{formatCurrency(totalMonthly)}/tháng</span></div></CardHeader>
      <CardContent className="space-y-2">
        {allowances.length === 0 && <p className="text-sm text-muted-foreground">Chưa có phụ cấp.</p>}
        {allowances.map((a) => (
          <div key={a.id} className="flex items-center justify-between p-3 border rounded-md">
            <div><p className="text-sm font-medium">{a.allowanceType?.name}</p><span className="text-xs text-muted-foreground">{ALLOWANCE_FREQUENCY[a.frequency]?.label}</span></div>
            <span className="text-sm font-medium font-mono">{formatCurrency(a.amount)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
