import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import BomTable from '@/components/bom/bom-table';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BomPage() {
  const boms = await prisma.bom.findMany({
    include: {
      item: { select: { itemCode: true, itemName: true } },
      _count: { select: { bomItems: true, bomOperations: true } },
    },
    orderBy: { bomNo: 'asc' },
  });

  // Serialize data
  const serializedBoms = boms.map((b) => ({
    id: b.id,
    bomNo: b.bomNo,
    item: b.item,
    _count: b._count,
    totalCost: Number(b.totalCost),
    isActive: b.isActive,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials (BOM)"
        description={`${boms.length} BOM`}
        actions={
          <Link href="/bom/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Tạo BOM
          </Link>
        }
      />
      <BomTable boms={serializedBoms} />
    </div>
  );
}
