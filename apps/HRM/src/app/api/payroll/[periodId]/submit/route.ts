import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"
import { writeAudit } from "@/lib/services/audit.service"

// POST /api/payroll/[periodId]/submit — DRAFT → SUBMITTED
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { periodId } = await params

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
  })
  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy bảng lương" }, { status: 404 })
  }
  if (period.status !== "DRAFT") {
    return NextResponse.json({ error: "Bảng lương đã được nộp/duyệt" }, { status: 400 })
  }

  const epCount = await prisma.employeePayroll.count({ where: { periodId } })
  if (epCount === 0) {
    return NextResponse.json({ error: "Chưa có dữ liệu lương NV, vui lòng khởi tạo trước" }, { status: 400 })
  }

  const updated = await prisma.payrollPeriod.update({
    where: { id: periodId },
    data: {
      status: "SUBMITTED",
      submittedBy: session.user.id,
      submittedAt: new Date(),
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
      type: "PAYROLL",
      title: "Bảng lương cần duyệt",
      message: `Bảng lương tháng ${period.month}/${period.year} đã được nộp và cần duyệt`,
      link: `/payroll/${periodId}`,
    })
  } catch {
    // Non-blocking
  }

  await writeAudit({
    action: "UPDATE",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "PayrollPeriod",
    targetId: periodId,
    targetName: `Bảng lương ${period.month}/${period.year}`,
    metadata: { action: "SUBMIT" },
  })

  return NextResponse.json({ data: updated })
}
