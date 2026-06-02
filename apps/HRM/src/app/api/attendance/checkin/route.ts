import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getVNToday(): Date {
  const now = new Date()
  const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))
  return new Date(vnTime.getFullYear(), vnTime.getMonth(), vnTime.getDate())
}

function getVNNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))
}

// GET /api/attendance/checkin — Today's record
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!employee) {
    return NextResponse.json({ data: null })
  }

  const today = getVNToday()

  const record = await prisma.attendanceRecord.findUnique({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date: today,
      },
    },
  })

  return NextResponse.json({ data: record })
}

// POST /api/attendance/checkin — Check in or check out
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!employee) {
    return NextResponse.json({ error: "Không tìm thấy hồ sơ nhân viên" }, { status: 404 })
  }

  const body = await request.json()
  const { action, latitude, longitude } = body as {
    action: "checkin" | "checkout"
    latitude?: number
    longitude?: number
  }

  if (!action || !["checkin", "checkout"].includes(action)) {
    return NextResponse.json({ error: "Action phải là 'checkin' hoặc 'checkout'" }, { status: 400 })
  }

  const today = getVNToday()
  const now = new Date()
  const vnNow = getVNNow()

  // Get or find existing record
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date: today,
      },
    },
  })

  if (action === "checkin") {
    if (existing?.checkInAt) {
      return NextResponse.json({ error: "Bạn đã check-in hôm nay rồi" }, { status: 400 })
    }

    // Determine status: LATE if after 8:30
    const isLate = vnNow.getHours() > 8 || (vnNow.getHours() === 8 && vnNow.getMinutes() > 30)

    const record = await prisma.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
      create: {
        employeeId: employee.id,
        date: today,
        checkInAt: now,
        checkInLat: latitude ?? null,
        checkInLng: longitude ?? null,
        status: isLate ? "LATE" : "PRESENT",
      },
      update: {
        checkInAt: now,
        checkInLat: latitude ?? null,
        checkInLng: longitude ?? null,
        status: isLate ? "LATE" : "PRESENT",
      },
    })

    return NextResponse.json({ data: record })
  }

  // action === "checkout"
  if (!existing?.checkInAt) {
    return NextResponse.json({ error: "Bạn chưa check-in hôm nay" }, { status: 400 })
  }

  if (existing.checkOutAt) {
    return NextResponse.json({ error: "Bạn đã check-out hôm nay rồi" }, { status: 400 })
  }

  // Calculate work hours
  const checkInTime = new Date(existing.checkInAt)
  const diffMs = now.getTime() - checkInTime.getTime()
  const workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100

  const record = await prisma.attendanceRecord.update({
    where: { id: existing.id },
    data: {
      checkOutAt: now,
      checkOutLat: latitude ?? null,
      checkOutLng: longitude ?? null,
      workHours,
    },
  })

  return NextResponse.json({ data: record })
}
