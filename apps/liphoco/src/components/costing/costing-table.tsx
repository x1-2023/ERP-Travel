'use client';

import { fmtVND, fmtDate } from '@/lib/utils';
import DataTable from '@/components/layout/data-table';

interface CostingRow {
  id: string;
  projectName: string | null;
  customer: { code: string; name: string } | null;
  itemDescription: string | null;
  totalWeightKg: number | null;
  productionCost: number;
  sellPriceUsd: number | null;
  pricePerKg: number | null;
  createdAt: string;
}

export default function CostingTable({ history }: { history: CostingRow[] }) {
  const columns = [
    {
      key: 'projectName',
      label: 'Dự án',
      render: (row: CostingRow) => <span className="text-sm font-medium">{row.projectName || '—'}</span>,
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (row: CostingRow) => <span className="text-sm">{row.customer?.name || '—'}</span>,
    },
    {
      key: 'itemDescription',
      label: 'Mô tả SP',
      render: (row: CostingRow) => (
        <span className="text-xs text-steel-500 line-clamp-2">{row.itemDescription || '—'}</span>
      ),
    },
    {
      key: 'totalWeightKg',
      label: 'Trọng lượng',
      className: 'text-right',
      render: (row: CostingRow) =>
        row.totalWeightKg ? <span className="font-mono text-xs">{Number(row.totalWeightKg)} kg</span> : '—',
    },
    {
      key: 'productionCost',
      label: 'Chi phí SX',
      className: 'text-right',
      render: (row: CostingRow) => <span className="font-mono text-sm">{fmtVND(Number(row.productionCost))}</span>,
    },
    {
      key: 'sellPriceUsd',
      label: 'Giá bán USD',
      className: 'text-right',
      render: (row: CostingRow) =>
        row.sellPriceUsd ? (
          <span className="font-mono text-sm font-semibold text-green-700">
            ${Number(row.sellPriceUsd).toLocaleString()}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'pricePerKg',
      label: '$/kg',
      className: 'text-right',
      render: (row: CostingRow) =>
        row.pricePerKg ? <span className="font-mono text-xs">${Number(row.pricePerKg).toFixed(2)}</span> : '—',
    },
    {
      key: 'createdAt',
      label: 'Ngày',
      render: (row: CostingRow) => <span className="text-xs">{fmtDate(row.createdAt)}</span>,
    },
  ];

  return <DataTable columns={columns} data={history as any} />;
}
