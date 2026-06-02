import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import PurchaseRequestsTable from '@/components/purchase-requests/purchase-requests-table';
import Badge from '@/components/ui/badge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PurchaseRequestsPage() {
  const prs = await prisma.purchaseRequest.findMany({
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize data
  const serializedPrs = prs.map((pr) => ({
    id: pr.id,
    prNo: pr.prNo,
    requestedBy: pr.requestedBy,
    approvedBy: pr.approvedBy,
    requiredDate: pr.requiredDate?.toISOString() ?? null,
    workOrderRef: pr.workOrderRef,
    status: pr.status,
    _count: pr._count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yêu cầu mua hàng (YCMH)"
        description={`${prs.length} yêu cầu — Tân tạo → Lệ duyệt`}
        actions={
          <Link href="/purchase-requests/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Tạo YCMH
          </Link>
        }
      />

      {/* Status summary */}
      <div className="flex gap-3">
        {['draft', 'submitted', 'approved', 'ordered', 'received'].map((s) => {
          const count = prs.filter((pr) => pr.status === s).length;
          return (
            <div key={s} className="rounded-lg border border-steel-200 bg-white px-4 py-2">
              <Badge status={s} />
              <span className="ml-2 text-sm font-medium">{count}</span>
            </div>
          );
        })}
      </div>

      <PurchaseRequestsTable purchaseRequests={serializedPrs} />
    </div>
  );
}
