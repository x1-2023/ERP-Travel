import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/items/groups — Danh sách nhóm vật tư (tree) */
export async function GET() {
  const groups = await prisma.itemGroup.findMany({
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json(groups);
}
