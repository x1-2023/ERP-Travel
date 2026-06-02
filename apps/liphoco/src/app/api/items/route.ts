import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/items — Danh sách vật tư + filter */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get('search') || '';
  const group = searchParams.get('group') || '';
  const type = searchParams.get('type') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  const where = {
    ...(search && {
      OR: [
        { itemCode: { contains: search, mode: 'insensitive' as const } },
        { itemName: { contains: search, mode: 'insensitive' as const } },
        { erpCode: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(group && { itemGroup: group }),
    ...(type && { itemType: type as any }),
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: { group: true, uomRef: true },
      orderBy: { itemCode: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.item.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

/** POST /api/items — Tạo vật tư mới */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const item = await prisma.item.create({
    data: {
      itemCode: body.itemCode,
      itemName: body.itemName,
      itemGroup: body.itemGroup,
      uomCode: body.uom,
      description: body.description,
      itemType: body.itemType || 'raw_material',
      valuationRate: body.valuationRate || 0,
      standardRate: body.standardRate || 0,
      materialGrade: body.materialGrade,
      thicknessMm: body.thicknessMm,
      outerDiameterMm: body.outerDiameterMm,
      widthMm: body.widthMm,
      heightMm: body.heightMm,
      lengthMm: body.lengthMm,
      weightPerMeter: body.weightPerMeter,
      weightPerUnit: body.weightPerUnit,
      hsCode: body.hsCode,
      erpCode: body.erpCode,
    },
    include: { group: true, uomRef: true },
  });

  return NextResponse.json(item, { status: 201 });
}
