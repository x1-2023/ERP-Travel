import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/attendance/me — Own attendance history
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!employee) {
    return NextResponse.json({ data: [] })
  }

  const { searchParams } = new URL(request.url)
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

  // Date range for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // last day of month

  const records = await prisma.attendanceRecord.findMany({
    where: {
      employeeId: employee.id,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "desc" },
  })

  // Summary counts
  const summary = {
    present: 0,
    late: 0,
    halfDay: 0,
    absent: 0,
    leave: 0,
    total: records.length,
  }

  for (const r of records) {
    switch (r.status) {
      case "PRESENT": summary.present++; break
      case "LATE": summary.late++; break
      case "HALF_DAY": summary.halfDay++; break
      case "ABSENT": summary.absent++; break
      case "LEAVE": summary.leave++; break
    }
  }

  const actualDays = summary.present + summary.late + summary.halfDay * 0.5 + summary.leave

  return NextResponse.json({ data: records, summary: { ...summary, actualDays } })
}
