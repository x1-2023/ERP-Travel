import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "HR_MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const jr = await prisma.jobRequisition.findUnique({
    where: { id },
    include: { department: { select: { name: true } }, position: { select: { name: true } } },
  })

  if (!jr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (jr.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT requisitions can be approved" }, { status: 400 })
  }

  const updated = await prisma.jobRequisition.update({
    where: { id },
    data: {
      status: "OPEN",
      approvedBy: session.user.id,
      approvedAt: new Date(),
    },
  })

  // Notify requester
  try {
    await notificationService.create({
      userId: jr.requestedBy,
      type: "GENERAL",
      title: "Yêu cầu tuyển dụng đã được duyệt",
      message: `${jr.title} (${jr.department.name} — ${jr.position.name}) đã được phê duyệt và mở tuyển`,
      link: `/recruitment/requisitions/${id}`,
    })
  } catch (e) {
    console.error("Notification error:", e)
  }

  return NextResponse.json(updated)
}
