import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { employeeService } from "@/services/employee.service"
import { audit } from "@/lib/audit/logger"
import { updateEmployeeSchema } from "@/lib/validations/employee"

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
    const employee = await employeeService.findById(session.user.tenantId, id)

    if (!employee) {
      return NextResponse.json(
        { error: "Không tìm thấy nhân viên" },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể tải thông tin nhân viên" },
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
    const validated = updateEmployeeSchema.parse({ ...body, id })

    const oldEmployee = await employeeService.findById(session.user.tenantId, id)
    if (!oldEmployee) {
      return NextResponse.json(
        { error: "Không tìm thấy nhân viên" },
        { status: 404 }
      )
    }

    const employee = await employeeService.update(
      session.user.tenantId,
      id,
      validated,
      session.user.id
    )

    await audit.update({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Employee', id)

    return NextResponse.json(employee)
  } catch (error) {
    console.error("PUT /api/employees/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật nhân viên" },
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
    const oldEmployee = await employeeService.findById(session.user.tenantId, id)
    if (!oldEmployee) {
      return NextResponse.json(
        { error: "Không tìm thấy nhân viên" },
        { status: 404 }
      )
    }

    await employeeService.softDelete(session.user.tenantId, id)

    await audit.delete({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Employee', id)

    // Return employee info so the client can show an undo action
    return NextResponse.json({
      success: true,
      data: { id, name: oldEmployee.fullName, code: oldEmployee.employeeCode },
      undoUrl: `/api/employees/${id}/restore`,
    })
  } catch (error) {
    console.error("DELETE /api/employees/[id] error:", error)
    return NextResponse.json(
      { error: "Không thể xóa nhân viên" },
      { status: 500 }
    )
  }
}
