import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/kpi/[periodId] — Detail + scores
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { periodId } = await params

  const period = await prisma.kPIPeriod.findUnique({
    where: { id: periodId },
    include: {
      scores: {
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              employeeCode: true,
              department: { select: { name: true } },
            },
          },
        },
        orderBy: { employee: { employeeCode: "asc" } },
      },
    },
  })

  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  }

  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)

  // Employee can only see PUBLISHED/LOCKED periods, and only their own score
  if (!isHR) {
    if (period.status === "DRAFT") {
      return NextResponse.json({ error: "KPI chưa được công bố" }, { status: 404 })
    }

    const emp = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })

    return NextResponse.json({
      data: {
        ...period,
        scores: period.scores.filter((s) => s.employeeId === emp?.id),
      },
    })
  }

  // HR: get all employees for entry sheet
  const employees = await prisma.employee.findMany({
    where: { status: { in: ["ACTIVE", "PROBATION"] } },
    select: {
      id: true,
      fullName: true,
      employeeCode: true,
      department: { select: { name: true } },
    },
    orderBy: { employeeCode: "asc" },
  })

  return NextResponse.json({ data: period, employees })
}
