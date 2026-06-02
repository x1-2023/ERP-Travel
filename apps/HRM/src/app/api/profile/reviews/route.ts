import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find employee linked to this user
  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!employee) {
    return NextResponse.json({ data: [] })
  }

  const reviews = await prisma.employeeReview.findMany({
    where: { employeeId: employee.id },
    select: {
      id: true,
      status: true,
      finalRating: true,
      selfSubmittedAt: true,
      period: {
        select: { name: true, cycle: true, year: true },
      },
    },
    orderBy: { period: { startDate: "desc" } },
  })

  return NextResponse.json({ data: reviews })
}
