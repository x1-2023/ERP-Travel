// src/lib/compliance/insurance/reports/d02-generator.ts
// D02-TS Report Generator - Báo cáo tăng lao động tham gia BHXH, BHYT, BHTN

import prisma from '@/lib/db'
import { formatInsuranceAmount } from '../calculator'
import { INSURANCE_CHANGE_TYPES } from '../constants'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface D02Employee {
  sequence: number
  employeeCode: string
  fullName: string
  dateOfBirth: Date | null
  gender: string
  idNumber: string
  socialInsuranceNumber: string
  insuranceSalary: number
  effectiveDate: Date
  changeType: string
  changeTypeCode: string
  reason: string
  // Previous employment info (if any)
  previousCompany?: string
  previousSocialInsuranceCode?: string
}

export interface D02ReportData {
  reportCode: string
  reportMonth: number
  reportYear: number
  companyInfo: {
    name: string
    taxCode: string
    address: string
    socialInsuranceCode?: string
  }
  employees: D02Employee[]
  summary: {
    totalNewEmployees: number
    totalInsuranceSalary: number
    byChangeType: Record<string, number>
  }
  generatedAt: Date
}

// ═══════════════════════════════════════════════════════════════
// CHANGE TYPE DETECTION
// ═══════════════════════════════════════════════════════════════

type IncreaseChangeType = 'NEW_HIRE' | 'RETURN_FROM_LEAVE' | 'SALARY_INCREASE' | 'TRANSFER_IN'

function detectIncreaseChangeType(employee: {
  hireDate: Date
  previousSalary?: number
  currentSalary: number
  previousStatus?: string
  transferFrom?: string
}): IncreaseChangeType {
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)

  // New hire
  if (employee.hireDate >= monthAgo) {
    return 'NEW_HIRE'
  }

  // Return from unpaid leave
  if (employee.previousStatus === 'ON_LEAVE') {
    return 'RETURN_FROM_LEAVE'
  }

  // Transfer from another company
  if (employee.transferFrom) {
    return 'TRANSFER_IN'
  }

  // Salary increase
  if (employee.previousSalary && employee.currentSalary > employee.previousSalary) {
    return 'SALARY_INCREASE'
  }

  return 'NEW_HIRE'
}

// ═══════════════════════════════════════════════════════════════
// REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════

export async function generateD02Report(
  tenantId: string,
  month: number,
  year: number
): Promise<D02ReportData> {
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

  // Find employees who started insurance participation in this month
  const newInsurances = await prisma.employeeInsurance.findMany({
    where: {
      tenantId,
      registrationDate: {
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
          hireDate: true,
          status: true,
        },
      },
    },
    orderBy: {
      registrationDate: 'asc',
    },
  })

  // Also find employees with salary increases
  const salaryChanges = await prisma.employeeInsurance.findMany({
    where: {
      tenantId,
      effectiveFrom: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      registrationDate: {
        lt: startOfMonth, // Already registered before this month
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
          hireDate: true,
        },
      },
    },
  })

  // Combine and process
  const allChanges = [...newInsurances, ...salaryChanges]

  const employees: D02Employee[] = allChanges.map((ins, index) => {
    const changeType = detectIncreaseChangeType({
      hireDate: ins.employee.hireDate,
      currentSalary: Number(ins.insuranceSalaryBase),
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
      insuranceSalary: Number(ins.insuranceSalaryBase),
      effectiveDate: ins.effectiveFrom,
      changeType: changeInfo.name,
      changeTypeCode: changeInfo.code,
      reason: ins.notes || changeInfo.name,
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
    totalNewEmployees: employees.length,
    totalInsuranceSalary: employees.reduce((sum, emp) => sum + emp.insuranceSalary, 0),
    byChangeType,
  }

  // Generate report code
  const reportCode = `D02-${year}${month.toString().padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`

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

export async function saveD02Report(
  tenantId: string,
  reportData: D02ReportData
): Promise<string> {
  // Calculate employee+employer amounts using standard rates
  const employeeRate = 0.105 // 10.5%
  const employerRate = 0.215 // 21.5%

  const totalEmployeeAmount = reportData.employees.reduce(
    (sum, e) => sum + e.insuranceSalary * employeeRate, 0
  )
  const totalEmployerAmount = reportData.employees.reduce(
    (sum, e) => sum + e.insuranceSalary * employerRate, 0
  )

  const report = await prisma.insuranceReport.create({
    data: {
      tenantId,
      reportType: 'D02_TS',
      reportCode: reportData.reportCode,
      reportMonth: reportData.reportMonth,
      reportYear: reportData.reportYear,
      totalEmployees: reportData.summary.totalNewEmployees,
      totalInsuranceSalary: reportData.summary.totalInsuranceSalary,
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
  // Look up employeeInsurance IDs for linking
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
      const empAmount = emp.insuranceSalary * employeeRate
      const erAmount = emp.insuranceSalary * employerRate
      await prisma.insuranceReportDetail.create({
        data: {
          reportId: report.id,
          employeeInsuranceId: insurance.id,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          dateOfBirth: insurance.employee.dateOfBirth || new Date(1990, 0, 1),
          gender: (insurance.employee.gender as any) || 'MALE',
          idNumber: insurance.employee.idNumber || '',
          insuranceSalary: emp.insuranceSalary,
          employeeAmount: empAmount,
          employerAmount: erAmount,
          totalAmount: empAmount + erAmount,
          changeType: emp.changeTypeCode,
          effectiveDate: emp.effectiveDate,
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

export function generateD02ExcelData(reportData: D02ReportData): unknown[][] {
  const headers = [
    'STT',
    'Mã NV',
    'Họ và tên',
    'Ngày sinh',
    'Giới tính',
    'Số CMND/CCCD',
    'Số sổ BHXH',
    'Mức lương đóng BH',
    'Ngày hiệu lực',
    'Mã loại',
    'Loại tăng',
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
    emp.insuranceSalary,
    emp.effectiveDate.toLocaleDateString('vi-VN'),
    emp.changeTypeCode,
    emp.changeType,
    emp.reason,
  ])

  // Add summary
  const summaryRow = ['', '', 'TỔNG CỘNG', '', '', '', '', reportData.summary.totalInsuranceSalary, '', '', '', '']

  return [headers, ...rows, summaryRow]
}

// ═══════════════════════════════════════════════════════════════
// FORMAT FOR DISPLAY
// ═══════════════════════════════════════════════════════════════

export function formatD02ForDisplay(reportData: D02ReportData): {
  title: string
  period: string
  company: string
  summary: Array<{ label: string; value: string }>
} {
  return {
    title: 'BÁO CÁO TĂNG LAO ĐỘNG (D02-TS)',
    period: `Tháng ${reportData.reportMonth}/${reportData.reportYear}`,
    company: reportData.companyInfo.name,
    summary: [
      { label: 'Tổng số lao động tăng', value: reportData.summary.totalNewEmployees.toString() },
      {
        label: 'Tổng mức lương đóng BH',
        value: formatInsuranceAmount(reportData.summary.totalInsuranceSalary),
      },
      ...Object.entries(reportData.summary.byChangeType).map(([type, count]) => ({
        label: type,
        value: count.toString(),
      })),
    ],
  }
}
