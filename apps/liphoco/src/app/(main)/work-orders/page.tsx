import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import WorkOrdersTable from '@/components/work-orders/work-orders-table';
import Badge from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WorkOrdersPage() {
  const workOrders = await prisma.workOrder.findMany({
    include: {
      item: { select: { itemCode: true, itemName: true } },
      bom: { select: { bomNo: true } },
      _count: { select: { jobCards: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize data
  const serializedWorkOrders = workOrders.map((wo) => ({
    id: wo.id,
    woNo: wo.woNo,
    item: wo.item,
    bom: wo.bom,
    qtyProduced: Number(wo.qtyProduced),
    qtyToProduce: Number(wo.qtyToProduce),
    status: wo.status,
    plannedStart: wo.plannedStart?.toISOString() ?? null,
    customerName: wo.customerName,
    _count: wo._count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lệnh sản xuất (Work Orders)"
        description={`${workOrders.length} lệnh SX`}
        actions={
          <Link href="/work-orders/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Tạo lệnh SX
          </Link>
        }
      />

      {/* Status summary */}
      <div className="flex gap-3">
        {['draft', 'submitted', 'in_progress', 'completed'].map((s) => {
          const count = workOrders.filter((wo) => wo.status === s).length;
          return (
            <div key={s} className="rounded-lg border border-steel-200 bg-white px-4 py-2">
              <Badge status={s} />
              <span className="ml-2 text-sm font-medium">{count}</span>
            </div>
          );
        })}
      </div>

      <WorkOrdersTable workOrders={serializedWorkOrders} />
    </div>
  );
}
