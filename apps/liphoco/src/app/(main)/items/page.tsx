import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import ItemsTable from '@/components/items/items-table';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ItemsPage() {
  const [items, groups] = await Promise.all([
    prisma.item.findMany({
      include: { group: true, uomRef: true },
      orderBy: { itemCode: 'asc' },
    }),
    prisma.itemGroup.findMany({
      where: { isGroup: false },
      include: { _count: { select: { items: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Serialize Prisma Decimal to plain objects
  const serializedItems = items.map((i) => ({
    id: i.id,
    itemCode: i.itemCode,
    itemName: i.itemName,
    itemGroup: i.itemGroup,
    itemType: i.itemType,
    uomCode: i.uomCode,
    valuationRate: Number(i.valuationRate),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vật tư (Items)"
        description={`${items.length} vật tư | ${groups.length} nhóm`}
        actions={
          <Link href="/items/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Thêm NVL
          </Link>
        }
      />
      <ItemsTable items={serializedItems} />
    </div>
  );
}
