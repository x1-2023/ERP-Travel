import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET /api/admin/users — List users
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role")
  const search = searchParams.get("search")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}
  if (role) where.role = role
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      employee: {
        select: { id: true, fullName: true, employeeCode: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ data: users })
}

// POST /api/admin/users — Create user
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { email, role, employeeId, tempPassword } = body

  if (!email || !role || !tempPassword) {
    return NextResponse.json({ error: "Thiếu email, role hoặc mật khẩu tạm" }, { status: 400 })
  }

  // Check email unique
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name: email.split("@")[0],
      password: hashedPassword,
      role,
      isActive: true,
    },
  })

  // Link to employee if provided
  if (employeeId) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { userId: user.id },
    })
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      newData: { email, role },
    },
  })

  return NextResponse.json({
    data: { id: user.id, email: user.email, role: user.role },
  }, { status: 201 })
}
