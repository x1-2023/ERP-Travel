import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { syncDependentCount } from "@/lib/services/dependent-sync"

// GET /api/employees/[id]/dependents — List dependents
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // EMPLOYEE can only see own
  if (session.user.role === "EMPLOYEE") {
    const userEmp = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (userEmp?.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const dependents = await prisma.dependent.findMany({
    where: { employeeId: id },
    orderBy: { createdAt: "asc" },
  })

  const activeCount = dependents.filter((d) => d.isActive).length

  return NextResponse.json({
    data: dependents,
    activeCount,
    deductionAmount: activeCount * 4_400_000,
  })
}

// POST /api/employees/[id]/dependents — Add dependent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // EMPLOYEE can only add to own profile
  if (session.user.role === "EMPLOYEE") {
    const userEmp = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (userEmp?.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const body = await request.json()
  const { fullName, relationship, dateOfBirth, nationalId, taxDepCode, registeredAt } = body

  if (!fullName || !relationship || !dateOfBirth) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc (họ tên, quan hệ, ngày sinh)" }, { status: 400 })
  }

  const dob = new Date(dateOfBirth)
  if (dob >= new Date()) {
    return NextResponse.json({ error: "Ngày sinh phải trước ngày hiện tại" }, { status: 400 })
  }

  // Warning for child over 18
  let warning: string | undefined
  if (relationship === "Con") {
    const ageMs = Date.now() - dob.getTime()
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25)
    if (ageYears >= 18) {
      warning = "Con đã trên 18 tuổi — chỉ áp dụng nếu đang học hoặc bị tật nguyền"
    }
  }

  const dependent = await prisma.dependent.create({
    data: {
      employeeId: id,
      fullName,
      relationship,
      dateOfBirth: dob,
      nationalId: nationalId || null,
      taxDepCode: taxDepCode || null,
      registeredAt: registeredAt ? new Date(registeredAt) : null,
    },
  })

  // Sync dependentCount to DRAFT payroll
  const updatedCount = await syncDependentCount(id)

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      entity: "Dependent",
      entityId: dependent.id,
      newData: { fullName, relationship, dateOfBirth },
    },
  })

  return NextResponse.json({
    data: dependent,
    updatedDependentCount: updatedCount,
    ...(warning ? { warning } : {}),
  }, { status: 201 })
}

