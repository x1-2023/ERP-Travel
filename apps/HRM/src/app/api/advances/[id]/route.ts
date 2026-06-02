import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/advances/[id] — Detail
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const advance = await prisma.salaryAdvance.findUnique({
    where: { id },
    include: {
      employee: {
        select: { id: true, fullName: true, employeeCode: true, userId: true },
      },
      approver: { select: { name: true } },
    },
  })

  if (!advance) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  }

  // EMPLOYEE can only see own
  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)
  if (!isHR && advance.employee.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ data: advance })
}
