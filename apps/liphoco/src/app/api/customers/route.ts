import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/customers */
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const status = req.nextUrl.searchParams.get('status') || '';

  const customers = await prisma.customer.findMany({
    where: {
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status: status as any }),
    },
    include: {
      contacts: true,
      _count: { select: { quotations: true, costingHistory: true } },
    },
    orderBy: { code: 'asc' },
  });

  return NextResponse.json(customers);
}

/** POST /api/customers */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const customer = await prisma.customer.create({
    data: {
      code: body.code,
      name: body.name,
      country: body.country,
      currency: body.currency || 'USD',
      pricingProfile: body.pricingProfile || 'new_customer',
      overheadPct: body.overheadPct ?? 20,
      profitPct: body.profitPct ?? 10,
      primaryContact: body.primaryContact,
      email: body.email,
      phone: body.phone,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
