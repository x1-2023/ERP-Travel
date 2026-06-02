'use client';

import Link from 'next/link';
import { fmtDate } from '@/lib/utils';
import DataTable from '@/components/layout/data-table';
import Badge from '@/components/ui/badge';

interface QuotationRow {
  id: string;
  quoteNo: string;
  customer: { code: string; name: string } | null;
  item: { itemCode: string; itemName: string } | null;
  itemDescription: string | null;
  sellPriceUsd: number | null;
  pricePerKgUsd: number | null;
  validUntil: string;
  status: string;
}

export default function QuotationsTable({ quotations }: { quotations: QuotationRow[] }) {
  const columns = [
    {
      key: 'quoteNo',
      label: 'Mã BG',
      render: (row: QuotationRow) => (
        <Link href={`/quotations/${row.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">
          {row.quoteNo}
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (row: QuotationRow) => (
        <div>
          <p className="text-sm font-medium">{row.customer?.name || '—'}</p>
          <p className="text-xs text-steel-400">{row.customer?.code}</p>
        </div>
      ),
    },
    {
      key: 'item',
      label: 'Sản phẩm',
      render: (row: QuotationRow) => (
        <span className="text-sm">{row.item?.itemName || row.itemDescription || '—'}</span>
      ),
    },
    {
      key: 'sellPriceUsd',
      label: 'Giá USD',
      className: 'text-right',
      render: (row: QuotationRow) =>
        row.sellPriceUsd ? (
          <span className="font-mono text-sm font-semibold text-green-700">
            ${Number(row.sellPriceUsd).toLocaleString()}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'pricePerKgUsd',
      label: '$/kg',
      className: 'text-right',
      render: (row: QuotationRow) =>
        row.pricePerKgUsd ? (
          <span className="font-mono text-xs">${Number(row.pricePerKgUsd).toFixed(2)}/kg</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'validUntil',
      label: 'Hiệu lực',
      render: (row: QuotationRow) => <span className="text-xs">{fmtDate(row.validUntil)}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: QuotationRow) => <Badge status={row.status} />,
    },
  ];

  return <DataTable columns={columns} data={quotations as any} />;
}
