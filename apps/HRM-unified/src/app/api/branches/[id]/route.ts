import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { branchService } from "@/services/branch.service"
import { audit } from "@/lib/audit/logger"
import { updateBranchSchema } from "@/lib/validations/branch"

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
    const validated = updateBranchSchema.parse({ ...body, id })

    const branch = await branchService.update(session.user.tenantId, id, validated)

    await audit.update({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Branch', id)

    return NextResponse.json(branch)
  } catch (error) {
    console.error("PUT /api/branches/[id] error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Không thể cập nhật chi nhánh" },
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
    await branchService.delete(session.user.tenantId, id)

    await audit.delete({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Branch', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/branches/[id] error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Không thể xóa chi nhánh" },
      { status: 500 }
    )
  }
}
