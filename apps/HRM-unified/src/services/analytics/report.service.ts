// src/services/analytics/report.service.ts
// Analytics Report CRUD Service

import { db } from '@/lib/db'

export interface CreateReportInput {
  name: string
  description?: string
  dataSource: string
  columns: Array<{ field: string; label: string; type?: string }>
  filters?: Record<string, unknown>
  sorting?: Array<{ field: string; direction: 'asc' | 'desc' }>
  grouping?: Array<{ field: string }>
  aggregations?: Array<{ field: string; function: 'sum' | 'avg' | 'count' | 'min' | 'max' }>
  isScheduled?: boolean
  schedule?: Record<string, unknown>
}

export interface UpdateReportInput {
  name?: string
  description?: string
  dataSource?: string
  columns?: Array<{ field: string; label: string; type?: string }>
  filters?: Record<string, unknown>
  sorting?: Array<{ field: string; direction: 'asc' | 'desc' }>
  grouping?: Array<{ field: string }>
  aggregations?: Array<{ field: string; function: 'sum' | 'avg' | 'count' | 'min' | 'max' }>
  isScheduled?: boolean
  schedule?: Record<string, unknown>
}

export interface ReportRunResult {
  reportId: string
  reportName: string
  data: Record<string, unknown>[]
  totalRows: number
  executedAt: Date
  executionTimeMs: number
}

export async function list(tenantId: string) {
  const reports = await db.analyticsReport.findMany({
    where: { tenantId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return reports
}

export async function getById(tenantId: string, id: string) {
  const report = await db.analyticsReport.findFirst({
    where: { id, tenantId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return report
}

export async function create(
  tenantId: string,
  userId: string,
  data: CreateReportInput
) {
  const report = await db.analyticsReport.create({
    data: {
      tenantId,
      userId,
      name: data.name,
      description: data.description,
      dataSource: data.dataSource,
      columns: data.columns,
      filters: data.filters as object | undefined,
      sorting: data.sorting as object | undefined,
      grouping: data.grouping as object | undefined,
      aggregations: data.aggregations as object | undefined,
      isScheduled: data.isScheduled || false,
      schedule: data.schedule as object | undefined,
    },
  })

  return report
}

export async function update(
  tenantId: string,
  id: string,
  data: UpdateReportInput
) {
  const existing = await db.analyticsReport.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Báo cáo không tồn tại')
  }

  const report = await db.analyticsReport.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.dataSource !== undefined && { dataSource: data.dataSource }),
      ...(data.columns !== undefined && { columns: data.columns }),
      ...(data.filters !== undefined && { filters: data.filters as object }),
      ...(data.sorting !== undefined && { sorting: data.sorting as object }),
      ...(data.grouping !== undefined && { grouping: data.grouping as object }),
      ...(data.aggregations !== undefined && { aggregations: data.aggregations as object }),
      ...(data.isScheduled !== undefined && { isScheduled: data.isScheduled }),
      ...(data.schedule !== undefined && { schedule: data.schedule as object }),
    },
  })

  return report
}

export async function remove(tenantId: string, id: string) {
  const existing = await db.analyticsReport.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Báo cáo không tồn tại')
  }

  await db.analyticsReport.delete({
    where: { id },
  })
}

