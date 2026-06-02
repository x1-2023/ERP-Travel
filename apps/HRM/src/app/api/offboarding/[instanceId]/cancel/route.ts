import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"
import { writeAudit } from "@/lib/services/audit.service"
import { format } from "date-fns"

const CANCELLABLE = ["INITIATED", "MANAGER_APPROVED", "HR_APPROVED", "IN_PROGRESS"]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { instanceId } = await params

  const instance = await prisma.offboardingInstance.findUnique({
    where: { id: instanceId },
    include: {
      employee: {
        select: {
          id: true,
          fullName: true,
          employeeCode: true,
          userId: true,
          departmentId: true,
        },
      },
    },
  })

  if (!instance) {
    return NextResponse.json({ error: "Không tìm thấy offboarding" }, { status: 404 })
  }

  if (instance.status === "COMPLETED") {
    return NextResponse.json({ error: "Không thể hủy offboarding đã hoàn tất" }, { status: 400 })
  }

  if (instance.status === "CANCELLED") {
    return NextResponse.json({ error: "Offboarding đã bị hủy trước đó" }, { status: 400 })
  }

  if (!CANCELLABLE.includes(instance.status)) {
    return NextResponse.json({ error: "Không thể hủy ở trạng thái hiện tại" }, { status: 400 })
  }

  let reason = ""
  try {
    const body = await request.json()
    reason = (body.reason || "").trim()
  } catch {
    // no body
  }

  if (!reason) {
    return NextResponse.json({ error: "Lý do hủy là bắt buộc" }, { status: 400 })
  }

  // Update instance
  const cancelNote = `[CANCELLED by HR_MANAGER on ${format(new Date(), "dd/MM/yyyy")}]: ${reason}`
  const updatedNotes = instance.notes
    ? `${instance.notes}\n${cancelNote}`
    : cancelNote

  const updated = await prisma.offboardingInstance.update({
    where: { id: instanceId },
    data: {
      status: "CANCELLED",
      notes: updatedNotes,
    },
    include: {
      employee: {
        select: { fullName: true, employeeCode: true },
      },
    },
  })

  // Audit
  await writeAudit({
    action: "OFFBOARDING_CANCELLED",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "OffboardingInstance",
    targetId: instanceId,
    targetName: `Offboarding ${instance.employee.fullName}`,
    metadata: { reason },
  })

  // Notify employee
  if (instance.employee.userId) {
    try {
      await notificationService.create({
        userId: instance.employee.userId,
        type: "OFFBOARDING",
        title: "Quy trình nghỉ việc đã bị hủy",
        message: `Quy trình offboarding của bạn đã được hủy. Lý do: ${reason}`,
        link: `/offboarding/${instanceId}`,
      })
    } catch {
      // Non-blocking
    }
  }

  // Notify dept manager
  if (instance.employee.departmentId) {
    try {
      const dept = await prisma.department.findUnique({
        where: { id: instance.employee.departmentId },
        select: { managerId: true },
      })
      if (dept?.managerId) {
        // Find user linked to dept manager (employee)
        const mgrEmployee = await prisma.employee.findUnique({
          where: { id: dept.managerId },
          select: { userId: true },
        })
        if (mgrEmployee?.userId) {
          await notificationService.create({
            userId: mgrEmployee.userId,
            type: "OFFBOARDING",
            title: "Offboarding đã hủy",
            message: `${instance.employee.fullName} sẽ không nghỉ việc — quy trình offboarding đã hủy`,
            link: `/offboarding/${instanceId}`,
          })
        }
      }
    } catch {
      // Non-blocking
    }
  }

  return NextResponse.json({ data: updated })
}
