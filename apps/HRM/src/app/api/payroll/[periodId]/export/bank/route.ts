import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAudit } from "@/lib/services/audit.service"

// GET /api/payroll/[periodId]/export/bank — Export bank transfer CSV
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["SUPER_ADMIN", "HR_MANAGER", "ACCOUNTANT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { periodId } = await params

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
    select: { status: true, month: true, year: true },
  })
  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy bảng lương" }, { status: 404 })
  }
  if (period.status !== "APPROVED" && period.status !== "PAID") {
    return NextResponse.json({ error: "Bảng lương chưa được duyệt" }, { status: 400 })
  }

  const employeePayrolls = await prisma.employeePayroll.findMany({
    where: { periodId },
    include: {
      employee: {
        select: {
          employeeCode: true,
          fullName: true,
        },
      },
    },
    orderBy: { employee: { employeeCode: "asc" } },
  })

  const lines: string[] = []
  lines.push("STT,Mã NV,Họ Tên,Tên Không Dấu,Số TK,Ngân Hàng,Số Tiền")

  let stt = 0
  let totalAmount = 0
  let skipped = 0

  for (const ep of employeePayrolls) {
    const net = Number(ep.netSalary)
    if (net <= 0) continue

    if (!ep.bankAccount) {
      skipped++
      console.log(`[Bank Export] WARNING: ${ep.employee.employeeCode} - ${ep.employee.fullName} skipped (no bank account)`)
      continue
    }

    stt++
    totalAmount += net
    const row = [
      stt,
      ep.employee.employeeCode,
      `"${ep.employee.fullName}"`,
      `"${ep.nameNoAccent || ""}"`,
      ep.bankAccount,
      `"${ep.bankName || ""}"`,
      net,
    ].join(",")
    lines.push(row)
  }

  lines.push("")
  lines.push(`Tổng,${stt} nhân viên,,,,,"${totalAmount}"`)
  if (skipped > 0) {
    console.log(`[Bank Export] ${skipped} employee(s) skipped (no bank account)`)
  }

  const csv = lines.join("\n")
  const filename = `bank-transfer-${period.month}-${period.year}.csv`

  await writeAudit({
    action: "EXPORT",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "PayrollPeriod",
    targetId: periodId,
    targetName: `Bank CSV ${period.month}/${period.year}`,
    metadata: { format: "csv", employeeCount: stt, skipped },
  })

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
