import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Fields an employee can self-edit
const ALLOWED_FIELDS = [
  "phone", "currentAddress", "personalEmail",
  "bankAccount", "bankBranch", "vehiclePlate",
] as const

// GET /api/profile — Get own profile
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      employee: {
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          gender: true,
          dateOfBirth: true,
          phone: true,
          currentAddress: true,
          permanentAddress: true,
          personalEmail: true,
          companyEmail: true,
          bankAccount: true,
          bankBranch: true,
          vehiclePlate: true,
          nationalId: true,
          taxCode: true,
          insuranceCode: true,
          startDate: true,
          status: true,
          department: { select: { id: true, name: true } },
          position: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })
  }

  return NextResponse.json({ data: user })
}

// PUT /api/profile — Update own profile (limited fields)
export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id },
  })

  if (!employee) {
    return NextResponse.json({ error: "Không tìm thấy hồ sơ nhân viên" }, { status: 404 })
  }

  const body = await request.json()

  // Only pick allowed fields, ignore everything else
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = []

  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      const oldVal = employee[field] as string | null
      const newVal = body[field] as string | null
      if (oldVal !== newVal) {
        updateData[field] = newVal
        changes.push({ field, oldValue: oldVal, newValue: newVal })
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ data: employee, message: "Không có thay đổi" })
  }

  // Validate phone format if provided
  if (updateData.phone && !/^0\d{9,10}$/.test(updateData.phone)) {
    return NextResponse.json({ error: "Số điện thoại không hợp lệ (VD: 0901234567)" }, { status: 400 })
  }

  const updated = await prisma.employee.update({
    where: { id: employee.id },
    data: updateData,
    select: {
      id: true, employeeCode: true, fullName: true,
      phone: true, currentAddress: true, personalEmail: true,
      bankAccount: true, bankBranch: true, vehiclePlate: true,
    },
  })

  // Record change history for each changed field
  await prisma.employeeChangeHistory.createMany({
    data: changes.map((ch) => ({
      employeeId: employee.id,
      changedBy: `${employee.fullName} (self)`,
      fieldName: ch.field,
      oldValue: ch.oldValue,
      newValue: ch.newValue,
      reason: "Tự cập nhật hồ sơ",
    })),
  })

  return NextResponse.json({ data: updated })
}
