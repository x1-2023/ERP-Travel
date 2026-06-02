import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET /api/admin/users/[userId]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await params

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  })

  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
  }

  return NextResponse.json({ data: user })
}

// PUT /api/admin/users/[userId] — Update role, active status, reset password
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await params
  const body = await request.json()
  const { role, isActive, newPassword } = body

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
  }

  // Cannot self-deactivate
  if (isActive === false && userId === session.user.id) {
    return NextResponse.json({ error: "Không thể khóa tài khoản của chính mình" }, { status: 400 })
  }

  // Cannot demote last SUPER_ADMIN
  if (role && role !== "SUPER_ADMIN" && user.role === "SUPER_ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN", isActive: true },
    })
    if (adminCount <= 1) {
      return NextResponse.json({
        error: "Phải có ít nhất 1 SUPER_ADMIN trong hệ thống",
      }, { status: 400 })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}
  if (role) updateData.role = role
  if (isActive !== undefined) updateData.isActive = isActive
  if (newPassword) {
    updateData.password = await bcrypt.hash(newPassword, 10)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, email: true, role: true, isActive: true },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "User",
      entityId: userId,
      oldData: { role: user.role, isActive: user.isActive },
      newData: updateData,
    },
  })

  return NextResponse.json({ data: updated })
}