export async function runReport(
  tenantId: string,
  id: string
): Promise<ReportRunResult> {
  const startTime = Date.now()

  const report = await db.analyticsReport.findFirst({
    where: { id, tenantId },
  })

  if (!report) {
    throw new Error('Báo cáo không tồn tại')
  }

  const filters = (report.filters as Record<string, unknown>) || {}
  const sorting = (report.sorting as Array<{ field: string; direction: 'asc' | 'desc' }>) || []
  const columns = report.columns as Array<{ field: string; label: string }>

  // Build dynamic query based on data source
  let data: Record<string, unknown>[] = []

  switch (report.dataSource) {
    case 'employees': {
      const where: Record<string, unknown> = { tenantId, deletedAt: null }
      if (filters.status) where.status = filters.status
      if (filters.departmentId) where.departmentId = filters.departmentId

      const orderBy: Record<string, string> = {}
      if (sorting.length > 0) {
        orderBy[sorting[0].field] = sorting[0].direction
      }

      const employees = await db.employee.findMany({
        where,
        include: { department: true, position: true },
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : { fullName: 'asc' },
      })

      data = employees.map((emp) => {
        const row: Record<string, unknown> = {}
        columns.forEach((col) => {
          switch (col.field) {
            case 'fullName': row[col.field] = emp.fullName; break
            case 'employeeCode': row[col.field] = emp.employeeCode; break
            case 'department': row[col.field] = emp.department?.name || ''; break
            case 'position': row[col.field] = emp.position?.name || ''; break
            case 'status': row[col.field] = emp.status; break
            case 'hireDate': row[col.field] = emp.hireDate; break
            case 'gender': row[col.field] = emp.gender; break
            case 'phone': row[col.field] = emp.phone; break
            case 'workEmail': row[col.field] = emp.workEmail; break
            default: row[col.field] = (emp as Record<string, unknown>)[col.field]
          }
        })
        return row
      })
      break
    }

    case 'attendance': {
      const where: Record<string, unknown> = {
        employee: { tenantId, deletedAt: null },
      }
      if (filters.startDate || filters.endDate) {
        where.date = {}
        if (filters.startDate) (where.date as Record<string, unknown>).gte = new Date(filters.startDate as string)
        if (filters.endDate) (where.date as Record<string, unknown>).lte = new Date(filters.endDate as string)
      }
      if (filters.status) where.status = filters.status

      const records = await db.attendance.findMany({
        where,
        include: {
          employee: { include: { department: true } },
        },
        orderBy: { date: 'desc' },
        take: 1000,
      })

      data = records.map((rec) => {
        const row: Record<string, unknown> = {}
        columns.forEach((col) => {
          switch (col.field) {
            case 'employeeName': row[col.field] = rec.employee.fullName; break
            case 'employeeCode': row[col.field] = rec.employee.employeeCode; break
            case 'department': row[col.field] = rec.employee.department?.name || ''; break
            case 'date': row[col.field] = rec.date; break
            case 'checkIn': row[col.field] = rec.checkIn; break
            case 'checkOut': row[col.field] = rec.checkOut; break
            case 'status': row[col.field] = rec.status; break
            default: row[col.field] = (rec as Record<string, unknown>)[col.field]
          }
        })
        return row
      })
      break
    }

    case 'contracts': {
      const where: Record<string, unknown> = { tenantId }
      if (filters.status) where.status = filters.status
      if (filters.contractType) where.contractType = filters.contractType

      const contracts = await db.contract.findMany({
        where,
        include: {
          employee: { include: { department: true } },
        },
        orderBy: { startDate: 'desc' },
        take: 1000,
      })

      data = contracts.map((contract) => {
        const row: Record<string, unknown> = {}
        columns.forEach((col) => {
          switch (col.field) {
            case 'employeeName': row[col.field] = contract.employee.fullName; break
            case 'employeeCode': row[col.field] = contract.employee.employeeCode; break
            case 'contractNumber': row[col.field] = contract.contractNumber; break
            case 'contractType': row[col.field] = contract.contractType; break
            case 'startDate': row[col.field] = contract.startDate; break
            case 'endDate': row[col.field] = contract.endDate; break
            case 'baseSalary': row[col.field] = Number(contract.baseSalary); break
            case 'status': row[col.field] = contract.status; break
            default: row[col.field] = (contract as Record<string, unknown>)[col.field]
          }
        })
        return row
      })
      break
    }

    case 'payroll': {
      const where: Record<string, unknown> = {
        employee: { tenantId, deletedAt: null },
      }
      if (filters.periodId) where.periodId = filters.periodId

      const payrolls = await db.payroll.findMany({
        where,
        include: {
          employee: { include: { department: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      })

      data = payrolls.map((payroll) => {
        const row: Record<string, unknown> = {}
        columns.forEach((col) => {
          switch (col.field) {
            case 'employeeName': row[col.field] = payroll.employee.fullName; break
            case 'employeeCode': row[col.field] = payroll.employee.employeeCode; break
            case 'department': row[col.field] = payroll.employee.department?.name || ''; break
            case 'grossSalary': row[col.field] = Number(payroll.grossSalary); break
            case 'netSalary': row[col.field] = Number(payroll.netSalary); break
            default: row[col.field] = (payroll as Record<string, unknown>)[col.field]
          }
        })
        return row
      })
      break
    }

    default:
      throw new Error(`Nguồn dữ liệu không được hỗ trợ: ${report.dataSource}`)
  }

  // Update last run time
  await db.analyticsReport.update({
    where: { id },
    data: { lastRunAt: new Date() },
  })

  const executionTimeMs = Date.now() - startTime

  return {
    reportId: report.id,
    reportName: report.name,
    data,
    totalRows: data.length,
    executedAt: new Date(),
    executionTimeMs,
  }
}

export const analyticsReportService = {
  list,
  getById,
  create,
  update,
  delete: remove,
  runReport,
}
