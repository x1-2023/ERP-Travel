import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

// POST /api/reports/[reportId]/approve-l1 — SUBMITTED → APPROVED_L1
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "DEPT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { reportId } = await params

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      employee: {
        select: {
          fullName: true,
          userId: true,
          department: { select: { id: true, managerId: true } },
        },
      },
    },
  })
  if (!report) {
    return NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 })
  }
  if (report.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Báo cáo không ở trạng thái chờ duyệt L1" }, { status: 400 })
  }

  // DEPT_MANAGER: verify they manage this employee's dept
  if (session.user.role === "DEPT_MANAGER") {
    const userEmployee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!userEmployee || report.employee.department?.managerId !== userEmployee.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "APPROVED_L1",
      l1ApproverId: session.user.id,
      l1ApprovedAt: new Date(),
      returnReason: null,
    },
  })

  await prisma.reportActivity.create({
    data: {
      reportId,
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "APPROVED_L1",
    },
  })

  // Notify HR_MANAGER
  try {
    const hrManagers = await prisma.user.findMany({
      where: { role: "HR_MANAGER", isActive: true },
      select: { id: true },
    })
    await notificationService.createForMany({
      userIds: hrManagers.map((u) => u.id),
      type: "REPORT_SUBMITTED",
      title: "Báo cáo cần duyệt L2",
      message: `Báo cáo ${report.type} của ${report.employee.fullName} đã qua duyệt L1`,
      link: `/reports/${reportId}`,
    })
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ data: updated })
}
