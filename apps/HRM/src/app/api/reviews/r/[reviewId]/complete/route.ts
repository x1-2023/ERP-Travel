import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { reviewId } = await params

  const review = await prisma.employeeReview.findUnique({
    where: { id: reviewId },
    include: {
      employee: { select: { userId: true, fullName: true } },
      period: { select: { name: true } },
    },
  })

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (review.status !== "HR_REVIEWING") {
    return NextResponse.json({ error: "Review is not in HR_REVIEWING status" }, { status: 400 })
  }

  const body = await request.json()
  const { finalRating, hrNotes } = body

  if (!finalRating) {
    return NextResponse.json({ error: "finalRating required" }, { status: 400 })
  }

  const updated = await prisma.employeeReview.update({
    where: { id: reviewId },
    data: {
      finalRating,
      hrNotes: hrNotes || null,
      completedAt: new Date(),
      status: "COMPLETED",
    },
  })

  // Notify employee
  if (review.employee.userId) {
    try {
      await notificationService.create({
        userId: review.employee.userId,
        type: "REVIEW",
        title: "Kết quả đánh giá đã có",
        message: `Kết quả đánh giá đợt "${review.period.name}" đã có. Xem ngay.`,
        link: `/reviews/r/${reviewId}`,
      })
    } catch { /* non-blocking */ }
  }

  return NextResponse.json({ data: updated })
}
