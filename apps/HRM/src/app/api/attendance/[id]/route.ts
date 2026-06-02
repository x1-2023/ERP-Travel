import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateWorkHours, determineStatus } from "@/lib/config/attendance"

// PUT /api/attendance/[id] — HR manual edit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { checkInAt, checkOutAt, status, editNote } = body

  if (!editNote) {
    return NextResponse.json(
      { error: "Ghi chú sửa (editNote) là bắt buộc" },
      { status: 400 }
    )
  }

  const record = await prisma.attendanceRecord.findUnique({ where: { id } })
  if (!record) {
    return NextResponse.json({ error: "Không tìm thấy bản ghi" }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    isManualEdit: true,
    editedBy: session.user.id,
    editNote,
  }

  if (checkInAt) updateData.checkInAt = new Date(checkInAt)
  if (checkOutAt) updateData.checkOutAt = new Date(checkOutAt)
  if (status) updateData.status = status

  // Recalculate workHours if times changed
  const finalCheckIn = updateData.checkInAt || record.checkInAt
  const finalCheckOut = updateData.checkOutAt || record.checkOutAt

  if (finalCheckIn && finalCheckOut) {
    const workHours = calculateWorkHours(
      new Date(finalCheckIn),
      new Date(finalCheckOut)
    )
    updateData.workHours = workHours
    // Auto-determine status if not explicitly set
    if (!status) {
      updateData.status = determineStatus(new Date(finalCheckIn), workHours)
    }
  }

  const updated = await prisma.attendanceRecord.update({
    where: { id },
    data: updateData,
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "AttendanceRecord",
      entityId: id,
      oldData: {
        checkInAt: record.checkInAt?.toISOString(),
        checkOutAt: record.checkOutAt?.toISOString(),
        status: record.status,
      },
      newData: {
        checkInAt: updated.checkInAt?.toISOString(),
        checkOutAt: updated.checkOutAt?.toISOString(),
        status: updated.status,
        editNote,
      },
    },
  })

  return NextResponse.json({ data: updated })
}
