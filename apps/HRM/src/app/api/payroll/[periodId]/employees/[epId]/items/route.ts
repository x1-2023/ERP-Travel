import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/payroll/[periodId]/employees/[epId]/items — Add PayrollItem
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ periodId: string; epId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { periodId, epId } = await params

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
    select: { status: true },
  })
  if (!period || period.status !== "DRAFT") {
    return NextResponse.json({ error: "Bảng lương đã duyệt, không thể thêm khoản" }, { status: 400 })
  }

  const body = await request.json()
  const { type, amount, description, sourceId, sourceType } = body

  if (!type || amount === undefined) {
    return NextResponse.json({ error: "Thiếu type hoặc amount" }, { status: 400 })
  }

  const item = await prisma.payrollItem.create({
    data: {
      employeePayrollId: epId,
      type,
      amount,
      description: description || null,
      sourceId: sourceId || null,
      sourceType: sourceType || null,
    },
  })

  return NextResponse.json({ data: item }, { status: 201 })
}

// DELETE /api/payroll/[periodId]/employees/[epId]/items — Remove PayrollItem
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { periodId } = await params

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
    select: { status: true },
  })
  if (!period || period.status !== "DRAFT") {
    return NextResponse.json({ error: "Bảng lương đã duyệt, không thể xóa khoản" }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get("itemId")
  if (!itemId) {
    return NextResponse.json({ error: "Thiếu itemId" }, { status: 400 })
  }

  await prisma.payrollItem.delete({
    where: { id: itemId },
  })

  return NextResponse.json({ message: "Đã xóa" })
}
