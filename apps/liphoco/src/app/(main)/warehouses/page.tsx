import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import WarehousesTable from '@/components/warehouses/warehouses-table';

export const dynamic = 'force-dynamic';

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    include: { _count: { select: { stockLedgers: true } } },
    orderBy: { name: 'asc' },
  });

  // Serialize data
  const serializedWarehouses = warehouses.map((w) => ({
    id: w.id,
    code: w.code,
    name: w.name,
    warehouseType: w.warehouseType,
    _count: w._count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Kho hàng" description={`${warehouses.length} kho — Xưởng 2`} />
      <WarehousesTable warehouses={serializedWarehouses} />
    </div>
  );
}
