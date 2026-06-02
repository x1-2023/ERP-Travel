import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  calculateBusinessNights,
  calculateOTHours,
  validateOTReport,
  calculateLeaveDays,
} from "@/lib/calculators/report"

// Simple in-memory rate limiter for POST
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 10 // max 10 creates per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT_MAX
}

// GET /api/reports — List reports with filters
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const employeeId = searchParams.get("employeeId")
  const pendingApproval = searchParams.get("pendingApproval")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}

  if (type) where.type = type
  if (status) where.status = status
  if (employeeId) where.employeeId = employeeId

  const role = session.user.role

  if (pendingApproval === "true") {
    // Approval queue filtering
    if (role === "DEPT_MANAGER") {
      // L1: only SUBMITTED reports from managed departments
      const userEmployee = await prisma.employee.findFirst({
        where: { userId: session.user.id },
      })
      if (userEmployee) {
        const managedDepts = await prisma.department.findMany({
          where: { managerId: userEmployee.id },
          select: { id: true },
        })
        where.status = "SUBMITTED"
        where.employee = { departmentId: { in: managedDepts.map((d) => d.id) } }
      }
    } else if (["SUPER_ADMIN", "HR_MANAGER"].includes(role)) {
      // L2: APPROVED_L1 from all
      where.status = "APPROVED_L1"
    } else {
      return NextResponse.json({ data: [] })
    }
  } else if (role === "EMPLOYEE") {
    // Employees only see their own reports
    const userEmployee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (userEmployee) {
      where.employeeId = userEmployee.id
    } else {
      return NextResponse.json({ data: [] })
    }
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          fullName: true,
          employeeCode: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json({ data: reports })
}

// POST /api/reports — Create new report
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { type, startDate, endDate, notes, payload: rawPayload, employeeId: bodyEmployeeId } = body

  if (!type || !startDate || !endDate) {
    return NextResponse.json({ error: "Thiếu type, startDate hoặc endDate" }, { status: 400 })
  }

  // Rate limiting
  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json({ error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }, { status: 429 })
  }

  // Date validations
  const startD = new Date(startDate)
  const endD = new Date(endDate)
  if (endD < startD) {
    return NextResponse.json({ error: "Ngày kết thúc không được trước ngày bắt đầu" }, { status: 400 })
  }
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  if (startD < thirtyDaysAgo) {
    return NextResponse.json({ error: "Ngày bắt đầu không được quá 30 ngày trong quá khứ" }, { status: 400 })
  }

  // Determine employee
  let employeeId = bodyEmployeeId
  if (!employeeId || session.user.role === "EMPLOYEE") {
    const userEmployee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!userEmployee) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ nhân viên" }, { status: 400 })
    }
    employeeId = userEmployee.id
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = rawPayload || {}

  // Type-specific processing
  if (type === "BUSINESS_TRIP") {
    payload.nightCount = calculateBusinessNights(start, end)
    payload.businessDays = payload.nightCount
  }

  if (type === "OVERTIME") {
    if (!payload.startTime || !payload.endTime || !payload.otType) {
      return NextResponse.json({ error: "Thiếu startTime, endTime hoặc otType cho tăng ca" }, { status: 400 })
    }
    const validation = validateOTReport(payload as { startTime: string; endTime: string; otType: "WEEKDAY" | "WEEKEND" | "HOLIDAY" | "NIGHT_SHIFT" })
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join("; ") }, { status: 400 })
    }
    payload.hours = calculateOTHours(payload.startTime, payload.endTime)
  }

  if (type.startsWith("LEAVE_")) {
    const excludeWeekends = type === "LEAVE_PAID" || type === "LEAVE_WEDDING"
    payload.dayCount = calculateLeaveDays(start, end, excludeWeekends)

    // Check leave balance for LEAVE_PAID
    if (type === "LEAVE_PAID") {
      const currentYear = new Date().getFullYear()
      const balance = await prisma.leaveBalance.findUnique({
        where: { employeeId_year: { employeeId, year: currentYear } },
      })
      const remaining = balance ? Number(balance.remainingDays) : 12
      if (payload.dayCount > remaining) {
        return NextResponse.json({
          error: `Không đủ số ngày phép (còn ${remaining} ngày, cần ${payload.dayCount} ngày)`,
        }, { status: 400 })
      }
    }
  }

  const report = await prisma.report.create({
    data: {
      employeeId,
      type,
      startDate: start,
      endDate: end,
      notes: notes || null,
      payload,
    },
    include: {
      employee: {
        select: { fullName: true, employeeCode: true },
      },
    },
  })

  return NextResponse.json({ data: report }, { status: 201 })
}
