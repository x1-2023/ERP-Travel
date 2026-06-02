import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/job-cards */
export async function GET(req: NextRequest) {
  const woId = req.nextUrl.searchParams.get('workOrderId') || '';
  const status = req.nextUrl.searchParams.get('status') || '';

  const jobCards = await prisma.jobCard.findMany({
    where: {
      ...(woId && { workOrderId: woId }),
      ...(status && { status: status as any }),
    },
    include: {
      workOrder: { select: { woNo: true } },
      operation: true,
      workstation: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(jobCards);
}

/** POST /api/job-cards — Tạo phiếu công việc */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const lastJc = await prisma.jobCard.findFirst({ orderBy: { jobNo: 'desc' } });
  const nextNum = lastJc ? parseInt(lastJc.jobNo.split('-').pop() || '0') + 1 : 1;
  const jobNo = `JC-2026-${String(nextNum).padStart(4, '0')}`;

  const jc = await prisma.jobCard.create({
    data: {
      jobNo,
      workOrderId: body.workOrderId,
      operationId: body.operationId,
      workstationId: body.workstationId,
      qtyToProduce: body.qtyToProduce,
      workerName: body.workerName,
    },
    include: { operation: true, workstation: true },
  });

  return NextResponse.json(jc, { status: 201 });
}
