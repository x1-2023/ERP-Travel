'use client';

import { useAllowanceTypes } from '@/hooks/use-allowances';
import { AllowanceTypeList } from '@/components/compensation/allowances/allowance-type-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AllowancesPage() {
  const { data: types, isLoading } = useAllowanceTypes();
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phụ cấp</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" />Thêm loại</Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : types && <AllowanceTypeList types={types} />}
    </div>
  );
}
