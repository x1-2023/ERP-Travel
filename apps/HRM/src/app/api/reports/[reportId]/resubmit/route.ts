import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

// POST /api/reports/[reportId]/resubmit — RETURNED_* → SUBMITTED
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reportId } = await params

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      employee: {
        select: {
          fullName: true,
          department: { select: { managerId: true } },
        },
      },
    },
  })
  if (!report) {
    return NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 })
  }
  if (report.status !== "RETURNED_L1" && report.status !== "RETURNED_L2") {
    return NextResponse.json({ error: "Chỉ có thể nộp lại báo cáo đã bị trả" }, { status: 400 })
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      returnReason: null,
    },
  })

  await prisma.reportActivity.create({
    data: {
      reportId,
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "RESUBMITTED",
    },
  })

  // Notify DEPT_MANAGER
  try {
    if (report.employee.department?.managerId) {
      const manager = await prisma.employee.findUnique({
        where: { id: report.employee.department.managerId },
        select: { userId: true },
      })
      if (manager?.userId) {
        await notificationService.create({
          userId: manager.userId,
          type: "REPORT_SUBMITTED",
          title: "Báo cáo nộp lại",
          message: `${report.employee.fullName} đã nộp lại báo cáo ${report.type}`,
          link: `/reports/${reportId}`,
        })
      }
    }
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ data: updated })
}
