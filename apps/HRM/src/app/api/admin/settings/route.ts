import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/settings — Get all system settings
export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  })

  // Convert to key-value map for easy consumption
  const settingsMap: Record<string, string> = {}
  for (const s of settings) {
    settingsMap[s.key] = s.value
  }

  return NextResponse.json({ data: settings, map: settingsMap })
}

// PUT /api/admin/settings — Update settings (batch)
export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { settings } = body as { settings: Record<string, string> }

  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "Thiếu dữ liệu settings" }, { status: 400 })
  }

  const oldSettings = await prisma.systemSetting.findMany()
  const oldMap: Record<string, string> = {}
  for (const s of oldSettings) {
    oldMap[s.key] = s.value
  }

  // Upsert each setting
  const updates = Object.entries(settings).map(([key, value]) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value), updatedBy: session.user.id },
      create: { key, value: String(value), updatedBy: session.user.id },
    })
  )

  await prisma.$transaction(updates)

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "SystemSetting",
      entityId: "batch",
      oldData: oldMap,
      newData: settings,
    },
  })

  return NextResponse.json({ success: true })
}
