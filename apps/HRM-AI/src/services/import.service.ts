import { db } from '@/lib/db'
import { parseExcel, parseCsv, type ParsedRow } from '@/lib/import/parser'
import { validateEmployeeRow, normalizeGender } from '@/lib/import/validators/employee'
import { audit } from '@/lib/audit/logger'
import type { ImportError } from '@/types/import'

export const importService = {
  async createJob(
    tenantId: string,
    userId: string,
    importType: string,
    fileName: string,
    fileBuffer: Buffer
  ): Promise<string> {
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
    const rows = isExcel ? await parseExcel(fileBuffer) : await parseCsv(fileBuffer)

    const job = await db.importJob.create({
      data: {
        tenantId,
        userId,
        importType,
        fileName,
        fileSize: fileBuffer.length,
        status: 'PENDING',
        totalRows: rows.length,
      },
    })

    processImportJob(job.id, tenantId, userId, importType, rows).catch(console.error)
    return job.id
  },

  async getJobs(tenantId: string, limit = 20) {
    return db.importJob.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    })
  },

  async getJob(tenantId: string, jobId: string) {
    return db.importJob.findFirst({
      where: { id: jobId, tenantId },
      include: { user: { select: { name: true, email: true } } },
    })
  },
}

async function processImportJob(
  jobId: string,
  tenantId: string,
  userId: string,
  importType: string,
  rows: ParsedRow[]
) {
  await db.importJob.update({
    where: { id: jobId },
    data: { status: 'PROCESSING', startedAt: new Date() },
  })

  const errors: ImportError[] = []
  let successRows = 0

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      try {
        let rowErrors: ImportError[] = []
        if (importType === 'employees') {
          rowErrors = await processEmployeeRow(tenantId, row, rowNum)
        } else if (importType === 'attendance') {
          rowErrors = await processAttendanceRow(tenantId, row, rowNum)
        }
        if (rowErrors.length > 0) {
          errors.push(...rowErrors)
        } else {
          successRows++
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        errors.push({ row: rowNum, field: 'general', error: msg })
      }

      if ((i + 1) % 10 === 0) {
        await db.importJob.update({
          where: { id: jobId },
          data: { processedRows: i + 1 },
        })
      }
    }

    await db.importJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        processedRows: rows.length,
        successRows,
        errorRows: rows.length - successRows,
        errors: errors.length > 0 ? JSON.parse(JSON.stringify(errors)) : undefined,
        summary: JSON.parse(JSON.stringify({ totalRows: rows.length, successRows, errorRows: rows.length - successRows })),
        completedAt: new Date(),
      },
    })

    await audit.import({ tenantId, userId }, importType, jobId, { totalRows: rows.length, successRows })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    await db.importJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errors: JSON.parse(JSON.stringify([{ row: 0, field: 'general', error: msg }])),
        completedAt: new Date(),
      },
    })
  }
}

async function processEmployeeRow(tenantId: string, row: ParsedRow, rowNum: number): Promise<ImportError[]> {
  const employeeCode = String(row['Mã NV'] || row.employeeCode || '').trim()
  const fullName = String(row['Họ và tên'] || row.fullName || '').trim()

  const validationErrors = validateEmployeeRow(row, rowNum)
  if (validationErrors.length > 0) return validationErrors

  const existing = await db.employee.findFirst({
    where: { tenantId, employeeCode },
  })

  if (existing) {
    return [{ row: rowNum, field: 'employeeCode', value: employeeCode, error: 'Mã NV đã tồn tại' }]
  }

  const deptCode = String(row['Mã phòng ban'] || row.departmentCode || '').trim()
  let departmentId: string | undefined
  if (deptCode) {
    const dept = await db.department.findFirst({ where: { tenantId, code: deptCode } })
    if (dept) departmentId = dept.id
  }

  const workEmail = String(row['Email'] || row.email || '').trim() || null
  const phone = String(row['Số điện thoại'] || row.phone || '').trim() || null
  const dateOfBirth = String(row['Ngày sinh'] || row.dateOfBirth || '').trim()
  const gender = String(row['Giới tính'] || row.gender || '').trim()
  const positionName = String(row['Chức vụ'] || row.position || '').trim()
  let positionId: string | undefined
  if (positionName) {
    const pos = await db.position.findFirst({ where: { tenantId, name: positionName } })
    if (pos) positionId = pos.id
  }
  const hireDate = String(row['Ngày vào làm'] || row.hireDate || '').trim()

  await db.employee.create({
    data: {
      tenantId,
      employeeCode,
      fullName,
      workEmail,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender ? normalizeGender(gender) : null,
      departmentId,
      positionId,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      status: 'ACTIVE',
    },
  })

  return []
}

async function processAttendanceRow(tenantId: string, row: ParsedRow, rowNum: number): Promise<ImportError[]> {
  const employeeCode = String(row['Mã NV'] || row.employeeCode || '').trim()
  const dateStr = String(row['Ngày'] || row.date || '').trim()

  if (!employeeCode) return [{ row: rowNum, field: 'employeeCode', error: 'Mã nhân viên bắt buộc' }]
  if (!dateStr) return [{ row: rowNum, field: 'date', error: 'Ngày bắt buộc' }]

  const employee = await db.employee.findFirst({
    where: { tenantId, employeeCode },
  })

  if (!employee) {
    return [{ row: rowNum, field: 'employeeCode', value: employeeCode, error: 'Không tìm thấy nhân viên' }]
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return [{ row: rowNum, field: 'date', value: dateStr, error: 'Ngày không hợp lệ' }]
  }

  const checkInStr = String(row['Giờ vào'] || row.checkIn || '').trim()
  const checkOutStr = String(row['Giờ ra'] || row.checkOut || '').trim()

  const checkIn = checkInStr ? parseTime(dateStr, checkInStr) : null
  const checkOut = checkOutStr ? parseTime(dateStr, checkOutStr) : null

  await db.attendance.upsert({
    where: {
      tenantId_employeeId_date: { tenantId, employeeId: employee.id, date },
    },
    update: { checkIn, checkOut },
    create: { tenantId, employeeId: employee.id, date, checkIn, checkOut, status: 'PRESENT' },
  })

  return []
}

function parseTime(dateStr: string, timeStr: string): Date | null {
  try {
    const parts = timeStr.split(':')
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1] || '0', 10)
    const date = new Date(dateStr)
    date.setHours(hours, minutes, 0, 0)
    return date
  } catch {
    return null
  }
}
