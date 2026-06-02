'use client';

import Link from 'next/link';
import DataTable from '@/components/layout/data-table';
import Badge from '@/components/ui/badge';

interface CustomerRow {
  id: string;
  code: string;
  name: string;
  country: string | null;
  currency: string;
  pricingProfile: string;
  overheadPct: number;
  profitPct: number;
  status: string;
  _count: { quotations: number };
}

export default function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const columns = [
    {
      key: 'code',
      label: 'Mã KH',
      render: (row: CustomerRow) => (
        <Link href={`/customers/${row.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">
          {row.code}
        </Link>
      ),
    },
    { key: 'name', label: 'Tên khách hàng' },
    {
      key: 'country',
      label: 'Quốc gia',
      render: (row: CustomerRow) => <span className="text-xs">{row.country || '—'}</span>,
    },
    {
      key: 'currency',
      label: 'Tiền tệ',
      render: (row: CustomerRow) => <span className="font-mono text-xs">{row.currency}</span>,
    },
    {
      key: 'pricingProfile',
      label: 'Pricing',
      render: (row: CustomerRow) => <Badge status={row.pricingProfile} />,
    },
    {
      key: 'overhead',
      label: 'OH / Profit',
      className: 'text-right',
      render: (row: CustomerRow) => (
        <span className="font-mono text-xs">
          {Number(row.overheadPct)}% / {Number(row.profitPct)}%
        </span>
      ),
    },
    {
      key: 'quotations',
      label: 'Báo giá',
      className: 'text-center',
      render: (row: CustomerRow) => <span className="font-mono">{row._count.quotations}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: CustomerRow) => <Badge status={row.status} />,
    },
  ];

  return <DataTable columns={columns} data={customers as any} />;
}
