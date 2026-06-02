import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"
import { writeAudit } from "@/lib/services/audit.service"

export async function POST(
  request: Request,
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
  if (period.status === "PAID") {
    return NextResponse.json({ error: "Bảng lương đã được đánh dấu thanh toán" }, { status: 400 })
  }
  if (period.status !== "APPROVED") {
    return NextResponse.json({ error: "Bảng lương chưa được phê duyệt" }, { status: 400 })
  }

  // Parse optional paidAt from body
  let paidAt = new Date()
  try {
    const body = await request.json()
    if (body.paidAt) {
      paidAt = new Date(body.paidAt)
    }
  } catch {
    // No body or invalid JSON — use default now()
  }

  // 1. Update period status to PAID
  await prisma.payrollPeriod.update({
    where: { id: periodId },
    data: {
      status: "PAID",
      paidAt,
    },
  })

  // 2. Mark APPROVED advances for this period's month/year as DEDUCTED
  const advancesUpdated = await prisma.salaryAdvance.updateMany({
    where: {
      status: "APPROVED",
      deductMonth: period.month,
      deductYear: period.year,
    },
    data: {
      status: "DEDUCTED",
    },
  })

  // 3. Write audit log
  await writeAudit({
    action: "PAYROLL_MARK_PAID",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "PayrollPeriod",
    targetId: periodId,
    targetName: `Bảng lương ${period.month}/${period.year}`,
    metadata: {
      paidAt: paidAt.toISOString(),
      advancesDeducted: advancesUpdated.count,
    },
  })

  // 4. Notify HR_STAFF
  try {
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ["HR_STAFF", "ACCOUNTANT"] },
        isActive: true,
      },
      select: { id: true },
    })
    await notificationService.createForMany({
      userIds: staffUsers.map((u) => u.id),
      type: "PAYROLL",
      title: "Bảng lương đã thanh toán",
      message: `Bảng lương tháng ${period.month}/${period.year} đã được đánh dấu đã thanh toán`,
      link: `/payroll/${periodId}`,
    })
  } catch {
    // Non-blocking
  }

  return NextResponse.json({
    data: { status: "PAID", paidAt: paidAt.toISOString() },
    message: "Bảng lương đã được đánh dấu thanh toán",
    advancesDeducted: advancesUpdated.count,
  })
}
