import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "HR_MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only HR_MANAGER can reject" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  if (!body.rejectionReason) {
    return NextResponse.json({ error: "rejectionReason is required" }, { status: 400 })
  }

  const event = await prisma.hREvent.findUnique({
    where: { id },
    include: {
      employee: { select: { fullName: true, employeeCode: true } },
    },
  })

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (event.status !== "PENDING") {
    return NextResponse.json({ error: "Event is not PENDING" }, { status: 400 })
  }

  const eventTypeLabel = {
    DEPARTMENT_TRANSFER: "Chuyển phòng ban",
    PROMOTION: "Thăng chức",
    RECOGNITION: "Khen thưởng",
    DISCIPLINARY: "Kỷ luật",
    SALARY_ADJUSTMENT: "Điều chỉnh lương",
  }[event.type]

  const updated = await prisma.hREvent.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectedBy: session.user.id,
      rejectionReason: body.rejectionReason,
    },
  })

  // Notify requester
  try {
    await notificationService.create({
      userId: event.requestedBy,
      type: "HR_EVENT",
      title: `${eventTypeLabel} bị từ chối`,
      message: `${eventTypeLabel} cho ${event.employee.fullName} (${event.employee.employeeCode}) bị từ chối: ${body.rejectionReason}`,
      link: `/hr-events/${event.id}`,
    })
  } catch (e) {
    console.error("Notification error:", e)
  }

  return NextResponse.json(updated)
}
