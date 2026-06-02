import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { syncDependentCount } from "@/lib/services/dependent-sync"

// PUT /api/employees/[id]/dependents/[depId] — Update dependent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; depId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, depId } = await params

  const dependent = await prisma.dependent.findFirst({
    where: { id: depId, employeeId: id },
  })
  if (!dependent) {
    return NextResponse.json({ error: "Không tìm thấy NPT" }, { status: 404 })
  }

  const body = await request.json()
  const { fullName, relationship, dateOfBirth, nationalId, taxDepCode, registeredAt } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}
  if (fullName) updateData.fullName = fullName
  if (relationship) updateData.relationship = relationship
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)
  if (nationalId !== undefined) updateData.nationalId = nationalId || null
  if (taxDepCode !== undefined) updateData.taxDepCode = taxDepCode || null
  if (registeredAt !== undefined) updateData.registeredAt = registeredAt ? new Date(registeredAt) : null

  const updated = await prisma.dependent.update({
    where: { id: depId },
    data: updateData,
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "Dependent",
      entityId: depId,
      oldData: { fullName: dependent.fullName, relationship: dependent.relationship },
      newData: updateData,
    },
  })

  return NextResponse.json({ data: updated })
}

// DELETE /api/employees/[id]/dependents/[depId] — Soft delete
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; depId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, depId } = await params

  const dependent = await prisma.dependent.findFirst({
    where: { id: depId, employeeId: id },
  })
  if (!dependent) {
    return NextResponse.json({ error: "Không tìm thấy NPT" }, { status: 404 })
  }

  await prisma.dependent.update({
    where: { id: depId },
    data: { isActive: false },
  })

  const updatedCount = await syncDependentCount(id)

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE",
      entity: "Dependent",
      entityId: depId,
      oldData: { fullName: dependent.fullName, isActive: true },
      newData: { isActive: false },
    },
  })

  return NextResponse.json({
    success: true,
    updatedDependentCount: updatedCount,
  })
}
