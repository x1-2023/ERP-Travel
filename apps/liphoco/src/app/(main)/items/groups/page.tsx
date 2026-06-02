import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import ItemGroupsTable from '@/components/item-groups/item-groups-table';

export const dynamic = 'force-dynamic';

export default async function ItemGroupsPage() {
  const groups = await prisma.itemGroup.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  });

  // Serialize data
  const serializedGroups = groups.map((g) => ({
    id: g.id,
    name: g.name,
    parentGroup: g.parentGroup,
    level: g.level,
    isGroup: g.isGroup,
    _count: g._count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhóm vật tư"
        description={`${groups.length} nhóm — cấu trúc cây: All → Raw Material → Thép ống...`}
      />
      <ItemGroupsTable groups={serializedGroups} />
    </div>
  );
}
