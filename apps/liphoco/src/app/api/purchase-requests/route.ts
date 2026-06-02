import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { larkTemplates } from '@/lib/lark';

export const dynamic = 'force-dynamic';

/** GET /api/purchase-requests */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') || '';

  const prs = await prisma.purchaseRequest.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      items: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(prs);
}

/** POST /api/purchase-requests — Tạo YCMH + notify Lệ duyệt */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const lastPr = await prisma.purchaseRequest.findFirst({ orderBy: { prNo: 'desc' } });
  const nextNum = lastPr ? parseInt(lastPr.prNo.split('-').pop() || '0') + 1 : 1;
  const prNo = `YCMH-${String(nextNum).padStart(4, '0')}`;

  const pr = await prisma.purchaseRequest.create({
    data: {
      prNo,
      requestedBy: body.requestedBy || 'Tân',
      status: 'submitted',
      workOrderRef: body.workOrderRef,
      requiredDate: body.requiredDate ? new Date(body.requiredDate) : null,
      remarks: body.remarks,
      items: body.items
        ? {
            create: body.items.map((item: any) => ({
              itemId: item.itemId || null,
              itemCode: item.itemCode,
              itemName: item.itemName,
              qty: item.qty,
              uom: item.uom,
              requiredDate: item.requiredDate ? new Date(item.requiredDate) : null,
              supplier: item.supplier,
              remarks: item.remarks,
            })),
          }
        : undefined,
    },
    include: { items: true },
  });

  // Lark: notify Lệ to approve
  larkTemplates.prNeedApproval(prNo, body.requestedBy || 'Tân').catch(() => {});

  return NextResponse.json(pr, { status: 201 });
}
