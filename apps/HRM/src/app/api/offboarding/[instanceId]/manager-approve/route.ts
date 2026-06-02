import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["DEPT_MANAGER", "SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { instanceId } = await params

  const instance = await prisma.offboardingInstance.findUnique({
    where: { id: instanceId },
    include: { employee: { select: { fullName: true, departmentId: true } } },
  })

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (instance.status !== "INITIATED") {
    return NextResponse.json(
      { error: `Không thể duyệt — trạng thái hiện tại: ${instance.status}` },
      { status: 400 }
    )
  }

  const updated = await prisma.offboardingInstance.update({
    where: { id: instanceId },
    data: {
      status: "MANAGER_APPROVED",
      managerApprovedBy: session.user.id,
      managerApprovedAt: new Date(),
    },
    include: { tasks: true },
  })

  // Notify HR_MANAGER
  try {
    const hrManagers = await prisma.user.findMany({
      where: { role: "HR_MANAGER", isActive: true },
      select: { id: true },
    })
    await notificationService.createForMany({
      userIds: hrManagers.map((u) => u.id),
      type: "OFFBOARDING",
      title: "Đơn nghỉ việc chờ HR phê duyệt",
      message: `Quản lý đã duyệt đơn nghỉ của ${instance.employee.fullName}, chờ HR phê duyệt`,
      link: `/offboarding/${instanceId}`,
    })
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ data: updated })
}
