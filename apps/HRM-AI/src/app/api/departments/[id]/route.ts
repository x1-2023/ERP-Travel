import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { departmentService } from "@/services/department.service"
import { audit } from "@/lib/audit/logger"
import { updateDepartmentSchema } from "@/lib/validations/department"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const department = await departmentService.findById(session.user.tenantId, id)

    if (!department) {
      return NextResponse.json(
        { error: "Không tìm thấy phòng ban" },
        { status: 404 }
      )
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error("GET /api/departments/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể tải thông tin phòng ban" },
      { status: 500 }
    )
  }
}

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
    const validated = updateDepartmentSchema.parse({ ...body, id })

    const department = await departmentService.update(session.user.tenantId, id, validated)

    await audit.update({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Department', id)

    return NextResponse.json(department)
  } catch (error) {
    console.error("PUT /api/departments/[id] error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Không thể cập nhật phòng ban" },
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
    await departmentService.delete(session.user.tenantId, id)

    await audit.delete({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Department', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/departments/[id] error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Không thể xóa phòng ban" },
      { status: 500 }
    )
  }
}
