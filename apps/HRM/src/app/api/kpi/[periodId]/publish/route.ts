import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAudit } from "@/lib/services/audit.service"

// POST /api/kpi/[periodId]/publish — DRAFT → PUBLISHED
export async function POST(
  _request: Request,
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

  const period = await prisma.kPIPeriod.findUnique({
    where: { id: periodId },
    include: { _count: { select: { scores: true } } },
  })

  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  }

  if (period.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Chỉ có thể công bố KPI ở trạng thái Nháp" },
      { status: 400 }
    )
  }

  if (period._count.scores === 0) {
    return NextResponse.json(
      { error: "Chưa có điểm KPI nào để công bố" },
      { status: 400 }
    )
  }

  await prisma.kPIPeriod.update({
    where: { id: periodId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })

  await writeAudit({
    action: "KPI_PUBLISH",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "KPIPeriod",
    targetId: periodId,
    targetName: `KPI ${period.month}/${period.year}`,
    metadata: { action: "PUBLISH", scoreCount: period._count.scores },
  })

  return NextResponse.json({ message: "Đã công bố KPI" })
}
