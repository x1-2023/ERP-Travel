import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "HR_MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only HR_MANAGER can approve" }, { status: 403 })
  }

  const { id } = await params

  const event = await prisma.hREvent.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true, fullName: true, employeeCode: true,
          departmentId: true, positionId: true,
          contracts: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (event.status !== "PENDING") {
    return NextResponse.json({ error: "Event is not PENDING" }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = event.payload as any
  const employee = event.employee
  const changeHistoryRecords: { employeeId: string; changedBy: string; fieldName: string; oldValue: string | null; newValue: string | null; reason: string }[] = []
  const eventTypeLabel = {
    DEPARTMENT_TRANSFER: "Chuyển phòng ban",
    PROMOTION: "Thăng chức",
    RECOGNITION: "Khen thưởng",
    DISCIPLINARY: "Kỷ luật",
    SALARY_ADJUSTMENT: "Điều chỉnh lương",
  }[event.type]

  // Validate salary adjustment has active contract before entering transaction
  if (event.type === "SALARY_ADJUSTMENT") {
    const activeContract = employee.contracts[0]
    if (!activeContract) {
      return NextResponse.json(
        { error: "Nhân viên chưa có hợp đồng ACTIVE. Tạo hợp đồng trước khi điều chỉnh lương." },
        { status: 400 }
      )
    }
  }

  // All DB changes in a single transaction for atomicity
  const updated = await prisma.$transaction(async (tx) => {
    // Execute changes based on event type
    if (event.type === "DEPARTMENT_TRANSFER") {
      const updateData: Record<string, string> = {}
      if (payload.toDepartmentId) {
        changeHistoryRecords.push({
          employeeId: employee.id,
          changedBy: session.user.id,
          fieldName: "departmentId",
          oldValue: employee.departmentId,
          newValue: payload.toDepartmentId,
          reason: `${eventTypeLabel} — HR Event #${event.id}`,
        })
        updateData.departmentId = payload.toDepartmentId
      }
      if (payload.toPositionId) {
        changeHistoryRecords.push({
          employeeId: employee.id,
          changedBy: session.user.id,
          fieldName: "positionId",
          oldValue: employee.positionId,
          newValue: payload.toPositionId,
          reason: `${eventTypeLabel} — HR Event #${event.id}`,
        })
        updateData.positionId = payload.toPositionId
      }
      if (Object.keys(updateData).length > 0) {
        await tx.employee.update({ where: { id: employee.id }, data: updateData })
      }
    } else if (event.type === "PROMOTION") {
      if (payload.toPositionId) {
        changeHistoryRecords.push({
          employeeId: employee.id,
          changedBy: session.user.id,
          fieldName: "positionId",
          oldValue: employee.positionId,
          newValue: payload.toPositionId,
          reason: `${eventTypeLabel} — HR Event #${event.id}`,
        })
        await tx.employee.update({
          where: { id: employee.id },
          data: { positionId: payload.toPositionId },
        })
      }
    } else if (event.type === "DISCIPLINARY") {
      await tx.disciplinaryRecord.create({
        data: {
          employeeId: employee.id,
          hrEventId: event.id,
          level: payload.level || "WARNING",
          reason: payload.reason || event.note || "Kỷ luật",
          decisionNo: payload.decisionNo || null,
          issuedBy: session.user.id,
          issuedAt: event.effectiveDate,
        },
      })

      if (payload.level === "TERMINATION") {
        changeHistoryRecords.push({
          employeeId: employee.id,
          changedBy: session.user.id,
          fieldName: "status",
          oldValue: "ACTIVE",
          newValue: "TERMINATED",
          reason: `${eventTypeLabel} (Sa thải) — HR Event #${event.id}`,
        })
        await tx.employee.update({
          where: { id: employee.id },
          data: { status: "TERMINATED" },
        })
      }
    } else if (event.type === "SALARY_ADJUSTMENT") {
      const activeContract = employee.contracts[0]
      if (payload.toSalary && activeContract) {
        changeHistoryRecords.push({
          employeeId: employee.id,
          changedBy: session.user.id,
          fieldName: "baseSalary",
          oldValue: activeContract.baseSalary?.toString() || null,
          newValue: payload.toSalary.toString(),
          reason: `${eventTypeLabel} — HR Event #${event.id}`,
        })

        const annexUpdate: Record<string, unknown> = { baseSalary: parseFloat(payload.toSalary) }
        if (!activeContract.annexNo1) {
          annexUpdate.annexNo1 = payload.annexNo || `PL-${Date.now()}`
          annexUpdate.annexDate1 = event.effectiveDate
        } else if (!activeContract.annexNo2) {
          annexUpdate.annexNo2 = payload.annexNo || `PL-${Date.now()}`
          annexUpdate.annexDate2 = event.effectiveDate
        } else if (!activeContract.annexNo3) {
          annexUpdate.annexNo3 = payload.annexNo || `PL-${Date.now()}`
          annexUpdate.annexDate3 = event.effectiveDate
        }

        await tx.contract.update({
          where: { id: activeContract.id },
          data: annexUpdate,
        })
      }
    }

    // Write change history
    if (changeHistoryRecords.length > 0) {
      await tx.employeeChangeHistory.createMany({ data: changeHistoryRecords })
    }

    // Update event status
    return tx.hREvent.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
      include: {
        employee: { select: { id: true, fullName: true, employeeCode: true } },
      },
    })
  })

  // Notify requester
  try {
    await notificationService.create({
      userId: event.requestedBy,
      type: "HR_EVENT",
      title: `${eventTypeLabel} được duyệt`,
      message: `${eventTypeLabel} cho ${employee.fullName} (${employee.employeeCode}) đã được phê duyệt`,
      link: `/hr-events/${event.id}`,
    })
  } catch (e) {
    console.error("Notification error:", e)
  }

  return NextResponse.json(updated)
}
