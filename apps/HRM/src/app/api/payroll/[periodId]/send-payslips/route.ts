import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emailService, type PayslipEmailData } from "@/lib/services/email.service"
import { writeAudit } from "@/lib/services/audit.service"

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { periodId } = await params

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
  })
  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy bảng lương" }, { status: 404 })
  }
  if (period.status !== "APPROVED" && period.status !== "PAID") {
    return NextResponse.json({ error: "Bảng lương chưa được duyệt" }, { status: 400 })
  }

  // Parse optional employeeIds filter
  let employeeIds: string[] | null = null
  try {
    const body = await request.json()
    if (body.employeeIds && Array.isArray(body.employeeIds)) {
      employeeIds = body.employeeIds
    }
  } catch {
    // No body — send to all
  }

  // Fetch employee payrolls with employee data + items
  const whereClause: Record<string, unknown> = { periodId }
  if (employeeIds) {
    whereClause.employeeId = { in: employeeIds }
  }

  const employeePayrolls = await prisma.employeePayroll.findMany({
    where: whereClause,
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          personalEmail: true,
          companyEmail: true,
        },
      },
      items: true,
    },
  })

  const sent: string[] = []
  const failed: { name: string; error: string }[] = []
  const skipped: string[] = []

  // Check SMTP availability
  const smtpAvailable = emailService.isSmtpConfigured()

  for (const ep of employeePayrolls) {
    const email = ep.employee.personalEmail || ep.employee.companyEmail
    if (!email) {
      skipped.push(ep.employee.fullName)
      continue
    }

    if (!smtpAvailable) {
      skipped.push(`${ep.employee.fullName} (no SMTP)`)
      continue
    }

    const payslipData: PayslipEmailData = {
      toEmail: email,
      employeeName: ep.employee.fullName,
      employeeCode: ep.employee.employeeCode,
      month: period.month,
      year: period.year,
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

    try {
      await emailService.sendPayslip(payslipData)
      sent.push(ep.employee.fullName)
    } catch (err) {
      failed.push({
        name: ep.employee.fullName,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }

    // 200ms delay between emails to avoid SMTP rate limit
    await delay(200)
  }

  // Write audit
  await writeAudit({
    action: "PAYSLIP_EMAIL_SENT",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "PayrollPeriod",
    targetId: periodId,
    targetName: `Bảng lương ${period.month}/${period.year}`,
    metadata: {
      sent: sent.length,
      failed: failed.length,
      skipped: skipped.length,
    },
  })

  return NextResponse.json({
    sent: sent.length,
    failed: failed.length,
    skipped: skipped.length,
    errors: failed,
  })
}
