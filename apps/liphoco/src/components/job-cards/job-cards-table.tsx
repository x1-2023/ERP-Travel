'use client';

import { fmtNum, fmtDate } from '@/lib/utils';
import DataTable from '@/components/layout/data-table';
import Badge from '@/components/ui/badge';

interface JobCardRow {
  id: string;
  jobNo: string;
  workOrder: { woNo: string };
  operation: { name: string };
  workstation: { name: string } | null;
  qtyCompleted: number;
  qtyToProduce: number;
  workerName: string | null;
  status: string;
}

export default function JobCardsTable({ jobCards }: { jobCards: JobCardRow[] }) {
  const columns = [
    {
      key: 'jobNo',
      label: 'Mã phiếu',
      render: (row: JobCardRow) => <span className="font-mono text-xs font-semibold text-brand-700">{row.jobNo}</span>,
    },
    {
      key: 'workOrder',
      label: 'Lệnh SX',
      render: (row: JobCardRow) => <span className="text-xs text-steel-500">{row.workOrder.woNo}</span>,
    },
    {
      key: 'operation',
      label: 'Công đoạn',
      render: (row: JobCardRow) => <span className="text-sm">{row.operation.name}</span>,
    },
    {
      key: 'workstation',
      label: 'Trạm',
      render: (row: JobCardRow) => <span className="text-xs text-steel-500">{row.workstation?.name || '—'}</span>,
    },
    {
      key: 'qty',
      label: 'Hoàn thành',
      className: 'text-right',
      render: (row: JobCardRow) => (
        <span className="font-mono text-sm">
          {fmtNum(Number(row.qtyCompleted))}/{fmtNum(Number(row.qtyToProduce || 0))}
        </span>
      ),
    },
    {
      key: 'workerName',
      label: 'Công nhân',
      render: (row: JobCardRow) => <span className="text-sm">{row.workerName || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: JobCardRow) => <Badge status={row.status} />,
    },
  ];

  return <DataTable columns={columns} data={jobCards as any} />;
}
