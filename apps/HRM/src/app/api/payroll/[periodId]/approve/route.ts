import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"
import { writeAudit } from "@/lib/services/audit.service"

// POST /api/payroll/[periodId]/approve — SUBMITTED → APPROVED
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

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
  })
  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy bảng lương" }, { status: 404 })
  }
  if (period.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Bảng lương chưa được nộp hoặc đã duyệt" }, { status: 400 })
  }

  // Optimistic lock: only update if still SUBMITTED (prevents concurrent approval)
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.payrollPeriod.updateMany({
      where: { id: periodId, status: "SUBMITTED" },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
    })
    if (updated.count === 0) {
      throw new Error("CONCURRENT_CONFLICT")
    }
    await tx.employeePayroll.updateMany({
      where: { periodId },
      data: { isLocked: true },
    })
    return updated
  })

  if (result.count === 0) {
    return NextResponse.json({ error: "Bảng lương đã được xử lý bởi người khác" }, { status: 409 })
  }

  // Notify HR_STAFF + ACCOUNTANT
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["HR_STAFF", "ACCOUNTANT"] },
        isActive: true,
      },
      select: { id: true },
    })
    await notificationService.createForMany({
      userIds: users.map((u) => u.id),
      type: "PAYROLL",
      title: "Bảng lương đã được duyệt",
      message: `Bảng lương tháng ${period.month}/${period.year} đã được duyệt, có thể xuất file ngân hàng`,
      link: `/payroll/${periodId}`,
    })
  } catch {
    // Non-blocking
  }

  await writeAudit({
    action: "APPROVE",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "PayrollPeriod",
    targetId: periodId,
    targetName: `Bảng lương ${period.month}/${period.year}`,
  })

  return NextResponse.json({
    data: { status: "APPROVED" },
    message: "Bảng lương đã được duyệt",
  })
}
