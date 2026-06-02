import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAudit } from "@/lib/services/audit.service"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { sessionId } = await params

  try {
    const importSession = await prisma.importSession.findUnique({
      where: { id: sessionId },
    })

    if (!importSession) {
      return NextResponse.json({ error: "Phiên import không tồn tại" }, { status: 404 })
    }

    if (importSession.status !== "COMPLETED") {
      return NextResponse.json({ error: "Chỉ có thể rollback phiên đã hoàn thành" }, { status: 400 })
    }

    const importedIds = importSession.importedIds as string[]
    const metadata = (importSession.metadata || {}) as Record<string, unknown>

    // Delete imported records by type
    switch (importSession.type) {
      case "EMPLOYEES": {
        if (importedIds.length > 0) {
          await prisma.employee.deleteMany({ where: { id: { in: importedIds } } })
        }
        // Also delete auto-created departments and positions
        const createdDeptIds = (metadata.createdDepartmentIds || []) as string[]
        const createdPosIds = (metadata.createdPositionIds || []) as string[]
        if (createdPosIds.length > 0) {
          await prisma.position.deleteMany({ where: { id: { in: createdPosIds } } })
        }
        if (createdDeptIds.length > 0) {
          await prisma.department.deleteMany({ where: { id: { in: createdDeptIds } } })
        }
        break
      }
      case "PAYROLL": {
        if (importedIds.length > 0) {
          await prisma.employeePayroll.deleteMany({ where: { id: { in: importedIds } } })
        }
        const createdPeriodIds = (metadata.createdPeriodIds || []) as string[]
        if (createdPeriodIds.length > 0) {
          // Only delete periods that have no other payrolls
          for (const periodId of createdPeriodIds) {
            const count = await prisma.employeePayroll.count({ where: { periodId } })
            if (count === 0) {
              await prisma.payrollPeriod.delete({ where: { id: periodId } })
            }
          }
        }
        break
      }
      case "ATTENDANCE": {
        if (importedIds.length > 0) {
          await prisma.attendanceRecord.deleteMany({ where: { id: { in: importedIds } } })
        }
        break
      }
      case "CONTRACTS": {
        if (importedIds.length > 0) {
          await prisma.contract.deleteMany({ where: { id: { in: importedIds } } })
        }
        break
      }
    }

    // Update session
    await prisma.importSession.update({
      where: { id: sessionId },
      data: {
        status: "ROLLED_BACK",
        rolledBackAt: new Date(),
      },
    })

    // Audit log
    try {
      await writeAudit({
        action: "DATA_IMPORT_ROLLBACK",
        actorId: session.user.id,
        actorName: session.user.name || session.user.email || "",
        actorRole: session.user.role,
        targetType: "ImportSession",
        targetId: sessionId,
        targetName: `${importSession.type} - ${importSession.fileName}`,
        metadata: {
          type: importSession.type,
          rolledBackRecords: importedIds.length,
        },
      })
    } catch {
      // Audit failure should not block rollback
    }

    return NextResponse.json({
      success: true,
      rolledBack: importedIds.length,
    })
  } catch (error) {
    console.error("Import rollback error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi rollback" },
      { status: 500 }
    )
  }
}
