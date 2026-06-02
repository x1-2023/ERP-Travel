import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { notificationService } from "@/lib/services/notification.service"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))

  const [notifications, unreadCount] = await Promise.all([
    notificationService.getByUser(session.user.id, limit),
    notificationService.countUnread(session.user.id),
  ])

  return NextResponse.json({ notifications, unreadCount })
}
