import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAudit } from "@/lib/services/audit.service"

// POST /api/reports/[reportId]/close — Close a single APPROVED_FINAL report
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { reportId } = await params

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      employee: { select: { fullName: true, employeeCode: true } },
    },
  })

  if (!report) {
    return NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 })
  }

  if (report.status !== "APPROVED_FINAL") {
    return NextResponse.json(
      { error: "Chỉ đóng báo cáo ở trạng thái APPROVED_FINAL" },
      { status: 400 }
    )
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  })

  await writeAudit({
    action: "REPORTS_BATCH_CLOSED",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "Report",
    targetId: reportId,
    targetName: `Đóng báo cáo — ${report.employee.fullName}`,
    metadata: { reportId },
  })

  return NextResponse.json({ data: updated })
}
