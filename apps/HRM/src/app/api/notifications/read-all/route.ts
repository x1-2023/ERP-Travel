import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { notificationService } from "@/lib/services/notification.service"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await notificationService.markAllRead(session.user.id)
  return NextResponse.json({ success: true })
}
