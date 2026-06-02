'use client';

import { useMeritMatrix } from '@/hooks/use-grades';
import { MeritMatrixView } from '@/components/compensation/merit-matrix/merit-matrix-view';
import { Button } from '@/components/ui/button';
import { DEFAULT_MERIT_MATRIX } from '@/lib/compensation/constants';
import { useState } from 'react';

export default function MeritMatrixPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: matrix, isLoading, mutate } = useMeritMatrix(year);

  const handleSeedDefaults = async () => {
    const entries = DEFAULT_MERIT_MATRIX.map(e => ({ ...e, effectiveYear: year }));
    await fetch('/api/compensation/merit-matrix', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entries) });
    mutate();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ma trận Merit - {year}</h1>
        {(!matrix || matrix.length === 0) && <Button onClick={handleSeedDefaults} size="sm">Tạo mặc định</Button>}
      </div>
      {isLoading ? <p className="text-muted-foreground">Đang tải...</p> : matrix && <MeritMatrixView data={matrix} />}
    </div>
  );
}
