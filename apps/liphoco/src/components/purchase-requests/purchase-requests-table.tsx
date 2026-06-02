'use client';

import Link from 'next/link';
import { fmtDate } from '@/lib/utils';
import DataTable from '@/components/layout/data-table';
import Badge from '@/components/ui/badge';

interface PurchaseRequestRow {
  id: string;
  prNo: string;
  requestedBy: string | null;
  approvedBy: string | null;
  requiredDate: string;
  workOrderRef: string | null;
  status: string;
  _count: { items: number };
}

export default function PurchaseRequestsTable({ purchaseRequests }: { purchaseRequests: PurchaseRequestRow[] }) {
  const columns = [
    {
      key: 'prNo',
      label: 'Mã YCMH',
      render: (row: PurchaseRequestRow) => (
        <Link href={`/purchase-requests/${row.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">
          {row.prNo}
        </Link>
      ),
    },
    {
      key: 'requestedBy',
      label: 'Người yêu cầu',
      render: (row: PurchaseRequestRow) => <span className="text-sm">{row.requestedBy || '—'}</span>,
    },
    {
      key: 'approvedBy',
      label: 'Người duyệt',
      render: (row: PurchaseRequestRow) => <span className="text-sm">{row.approvedBy || '—'}</span>,
    },
    {
      key: 'items',
      label: 'Số dòng NVL',
      className: 'text-center',
      render: (row: PurchaseRequestRow) => <span className="font-mono">{row._count.items}</span>,
    },
    {
      key: 'requiredDate',
      label: 'Ngày cần',
      render: (row: PurchaseRequestRow) => <span className="text-xs">{fmtDate(row.requiredDate)}</span>,
    },
    {
      key: 'workOrderRef',
      label: 'LSX liên kết',
      render: (row: PurchaseRequestRow) => (
        <span className="font-mono text-xs text-steel-500">{row.workOrderRef || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: PurchaseRequestRow) => <Badge status={row.status} />,
    },
  ];

  return <DataTable columns={columns} data={purchaseRequests as any} />;
}
