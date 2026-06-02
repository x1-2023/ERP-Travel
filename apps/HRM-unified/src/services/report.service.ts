// src/services/report.service.ts
// Report Generator Service

import { db } from '@/lib/db'
import { classify } from '@/lib/ai/client'
import { REPORT_GENERATOR_PROMPT } from '@/lib/ai/prompts'
import type { PaginatedResponse } from '@/types'
import type { ReportParams, ReportResult, SavedReport } from '@/types/report'

export const reportService = {
  /**
   * Parse natural language query to report parameters
   */
  async parseReportQuery(query: string): Promise<ReportParams> {
    const response = await classify(query, REPORT_GENERATOR_PROMPT)

    try {
      const params = JSON.parse(response)
      return {
        reportType: params.reportType || 'attendance',
        title: params.title || 'Báo cáo',
        parameters: {
          startDate: params.parameters?.startDate || getDefaultStartDate(),
          endDate: params.parameters?.endDate || getDefaultEndDate(),
          departmentId: params.parameters?.departmentId,
          groupBy: params.parameters?.groupBy || 'employee',
        },
      }
    } catch {
      // Default to attendance report for current month
      return {
        reportType: 'attendance',
        title: 'Báo cáo chấm công',
        parameters: {
          startDate: getDefaultStartDate(),
          endDate: getDefaultEndDate(),
          groupBy: 'employee',
        },
      }
    }
  },

  /**
   * Generate report based on parameters
   */
  async generateReport(
    tenantId: string,
    params: ReportParams
  ): Promise<ReportResult> {
    const { reportType, title, parameters } = params
    const { startDate, endDate, departmentId, groupBy } = parameters

    switch (reportType) {
      case 'attendance':
        return this.generateAttendanceReport(
          tenantId,
          title,
          new Date(startDate),
          new Date(endDate),
          departmentId,
          groupBy
        )

      case 'leave':
        return this.generateLeaveReport(
          tenantId,
          title,
          new Date(startDate),
          new Date(endDate),
          departmentId,
          groupBy
        )

      case 'overtime':
        return this.generateOvertimeReport(
          tenantId,
          title,
          new Date(startDate),
          new Date(endDate),
          departmentId,
          groupBy
        )

      case 'headcount':
        return this.generateHeadcountReport(tenantId, title, departmentId)

      default:
        throw new Error(`Unknown report type: ${reportType}`)
    }
  },

  /**
   * Generate attendance report
   */
  async generateAttendanceReport(
    tenantId: string,
    title: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    groupBy?: string
  ): Promise<ReportResult> {
    const records = await db.attendance.findMany({
      where: {
        employee: {
          tenantId,
          ...(departmentId && { departmentId }),
        },
        date: { gte: startDate, lte: endDate },
      },
      include: {
        employee: {
          include: { department: true },
        },
      },
    })

    // Calculate summary
    const totalRecords = records.length
    const presentDays = records.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length
    const lateDays = records.filter((r) => r.status === 'LATE').length
    const absentDays = records.filter((r) => r.status === 'ABSENT').length

    // Group data
    const groupedData: Record<string, unknown>[] = []

    if (groupBy === 'department') {
      const byDept = new Map<string, typeof records>()
      records.forEach((r) => {
        const dept = r.employee.department?.name || 'Chưa phân bổ'
        if (!byDept.has(dept)) byDept.set(dept, [])
        byDept.get(dept)!.push(r)
      })

      byDept.forEach((deptRecords, deptName) => {
        groupedData.push({
          department: deptName,
          totalDays: deptRecords.length,
          presentDays: deptRecords.filter(
            (r) => r.status === 'PRESENT' || r.status === 'LATE'
          ).length,
          lateDays: deptRecords.filter((r) => r.status === 'LATE').length,
          absentDays: deptRecords.filter((r) => r.status === 'ABSENT').length,
        })
      })
    } else {
      // Group by employee
      const byEmp = new Map<string, typeof records>()
      records.forEach((r) => {
        if (!byEmp.has(r.employeeId)) byEmp.set(r.employeeId, [])
        byEmp.get(r.employeeId)!.push(r)
      })

      byEmp.forEach((empRecords) => {
        const emp = empRecords[0].employee
        groupedData.push({
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          department: emp.department?.name || 'N/A',
          totalDays: empRecords.length,
          presentDays: empRecords.filter(
            (r) => r.status === 'PRESENT' || r.status === 'LATE'
          ).length,
          lateDays: empRecords.filter((r) => r.status === 'LATE').length,
          absentDays: empRecords.filter((r) => r.status === 'ABSENT').length,
        })
      })
    }

    return {
      title,
      summary: {
        'Tổng bản ghi': totalRecords,
        'Ngày có mặt': presentDays,
        'Ngày đi muộn': lateDays,
        'Ngày vắng mặt': absentDays,
      },
      data: groupedData,
      columns:
        groupBy === 'department'
          ? [
              { key: 'department', label: 'Phòng ban' },
              { key: 'totalDays', label: 'Tổng ngày' },
              { key: 'presentDays', label: 'Có mặt' },
              { key: 'lateDays', label: 'Đi muộn' },
              { key: 'absentDays', label: 'Vắng mặt' },
            ]
          : [
              { key: 'employeeCode', label: 'Mã NV' },
              { key: 'employeeName', label: 'Họ tên' },
              { key: 'department', label: 'Phòng ban' },
              { key: 'presentDays', label: 'Có mặt' },
              { key: 'lateDays', label: 'Đi muộn' },
              { key: 'absentDays', label: 'Vắng mặt' },
            ],
      generatedAt: new Date(),
    }
  },

  /**
   * Generate leave report
   */
  async generateLeaveReport(
    tenantId: string,
    title: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    groupBy?: string
  ): Promise<ReportResult> {
    const requests = await db.leaveRequest.findMany({
      where: {
        employee: {
          tenantId,
          ...(departmentId && { departmentId }),
        },
        startDate: { gte: startDate },
        endDate: { lte: endDate },
        status: 'APPROVED',
      },
      include: {
        employee: { include: { department: true } },
        policy: true,
      },
    })

    const totalDays = requests.reduce((sum, r) => sum + Number(r.totalDays), 0)
    const byType = new Map<string, number>()
    requests.forEach((r) => {
      const type = r.policy.name
      byType.set(type, (byType.get(type) || 0) + Number(r.totalDays))
    })

    const summary: Record<string, string | number> = {
      'Tổng đơn': requests.length,
      'Tổng ngày nghỉ': totalDays,
    }
    byType.forEach((days, type) => {
      summary[type] = days
    })

    const data: Record<string, unknown>[] = []

    if (groupBy === 'department') {
      const byDept = new Map<string, typeof requests>()
      requests.forEach((r) => {
        const dept = r.employee.department?.name || 'Chưa phân bổ'
        if (!byDept.has(dept)) byDept.set(dept, [])
        byDept.get(dept)!.push(r)
      })

      byDept.forEach((deptReqs, deptName) => {
        data.push({
          department: deptName,
          totalRequests: deptReqs.length,
          totalDays: deptReqs.reduce((sum, r) => sum + Number(r.totalDays), 0),
        })
      })
    } else {
      requests.forEach((r) => {
        data.push({
          employeeCode: r.employee.employeeCode,
          employeeName: r.employee.fullName,
          department: r.employee.department?.name || 'N/A',
          policy: r.policy.name,
          startDate: r.startDate.toISOString().split('T')[0],
          endDate: r.endDate.toISOString().split('T')[0],
          days: Number(r.totalDays),
        })
      })
    }

    return {
      title,
      summary,
      data,
      columns:
        groupBy === 'department'
          ? [
              { key: 'department', label: 'Phòng ban' },
              { key: 'totalRequests', label: 'Số đơn' },
              { key: 'totalDays', label: 'Tổng ngày' },
            ]
          : [
              { key: 'employeeCode', label: 'Mã NV' },
              { key: 'employeeName', label: 'Họ tên' },
              { key: 'policy', label: 'Loại nghỉ' },
              { key: 'startDate', label: 'Từ ngày' },
              { key: 'endDate', label: 'Đến ngày' },
              { key: 'days', label: 'Số ngày' },
            ],
      generatedAt: new Date(),
    }
  },

  /**
   * Generate overtime report
   */
  async generateOvertimeReport(
    tenantId: string,
    title: string,
    startDate: Date,
    endDate: Date,
    departmentId?: string,
    groupBy?: string
  ): Promise<ReportResult> {
    const records = await db.overtimeRequest.findMany({
      where: {
        employee: {
          tenantId,
          ...(departmentId && { departmentId }),
        },
        date: { gte: startDate, lte: endDate },
        status: 'APPROVED',
      },
      include: {
        employee: { include: { department: true } },
      },
    })

    const totalHours = records.reduce((sum, r) => sum + Number(r.actualHours || r.plannedHours), 0)

    const data: Record<string, unknown>[] = []

    if (groupBy === 'department') {
      const byDept = new Map<string, typeof records>()
      records.forEach((r) => {
        const dept = r.employee.department?.name || 'Chưa phân bổ'
        if (!byDept.has(dept)) byDept.set(dept, [])
        byDept.get(dept)!.push(r)
      })

      byDept.forEach((deptRecs, deptName) => {
        data.push({
          department: deptName,
          totalRequests: deptRecs.length,
          totalHours: deptRecs.reduce((sum, r) => sum + Number(r.actualHours || r.plannedHours), 0),
        })
      })
    } else {
      const byEmp = new Map<string, typeof records>()
      records.forEach((r) => {
        if (!byEmp.has(r.employeeId)) byEmp.set(r.employeeId, [])
        byEmp.get(r.employeeId)!.push(r)
      })

      byEmp.forEach((empRecs) => {
        const emp = empRecs[0].employee
        data.push({
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          department: emp.department?.name || 'N/A',
          totalRequests: empRecs.length,
          totalHours: empRecs.reduce((sum, r) => sum + Number(r.actualHours || r.plannedHours), 0),
        })
      })
    }

    return {
      title,
      summary: {
        'Tổng yêu cầu': records.length,
        'Tổng giờ tăng ca': totalHours,
      },
      data,
      columns:
        groupBy === 'department'
          ? [
              { key: 'department', label: 'Phòng ban' },
              { key: 'totalRequests', label: 'Số yêu cầu' },
              { key: 'totalHours', label: 'Tổng giờ' },
            ]
          : [
              { key: 'employeeCode', label: 'Mã NV' },
              { key: 'employeeName', label: 'Họ tên' },
              { key: 'department', label: 'Phòng ban' },
              { key: 'totalRequests', label: 'Số yêu cầu' },
              { key: 'totalHours', label: 'Tổng giờ' },
            ],
      generatedAt: new Date(),
    }
  },

  /**
   * Generate headcount report
   */
  async generateHeadcountReport(
    tenantId: string,
    title: string,
    departmentId?: string
  ): Promise<ReportResult> {
    const employees = await db.employee.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(departmentId && { departmentId }),
      },
      include: { department: true, position: true },
    })

    const byDept = new Map<string, number>()
    const byPosition = new Map<string, number>()

    employees.forEach((e) => {
      const dept = e.department?.name || 'Chưa phân bổ'
      const pos = e.position?.name || 'Chưa xác định'
      byDept.set(dept, (byDept.get(dept) || 0) + 1)
      byPosition.set(pos, (byPosition.get(pos) || 0) + 1)
    })

    const data: Record<string, unknown>[] = []
    byDept.forEach((count, dept) => {
      data.push({ department: dept, headcount: count })
    })

    const summary: Record<string, string | number> = {
      'Tổng nhân sự': employees.length,
    }

    return {
      title,
      summary,
      data,
      columns: [
        { key: 'department', label: 'Phòng ban' },
        { key: 'headcount', label: 'Số lượng' },
      ],
      generatedAt: new Date(),
    }
  },

  /**
   * Save a report configuration
   */
  async saveReport(
    tenantId: string,
    userId: string,
    data: {
      name: string
      description?: string
      reportType: string
      parameters: Record<string, unknown>
      isScheduled?: boolean
      cronExpression?: string
    }
  ): Promise<SavedReport> {
    const report = await db.savedReport.create({
      data: {
        tenantId,
        userId,
        name: data.name,
        description: data.description,
        reportType: data.reportType,
        parameters: JSON.parse(JSON.stringify(data.parameters)),
        isScheduled: data.isScheduled || false,
        cronExpression: data.cronExpression,
      },
    })

    return report as SavedReport
  },

  /**
   * Get saved reports
   */
  async getSavedReports(
    tenantId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<SavedReport>> {
    const skip = (page - 1) * pageSize

    const [data, total] = await Promise.all([
      db.savedReport.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      db.savedReport.count({ where: { tenantId } }),
    ])

    return {
      data: data as SavedReport[],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * Get saved report by ID
   */
  async getSavedReportById(
    tenantId: string,
    id: string
  ): Promise<SavedReport | null> {
    const report = await db.savedReport.findFirst({
      where: { id, tenantId },
    })
    return report as SavedReport | null
  },

  /**
   * Delete saved report
   */
  async deleteSavedReport(tenantId: string, id: string): Promise<void> {
    await db.savedReport.deleteMany({
      where: { id, tenantId },
    })
  },

  /**
   * Run saved report
   */
  async runSavedReport(
    tenantId: string,
    id: string
  ): Promise<ReportResult> {
    const saved = await this.getSavedReportById(tenantId, id)
    if (!saved) {
      throw new Error('Báo cáo không tồn tại')
    }

    // Update last run time
    await db.savedReport.update({
      where: { id },
      data: { lastRunAt: new Date() },
    })

    return this.generateReport(tenantId, {
      reportType: saved.reportType,
      title: saved.name,
      parameters: saved.parameters as ReportParams['parameters'],
    })
  },
}

// Helper functions
function getDefaultStartDate(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]
}

function getDefaultEndDate(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0]
}
