import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/departments — List departments with headcount
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ]
  }

  const departments = await prisma.department.findMany({
    where,
    include: {
      manager: { select: { id: true, fullName: true, employeeCode: true } },
      _count: { select: { employees: true, positions: true } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ data: departments })
}

// POST /api/admin/departments — Create department
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { name, code, description, managerId } = body

  if (!name || !code) {
    return NextResponse.json({ error: "Thiếu tên hoặc mã phòng ban" }, { status: 400 })
  }

  const existing = await prisma.department.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: "Mã phòng ban đã tồn tại" }, { status: 400 })
  }

  const department = await prisma.department.create({
    data: {
      name,
      code,
      description: description || null,
      managerId: managerId || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      entity: "Department",
      entityId: department.id,
      newData: { name, code },
    },
  })

  return NextResponse.json({ data: department }, { status: 201 })
}
