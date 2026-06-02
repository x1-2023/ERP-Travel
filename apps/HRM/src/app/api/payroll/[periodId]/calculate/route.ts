import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculatePayroll } from "@/lib/calculators/payroll"

// POST /api/payroll/[periodId]/calculate — Recalculate all or one employee
export async function POST(
  request: NextRequest,
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
  if (period.status === "APPROVED" || period.status === "PAID") {
    return NextResponse.json({ error: "Bảng lương đã duyệt, không thể tính lại" }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const { employeePayrollId } = body as { employeePayrollId?: string }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { periodId }
  if (employeePayrollId) {
    where.id = employeePayrollId
  }

  const employeePayrolls = await prisma.employeePayroll.findMany({
    where,
    include: {
      items: true,
      employee: {
        select: { status: true },
      },
    },
  })

  let recalculated = 0

  for (const ep of employeePayrolls) {
    // Sum items by type
    const itemSums: Record<string, number> = {}
    for (const item of ep.items) {
      itemSums[item.type] = (itemSums[item.type] || 0) + Number(item.amount)
    }

    const isProbation = ep.employee.status === "PROBATION"

    const result = calculatePayroll({
      baseSalary: Number(ep.baseSalary),
      mealAllowance: Number(ep.mealAllowance),
      phoneAllowance: Number(ep.phoneAllowance),
      fuelAllowance: Number(ep.fuelAllowance),
      perfAllowance: Number(ep.perfAllowance),
      actualDays: Number(ep.actualDays),
      standardDays: Number(ep.standardDays),
      otWeekday: itemSums["OT_WEEKDAY"] || 0,
      otWeekend: itemSums["OT_WEEKEND"] || 0,
      otHoliday: itemSums["OT_HOLIDAY"] || 0,
      nightShift: itemSums["NIGHT_SHIFT"] || 0,
      businessTrip: itemSums["BUSINESS_TRIP"] || 0,
      hazardAllowance: itemSums["HAZARD_ALLOWANCE"] || 0,
      otherAllowance: itemSums["OTHER_ALLOWANCE"] || 0,
      kpiCurrent: itemSums["KPI_CURRENT"] || 0,
      kpiPrev1: itemSums["KPI_PREV1"] || 0,
      kpiPrev2: itemSums["KPI_PREV2"] || 0,
      advanceDeduction: Number(ep.advanceDeduction),
      dependentCount: ep.dependentCount,
      isProbation,
    })

    await prisma.employeePayroll.update({
      where: { id: ep.id },
      data: {
        totalContractSalary: result.totalContractSalary,
        totalActualSalary: result.totalActualSalary,
        totalIncome: result.totalIncome,
        insuranceBase: result.insuranceBase,
        bhxhEmployee: result.bhxhEmployee,
        bhytEmployee: result.bhytEmployee,
        bhtnEmployee: result.bhtnEmployee,
        totalEmployeeIns: result.totalEmployeeIns,
        personalDeduction: result.personalDeduction,
        dependentDeduction: result.dependentDeduction,
        taxableIncome: result.taxableIncome,
        pitAmount: result.pitAmount,
        netSalary: result.netSalary,
        bhxhEmployer: result.bhxhEmployer,
        bhytEmployer: result.bhytEmployer,
        bhtnEmployer: result.bhtnEmployer,
        bhtnldEmployer: result.bhtnldEmployer,
        totalEmployerIns: result.totalEmployerIns,
      },
    })
    recalculated++
  }

  return NextResponse.json({
    data: { recalculated },
    message: `Đã tính lại ${recalculated} bảng lương NV`,
  })
}
