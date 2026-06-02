// src/lib/compliance/insurance/reports/c12-generator.ts
// C12-TS Report Generator - Bảng kê đóng BHXH, BHYT, BHTN hàng tháng

import prisma from '@/lib/db'
import { InsuranceCalculator, formatInsuranceAmount, type WageRegion } from '../calculator'
import { INSURANCE_RATES } from '../constants'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface C12ReportEmployee {
  sequence: number
  employeeCode: string
  fullName: string
  dateOfBirth: Date | null
  gender: string
  idNumber: string
  socialInsuranceNumber: string
  insuranceSalary: number
  // BHXH
  socialEmployee: number
  socialEmployer: number
  // BHYT
  healthEmployee: number
  healthEmployer: number
  // BHTN
  unemploymentEmployee: number
  unemploymentEmployer: number
  // Totals
  employeeTotal: number
  employerTotal: number
  grandTotal: number
}

export interface C12ReportData {
  reportCode: string
  reportMonth: number
  reportYear: number
  companyInfo: {
    name: string
    taxCode: string
    address: string
    socialInsuranceCode?: string
  }
  employees: C12ReportEmployee[]
  summary: {
    totalEmployees: number
    totalInsuranceSalary: number
    totalSocialEmployee: number
    totalSocialEmployer: number
    totalHealthEmployee: number
    totalHealthEmployer: number
    totalUnemploymentEmployee: number
    totalUnemploymentEmployer: number
    totalEmployeeContribution: number
    totalEmployerContribution: number
    grandTotal: number
  }
  generatedAt: Date
}

// ═══════════════════════════════════════════════════════════════
// REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════

export async function generateC12Report(
  tenantId: string,
  month: number,
  year: number
): Promise<C12ReportData> {
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

  // Get active employee insurances for the period
  const employeeInsurances = await prisma.employeeInsurance.findMany({
    where: {
      tenantId,
      isActive: true,
      registrationDate: {
        lte: new Date(year, month, 0), // End of month
      },
      OR: [{ terminationDate: null }, { terminationDate: { gt: new Date(year, month - 1, 1) } }],
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
        },
      },
    },
    orderBy: {
      employee: {
        employeeCode: 'asc',
      },
    },
  })

  // Calculate contributions for each employee
  const employees: C12ReportEmployee[] = employeeInsurances.map((ins, index) => {
    const calculator = new InsuranceCalculator({
      baseSalary: Number(ins.insuranceSalaryBase),
      region: 1 as WageRegion, // Default to region 1, can be made configurable
    })

    const contribution = calculator.calculate()

    return {
      sequence: index + 1,
      employeeCode: ins.employee.employeeCode,
      fullName: ins.employee.fullName,
      dateOfBirth: ins.employee.dateOfBirth,
      gender: ins.employee.gender === 'MALE' ? 'Nam' : 'Nữ',
      idNumber: ins.employee.idNumber || '',
      socialInsuranceNumber: ins.socialInsuranceNumber,
      insuranceSalary: Number(ins.insuranceSalaryBase),
      socialEmployee: contribution.employee.social,
      socialEmployer: contribution.employer.social,
      healthEmployee: contribution.employee.health,
      healthEmployer: contribution.employer.health,
      unemploymentEmployee: contribution.employee.unemployment,
      unemploymentEmployer: contribution.employer.unemployment,
      employeeTotal: contribution.employee.total,
      employerTotal: contribution.employer.total,
      grandTotal: contribution.total,
    }
  })

  // Calculate summary
  const summary = employees.reduce(
    (acc, emp) => ({
      totalEmployees: acc.totalEmployees + 1,
      totalInsuranceSalary: acc.totalInsuranceSalary + emp.insuranceSalary,
      totalSocialEmployee: acc.totalSocialEmployee + emp.socialEmployee,
      totalSocialEmployer: acc.totalSocialEmployer + emp.socialEmployer,
      totalHealthEmployee: acc.totalHealthEmployee + emp.healthEmployee,
      totalHealthEmployer: acc.totalHealthEmployer + emp.healthEmployer,
      totalUnemploymentEmployee: acc.totalUnemploymentEmployee + emp.unemploymentEmployee,
      totalUnemploymentEmployer: acc.totalUnemploymentEmployer + emp.unemploymentEmployer,
      totalEmployeeContribution: acc.totalEmployeeContribution + emp.employeeTotal,
      totalEmployerContribution: acc.totalEmployerContribution + emp.employerTotal,
      grandTotal: acc.grandTotal + emp.grandTotal,
    }),
    {
      totalEmployees: 0,
      totalInsuranceSalary: 0,
      totalSocialEmployee: 0,
      totalSocialEmployer: 0,
      totalHealthEmployee: 0,
      totalHealthEmployer: 0,
      totalUnemploymentEmployee: 0,
      totalUnemploymentEmployer: 0,
      totalEmployeeContribution: 0,
      totalEmployerContribution: 0,
      grandTotal: 0,
    }
  )

  // Generate report code
  const reportCode = `C12-${year}${month.toString().padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`

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

