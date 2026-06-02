import prisma from '@/lib/db';
import PageHeader from '@/components/layout/page-header';
import CustomersTable from '@/components/customers/customers-table';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: { select: { quotations: true, costingHistory: true, contacts: true } },
    },
    orderBy: { code: 'asc' },
  });

  // Serialize data
  const serializedCustomers = customers.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    country: c.country,
    currency: c.currency,
    pricingProfile: c.pricingProfile,
    overheadPct: Number(c.overheadPct),
    profitPct: Number(c.profitPct),
    status: c.status,
    _count: { quotations: c._count.quotations },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khách hàng"
        description={`${customers.length} khách — Thị trường Mỹ, EU, Úc`}
        actions={
          <Link href="/customers/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Thêm khách
          </Link>
        }
      />
      <CustomersTable customers={serializedCustomers} />
    </div>
  );
}
