import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/warehouses */
export async function GET() {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      _count: { select: { stockLedgers: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(warehouses);
}
