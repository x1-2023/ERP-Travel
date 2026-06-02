import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculatePayroll } from "@/lib/calculators/payroll"
import { notificationService } from "@/lib/services/notification.service"
import { writeAudit } from "@/lib/services/audit.service"

// POST /api/advances/[id]/approve — HR_MANAGER approves
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { deductMonth, deductYear } = body

  if (!deductMonth || !deductYear) {
    return NextResponse.json(
      { error: "Tháng/năm trừ lương là bắt buộc" },
      { status: 400 }
    )
  }

  // Validate deductMonth/Year is current or next month
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const isCurrentMonth = deductMonth === currentMonth && deductYear === currentYear
  const isNextMonth =
    (deductMonth === currentMonth + 1 && deductYear === currentYear) ||
    (deductMonth === 1 && currentMonth === 12 && deductYear === currentYear + 1)

  if (!isCurrentMonth && !isNextMonth) {
    return NextResponse.json(
      { error: "Chỉ được chọn tháng hiện tại hoặc tháng sau" },
      { status: 400 }
    )
  }

  const advance = await prisma.salaryAdvance.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true, fullName: true, userId: true, status: true,
          contracts: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  if (!advance) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  }

  if (advance.status !== "PENDING") {
    return NextResponse.json(
      { error: "Yêu cầu không ở trạng thái chờ duyệt" },
      { status: 400 }
    )
  }

  // Find or create PayrollPeriod
  let period = await prisma.payrollPeriod.findUnique({
    where: { month_year: { month: deductMonth, year: deductYear } },
  })

  if (!period) {
    period = await prisma.payrollPeriod.create({
      data: {
        month: deductMonth,
        year: deductYear,
        createdBy: session.user.id,
      },
    })
  }

  if (!["DRAFT"].includes(period.status)) {
    return NextResponse.json(
      { error: `Bảng lương tháng ${deductMonth}/${deductYear} đã ${period.status}, không thể thêm tạm ứng` },
      { status: 400 }
    )
  }

  // Find EmployeePayroll
  const empPayroll = await prisma.employeePayroll.findUnique({
    where: {
      periodId_employeeId: {
        periodId: period.id,
        employeeId: advance.employeeId,
      },
    },
    include: { items: true },
  })

  const advanceAmount = Number(advance.amount)

  if (empPayroll) {
    // Create PayrollItem and update advance deduction
    const payrollItem = await prisma.payrollItem.create({
      data: {
        employeePayrollId: empPayroll.id,
        type: "ADVANCE_DEDUCTION",
        amount: advanceAmount,
        description: `Tạm ứng: ${advance.reason}`,
        sourceId: advance.id,
        sourceType: "SALARY_ADVANCE",
      },
    })

    // Recalculate payroll
    const existingItems = empPayroll.items
    const getItemAmount = (type: string) =>
      existingItems.filter((i) => i.type === type).reduce((s, i) => s + Number(i.amount), 0)

    const totalAdvance = Number(empPayroll.advanceDeduction) + advanceAmount

    const result = calculatePayroll({
      baseSalary: Number(empPayroll.baseSalary),
      mealAllowance: Number(empPayroll.mealAllowance),
      phoneAllowance: Number(empPayroll.phoneAllowance),
      fuelAllowance: Number(empPayroll.fuelAllowance),
      perfAllowance: Number(empPayroll.perfAllowance),
      actualDays: Number(empPayroll.actualDays),
      standardDays: Number(empPayroll.standardDays),
      otWeekday: getItemAmount("OT_WEEKDAY"),
      otWeekend: getItemAmount("OT_WEEKEND"),
      otHoliday: getItemAmount("OT_HOLIDAY"),
      nightShift: getItemAmount("NIGHT_SHIFT"),
      businessTrip: getItemAmount("BUSINESS_TRIP"),
      hazardAllowance: getItemAmount("HAZARD_ALLOWANCE"),
      otherAllowance: getItemAmount("OTHER_ALLOWANCE"),
      kpiCurrent: getItemAmount("KPI_CURRENT"),
      kpiPrev1: getItemAmount("KPI_PREV1"),
      kpiPrev2: getItemAmount("KPI_PREV2"),
      advanceDeduction: totalAdvance,
      dependentCount: empPayroll.dependentCount,
      isProbation: advance.employee.status === "PROBATION",
    })

    await prisma.employeePayroll.update({
      where: { id: empPayroll.id },
      data: {
        advanceDeduction: totalAdvance,
        netSalary: result.netSalary,
        taxableIncome: result.taxableIncome,
        pitAmount: result.pitAmount,
        totalIncome: result.totalIncome,
      },
    })

    // Update advance
    await prisma.salaryAdvance.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
        deductMonth,
        deductYear,
        payrollItemId: payrollItem.id,
      },
    })
  } else {
    // No EmployeePayroll yet — just approve, PayrollItem will be created when period initializes
    await prisma.salaryAdvance.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
        deductMonth,
        deductYear,
      },
    })
  }

  // Notify employee
  try {
    if (advance.employee.userId) {
      await notificationService.create({
        userId: advance.employee.userId,
        type: "GENERAL",
        title: "Tạm ứng được duyệt",
        message: `Tạm ứng ${advanceAmount.toLocaleString("vi-VN")}đ đã được duyệt, sẽ trừ vào lương ${deductMonth}/${deductYear}`,
        link: "/advances",
      })
    }
  } catch {
    // Don't block
  }

  await writeAudit({
    action: "APPROVE",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "SalaryAdvance",
    targetId: id,
    targetName: `Tạm ứng ${advance.employee.fullName} ${advanceAmount.toLocaleString("vi-VN")}đ`,
    metadata: { deductMonth, deductYear },
  })

  return NextResponse.json({ message: "Đã duyệt tạm ứng" })
}
