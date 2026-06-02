import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/positions — List positions
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const departmentId = searchParams.get("departmentId")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ]
  }
  if (departmentId) where.departmentId = departmentId

  const positions = await prisma.position.findMany({
    where,
    include: {
      department: { select: { id: true, name: true } },
      _count: { select: { employees: true } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ data: positions })
}

// POST /api/admin/positions — Create position
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { name, code, departmentId, description } = body

  if (!name || !code) {
    return NextResponse.json({ error: "Thiếu tên hoặc mã chức vụ" }, { status: 400 })
  }

  const existing = await prisma.position.findUnique({ where: { code } })
  if (existing) {
    return NextResponse.json({ error: "Mã chức vụ đã tồn tại" }, { status: 400 })
  }

  const position = await prisma.position.create({
    data: {
      name,
      code,
      departmentId: departmentId || null,
      description: description || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      entity: "Position",
      entityId: position.id,
      newData: { name, code },
    },
  })

  return NextResponse.json({ data: position }, { status: 201 })
}
