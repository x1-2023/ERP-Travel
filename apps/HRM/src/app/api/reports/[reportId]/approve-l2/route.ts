import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"
import { calculateOTRate } from "@/lib/calculators/report"

// POST /api/reports/[reportId]/approve-l2 — APPROVED_L1 → APPROVED_FINAL + auto PayrollItem
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
      employee: {
        select: {
          id: true,
          fullName: true,
          userId: true,
          status: true,
          contracts: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { baseSalary: true },
          },
        },
      },
    },
  })
  if (!report) {
    return NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 })
  }
  if (report.status !== "APPROVED_L1") {
    return NextResponse.json({ error: "Báo cáo không ở trạng thái chờ duyệt L2" }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = report.payload as Record<string, any>

  // Determine PayrollItem creation
  let payrollItemId: string | null = null
  let payrollPeriodId: string | null = null

  const shouldCreatePayrollItem =
    report.type === "BUSINESS_TRIP" ||
    report.type === "OVERTIME"

  if (shouldCreatePayrollItem) {
    // Find or create DRAFT payroll period for current month
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    let period = await prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
    })

    if (!period) {
      period = await prisma.payrollPeriod.create({
        data: { month, year, createdBy: session.user.id },
      })
    }

    if (period.status !== "DRAFT" && period.status !== "SUBMITTED") {
      // Period already approved — still create item but warn
      console.log(`[Report] WARNING: PayrollPeriod ${month}/${year} is ${period.status}, creating item anyway`)
    }

    // Find EmployeePayroll in this period
    const empPayroll = await prisma.employeePayroll.findUnique({
      where: {
        periodId_employeeId: {
          periodId: period.id,
          employeeId: report.employeeId,
        },
      },
    })

    // If no EmployeePayroll exists, we can't add items
    // The PayrollItem still gets created for audit
    if (empPayroll) {
      // Map report type to PayrollItemType + calculate amount
      let itemType: string
      let amount: number

      if (report.type === "BUSINESS_TRIP") {
        itemType = "BUSINESS_TRIP"
        amount = (payload.nightCount || 0) * (payload.allowancePerDay || 0)
      } else {
        // OVERTIME
        const otTypeMap: Record<string, string> = {
          WEEKDAY: "OT_WEEKDAY",
          WEEKEND: "OT_WEEKEND",
          HOLIDAY: "OT_HOLIDAY",
          NIGHT_SHIFT: "NIGHT_SHIFT",
        }
        itemType = otTypeMap[payload.otType] || "OT_WEEKDAY"

        const baseSalary = Number(report.employee.contracts[0]?.baseSalary ?? 0)
        const hours = payload.hours || 0
        amount = calculateOTRate(baseSalary, 26, hours, payload.otType)
      }

      if (amount > 0) {
        const item = await prisma.payrollItem.create({
          data: {
            employeePayrollId: empPayroll.id,
            type: itemType as never,
            amount,
            description: `Từ báo cáo ${report.type}`,
            sourceId: reportId,
            sourceType: report.type === "OVERTIME" ? "REPORT_OT" : "REPORT_TRIP",
          },
        })
        payrollItemId = item.id
        payrollPeriodId = period.id
      }
    }
  }

  // Handle LEAVE_PAID — update leave balance
  if (report.type === "LEAVE_PAID") {
    const dayCount = payload.dayCount || 0
    if (dayCount > 0) {
      const currentYear = new Date().getFullYear()
      await prisma.leaveBalance.upsert({
        where: { employeeId_year: { employeeId: report.employeeId, year: currentYear } },
        create: {
          employeeId: report.employeeId,
          year: currentYear,
          totalDays: 12,
          usedDays: dayCount,
          remainingDays: 12 - dayCount,
        },
        update: {
          usedDays: { increment: dayCount },
          remainingDays: { decrement: dayCount },
        },
      })
    }
  }

  // Update report
  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "APPROVED_FINAL",
      l2ApproverId: session.user.id,
      l2ApprovedAt: new Date(),
      returnReason: null,
      payrollItemId,
      payrollPeriodId,
    },
  })

  await prisma.reportActivity.create({
    data: {
      reportId,
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "APPROVED_FINAL",
    },
  })

  // Notify employee
  try {
    if (report.employee.userId) {
      await notificationService.create({
        userId: report.employee.userId,
        type: "REPORT_APPROVED",
        title: "Báo cáo đã được duyệt",
        message: `Báo cáo ${report.type} đã được duyệt`,
        link: `/reports/${reportId}`,
      })
    }
    // Notify HR_STAFF about PayrollItem
    if (payrollItemId) {
      await notificationService.notifyHR({
        type: "PAYROLL",
        title: "Đã thêm khoản vào bảng lương",
        message: `Báo cáo ${report.type} của ${report.employee.fullName} đã được thêm vào bảng lương`,
        link: `/payroll/${payrollPeriodId}`,
      })
    }
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ data: updated })
}
