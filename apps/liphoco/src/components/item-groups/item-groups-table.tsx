'use client';

import DataTable from '@/components/layout/data-table';

interface ItemGroupRow {
  id: string;
  name: string;
  parentGroup: string | null;
  level: number;
  isGroup: boolean;
  _count: { items: number };
}

export default function ItemGroupsTable({ groups }: { groups: ItemGroupRow[] }) {
  const columns = [
    {
      key: 'name',
      label: 'Tên nhóm',
      render: (row: ItemGroupRow) => (
        <div style={{ paddingLeft: `${row.level * 24}px` }}>
          <span className={row.isGroup ? 'font-semibold text-steel-800' : 'text-steel-600'}>
            {row.isGroup ? '📁' : '📄'} {row.name}
          </span>
        </div>
      ),
    },
    {
      key: 'parentGroup',
      label: 'Nhóm cha',
      render: (row: ItemGroupRow) => <span className="text-xs text-steel-400">{row.parentGroup || '—'}</span>,
    },
    {
      key: 'level',
      label: 'Cấp',
      className: 'text-center',
    },
    {
      key: '_count',
      label: 'Số NVL',
      className: 'text-right',
      render: (row: ItemGroupRow) => (
        <span className="font-mono text-sm">{row._count?.items || 0}</span>
      ),
    },
  ];

  return <DataTable columns={columns} data={groups as any} />;
}
