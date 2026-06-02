'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ALLOWANCE_FREQUENCY } from '@/lib/compensation/constants';
import { formatCurrency } from '@/lib/compensation/utils';
import { AllowanceType } from '@/types/compensation';

interface AllowanceTypeListProps { types: AllowanceType[]; }

export function AllowanceTypeList({ types }: AllowanceTypeListProps) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Loại phụ cấp</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {types.map((type) => (
          <div key={type.id} className="flex items-center justify-between p-3 border rounded-md">
            <div><p className="text-sm font-medium">{type.name}</p>
              <div className="flex items-center gap-2 mt-1"><Badge variant="outline" className="text-xs">{type.code}</Badge><span className="text-xs text-muted-foreground">{ALLOWANCE_FREQUENCY[type.frequency]?.label}</span>{type.isTaxable && <Badge variant="secondary" className="text-xs">Chịu thuế</Badge>}</div>
            </div>
            {type.defaultAmount && <span className="text-sm font-medium font-mono">{formatCurrency(type.defaultAmount)}</span>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
