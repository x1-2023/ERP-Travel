import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

// Simple in-memory rate limiter for public endpoint
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5 // max 5 applications per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of Array.from(rateLimitMap.entries())) {
    if (now > val.resetAt) rateLimitMap.delete(key)
  }
}, 10 * 60 * 1000)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Bạn đã gửi quá nhiều đơn. Vui lòng thử lại sau 1 giờ." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { requisitionId, fullName, email, phone, dateOfBirth, currentAddress, school, major, expectedSalary, coverLetter, source } = body

    if (!requisitionId || !fullName || !email || !phone) {
      return NextResponse.json({ error: "Họ tên, email và số điện thoại là bắt buộc" }, { status: 400 })
    }

    // Basic input validation
    if (typeof fullName !== "string" || fullName.length > 200) {
      return NextResponse.json({ error: "Họ tên không hợp lệ" }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof email !== "string" || !emailRegex.test(email) || email.length > 100) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 })
    }
    if (typeof phone !== "string" || phone.length > 20) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 })
    }

    // Check JR status
    const jr = await prisma.jobRequisition.findUnique({
      where: { id: requisitionId },
      select: { id: true, status: true, title: true },
    })
    if (!jr) return NextResponse.json({ error: "Không tìm thấy vị trí tuyển dụng" }, { status: 404 })
    if (jr.status !== "OPEN") {
      return NextResponse.json({ error: "Vị trí đã đóng tuyển" }, { status: 400 })
    }

    // Upsert candidate by email
    const candidate = await prisma.candidate.upsert({
      where: { email },
      create: {
        fullName,
        email,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        currentAddress: currentAddress || null,
        school: school || null,
        major: major || null,
        source: source || null,
      },
      update: {
        fullName,
        phone: phone || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        currentAddress: currentAddress || undefined,
        school: school || undefined,
        major: major || undefined,
      },
    })

    // Check duplicate application
    const existing = await prisma.application.findFirst({
      where: { requisitionId, candidateId: candidate.id },
    })
    if (existing) {
      return NextResponse.json({ error: "Bạn đã ứng tuyển vị trí này rồi" }, { status: 409 })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        requisitionId,
        candidateId: candidate.id,
        coverLetter: coverLetter || null,
        expectedSalary: expectedSalary || null,
      },
    })

    // Notify HR staff
    try {
      await notificationService.notifyHR({
        type: "GENERAL",
        title: "Ứng viên mới",
        message: `${fullName} đã ứng tuyển vị trí "${jr.title}"`,
        link: `/recruitment/requisitions/${requisitionId}`,
      })
    } catch (e) {
      console.error("Notification error:", e)
    }

    return NextResponse.json({ success: true, applicationId: application.id }, { status: 201 })
  } catch (error) {
    console.error("Public apply error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
