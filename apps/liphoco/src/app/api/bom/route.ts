import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/bom — Danh sách BOM */
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';

  const boms = await prisma.bom.findMany({
    where: search
      ? {
          OR: [
            { bomNo: { contains: search, mode: 'insensitive' } },
            { item: { itemName: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : undefined,
    include: {
      item: true,
      bomItems: { include: { item: true, uomRef: true }, orderBy: { sortOrder: 'asc' } },
      bomOperations: {
        include: { operation: true, workstation: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { bomItems: true, bomOperations: true } },
    },
    orderBy: { bomNo: 'asc' },
  });

  return NextResponse.json(boms);
}

/** POST /api/bom — Tạo BOM mới */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const bom = await prisma.bom.create({
    data: {
      bomNo: body.bomNo,
      itemId: body.itemId,
      quantity: body.quantity || 1,
      isActive: true,
      isDefault: body.isDefault || false,
      withOperations: body.withOperations ?? true,
      companyId: body.companyId,
      bomItems: body.bomItems
        ? {
            create: body.bomItems.map((bi: any, i: number) => ({
              itemId: bi.itemId,
              qty: bi.qty,
              uomCode: bi.uom,
              rate: bi.rate || 0,
              amount: (bi.qty || 0) * (bi.rate || 0),
              sortOrder: i,
            })),
          }
        : undefined,
      bomOperations: body.bomOperations
        ? {
            create: body.bomOperations.map((bo: any, i: number) => ({
              operationId: bo.operationId,
              workstationId: bo.workstationId,
              timeInMins: bo.timeInMins || 0,
              hourRate: bo.hourRate || 0,
              operatingCost: ((bo.timeInMins || 0) / 60) * (bo.hourRate || 0),
              sortOrder: i,
            })),
          }
        : undefined,
    },
    include: {
      item: true,
      bomItems: { include: { item: true } },
      bomOperations: { include: { operation: true } },
    },
  });

  return NextResponse.json(bom, { status: 201 });
}
