import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/admin/positions/[id] — Update position
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const position = await prisma.position.findUnique({ where: { id } })
  if (!position) {
    return NextResponse.json({ error: "Không tìm thấy chức vụ" }, { status: 404 })
  }

  const body = await request.json()
  const { name, departmentId, description, isActive } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}
  if (name) updateData.name = name
  if (departmentId !== undefined) updateData.departmentId = departmentId || null
  if (description !== undefined) updateData.description = description || null
  if (isActive !== undefined) updateData.isActive = isActive

  const updated = await prisma.position.update({
    where: { id },
    data: updateData,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "Position",
      entityId: id,
      oldData: { name: position.name, isActive: position.isActive },
      newData: updateData,
    },
  })

  return NextResponse.json({ data: updated })
}

// DELETE /api/admin/positions/[id] — Delete (only if 0 employees)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const position = await prisma.position.findUnique({
    where: { id },
    include: { _count: { select: { employees: true } } },
  })
  if (!position) {
    return NextResponse.json({ error: "Không tìm thấy chức vụ" }, { status: 404 })
  }

  if (position._count.employees > 0) {
    return NextResponse.json({
      error: `Không thể xóa — chức vụ còn ${position._count.employees} nhân viên`,
    }, { status: 400 })
  }

  await prisma.position.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE",
      entity: "Position",
      entityId: id,
      oldData: { name: position.name, code: position.code },
    },
  })

  return NextResponse.json({ success: true })
}
