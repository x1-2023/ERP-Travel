import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { positionService } from "@/services/position.service"
import { audit } from "@/lib/audit/logger"
import { updatePositionSchema } from "@/lib/validations/position"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updatePositionSchema.parse({ ...body, id })

    const position = await positionService.update(session.user.tenantId, id, validated)

    await audit.update({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Position', id)

    return NextResponse.json(position)
  } catch (error) {
    console.error("PUT /api/positions/[id] error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Không thể cập nhật chức danh" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await positionService.delete(session.user.tenantId, id)

    await audit.delete({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Position', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/positions/[id] error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Không thể xóa chức danh" },
      { status: 500 }
    )
  }
}
