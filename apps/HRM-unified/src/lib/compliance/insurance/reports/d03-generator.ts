// src/lib/compliance/insurance/reports/d03-generator.ts
// D03-TS Report Generator - Báo cáo giảm lao động dừng đóng BHXH, BHYT, BHTN

import prisma from '@/lib/db'
import { formatInsuranceAmount } from '../calculator'
import { INSURANCE_CHANGE_TYPES } from '../constants'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface D03Employee {
  sequence: number
  employeeCode: string
  fullName: string
  dateOfBirth: Date | null
  gender: string
  idNumber: string
  socialInsuranceNumber: string
  lastInsuranceSalary: number
  terminationDate: Date
  changeType: string
  changeTypeCode: string
  reason: string
  // Benefits info
  totalMonthsContributed?: number
  lastContributionMonth?: string
}

export interface D03ReportData {
  reportCode: string
  reportMonth: number
  reportYear: number
  companyInfo: {
    name: string
    taxCode: string
    address: string
    socialInsuranceCode?: string
  }
  employees: D03Employee[]
  summary: {
    totalTerminatedEmployees: number
    totalLastInsuranceSalary: number
    byChangeType: Record<string, number>
  }
  generatedAt: Date
}

// ═══════════════════════════════════════════════════════════════
// CHANGE TYPE DETECTION
// ═══════════════════════════════════════════════════════════════

type DecreaseChangeType =
  | 'RESIGNATION'
  | 'TERMINATION'
  | 'UNPAID_LEAVE'
  | 'SALARY_DECREASE'
  | 'TRANSFER_OUT'
  | 'DEATH'
  | 'RETIREMENT'

function detectDecreaseChangeType(employee: {
  resignationReason?: string | null
  status: string
  age?: number
}): DecreaseChangeType {
  // Check for death
  if (employee.resignationReason?.toLowerCase().includes('chết') ||
      employee.resignationReason?.toLowerCase().includes('death')) {
    return 'DEATH'
  }

  // Check for retirement (assuming retirement age 60 for men, 55 for women)
  if (employee.age && employee.age >= 55) {
    if (employee.resignationReason?.toLowerCase().includes('hưu') ||
        employee.resignationReason?.toLowerCase().includes('retire')) {
      return 'RETIREMENT'
    }
  }

  // Check for unpaid leave
  if (employee.status === 'ON_LEAVE') {
    return 'UNPAID_LEAVE'
  }

  // Check for termination vs resignation
  if (employee.status === 'TERMINATED') {
    return 'TERMINATION'
  }

  if (employee.resignationReason?.toLowerCase().includes('chuyển') ||
      employee.resignationReason?.toLowerCase().includes('transfer')) {
    return 'TRANSFER_OUT'
  }

  return 'RESIGNATION'
}

// ═══════════════════════════════════════════════════════════════
// REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════

