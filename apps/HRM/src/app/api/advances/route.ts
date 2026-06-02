import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

// GET /api/advances — HR: all | EMPLOYEE: own
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (!isHR) {
    const emp = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!emp) return NextResponse.json({ data: [] })
    where.employeeId = emp.id
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  if (status) where.status = status

  const advances = await prisma.salaryAdvance.findMany({
    where,
    include: {
      employee: { select: { id: true, fullName: true, employeeCode: true } },
      approver: { select: { name: true } },
    },
    orderBy: { requestedAt: "desc" },
  })

  return NextResponse.json({ data: advances })
}

// POST /api/advances — Create advance request
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { amount, reason, employeeId: targetEmployeeId } = body

  if (!reason || !reason.trim()) {
    return NextResponse.json({ error: "Lý do là bắt buộc" }, { status: 400 })
  }

  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)

  // Determine employee
  let empId: string
  if (targetEmployeeId && isHR) {
    empId = targetEmployeeId
  } else {
    const emp = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!emp) {
      return NextResponse.json({ error: "Tài khoản chưa liên kết nhân viên" }, { status: 400 })
    }
    empId = emp.id
  }

  // Get active contract for baseSalary
  const contract = await prisma.contract.findFirst({
    where: { employeeId: empId, status: "ACTIVE" },
    select: { baseSalary: true },
    orderBy: { createdAt: "desc" },
  })

  if (!contract || !contract.baseSalary) {
    return NextResponse.json(
      { error: "Nhân viên chưa có hợp đồng lao động hoạt động" },
      { status: 400 }
    )
  }

  const baseSalary = Number(contract.baseSalary)
  const maxAdvance = Math.floor(baseSalary * 0.5)

  if (!amount || amount < 500000) {
    return NextResponse.json(
      { error: "Số tiền tạm ứng tối thiểu 500,000đ" },
      { status: 400 }
    )
  }

  if (amount > maxAdvance) {
    return NextResponse.json(
      { error: `Số tiền tạm ứng không được vượt quá ${maxAdvance.toLocaleString("vi-VN")}đ (50% lương cơ bản)` },
      { status: 400 }
    )
  }

  // Check no existing PENDING or APPROVED advance
  const existing = await prisma.salaryAdvance.findFirst({
    where: {
      employeeId: empId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  })

  if (existing) {
    return NextResponse.json(
      { error: "Bạn đang có yêu cầu tạm ứng chưa xử lý" },
      { status: 409 }
    )
  }

  const advance = await prisma.salaryAdvance.create({
    data: {
      employeeId: empId,
      amount,
      reason: reason.trim(),
    },
  })

  // Notify HR_MANAGER
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: empId },
      select: { fullName: true },
    })
    await notificationService.notifyHR({
      type: "GENERAL",
      title: "Yêu cầu tạm ứng mới",
      message: `${employee?.fullName || "Nhân viên"} yêu cầu tạm ứng ${Number(amount).toLocaleString("vi-VN")}đ`,
      link: "/advances",
    })
  } catch {
    // Don't block on notification failure
  }

  return NextResponse.json({ data: advance }, { status: 201 })
}
