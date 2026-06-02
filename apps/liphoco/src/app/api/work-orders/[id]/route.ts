import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/work-orders/:id */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const wo = await prisma.workOrder.findUnique({
    where: { id: params.id },
    include: {
      item: true,
      bom: {
        include: {
          bomItems: { include: { item: true }, orderBy: { sortOrder: 'asc' } },
          bomOperations: { include: { operation: true, workstation: true }, orderBy: { sortOrder: 'asc' } },
        },
      },
      jobCards: { include: { operation: true, workstation: true }, orderBy: { createdAt: 'desc' } },
      sourceWarehouse: true,
      wipWarehouse: true,
      targetWarehouse: true,
    },
  });

  if (!wo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(wo);
}

/** PATCH /api/work-orders/:id — Cập nhật trạng thái */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const wo = await prisma.workOrder.update({
    where: { id: params.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.status === 'in_progress' && { actualStart: new Date() }),
      ...(body.status === 'completed' && { actualEnd: new Date() }),
      ...(body.qtyProduced !== undefined && { qtyProduced: body.qtyProduced }),
    },
    include: { item: true },
  });

  return NextResponse.json(wo);
}
