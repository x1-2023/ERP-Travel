import { Package, ClipboardList, Users, ShoppingCart, Warehouse, Factory } from 'lucide-react';
import prisma from '@/lib/db';
import { fmtNum } from '@/lib/utils';
import StatCard from '@/components/ui/stat-card';
import PageHeader from '@/components/layout/page-header';
import Badge from '@/components/ui/badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [
    itemCount,
    woStats,
    customerCount,
    prPending,
    recentWOs,
    recentQuotes,
  ] = await Promise.all([
    prisma.item.count(),
    prisma.workOrder.groupBy({ by: ['status'], _count: true }),
    prisma.customer.count({ where: { status: 'active' } }),
    prisma.purchaseRequest.count({ where: { status: 'submitted' } }),
    prisma.workOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { item: { select: { itemName: true } } },
    }),
    prisma.quotation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const woInProgress = woStats.find((s) => s.status === 'in_progress')?._count || 0;
  const woTotal = woStats.reduce((sum, s) => sum + s._count, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Tổng quan hệ thống LIPHOCO ERP" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Vật tư" value={fmtNum(itemCount)} icon={Package} subtitle="NVL + BTP + TP" />
        <StatCard
          title="Lệnh SX"
          value={fmtNum(woTotal)}
          icon={Factory}
          subtitle={`${woInProgress} đang chạy`}
        />
        <StatCard title="Khách hàng" value={fmtNum(customerCount)} icon={Users} subtitle="Active" />
        <StatCard
          title="YCMH chờ duyệt"
          value={fmtNum(prPending)}
          icon={ShoppingCart}
          subtitle="Cần Lệ phê duyệt"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Work Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-steel-700">Lệnh SX gần đây</h2>
            <Link href="/work-orders" className="text-xs text-brand-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentWOs.map((wo) => (
              <div key={wo.id} className="flex items-center justify-between rounded-lg border border-steel-100 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-steel-800">{wo.woNo}</p>
                  <p className="text-xs text-steel-400">{wo.item.itemName}</p>
                </div>
                <Badge status={wo.status} />
              </div>
            ))}
            {recentWOs.length === 0 && (
              <p className="text-sm text-steel-400 text-center py-4">Chưa có lệnh sản xuất</p>
            )}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-steel-700">Báo giá gần đây</h2>
            <Link href="/quotations" className="text-xs text-brand-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentQuotes.map((qt) => (
              <div key={qt.id} className="flex items-center justify-between rounded-lg border border-steel-100 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-steel-800">{qt.quoteNo}</p>
                  <p className="text-xs text-steel-400">{qt.customer?.name || '—'}</p>
                </div>
                <div className="text-right">
                  <Badge status={qt.status} />
                  {qt.sellPriceUsd && (
                    <p className="mt-1 text-xs font-medium text-steel-600">
                      ${Number(qt.sellPriceUsd).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {recentQuotes.length === 0 && (
              <p className="text-sm text-steel-400 text-center py-4">Chưa có báo giá</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
