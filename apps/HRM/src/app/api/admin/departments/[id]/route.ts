import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/admin/departments/[id] — Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const dept = await prisma.department.findUnique({ where: { id } })
  if (!dept) {
    return NextResponse.json({ error: "Không tìm thấy phòng ban" }, { status: 404 })
  }

  const body = await request.json()
  const { name, description, managerId, isActive } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}
  if (name) updateData.name = name
  if (description !== undefined) updateData.description = description || null
  if (managerId !== undefined) updateData.managerId = managerId || null
  if (isActive !== undefined) updateData.isActive = isActive

  const updated = await prisma.department.update({
    where: { id },
    data: updateData,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "Department",
      entityId: id,
      oldData: { name: dept.name, isActive: dept.isActive },
      newData: updateData,
    },
  })

  return NextResponse.json({ data: updated })
}

// DELETE /api/admin/departments/[id] — Delete (only if 0 employees)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { employees: true } } },
  })
  if (!dept) {
    return NextResponse.json({ error: "Không tìm thấy phòng ban" }, { status: 404 })
  }

  if (dept._count.employees > 0) {
    return NextResponse.json({
      error: `Không thể xóa — phòng ban còn ${dept._count.employees} nhân viên`,
    }, { status: 400 })
  }

  await prisma.department.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE",
      entity: "Department",
      entityId: id,
      oldData: { name: dept.name, code: dept.code },
    },
  })

  return NextResponse.json({ success: true })
}
