import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import QuotationsTable from '@/components/quotations/quotations-table';
import Badge from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    include: {
      customer: { select: { code: true, name: true } },
      item: { select: { itemCode: true, itemName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize data
  const serializedQuotations = quotations.map((q) => ({
    id: q.id,
    quoteNo: q.quoteNo,
    customer: q.customer,
    item: q.item,
    itemDescription: q.itemDescription,
    sellPriceUsd: q.sellPriceUsd ? Number(q.sellPriceUsd) : null,
    pricePerKgUsd: q.pricePerKgUsd ? Number(q.pricePerKgUsd) : null,
    validUntil: q.validUntil?.toISOString() ?? null,
    status: q.status,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo giá (Quotations)"
        description={`${quotations.length} báo giá`}
        actions={
          <Link href="/quotations/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Tạo báo giá
          </Link>
        }
      />

      {/* Pipeline summary */}
      <div className="flex gap-3">
        {['draft', 'sent', 'negotiating', 'won', 'lost'].map((s) => {
          const count = quotations.filter((q) => q.status === s).length;
          return (
            <div key={s} className="rounded-lg border border-steel-200 bg-white px-4 py-2">
              <Badge status={s} />
              <span className="ml-2 text-sm font-medium">{count}</span>
            </div>
          );
        })}
      </div>

      <QuotationsTable quotations={serializedQuotations} />
    </div>
  );
}
