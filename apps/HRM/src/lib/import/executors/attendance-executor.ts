import { prisma } from "@/lib/prisma"
import { parseDate, parseTime, parseAttendanceStatus } from "../parsers"
import { calculateWorkHours, determineStatus } from "@/lib/config/attendance"
import type { ColumnMapping } from "@/lib/ai/import-mapper"
import { applyMapping, type ImportError } from "../validators"

interface ExecutorResult {
  importedIds: string[]
  errors: ImportError[]
  successCount: number
}

export async function executeAttendanceImport(
  rawRows: Record<string, unknown>[],
  mapping: ColumnMapping
): Promise<ExecutorResult> {
  const mappedRows = applyMapping(rawRows, mapping)
  const errors: ImportError[] = []
  const importedIds: string[] = []

  await prisma.$transaction(
    async (tx) => {
      const employees = await tx.employee.findMany({
        select: { id: true, employeeCode: true, fullName: true },
      })
      const empByCode = new Map(employees.map((e) => [e.employeeCode, e]))
      const empByName = new Map(employees.map((e) => [e.fullName.toLowerCase(), e]))

      for (let i = 0; i < mappedRows.length; i++) {
        const row = mappedRows[i]
        const rowNum = i + 2

        try {
          const code = row.employeeCode ? String(row.employeeCode).trim() : ""
          const name = row.employeeName ? String(row.employeeName).trim().toLowerCase() : ""
          const emp = code ? empByCode.get(code) : empByName.get(name)

          if (!emp) {
            errors.push({ row: rowNum, field: "employeeCode", message: `Không tìm thấy NV: "${code || row.employeeName}"`, severity: "error" })
            continue
          }

          const date = parseDate(row.date)
          if (!date) {
            errors.push({ row: rowNum, field: "date", message: `Ngày không hợp lệ: "${row.date}"`, severity: "error" })
            continue
          }

          // Create date for @db.Date field — midnight UTC with correct date
          const dateForDb = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

          // Check duplicate
          const existing = await tx.attendanceRecord.findUnique({
            where: { employeeId_date: { employeeId: emp.id, date: dateForDb } },
          })
          if (existing) {
            errors.push({ row: rowNum, field: "date", message: `Bản ghi chấm công đã tồn tại cho ngày ${row.date}`, severity: "warning" })
            continue
          }

          // Parse times
          let checkInAt: Date | undefined
          let checkOutAt: Date | undefined

          const checkInTime = parseTime(row.checkIn)
          if (checkInTime) {
            checkInAt = new Date(dateForDb)
            checkInAt.setUTCHours(checkInTime.hours, checkInTime.minutes, 0, 0)
          }

          const checkOutTime = parseTime(row.checkOut)
          if (checkOutTime) {
            checkOutAt = new Date(dateForDb)
            checkOutAt.setUTCHours(checkOutTime.hours, checkOutTime.minutes, 0, 0)
          }

          // Calculate work hours and status
          let workHours = 0
          let status = parseAttendanceStatus(row.status) || "PRESENT"

          if (checkInAt && checkOutAt) {
            workHours = calculateWorkHours(checkInAt, checkOutAt)
            status = determineStatus(checkInAt, workHours)
          }

          const record = await tx.attendanceRecord.create({
            data: {
              employeeId: emp.id,
              date: dateForDb,
              checkInAt,
              checkOutAt,
              workHours,
              status,
              isManualEdit: true,
              editNote: "Nhập từ Excel",
            },
          })
          importedIds.push(record.id)
        } catch (error) {
          errors.push({
            row: rowNum,
            field: "general",
            message: error instanceof Error ? error.message : "Lỗi không xác định",
            severity: "error",
          })
        }
      }
    },
    { timeout: 120000 }
  )

  return { importedIds, errors, successCount: importedIds.length }
}
