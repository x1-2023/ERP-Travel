import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FileAdapter } from "@/lib/attendance/file-adapter"
import { calculateWorkHours, determineStatus } from "@/lib/config/attendance"
import type { DeviceFormat, ParseError } from "@/lib/attendance/adapter"

const ALLOWED_ROLES = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"]

/**
 * POST /api/attendance/import
 *
 * Body: FormData with:
 *   - file: Excel/CSV file from attendance device
 *   - format: DeviceFormat (optional, default "auto")
 *   - mode: "preview" | "import" (default "preview")
 *   - duplicateStrategy: "skip" | "overwrite" (default "skip")
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const format = (formData.get("format") as DeviceFormat) || "auto"
  const mode = (formData.get("mode") as string) || "preview"
  const duplicateStrategy = (formData.get("duplicateStrategy") as "skip" | "overwrite") || "skip"

  if (!file) {
    return NextResponse.json({ error: "Vui lòng chọn file" }, { status: 400 })
  }

  // Validate file type
  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
    return NextResponse.json({ error: "Chỉ hỗ trợ file Excel (.xlsx, .xls) hoặc CSV (.csv)" }, { status: 400 })
  }

  // Parse file
  const buffer = Buffer.from(await file.arrayBuffer())
  const adapter = new FileAdapter()
  const parseResult = await adapter.parse(buffer, {
    deviceFormat: format,
    duplicateStrategy,
  })

  if (parseResult.records.length === 0) {
    return NextResponse.json({
      error: "Không tìm thấy dữ liệu chấm công trong file",
      parseErrors: parseResult.errors,
      meta: parseResult.meta,
    }, { status: 400 })
  }

  // Match employee codes/names to actual employees
  const employees = await prisma.employee.findMany({
    where: { status: { in: ["ACTIVE", "PROBATION", "ON_LEAVE"] } },
    select: { id: true, employeeCode: true, fullName: true },
  })
  const empByCode = new Map(employees.map(e => [e.employeeCode, e]))
  const empByName = new Map(employees.map(e => [e.fullName.toLowerCase(), e]))

  // Build preview data
  const preview: {
    employeeCode: string
    employeeName: string
    date: string
    checkIn: string | null
    checkOut: string | null
    workHours: number
    status: string
    matched: boolean
    matchedEmployeeId?: string
    matchedEmployeeName?: string
    conflict: boolean
    conflictAction?: string
  }[] = []

  const matchErrors: ParseError[] = []
  let matchedCount = 0
  let unmatchedCount = 0
  let conflictCount = 0

  for (const rec of parseResult.records) {
    const emp = rec.employeeCode
      ? empByCode.get(rec.employeeCode)
      : rec.employeeName
        ? empByName.get(rec.employeeName.toLowerCase())
        : null

    if (!emp) {
      unmatchedCount++
      matchErrors.push({
        row: 0,
        field: "employee",
        message: `Không tìm thấy NV: "${rec.employeeCode || rec.employeeName}"`,
        severity: "warning",
      })
    } else {
      matchedCount++
    }

    // Check for existing record
    let conflict = false
    if (emp) {
      const dateForDb = new Date(Date.UTC(rec.date.getFullYear(), rec.date.getMonth(), rec.date.getDate()))
      const existing = await prisma.attendanceRecord.findUnique({
        where: { employeeId_date: { employeeId: emp.id, date: dateForDb } },
      })
      if (existing) {
        conflict = true
        conflictCount++
      }
    }

    // Calculate work hours + status
    let workHours = 0
    let status = "PRESENT"
    if (rec.checkIn && rec.checkOut) {
      workHours = calculateWorkHours(rec.checkIn, rec.checkOut)
      status = determineStatus(rec.checkIn, workHours)
    } else if (!rec.checkIn && !rec.checkOut) {
      status = "ABSENT"
    } else {
      status = "HALF_DAY"
      workHours = 4
    }

    preview.push({
      employeeCode: rec.employeeCode || "",
      employeeName: rec.employeeName || "",
      date: rec.date.toISOString().split("T")[0],
      checkIn: rec.checkIn ? `${String(rec.checkIn.getHours()).padStart(2, "0")}:${String(rec.checkIn.getMinutes()).padStart(2, "0")}` : null,
      checkOut: rec.checkOut ? `${String(rec.checkOut.getHours()).padStart(2, "0")}:${String(rec.checkOut.getMinutes()).padStart(2, "0")}` : null,
      workHours: Math.round(workHours * 100) / 100,
      status,
      matched: !!emp,
      matchedEmployeeId: emp?.id,
      matchedEmployeeName: emp?.fullName,
      conflict,
      conflictAction: conflict ? duplicateStrategy : undefined,
    })
  }

  // PREVIEW MODE: return parsed data for user review
  if (mode === "preview") {
    return NextResponse.json({
      mode: "preview",
      meta: parseResult.meta,
      summary: {
        totalRecords: parseResult.records.length,
        matched: matchedCount,
        unmatched: unmatchedCount,
        conflicts: conflictCount,
        willImport: preview.filter(p => p.matched && (!p.conflict || duplicateStrategy === "overwrite")).length,
      },
      preview: preview.slice(0, 200), // limit preview to 200 rows
      parseErrors: [...parseResult.errors, ...matchErrors],
    })
  }

  // IMPORT MODE: create/update records
  const importErrors: ParseError[] = []
  let created = 0
  let updated = 0
  let skipped = 0

  await prisma.$transaction(async (tx) => {
    for (const row of preview) {
      if (!row.matched || !row.matchedEmployeeId) {
        skipped++
        continue
      }

      const dateForDb = new Date(Date.UTC(
        parseInt(row.date.split("-")[0]),
        parseInt(row.date.split("-")[1]) - 1,
        parseInt(row.date.split("-")[2])
      ))

      const checkInAt = row.checkIn
        ? new Date(dateForDb.getTime() + parseInt(row.checkIn.split(":")[0]) * 3600000 + parseInt(row.checkIn.split(":")[1]) * 60000)
        : undefined
      const checkOutAt = row.checkOut
        ? new Date(dateForDb.getTime() + parseInt(row.checkOut.split(":")[0]) * 3600000 + parseInt(row.checkOut.split(":")[1]) * 60000)
        : undefined

      try {
        if (row.conflict && duplicateStrategy === "skip") {
          skipped++
          continue
        }

        if (row.conflict && duplicateStrategy === "overwrite") {
          await tx.attendanceRecord.update({
            where: { employeeId_date: { employeeId: row.matchedEmployeeId, date: dateForDb } },
            data: {
              checkInAt,
              checkOutAt,
              workHours: row.workHours,
              status: row.status as "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT",
              isManualEdit: true,
              editedBy: session.user.id,
              editNote: `Import từ máy chấm công (${parseResult.meta.deviceType})`,
            },
          })
          updated++
        } else {
          await tx.attendanceRecord.create({
            data: {
              employeeId: row.matchedEmployeeId,
              date: dateForDb,
              checkInAt,
              checkOutAt,
              workHours: row.workHours,
              status: row.status as "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT",
              isManualEdit: true,
              editedBy: session.user.id,
              editNote: `Import từ máy chấm công (${parseResult.meta.deviceType})`,
            },
          })
          created++
        }
      } catch (err) {
        importErrors.push({
          row: 0,
          field: "import",
          message: `Lỗi import NV ${row.employeeCode}: ${err instanceof Error ? err.message : "Unknown"}`,
          severity: "error",
        })
      }
    }
  }, { timeout: 120000 })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE",
      entity: "AttendanceRecord",
      actorName: session.user.name || "",
      actorRole: session.user.role,
      targetName: `Import chấm công: ${created} tạo, ${updated} cập nhật, ${skipped} bỏ qua`,
      newData: {
        fileName: file.name,
        deviceType: parseResult.meta.deviceType,
        dateRange: parseResult.meta.dateRange,
        created, updated, skipped,
      },
    },
  })

  return NextResponse.json({
    mode: "import",
    result: { created, updated, skipped },
    errors: importErrors,
    meta: parseResult.meta,
  })
}
