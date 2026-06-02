import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { periodId } = await params
  const body = await request.json()
  const { employeeIds, reviewerIds } = body as {
    employeeIds: string[]
    reviewerIds?: Record<string, string>
  }

  if (!employeeIds || employeeIds.length === 0) {
    return NextResponse.json({ error: "employeeIds required" }, { status: 400 })
  }

  const period = await prisma.reviewPeriod.findUnique({ where: { id: periodId } })
  if (!period) return NextResponse.json({ error: "Period not found" }, { status: 404 })

  // Fetch employees with their departments to find default reviewers
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: {
      id: true,
      fullName: true,
      userId: true,
      department: {
        select: {
          managerId: true,
          manager: { select: { userId: true } },
        },
      },
    },
  })

  // Check for existing reviews to avoid duplicates
  const existingReviews = await prisma.employeeReview.findMany({
    where: { periodId, employeeId: { in: employeeIds } },
    select: { employeeId: true },
  })
  const existingIds = new Set(existingReviews.map((r) => r.employeeId))

  const reviewsToCreate = []
  const employeeUserIds: string[] = []
  const managerUserIds = new Set<string>()

  for (const emp of employees) {
    if (existingIds.has(emp.id)) continue

    // Determine reviewer: explicit override → dept manager user → session user as fallback
    let reviewerUserId = reviewerIds?.[emp.id]
    if (!reviewerUserId) {
      reviewerUserId = emp.department?.manager?.userId || session.user.id
    }

    reviewsToCreate.push({
      periodId,
      employeeId: emp.id,
      reviewerId: reviewerUserId,
      status: "SELF_PENDING" as const,
    })

    if (emp.userId) employeeUserIds.push(emp.userId)
    if (reviewerUserId) managerUserIds.add(reviewerUserId)
  }

  if (reviewsToCreate.length === 0) {
    return NextResponse.json({ message: "No new reviews to create" })
  }

  await prisma.employeeReview.createMany({ data: reviewsToCreate })

  // Notify employees
  const endDateStr = period.endDate.toLocaleDateString("vi-VN")
  if (employeeUserIds.length > 0) {
    try {
      await notificationService.createForMany({
        userIds: employeeUserIds,
        type: "REVIEW",
        title: "Đợt đánh giá năng lực",
        message: `Đợt đánh giá "${period.name}" đã bắt đầu. Vui lòng hoàn thành tự đánh giá trước ${endDateStr}.`,
        link: "/profile",
      })
    } catch { /* non-blocking */ }
  }

  // Notify managers
  const managerIds = Array.from(managerUserIds)
  if (managerIds.length > 0) {
    try {
      await notificationService.createForMany({
        userIds: managerIds,
        type: "REVIEW",
        title: "Cần đánh giá nhân viên",
        message: `Bạn cần đánh giá nhân viên trong đợt "${period.name}".`,
        link: "/reviews",
      })
    } catch { /* non-blocking */ }
  }

  return NextResponse.json({
    data: { created: reviewsToCreate.length, skipped: existingIds.size },
  })
}
