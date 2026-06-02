import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"
import { writeAudit } from "@/lib/services/audit.service"

// POST /api/advances/[id]/reject — HR_MANAGER rejects
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { rejectionReason } = body

  if (!rejectionReason || !rejectionReason.trim()) {
    return NextResponse.json(
      { error: "Lý do từ chối là bắt buộc" },
      { status: 400 }
    )
  }

  const advance = await prisma.salaryAdvance.findUnique({
    where: { id },
    include: {
      employee: { select: { userId: true, fullName: true } },
    },
  })

  if (!advance) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  }

  if (advance.status !== "PENDING") {
    return NextResponse.json(
      { error: "Yêu cầu không ở trạng thái chờ duyệt" },
      { status: 400 }
    )
  }

  await prisma.salaryAdvance.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectedBy: session.user.id,
      rejectionReason: rejectionReason.trim(),
    },
  })

  // Notify employee
  try {
    if (advance.employee.userId) {
      await notificationService.create({
        userId: advance.employee.userId,
        type: "GENERAL",
        title: "Tạm ứng bị từ chối",
        message: `Yêu cầu tạm ứng ${Number(advance.amount).toLocaleString("vi-VN")}đ bị từ chối: ${rejectionReason}`,
        link: "/advances",
      })
    }
  } catch {
    // Don't block
  }

  await writeAudit({
    action: "REJECT",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "SalaryAdvance",
    targetId: id,
    targetName: `Tạm ứng ${advance.employee.fullName}`,
    metadata: { rejectionReason },
  })

  return NextResponse.json({ message: "Đã từ chối tạm ứng" })
}
