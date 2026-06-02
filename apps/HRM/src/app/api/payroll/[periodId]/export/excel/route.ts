import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generatePayrollExcel } from "@/lib/export/payroll-excel"
import { writeAudit } from "@/lib/services/audit.service"

// GET /api/payroll/[periodId]/export/excel
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // RBAC: HR_MANAGER, SUPER_ADMIN, ACCOUNTANT only
  if (!["SUPER_ADMIN", "HR_MANAGER", "ACCOUNTANT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { periodId } = await params

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
    include: {
      employeePayrolls: {
        include: {
          employee: {
            select: {
              employeeCode: true,
              fullName: true,
              nameNoAccent: true,
              department: { select: { name: true } },
              position: { select: { name: true } },
              contracts: {
                where: { status: "ACTIVE" },
                select: { type: true },
                take: 1,
              },
            },
          },
          items: {
            select: { type: true, amount: true },
          },
        },
        orderBy: { employee: { employeeCode: "asc" } },
      },
    },
  })

  if (!period) {
    return NextResponse.json({ error: "Không tìm thấy kỳ lương" }, { status: 404 })
  }

  if (!["APPROVED", "PAID"].includes(period.status)) {
    return NextResponse.json({ error: "Chỉ xuất Excel khi bảng lương đã duyệt" }, { status: 400 })
  }

  const buffer = generatePayrollExcel(period)

  await writeAudit({
    action: "EXPORT",
    actorId: session.user.id,
    actorName: session.user.name || session.user.email || "",
    actorRole: session.user.role,
    targetType: "PayrollPeriod",
    targetId: periodId,
    targetName: `Excel bảng lương ${period.month}/${period.year}`,
    metadata: { format: "xlsx" },
  })

  const filename = `Luong-${String(period.month).padStart(2, "0")}-${period.year}-RTR.xlsx`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
