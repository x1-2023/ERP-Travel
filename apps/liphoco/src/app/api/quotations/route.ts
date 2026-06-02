import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { larkTemplates } from '@/lib/lark';

export const dynamic = 'force-dynamic';

/** GET /api/quotations */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') || '';
  const customerId = req.nextUrl.searchParams.get('customerId') || '';

  const quotations = await prisma.quotation.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(customerId && { customerId }),
    },
    include: {
      customer: { select: { code: true, name: true, country: true } },
      item: { select: { itemCode: true, itemName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(quotations);
}

/** POST /api/quotations — Tạo báo giá + notify Lark CRM */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const lastQt = await prisma.quotation.findFirst({ orderBy: { quoteNo: 'desc' } });
  const nextNum = lastQt ? parseInt(lastQt.quoteNo.split('-').pop() || '0') + 1 : 1;
  const quoteNo = `QT-2026-${String(nextNum).padStart(4, '0')}`;

  const quotation = await prisma.quotation.create({
    data: {
      quoteNo,
      customerId: body.customerId,
      itemId: body.itemId,
      itemDescription: body.itemDescription,
      quantity: body.quantity,
      weightPerUnit: body.weightPerUnit,
      totalWeight: body.totalWeight,
      productionCostVnd: body.productionCostVnd,
      sellPriceVnd: body.sellPriceVnd,
      sellPriceUsd: body.sellPriceUsd,
      pricePerKgVnd: body.pricePerKgVnd,
      pricePerKgUsd: body.pricePerKgUsd,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      notes: body.notes,
      costBreakdown: body.costBreakdown,
    },
    include: { customer: true },
  });

  // Lark CRM notification
  if (quotation.customer && quotation.sellPriceUsd) {
    larkTemplates
      .newQuotation(quoteNo, quotation.customer.name, Number(quotation.sellPriceUsd))
      .catch(() => {});
  }

  return NextResponse.json(quotation, { status: 201 });
}
