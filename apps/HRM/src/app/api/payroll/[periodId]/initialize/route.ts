import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculatePayroll } from "@/lib/calculators/payroll"
import { DAY_VALUES } from "@/lib/config/attendance"
import { calculateStandardDays } from "@/lib/config/holidays"

// POST /api/payroll/[periodId]/initialize — Auto-populate from contracts
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
    return NextResponse.json({ error: "Chỉ có thể khởi tạo khi bảng lương ở trạng thái Nháp" }, { status: 400 })
  }

  // Check if already initialized
  const existingCount = await prisma.employeePayroll.count({
    where: { periodId },
  })
  if (existingCount > 0) {
    return NextResponse.json({ error: "Bảng lương đã được khởi tạo" }, { status: 400 })
  }

  // Calculate standard working days for the period month (excluding weekends + VN public holidays)
  const startOfMonth = new Date(period.year, period.month - 1, 1)
  const endOfMonth = new Date(period.year, period.month, 0)
  const standardDays = calculateStandardDays(period.month, period.year)

  // Get all eligible employees: ACTIVE/PROBATION + RESIGNED who left mid-month
  const employees = await prisma.employee.findMany({
    where: {
      OR: [
        { status: { in: ["ACTIVE", "PROBATION"] } },
        // Include employees who resigned during this payroll month (pro-ration)
        {
          status: { in: ["RESIGNED", "TERMINATED"] },
          resignDate: { gte: startOfMonth, lte: endOfMonth },
        },
      ],
    },
    include: {
      contracts: {
        where: { status: { in: ["ACTIVE", "EXPIRED"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      dependents: { where: { isActive: true }, select: { id: true } },
      leaveBalances: {
        where: { year: new Date().getFullYear() },
        take: 1,
        select: { remainingDays: true },
      },
    },
  })

  // Fetch attendance records for this month for all employees
  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: {
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    select: { employeeId: true, status: true },
  })

  // Build per-employee attendance summary
  const attendanceByEmp: Record<string, Record<string, number>> = {}
  for (const r of attendanceRecords) {
    if (!attendanceByEmp[r.employeeId]) {
      attendanceByEmp[r.employeeId] = { PRESENT: 0, LATE: 0, HALF_DAY: 0, ABSENT: 0, LEAVE: 0, HOLIDAY: 0 }
    }
    attendanceByEmp[r.employeeId][r.status] = (attendanceByEmp[r.employeeId][r.status] || 0) + 1
  }

  // Build all payroll records first, then batch create in a transaction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payrollRecords: any[] = []
  let skipped = 0

  for (const emp of employees) {
    const contract = emp.contracts[0]
    if (!contract) {
      skipped++
      continue
    }

    const baseSalary = Number(contract.baseSalary ?? 0)
    const mealAllowance = Number(contract.mealAllowance ?? 0)
    const phoneAllowance = Number(contract.phoneAllowance ?? 0)
    const fuelAllowance = Number(contract.fuelAllowance ?? 0)
    const perfAllowance = Number(contract.perfAllowance ?? 0)
    const dependentCount = emp.dependents.length
    const isProbation = emp.status === "PROBATION"

    // Pull actualDays from attendance if available, fallback to standardDays
    let actualDays = standardDays
    const empAttendance = attendanceByEmp[emp.id]
    if (empAttendance) {
      actualDays = Object.entries(empAttendance).reduce(
        (sum, [status, count]) => sum + count * (DAY_VALUES[status] || 0),
        0
      )
      actualDays = Math.round(actualDays * 10) / 10
    }

    // Pro-ration for employees who resigned mid-month
    if (
      (emp.status === "RESIGNED" || emp.status === "TERMINATED") &&
      emp.resignDate &&
      !empAttendance // Only apply if no attendance data (attendance takes priority)
    ) {
      const resignDate = new Date(emp.resignDate)
      // Count working days from start of month up to resignDate
      let proRatedDays = 0
      const d = new Date(startOfMonth)
      while (d <= resignDate && d <= endOfMonth) {
        if (d.getDay() !== 0 && d.getDay() !== 6) proRatedDays++
        d.setDate(d.getDate() + 1)
      }
      actualDays = proRatedDays
    }

    const result = calculatePayroll({
      baseSalary,
      mealAllowance,
      phoneAllowance,
      fuelAllowance,
      perfAllowance,
      actualDays,
      standardDays,
      otWeekday: 0, otWeekend: 0, otHoliday: 0,
      nightShift: 0, businessTrip: 0, hazardAllowance: 0,
      otherAllowance: 0, kpiCurrent: 0, kpiPrev1: 0, kpiPrev2: 0,
      advanceDeduction: 0,
      dependentCount,
      isProbation,
    })

    payrollRecords.push({
      periodId,
      employeeId: emp.id,
      actualDays,
      standardDays,
      baseSalary,
      mealAllowance,
      phoneAllowance,
      fuelAllowance,
      perfAllowance,
      totalContractSalary: result.totalContractSalary,
      totalActualSalary: result.totalActualSalary,
      personalDeduction: result.personalDeduction,
      dependentCount,
      dependentDeduction: result.dependentDeduction,
      totalIncome: result.totalIncome,
      taxableIncome: result.taxableIncome,
      insuranceBase: result.insuranceBase,
      bhxhEmployee: result.bhxhEmployee,
      bhytEmployee: result.bhytEmployee,
      bhtnEmployee: result.bhtnEmployee,
      totalEmployeeIns: result.totalEmployeeIns,
      pitAmount: result.pitAmount,
      advanceDeduction: 0,
      netSalary: result.netSalary,
      bhxhEmployer: result.bhxhEmployer,
      bhytEmployer: result.bhytEmployer,
      bhtnEmployer: result.bhtnEmployer,
      bhtnldEmployer: result.bhtnldEmployer,
      totalEmployerIns: result.totalEmployerIns,
      remainingLeave: emp.leaveBalances[0] ? Number(emp.leaveBalances[0].remainingDays) : 0,
      bankAccount: emp.bankAccount,
      bankName: emp.bankBranch,
      nameNoAccent: emp.nameNoAccent,
    })
  }

  // Atomic batch create — all or nothing
  if (payrollRecords.length > 0) {
    await prisma.employeePayroll.createMany({ data: payrollRecords })
  }

  return NextResponse.json({
    data: { created: payrollRecords.length, skipped },
    message: `Đã tạo ${payrollRecords.length} bảng lương NV, bỏ qua ${skipped} (không có HĐ)`,
  })
}
