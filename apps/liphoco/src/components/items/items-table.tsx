'use client';

import { fmtVND } from '@/lib/utils';
import DataTable from '@/components/layout/data-table';
import Badge from '@/components/ui/badge';

interface ItemRow {
  id: string;
  itemCode: string;
  itemName: string;
  itemGroup: string;
  itemType: string;
  uomCode: string;
  valuationRate: string | number;
}

export default function ItemsTable({ items }: { items: ItemRow[] }) {
  const columns = [
    {
      key: 'itemCode',
      label: 'Mã NVL',
      render: (row: ItemRow) => (
        <span className="font-mono text-xs font-semibold text-brand-700">{row.itemCode}</span>
      ),
    },
    { key: 'itemName', label: 'Tên vật tư' },
    {
      key: 'itemGroup',
      label: 'Nhóm',
      render: (row: ItemRow) => <span className="text-xs text-steel-500">{row.itemGroup}</span>,
    },
    {
      key: 'itemType',
      label: 'Loại',
      render: (row: ItemRow) => <Badge status={row.itemType} />,
    },
    {
      key: 'uomCode',
      label: 'ĐVT',
      render: (row: ItemRow) => <span className="text-xs">{row.uomCode}</span>,
    },
    {
      key: 'valuationRate',
      label: 'Giá nhập',
      className: 'text-right',
      render: (row: ItemRow) => (
        <span className="font-mono text-sm">{fmtVND(Number(row.valuationRate))}</span>
      ),
    },
  ];

  return <DataTable columns={columns} data={items as any} />;
}