export async function generateD03Report(
  tenantId: string,
  month: number,
  year: number
): Promise<D03ReportData> {
  // Get tenant info
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      name: true,
      taxCode: true,
      address: true,
      settings: true,
    },
  })

  if (!tenant) {
    throw new Error('Không tìm thấy thông tin công ty')
  }

  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0)

  // Find employees whose insurance terminated in this month
  const terminatedInsurances = await prisma.employeeInsurance.findMany({
    where: {
      tenantId,
      terminationDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          dateOfBirth: true,
          gender: true,
          idNumber: true,
          status: true,
          resignationDate: true,
          resignationReason: true,
        },
      },
    },
    orderBy: {
      terminationDate: 'asc',
    },
  })

  // Calculate age for retirement detection
  const calculateAge = (dateOfBirth: Date | null): number | undefined => {
    if (!dateOfBirth) return undefined
    const today = new Date()
    let age = today.getFullYear() - dateOfBirth.getFullYear()
    const monthDiff = today.getMonth() - dateOfBirth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--
    }
    return age
  }

  const employees: D03Employee[] = terminatedInsurances.map((ins, index) => {
    const age = calculateAge(ins.employee.dateOfBirth)
    const changeType = detectDecreaseChangeType({
      resignationReason: ins.employee.resignationReason,
      status: ins.employee.status,
      age,
    })

    const changeInfo = INSURANCE_CHANGE_TYPES[changeType]

    return {
      sequence: index + 1,
      employeeCode: ins.employee.employeeCode,
      fullName: ins.employee.fullName,
      dateOfBirth: ins.employee.dateOfBirth,
      gender: ins.employee.gender === 'MALE' ? 'Nam' : 'Nữ',
      idNumber: ins.employee.idNumber || '',
      socialInsuranceNumber: ins.socialInsuranceNumber,
      lastInsuranceSalary: Number(ins.insuranceSalaryBase),
      terminationDate: ins.terminationDate!,
      changeType: changeInfo.name,
      changeTypeCode: changeInfo.code,
      reason: ins.notes || ins.employee.resignationReason || changeInfo.name,
    }
  })

  // Calculate summary by change type
  const byChangeType = employees.reduce(
    (acc, emp) => {
      acc[emp.changeType] = (acc[emp.changeType] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const summary = {
    totalTerminatedEmployees: employees.length,
    totalLastInsuranceSalary: employees.reduce((sum, emp) => sum + emp.lastInsuranceSalary, 0),
    byChangeType,
  }

  // Generate report code
  const reportCode = `D03-${year}${month.toString().padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`

  return {
    reportCode,
    reportMonth: month,
    reportYear: year,
    companyInfo: {
      name: tenant.name,
      taxCode: tenant.taxCode || '',
      address: tenant.address || '',
      socialInsuranceCode: (tenant.settings as Record<string, unknown>)?.socialInsuranceCode as string,
    },
    employees,
    summary,
    generatedAt: new Date(),
  }
}

// ═══════════════════════════════════════════════════════════════
// SAVE REPORT TO DATABASE
// ═══════════════════════════════════════════════════════════════

export async function saveD03Report(
  tenantId: string,
  reportData: D03ReportData
): Promise<string> {
  const employeeRate = 0.105
  const employerRate = 0.215

  const totalEmployeeAmount = reportData.employees.reduce(
    (sum, e) => sum + e.lastInsuranceSalary * employeeRate, 0
  )
  const totalEmployerAmount = reportData.employees.reduce(
    (sum, e) => sum + e.lastInsuranceSalary * employerRate, 0
  )

  const report = await prisma.insuranceReport.create({
    data: {
      tenantId,
      reportType: 'D03_TS',
      reportCode: reportData.reportCode,
      reportMonth: reportData.reportMonth,
      reportYear: reportData.reportYear,
      totalEmployees: reportData.summary.totalTerminatedEmployees,
      totalInsuranceSalary: reportData.summary.totalLastInsuranceSalary,
      totalEmployeeAmount,
      totalEmployerAmount,
      totalAmount: totalEmployeeAmount + totalEmployerAmount,
      status: 'DRAFT',
      metadata: {
        generatedAt: reportData.generatedAt.toISOString(),
        byChangeType: reportData.summary.byChangeType,
      },
    },
  })

  // Save individual employee detail records
  for (const emp of reportData.employees) {
    const insurance = await prisma.employeeInsurance.findFirst({
      where: {
        tenantId,
        socialInsuranceNumber: emp.socialInsuranceNumber,
      },
      include: {
        employee: {
          select: { dateOfBirth: true, gender: true, idNumber: true },
        },
      },
    })

    if (insurance) {
      const empAmount = emp.lastInsuranceSalary * employeeRate
      const erAmount = emp.lastInsuranceSalary * employerRate
      await prisma.insuranceReportDetail.create({
        data: {
          reportId: report.id,
          employeeInsuranceId: insurance.id,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          dateOfBirth: insurance.employee.dateOfBirth || new Date(1990, 0, 1),
          gender: (insurance.employee.gender as any) || 'MALE',
          idNumber: insurance.employee.idNumber || '',
          insuranceSalary: emp.lastInsuranceSalary,
          employeeAmount: empAmount,
          employerAmount: erAmount,
          totalAmount: empAmount + erAmount,
          changeType: emp.changeTypeCode,
          effectiveDate: emp.terminationDate,
          reason: emp.reason,
        },
      })
    }
  }

  return report.id
}

// ═══════════════════════════════════════════════════════════════
// EXPORT TO EXCEL
// ═══════════════════════════════════════════════════════════════

export function generateD03ExcelData(reportData: D03ReportData): unknown[][] {
  const headers = [
    'STT',
    'Mã NV',
    'Họ và tên',
    'Ngày sinh',
    'Giới tính',
    'Số CMND/CCCD',
    'Số sổ BHXH',
    'Mức lương đóng BH cuối',
    'Ngày dừng đóng',
    'Mã loại',
    'Loại giảm',
    'Lý do',
  ]

  const rows = reportData.employees.map((emp) => [
    emp.sequence,
    emp.employeeCode,
    emp.fullName,
    emp.dateOfBirth ? emp.dateOfBirth.toLocaleDateString('vi-VN') : '',
    emp.gender,
    emp.idNumber,
    emp.socialInsuranceNumber,
    emp.lastInsuranceSalary,
    emp.terminationDate.toLocaleDateString('vi-VN'),
    emp.changeTypeCode,
    emp.changeType,
    emp.reason,
  ])

  // Add summary
  const summaryRow = [
    '',
    '',
    'TỔNG CỘNG',
    '',
    '',
    '',
    '',
    reportData.summary.totalLastInsuranceSalary,
    '',
    '',
    '',
    '',
  ]

  return [headers, ...rows, summaryRow]
}

// ═══════════════════════════════════════════════════════════════
// FORMAT FOR DISPLAY
// ═══════════════════════════════════════════════════════════════

export function formatD03ForDisplay(reportData: D03ReportData): {
  title: string
  period: string
  company: string
  summary: Array<{ label: string; value: string }>
} {
  return {
    title: 'BÁO CÁO GIẢM LAO ĐỘNG (D03-TS)',
    period: `Tháng ${reportData.reportMonth}/${reportData.reportYear}`,
    company: reportData.companyInfo.name,
    summary: [
      { label: 'Tổng số lao động giảm', value: reportData.summary.totalTerminatedEmployees.toString() },
      {
        label: 'Tổng mức lương đóng BH cuối',
        value: formatInsuranceAmount(reportData.summary.totalLastInsuranceSalary),
      },
      ...Object.entries(reportData.summary.byChangeType).map(([type, count]) => ({
        label: type,
        value: count.toString(),
      })),
    ],
  }
}
