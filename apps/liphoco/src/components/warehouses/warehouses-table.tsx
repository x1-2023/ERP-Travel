'use client';

import DataTable from '@/components/layout/data-table';
import Badge from '@/components/ui/badge';

interface WarehouseRow {
  id: string;
  code: string;
  name: string;
  warehouseType: string;
  _count: { stockLedgers: number };
}

export default function WarehousesTable({ warehouses }: { warehouses: WarehouseRow[] }) {
  const columns = [
    {
      key: 'code',
      label: 'Mã kho',
      render: (row: WarehouseRow) => <span className="font-mono text-xs font-semibold">{row.code}</span>,
    },
    { key: 'name', label: 'Tên kho' },
    {
      key: 'warehouseType',
      label: 'Loại',
      render: (row: WarehouseRow) => <Badge status={row.warehouseType} />,
    },
    {
      key: '_count',
      label: 'Giao dịch',
      className: 'text-right',
      render: (row: WarehouseRow) => <span className="font-mono">{row._count?.stockLedgers || 0}</span>,
    },
  ];

  return <DataTable columns={columns} data={warehouses as any} />;
}
