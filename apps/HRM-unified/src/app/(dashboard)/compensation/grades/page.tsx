'use client';

import { useSalaryGrades } from '@/hooks/use-grades';
import { GradeList } from '@/components/compensation/grades/grade-list';
import { GradeForm } from '@/components/compensation/grades/grade-form';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function GradesPage() {
  const { data: grades, isLoading, mutate } = useSalaryGrades();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (data: any) => {
    await fetch('/api/compensation/grades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    mutate();
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bậc lương</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus className="w-4 h-4 mr-1" />Thêm bậc</Button>
      </div>
      {showForm && <GradeForm onSubmit={handleCreate} />}
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : grades && <GradeList grades={grades} />}
    </div>
  );
}
