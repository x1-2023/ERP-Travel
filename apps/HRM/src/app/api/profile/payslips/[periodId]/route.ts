import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/profile/payslips/[periodId] — Detail of own payslip
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { periodId } = await params

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!employee) {
    return NextResponse.json({ error: "Không tìm thấy hồ sơ nhân viên" }, { status: 404 })
  }

  const payslip = await prisma.employeePayroll.findUnique({
    where: {
      periodId_employeeId: { periodId, employeeId: employee.id },
    },
    include: {
      period: { select: { month: true, year: true, status: true } },
      items: {
        select: { id: true, type: true, amount: true, description: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!payslip) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ data: payslip })
}
