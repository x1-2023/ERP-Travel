import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { larkTemplates } from '@/lib/lark';

export const dynamic = 'force-dynamic';

/** GET /api/work-orders — Danh sách lệnh sản xuất */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') || '';

  const workOrders = await prisma.workOrder.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      item: true,
      bom: { select: { bomNo: true } },
      sourceWarehouse: { select: { name: true } },
      targetWarehouse: { select: { name: true } },
      _count: { select: { jobCards: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(workOrders);
}

/** POST /api/work-orders — Tạo lệnh sản xuất + notify Lark */
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Auto-generate WO number
  const lastWo = await prisma.workOrder.findFirst({ orderBy: { woNo: 'desc' } });
  const nextNum = lastWo
    ? parseInt(lastWo.woNo.split('-').pop() || '0') + 1
    : 1;
  const woNo = `WO-2026-${String(nextNum).padStart(4, '0')}`;

  const wo = await prisma.workOrder.create({
    data: {
      woNo,
      bomId: body.bomId,
      itemId: body.itemId,
      qtyToProduce: body.qtyToProduce,
      status: 'draft',
      plannedStart: body.plannedStart ? new Date(body.plannedStart) : null,
      plannedEnd: body.plannedEnd ? new Date(body.plannedEnd) : null,
      sourceWarehouseId: body.sourceWarehouseId,
      wipWarehouseId: body.wipWarehouseId,
      targetWarehouseId: body.targetWarehouseId,
      salesOrderRef: body.salesOrderRef,
      customerName: body.customerName,
      companyId: body.companyId,
    },
    include: { item: true, bom: true },
  });

  // Lark notification — thông báo cho xưởng
  larkTemplates.newWorkOrder(woNo, wo.item.itemName, Number(body.qtyToProduce)).catch(() => {});

  return NextResponse.json(wo, { status: 201 });
}
