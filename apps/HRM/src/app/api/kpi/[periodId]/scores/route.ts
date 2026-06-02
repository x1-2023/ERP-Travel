import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DEFAULT_KPI_RATE } from "@/lib/config/kpi"

// PUT /api/kpi/[periodId]/scores — Bulk upsert scores
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { periodId } = await params

  const period = await prisma.kPIPeriod.findUnique({ where: { id: periodId } })
  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  }
  if (period.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Chỉ có thể nhập điểm khi KPI ở trạng thái Nháp" },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { scores } = body as {
    scores: { employeeId: string; score: number; kpiAmount?: number; notes?: string }[]
  }

  if (!scores || !Array.isArray(scores)) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })
  }

  let updated = 0
  for (const s of scores) {
    if (s.score < 0 || s.score > 100) continue

    const kpiAmount = s.kpiAmount ?? Math.round(s.score * DEFAULT_KPI_RATE)

    await prisma.kPIScore.upsert({
      where: {
        periodId_employeeId: { periodId, employeeId: s.employeeId },
      },
      create: {
        periodId,
        employeeId: s.employeeId,
        score: s.score,
        kpiAmount,
        notes: s.notes || null,
        enteredBy: session.user.id,
      },
      update: {
        score: s.score,
        kpiAmount,
        notes: s.notes || null,
        enteredBy: session.user.id,
      },
    })
    updated++
  }

  return NextResponse.json({ updated })
}
