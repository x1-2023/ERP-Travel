import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { convertToNoAccent } from "@/lib/utils/employee"
import { generateEmployeeCode } from "@/lib/utils/employee-server"
import { notificationService } from "@/lib/services/notification.service"
import { createOnboardingChecklist } from "@/lib/services/onboarding.service"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "HR_MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      candidate: true,
      requisition: { select: { departmentId: true, positionId: true } },
    },
  })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (app.status !== "OFFERED") {
    return NextResponse.json({ error: "Application must be in OFFERED status" }, { status: 400 })
  }

  const candidate = app.candidate
  const employeeCode = await generateEmployeeCode()

  // Create Employee
  const employee = await prisma.employee.create({
    data: {
      employeeCode,
      fullName: candidate.fullName,
      nameNoAccent: convertToNoAccent(candidate.fullName),
      gender: "MALE", // default, HR sửa sau
      dateOfBirth: candidate.dateOfBirth,
      phone: candidate.phone,
      personalEmail: candidate.email,
      nationalId: candidate.nationalId,
      currentAddress: candidate.currentAddress,
      school: candidate.school,
      major: candidate.major,
      departmentId: app.requisition.departmentId,
      positionId: app.requisition.positionId,
      status: "PROBATION",
      startDate: new Date(),
    },
  })

  // Create probation contract
  await prisma.contract.create({
    data: {
      employeeId: employee.id,
      type: "PROBATION",
      status: "DRAFT",
      probationFrom: new Date(),
      baseSalary: app.offeredSalary,
    },
  })

  // Update application
  await prisma.application.update({
    where: { id },
    data: {
      status: "ACCEPTED",
      employeeId: employee.id,
    },
  })

  // Create onboarding checklist
  try {
    await createOnboardingChecklist(employee.id, new Date())
  } catch (e) {
    console.error("Onboarding checklist error:", e)
  }

  // Notify HR team
  try {
    await notificationService.notifyHR({
      type: "EMPLOYEE_CREATED",
      title: "Nhân viên mới từ tuyển dụng",
      message: `${employee.fullName} (${employeeCode}) đã được tạo từ pipeline tuyển dụng`,
      link: `/employees/${employee.id}`,
    })
  } catch (e) {
    console.error("Notification error:", e)
  }

  return NextResponse.json({ employee, applicationId: id })
}
