import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emailService, type PayslipEmailData } from "@/lib/services/email.service"

const ITEM_TYPE_LABELS: Record<string, string> = {
  KPI_CURRENT: "KPI tháng này",
  KPI_PREV1: "KPI tháng trước",
  KPI_PREV2: "KPI T-2",
  OT_WEEKDAY: "OT ngày thường (150%)",
  OT_WEEKEND: "OT T7/CN (200%)",
  OT_HOLIDAY: "OT Lễ (300%)",
  NIGHT_SHIFT: "Trực đêm",
  BUSINESS_TRIP: "Công tác",
  HAZARD_ALLOWANCE: "Phụ cấp độc hại",
  OTHER_ALLOWANCE: "Phụ cấp khác",
  ADVANCE_DEDUCTION: "Trừ tạm ứng",
  BONUS: "Thưởng",
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ periodId: string; epId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { periodId, epId } = await params

  const ep = await prisma.employeePayroll.findUnique({
    where: { id: epId },
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          personalEmail: true,
          companyEmail: true,
          userId: true,
        },
      },
      items: true,
      period: { select: { month: true, year: true, status: true } },
    },
  })

  if (!ep || ep.periodId !== periodId) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  }

  // RBAC: HR_MANAGER+ can view any, EMPLOYEE can view own
  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)
  const isOwn = ep.employee.userId === session.user.id
  if (!isHR && !isOwn) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const payslipData: PayslipEmailData = {
    toEmail: ep.employee.personalEmail || ep.employee.companyEmail || "",
    employeeName: ep.employee.fullName,
    employeeCode: ep.employee.employeeCode,
    month: ep.period.month,
    year: ep.period.year,
    baseSalary: Number(ep.baseSalary),
    totalContractSalary: Number(ep.totalContractSalary),
    totalActualSalary: Number(ep.totalActualSalary),
    actualDays: Number(ep.actualDays),
    standardDays: Number(ep.standardDays),
    items: ep.items.map((item) => ({
      type: item.type,
      label: ITEM_TYPE_LABELS[item.type] || item.type,
      amount: Number(item.amount),
    })),
    totalEmployeeIns: Number(ep.totalEmployeeIns),
    pitAmount: Number(ep.pitAmount),
    advanceDeduction: Number(ep.advanceDeduction),
    netSalary: Number(ep.netSalary),
    bankAccount: ep.bankAccount || "",
    bankName: ep.bankName || "",
  }

  const html = emailService.buildPayslipHtml(payslipData)

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
