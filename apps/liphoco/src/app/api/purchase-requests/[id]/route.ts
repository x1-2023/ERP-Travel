import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** PATCH /api/purchase-requests/:id — Duyệt/Reject YCMH */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const pr = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.approvedBy && { approvedBy: body.approvedBy }),
    },
    include: { items: true },
  });

  return NextResponse.json(pr);
}