export async function saveC12Report(
  tenantId: string,
  reportData: C12ReportData
): Promise<string> {
  // Create the report
  const report = await prisma.insuranceReport.create({
    data: {
      tenantId,
      reportType: 'C12_TS',
      reportCode: reportData.reportCode,
      reportMonth: reportData.reportMonth,
      reportYear: reportData.reportYear,
      totalEmployees: reportData.summary.totalEmployees,
      totalInsuranceSalary: reportData.summary.totalInsuranceSalary,
      totalEmployeeAmount: reportData.summary.totalEmployeeContribution,
      totalEmployerAmount: reportData.summary.totalEmployerContribution,
      totalAmount: reportData.summary.grandTotal,
      status: 'DRAFT',
      metadata: {
        generatedAt: reportData.generatedAt.toISOString(),
        rates: INSURANCE_RATES,
      },
    },
  })

  // Create report details - only for employees with valid dateOfBirth
  const validEmployees = reportData.employees.filter((emp) => emp.dateOfBirth !== null)

  if (validEmployees.length > 0) {
    await prisma.insuranceReportDetail.createMany({
      data: validEmployees.map((emp) => ({
        reportId: report.id,
        employeeInsuranceId: emp.employeeCode, // This needs to be the actual insurance ID
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        dateOfBirth: emp.dateOfBirth as Date,
        gender: emp.gender === 'Nam' ? 'MALE' : 'FEMALE',
        idNumber: emp.idNumber,
        insuranceSalary: emp.insuranceSalary,
        employeeAmount: emp.employeeTotal,
        employerAmount: emp.employerTotal,
        totalAmount: emp.grandTotal,
      })),
      skipDuplicates: true,
    })
  }

  return report.id
}

// ═══════════════════════════════════════════════════════════════
// EXPORT TO EXCEL
// ═══════════════════════════════════════════════════════════════

export function generateC12ExcelData(reportData: C12ReportData): unknown[][] {
  const headers = [
    'STT',
    'Mã NV',
    'Họ và tên',
    'Ngày sinh',
    'Giới tính',
    'Số CMND/CCCD',
    'Số sổ BHXH',
    'Mức lương đóng BH',
    'BHXH (NLĐ)',
    'BHXH (DN)',
    'BHYT (NLĐ)',
    'BHYT (DN)',
    'BHTN (NLĐ)',
    'BHTN (DN)',
    'Tổng NLĐ',
    'Tổng DN',
    'Tổng cộng',
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
    emp.socialEmployee,
    emp.socialEmployer,
    emp.healthEmployee,
    emp.healthEmployer,
    emp.unemploymentEmployee,
    emp.unemploymentEmployer,
    emp.employeeTotal,
    emp.employerTotal,
    emp.grandTotal,
  ])

  // Add summary row
  const summaryRow = [
    '',
    '',
    'TỔNG CỘNG',
    '',
    '',
    '',
    '',
    reportData.summary.totalInsuranceSalary,
    reportData.summary.totalSocialEmployee,
    reportData.summary.totalSocialEmployer,
    reportData.summary.totalHealthEmployee,
    reportData.summary.totalHealthEmployer,
    reportData.summary.totalUnemploymentEmployee,
    reportData.summary.totalUnemploymentEmployer,
    reportData.summary.totalEmployeeContribution,
    reportData.summary.totalEmployerContribution,
    reportData.summary.grandTotal,
  ]

  return [headers, ...rows, summaryRow]
}

// ═══════════════════════════════════════════════════════════════
// FORMAT FOR DISPLAY
// ═══════════════════════════════════════════════════════════════

export function formatC12ForDisplay(reportData: C12ReportData): {
  title: string
  period: string
  company: string
  summary: Array<{ label: string; value: string }>
} {
  return {
    title: 'BẢNG KÊ ĐÓNG BHXH, BHYT, BHTN',
    period: `Tháng ${reportData.reportMonth}/${reportData.reportYear}`,
    company: reportData.companyInfo.name,
    summary: [
      { label: 'Tổng số lao động', value: reportData.summary.totalEmployees.toString() },
      {
        label: 'Tổng mức lương đóng BH',
        value: formatInsuranceAmount(reportData.summary.totalInsuranceSalary),
      },
      {
        label: 'Tổng đóng BHXH',
        value: formatInsuranceAmount(
          reportData.summary.totalSocialEmployee + reportData.summary.totalSocialEmployer
        ),
      },
      {
        label: 'Tổng đóng BHYT',
        value: formatInsuranceAmount(
          reportData.summary.totalHealthEmployee + reportData.summary.totalHealthEmployer
        ),
      },
      {
        label: 'Tổng đóng BHTN',
        value: formatInsuranceAmount(
          reportData.summary.totalUnemploymentEmployee + reportData.summary.totalUnemploymentEmployer
        ),
      },
      {
        label: 'NLĐ đóng',
        value: formatInsuranceAmount(reportData.summary.totalEmployeeContribution),
      },
      {
        label: 'Doanh nghiệp đóng',
        value: formatInsuranceAmount(reportData.summary.totalEmployerContribution),
      },
      {
        label: 'Tổng cộng',
        value: formatInsuranceAmount(reportData.summary.grandTotal),
      },
    ],
  }
}
