import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAudit } from "@/lib/services/audit.service"

// POST /api/reports/batch-close — Close all APPROVED_FINAL reports for a payroll period
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { periodId } = body

  if (!periodId) {
    return NextResponse.json({ error: "Thiếu periodId" }, { status: 400 })
  }

  // Verify payroll period is PAID
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
  })
  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy bảng lương" }, { status: 404 })
  }
  if (period.status !== "PAID") {
    return NextResponse.json(
      { error: "Chỉ đóng báo cáo khi bảng lương đã thanh toán (PAID)" },
      { status: 400 }
    )
  }

  // Find all APPROVED_FINAL reports linked to this period
  const reports = await prisma.report.findMany({
    where: {
      payrollPeriodId: periodId,
      status: "APPROVED_FINAL",
    },
    include: {
      employee: { select: { fullName: true, employeeCode: true } },
    },
  })

  if (reports.length === 0) {
    return NextResponse.json(
      { error: "Không có báo cáo APPROVED_FINAL nào để đóng" },
      { status: 400 }
    )
  }

  // Batch update
  const now = new Date()
  await prisma.report.updateMany({
    where: {
      payrollPeriodId: periodId,
      status: "APPROVED_FINAL",
    },
    data: {
      status: "CLOSED",
      closedAt: now,
    },
  })

  // Audit
  await writeAudit({
    action: "REPORTS_BATCH_CLOSED",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "Report",
    targetId: periodId,
    targetName: `Đóng ${reports.length} báo cáo — T${period.month}/${period.year}`,
    metadata: {
      periodId,
      month: period.month,
      year: period.year,
      count: reports.length,
      reportIds: reports.map((r) => r.id),
    },
  })

  return NextResponse.json({
    data: { closedCount: reports.length },
  })
}
