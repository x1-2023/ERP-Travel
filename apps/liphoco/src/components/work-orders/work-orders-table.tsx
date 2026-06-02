'use client';

import Link from 'next/link';
import { fmtDate, fmtNum } from '@/lib/utils';
import DataTable from '@/components/layout/data-table';
import Badge from '@/components/ui/badge';

interface WorkOrderRow {
  id: string;
  woNo: string;
  item: { itemCode: string; itemName: string };
  bom: { bomNo: string };
  qtyProduced: number;
  qtyToProduce: number;
  status: string;
  plannedStart: string;
  customerName: string | null;
  _count: { jobCards: number };
}

export default function WorkOrdersTable({ workOrders }: { workOrders: WorkOrderRow[] }) {
  const columns = [
    {
      key: 'woNo',
      label: 'Mã LSX',
      render: (row: WorkOrderRow) => (
        <Link href={`/work-orders/${row.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">
          {row.woNo}
        </Link>
      ),
    },
    {
      key: 'item',
      label: 'Sản phẩm',
      render: (row: WorkOrderRow) => (
        <div>
          <p className="text-sm font-medium">{row.item.itemCode}</p>
          <p className="text-xs text-steel-400">{row.item.itemName}</p>
        </div>
      ),
    },
    {
      key: 'qty',
      label: 'SL',
      className: 'text-right',
      render: (row: WorkOrderRow) => (
        <span className="font-mono text-sm">
          {fmtNum(Number(row.qtyProduced))}/{fmtNum(Number(row.qtyToProduce))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: WorkOrderRow) => <Badge status={row.status} />,
    },
    {
      key: 'plannedStart',
      label: 'Ngày bắt đầu',
      render: (row: WorkOrderRow) => <span className="text-xs">{fmtDate(row.plannedStart)}</span>,
    },
    {
      key: 'customerName',
      label: 'Khách hàng',
      render: (row: WorkOrderRow) => <span className="text-xs text-steel-500">{row.customerName || '—'}</span>,
    },
    {
      key: 'jobCards',
      label: 'Job Cards',
      className: 'text-center',
      render: (row: WorkOrderRow) => <span className="font-mono">{row._count.jobCards}</span>,
    },
  ];

  return <DataTable columns={columns} data={workOrders as any} />;
}
