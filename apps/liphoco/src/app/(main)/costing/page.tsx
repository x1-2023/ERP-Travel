import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import CostingTable from '@/components/costing/costing-table';

export const dynamic = 'force-dynamic';

export default async function CostingPage() {
  const history = await prisma.costingHistory.findMany({
    include: { customer: { select: { code: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Serialize data
  const serializedHistory = history.map((h) => ({
    id: h.id,
    projectName: h.projectName,
    customer: h.customer,
    itemDescription: h.itemDescription,
    totalWeightKg: h.totalWeightKg ? Number(h.totalWeightKg) : null,
    productionCost: Number(h.productionCost),
    sellPriceUsd: h.sellPriceUsd ? Number(h.sellPriceUsd) : null,
    pricePerKg: h.pricePerKg ? Number(h.pricePerKg) : null,
    createdAt: h.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử tính giá (Costing)"
        description={`${history.length} lượt tính — AI Copilot`}
      />
      <CostingTable history={serializedHistory} />
    </div>
  );
}
