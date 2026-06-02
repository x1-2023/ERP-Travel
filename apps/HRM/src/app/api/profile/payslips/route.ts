import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/profile/payslips — List own payslips
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
  const year = searchParams.get("year")
    ? parseInt(searchParams.get("year")!)
    : new Date().getFullYear()

  const payslips = await prisma.employeePayroll.findMany({
    where: {
      employeeId: employee.id,
      period: { year },
    },
    select: {
      id: true,
      periodId: true,
      actualDays: true,
      standardDays: true,
      totalIncome: true,
      netSalary: true,
      period: {
        select: { month: true, year: true, status: true },
      },
    },
    orderBy: { period: { month: "desc" } },
  })

  return NextResponse.json({ data: payslips, year })
}
