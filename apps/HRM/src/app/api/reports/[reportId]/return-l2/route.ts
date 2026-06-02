import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

// POST /api/reports/[reportId]/return-l2 — APPROVED_L1 → RETURNED_L2
export async function POST(
  request: NextRequest,
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
  const body = await request.json()
  const { reason } = body

  if (!reason) {
    return NextResponse.json({ error: "Lý do trả lại là bắt buộc" }, { status: 400 })
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      employee: { select: { fullName: true, userId: true } },
    },
  })
  if (!report) {
    return NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 })
  }
  if (report.status !== "APPROVED_L1") {
    return NextResponse.json({ error: "Báo cáo không ở trạng thái chờ duyệt L2" }, { status: 400 })
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "RETURNED_L2",
      returnReason: reason,
    },
  })

  await prisma.reportActivity.create({
    data: {
      reportId,
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "RETURNED_L2",
      comment: reason,
    },
  })

  // Notify employee
  try {
    if (report.employee.userId) {
      await notificationService.create({
        userId: report.employee.userId,
        type: "REPORT_RETURNED",
        title: "Báo cáo bị trả lại (HR)",
        message: `Báo cáo ${report.type} bị trả lại: ${reason}`,
        link: `/reports/${reportId}`,
      })
    }
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ data: updated })
}
