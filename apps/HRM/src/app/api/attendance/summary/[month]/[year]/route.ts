import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DAY_VALUES } from "@/lib/config/attendance"

// GET /api/attendance/summary/[month]/[year]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ month: string; year: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { month: monthStr, year: yearStr } = await params
  const month = parseInt(monthStr)
  const year = parseInt(yearStr)

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Tháng/năm không hợp lệ" }, { status: 400 })
  }

  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)
  const isDeptMgr = session.user.role === "DEPT_MANAGER"

  // Calculate standard working days (exclude Sat/Sun)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  let standardDays = 0
  const d = new Date(startDate)
  while (d <= endDate) {
    if (d.getDay() !== 0 && d.getDay() !== 6) standardDays++
    d.setDate(d.getDate() + 1)
  }

  // Determine which employees to include
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const empWhere: any = { status: { in: ["ACTIVE", "PROBATION"] } }

  if (!isHR && !isDeptMgr) {
    // EMPLOYEE: only own data
    const emp = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!emp) return NextResponse.json({ data: [], standardDays })
    empWhere.id = emp.id
  } else if (isDeptMgr) {
    const mgr = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (mgr) {
      const depts = await prisma.department.findMany({
        where: { managerId: mgr.id },
        select: { id: true },
      })
      empWhere.departmentId = { in: depts.map((d) => d.id) }
    }
  }

  const employees = await prisma.employee.findMany({
    where: empWhere,
    select: { id: true, employeeCode: true, fullName: true },
    orderBy: { employeeCode: "asc" },
  })

  const records = await prisma.attendanceRecord.findMany({
    where: {
      employeeId: { in: employees.map((e) => e.id) },
      date: { gte: startDate, lte: endDate },
    },
  })

  // Group by employee
  const byEmployee: Record<string, typeof records> = {}
  for (const r of records) {
    if (!byEmployee[r.employeeId]) byEmployee[r.employeeId] = []
    byEmployee[r.employeeId].push(r)
  }

  const data = employees.map((emp) => {
    const empRecords = byEmployee[emp.id] || []
    const counts: Record<string, number> = {
      PRESENT: 0, LATE: 0, HALF_DAY: 0, ABSENT: 0, LEAVE: 0, HOLIDAY: 0,
    }
    for (const r of empRecords) {
      counts[r.status] = (counts[r.status] || 0) + 1
    }

    const actualDays = Object.entries(counts).reduce(
      (sum, [status, count]) => sum + count * (DAY_VALUES[status] || 0),
      0
    )

    return {
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      totalDays: standardDays,
      presentDays: counts.PRESENT,
      lateDays: counts.LATE,
      halfDays: counts.HALF_DAY,
      absentDays: counts.ABSENT,
      leaveDays: counts.LEAVE,
      actualDays: Math.round(actualDays * 10) / 10,
    }
  })

  return NextResponse.json({ data, standardDays })
}
