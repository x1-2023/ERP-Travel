import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculatePayroll } from "@/lib/calculators/payroll"
import { DAY_VALUES } from "@/lib/config/attendance"

// POST /api/attendance/sync-payroll — Sync attendance data into payroll
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { month, year } = body

  if (!month || !year) {
    return NextResponse.json({ error: "Tháng/năm là bắt buộc" }, { status: 400 })
  }

  // Find payroll period
  const period = await prisma.payrollPeriod.findUnique({
    where: { month_year: { month, year } },
  })

  if (!period) {
    return NextResponse.json(
      { error: "Chưa có bảng lương tháng này. Tạo bảng lương trước." },
      { status: 404 }
    )
  }

  if (period.status !== "DRAFT") {
    return NextResponse.json(
      { error: `Bảng lương tháng ${month} đã được nộp duyệt, không thể sync` },
      { status: 400 }
    )
  }

  // Get attendance records for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  const records = await prisma.attendanceRecord.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
  })

  // Build attendance summary per employee
  const attendanceSummary: Record<string, number> = {}
  for (const r of records) {
    const dayValue = DAY_VALUES[r.status] || 0
    attendanceSummary[r.employeeId] = (attendanceSummary[r.employeeId] || 0) + dayValue
  }

  // Get all EmployeePayrolls for this period
  const empPayrolls = await prisma.employeePayroll.findMany({
    where: { periodId: period.id },
    include: { items: true, employee: { select: { status: true } } },
  })

  let synced = 0
  let skipped = 0

  for (const ep of empPayrolls) {
    const actualDays = attendanceSummary[ep.employeeId]
    if (actualDays === undefined) {
      skipped++
      continue
    }

    // Recalculate payroll with new actualDays
    const getItemAmount = (type: string) =>
      ep.items.filter((i) => i.type === type).reduce((s, i) => s + Number(i.amount), 0)

    const result = calculatePayroll({
      baseSalary: Number(ep.baseSalary),
      mealAllowance: Number(ep.mealAllowance),
      phoneAllowance: Number(ep.phoneAllowance),
      fuelAllowance: Number(ep.fuelAllowance),
      perfAllowance: Number(ep.perfAllowance),
      actualDays,
      standardDays: Number(ep.standardDays),
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
      advanceDeduction: Number(ep.advanceDeduction),
      dependentCount: ep.dependentCount,
      isProbation: ep.employee.status === "PROBATION",
    })

    await prisma.employeePayroll.update({
      where: { id: ep.id },
      data: {
        actualDays,
        totalContractSalary: result.totalContractSalary,
        totalActualSalary: result.totalActualSalary,
        totalIncome: result.totalIncome,
        taxableIncome: result.taxableIncome,
        pitAmount: result.pitAmount,
        netSalary: result.netSalary,
        totalEmployeeIns: result.totalEmployeeIns,
        bhxhEmployee: result.bhxhEmployee,
        bhytEmployee: result.bhytEmployee,
        bhtnEmployee: result.bhtnEmployee,
        totalEmployerIns: result.totalEmployerIns,
        bhxhEmployer: result.bhxhEmployer,
        bhytEmployer: result.bhytEmployer,
        bhtnEmployer: result.bhtnEmployer,
        bhtnldEmployer: result.bhtnldEmployer,
      },
    })

    synced++
  }

  return NextResponse.json({
    synced,
    skipped,
    message: `Đã sync ${synced} nhân viên. ${skipped > 0 ? `${skipped} nhân viên chưa có dữ liệu chấm công (giữ nguyên).` : ""}`,
  })
}
