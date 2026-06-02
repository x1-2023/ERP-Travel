'use client';

import Link from 'next/link';
import { fmtVND } from '@/lib/utils';
import DataTable from '@/components/layout/data-table';
import Badge from '@/components/ui/badge';

interface BomRow {
  id: string;
  bomNo: string;
  item: { itemCode: string; itemName: string };
  _count: { bomItems: number; bomOperations: number };
  totalCost: number;
  isActive: boolean;
}

export default function BomTable({ boms }: { boms: BomRow[] }) {
  const columns = [
    {
      key: 'bomNo',
      label: 'Mã BOM',
      render: (row: BomRow) => (
        <Link href={`/bom/${row.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">
          {row.bomNo}
        </Link>
      ),
    },
    {
      key: 'item',
      label: 'Sản phẩm',
      render: (row: BomRow) => (
        <div>
          <p className="text-sm font-medium">{row.item.itemCode}</p>
          <p className="text-xs text-steel-400">{row.item.itemName}</p>
        </div>
      ),
    },
    {
      key: 'bomItems',
      label: 'NVL',
      className: 'text-center',
      render: (row: BomRow) => <span className="font-mono">{row._count.bomItems}</span>,
    },
    {
      key: 'bomOps',
      label: 'Công đoạn',
      className: 'text-center',
      render: (row: BomRow) => <span className="font-mono">{row._count.bomOperations}</span>,
    },
    {
      key: 'totalCost',
      label: 'Tổng giá',
      className: 'text-right',
      render: (row: BomRow) => <span className="font-mono text-sm">{fmtVND(Number(row.totalCost))}</span>,
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (row: BomRow) => <Badge status={row.isActive ? 'active' : 'cancelled'} label={row.isActive ? 'Active' : 'Inactive'} />,
    },
  ];

  return <DataTable columns={columns} data={boms as any} />;
}
