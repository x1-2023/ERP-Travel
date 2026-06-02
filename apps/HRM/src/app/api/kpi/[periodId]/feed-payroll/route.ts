import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculatePayroll } from "@/lib/calculators/payroll"
import { writeAudit } from "@/lib/services/audit.service"

// POST /api/kpi/[periodId]/feed-payroll — PUBLISHED → LOCKED + create PayrollItems
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

  const kpiPeriod = await prisma.kPIPeriod.findUnique({
    where: { id: periodId },
    include: {
      scores: {
        include: { employee: { select: { id: true, status: true } } },
      },
    },
  })

  if (!kpiPeriod) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  }

  if (kpiPeriod.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "KPI phải ở trạng thái Đã công bố để feed vào lương" },
      { status: 400 }
    )
  }

  // Find matching PayrollPeriod
  const payrollPeriod = await prisma.payrollPeriod.findUnique({
    where: { month_year: { month: kpiPeriod.month, year: kpiPeriod.year } },
  })

  if (!payrollPeriod) {
    return NextResponse.json(
      { error: `Chưa có bảng lương tháng ${kpiPeriod.month}/${kpiPeriod.year}` },
      { status: 404 }
    )
  }

  if (payrollPeriod.status !== "DRAFT") {
    return NextResponse.json(
      { error: `Bảng lương tháng ${kpiPeriod.month} đã ${payrollPeriod.status}, không thể feed KPI` },
      { status: 400 }
    )
  }

  let fed = 0
  let skipped = 0

  for (const score of kpiPeriod.scores) {
    const empPayroll = await prisma.employeePayroll.findUnique({
      where: {
        periodId_employeeId: {
          periodId: payrollPeriod.id,
          employeeId: score.employeeId,
        },
      },
      include: { items: true },
    })

    if (!empPayroll) {
      skipped++
      continue
    }

    // Delete existing KPI_CURRENT items for this employee (idempotent)
    await prisma.payrollItem.deleteMany({
      where: {
        employeePayrollId: empPayroll.id,
        type: "KPI_CURRENT",
      },
    })

    // Create new KPI_CURRENT item
    await prisma.payrollItem.create({
      data: {
        employeePayrollId: empPayroll.id,
        type: "KPI_CURRENT",
        amount: Number(score.kpiAmount),
        description: `KPI tháng ${kpiPeriod.month}/${kpiPeriod.year}: ${score.score} điểm`,
        sourceId: score.id,
        sourceType: "KPI_SCORE",
      },
    })

    // Recalculate payroll
    const items = await prisma.payrollItem.findMany({
      where: { employeePayrollId: empPayroll.id },
    })

    const getItemAmount = (type: string) =>
      items.filter((i) => i.type === type).reduce((s, i) => s + Number(i.amount), 0)

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
      advanceDeduction: Number(empPayroll.advanceDeduction),
      dependentCount: empPayroll.dependentCount,
      isProbation: score.employee.status === "PROBATION",
    })

    await prisma.employeePayroll.update({
      where: { id: empPayroll.id },
      data: {
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

    fed++
  }

  // Lock KPI period
  await prisma.kPIPeriod.update({
    where: { id: periodId },
    data: { status: "LOCKED", lockedAt: new Date() },
  })

  // Audit log
  await writeAudit({
    action: "APPROVE",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "KPIPeriod",
    targetId: periodId,
    targetName: `KPI ${kpiPeriod.month}/${kpiPeriod.year}`,
    metadata: { fed, skipped, action: "KPI_FEED_PAYROLL" },
  })

  return NextResponse.json({
    fed,
    skipped,
    message: `Đã feed ${fed} nhân viên vào bảng lương.${skipped > 0 ? ` ${skipped} nhân viên chưa có bảng lương.` : ""}`,
  })
}
