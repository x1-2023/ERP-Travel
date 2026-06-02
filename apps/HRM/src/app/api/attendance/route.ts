import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/attendance — HR: company-wide attendance list
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF", "DEPT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))
  const deptId = searchParams.get("departmentId")

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  // Get employees (filter by dept for DEPT_MANAGER)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const empWhere: any = { status: { in: ["ACTIVE", "PROBATION"] } }

  if (session.user.role === "DEPT_MANAGER") {
    const mgr = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (mgr) {
      const managedDepts = await prisma.department.findMany({
        where: { managerId: mgr.id },
        select: { id: true },
      })
      empWhere.departmentId = { in: managedDepts.map((d) => d.id) }
    }
  } else if (deptId) {
    empWhere.departmentId = deptId
  }

  const employees = await prisma.employee.findMany({
    where: empWhere,
    select: {
      id: true,
      employeeCode: true,
      fullName: true,
      department: { select: { name: true } },
    },
    orderBy: { employeeCode: "asc" },
  })

  const employeeIds = employees.map((e) => e.id)

  // Fetch all attendance records for these employees in the month
  const records = await prisma.attendanceRecord.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  })

  // Group records by employeeId → date
  const recordMap: Record<string, Record<string, typeof records[0]>> = {}
  for (const r of records) {
    if (!recordMap[r.employeeId]) recordMap[r.employeeId] = {}
    const dateKey = r.date.toISOString().split("T")[0]
    recordMap[r.employeeId][dateKey] = r
  }

  // Calculate standard working days (exclude Sat/Sun)
  const workingDays: string[] = []
  const d = new Date(startDate)
  while (d <= endDate) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      workingDays.push(d.toISOString().split("T")[0])
    }
    d.setDate(d.getDate() + 1)
  }

  return NextResponse.json({
    employees,
    recordMap,
    workingDays,
    month,
    year,
    standardDays: workingDays.length,
  })
}
