import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/costing — Lịch sử tính giá */
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customerId') || '';

  const history = await prisma.costingHistory.findMany({
    where: customerId ? { customerId } : undefined,
    include: { customer: { select: { code: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json(history);
}

/** POST /api/costing — Lưu kết quả tính giá từ AI Copilot */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const record = await prisma.costingHistory.create({
    data: {
      projectName: body.projectName,
      customerId: body.customerId,
      itemDescription: body.itemDescription,
      drawingFilePath: body.drawingFilePath,
      totalWeightKg: body.totalWeightKg,
      quantity: body.quantity,
      surfaceFinish: body.surfaceFinish,
      materialCost: body.materialCost,
      fabricationCost: body.fabricationCost,
      surfaceCost: body.surfaceCost,
      packagingFobCost: body.packagingFobCost,
      productionCost: body.productionCost,
      overhead: body.overhead,
      profit: body.profit,
      sellPriceVnd: body.sellPriceVnd,
      sellPriceUsd: body.sellPriceUsd,
      pricePerKg: body.pricePerKg,
      bomData: body.bomData,
      costBreakdown: body.costBreakdown,
      pricingProfile: body.pricingProfile,
      exchangeRate: body.exchangeRate || 24500,
    },
    include: { customer: true },
  });

  return NextResponse.json(record, { status: 201 });
}
