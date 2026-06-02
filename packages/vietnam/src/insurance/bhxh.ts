/**
 * Insurance Calculation Module (BHXH, BHYT, BHTN)
 * Social, Health, and Unemployment Insurance per Vietnamese law
 * Based on Luật Bảo hiểm xã hội, Bảo hiểm y tế, Bảo hiểm thất nghiệp
 */

import { InsuranceRecord, InsuranceReport, MINIMUM_WAGE_2024 } from "../types/index.js";

/**
 * Insurance contribution rates (2024)
 */
const INSURANCE_RATES = {
  BHXH: {
    employee: 0.08, // 8%
    employer: 0.175, // 17.5%
  },
  BHYT: {
    employee: 0.015, // 1.5%
    employer: 0.03, // 3%
  },
  BHTN: {
    employee: 0.01, // 1%
    employer: 0.01, // 1%
  },
};

/**
 * Salary cap for insurance calculation
 * 20x minimum wage (Nghị định về Bảo hiểm xã hội)
 */
const SALARY_CAP = MINIMUM_WAGE_2024 * 20; // 36,000,000 VNĐ

/**
 * Calculate Social Insurance (BHXH)
 * Employee contribution: 8%, Employer contribution: 17.5%
 *
 * @param salary - Monthly salary in VNĐ
 * @param employeeOnly - If true, return only employee contribution
 * @returns Contribution amount in VNĐ
 */
export function calculateBHXH(salary: number, employeeOnly: boolean = false): number {
  if (salary < 0) {
    throw new Error("Salary must be non-negative");
  }

  const cappedSalary = Math.min(salary, SALARY_CAP);
  const rate = employeeOnly ? INSURANCE_RATES.BHXH.employee : INSURANCE_RATES.BHXH.employer;

  return Math.round(cappedSalary * rate);
}

/**
 * Calculate Health Insurance (BHYT)
 * Employee contribution: 1.5%, Employer contribution: 3%
 *
 * @param salary - Monthly salary in VNĐ
 * @param employeeOnly - If true, return only employee contribution
 * @returns Contribution amount in VNĐ
 */
export function calculateBHYT(salary: number, employeeOnly: boolean = false): number {
  if (salary < 0) {
    throw new Error("Salary must be non-negative");
  }

  const cappedSalary = Math.min(salary, SALARY_CAP);
  const rate = employeeOnly ? INSURANCE_RATES.BHYT.employee : INSURANCE_RATES.BHYT.employer;

  return Math.round(cappedSalary * rate);
}

/**
 * Calculate Unemployment Insurance (BHTN)
 * Employee contribution: 1%, Employer contribution: 1%
 *
 * @param salary - Monthly salary in VNĐ
 * @param employeeOnly - If true, return only employee contribution
 * @returns Contribution amount in VNĐ
 */
export function calculateBHTN(salary: number, employeeOnly: boolean = false): number {
  if (salary < 0) {
    throw new Error("Salary must be non-negative");
  }

  const cappedSalary = Math.min(salary, SALARY_CAP);
  const rate = employeeOnly ? INSURANCE_RATES.BHTN.employee : INSURANCE_RATES.BHTN.employer;

  return Math.round(cappedSalary * rate);
}

/**
 * Insurance Calculation Result
 */
export interface InsuranceCalculation {
  salary: number;
  cappedSalary: number;
  bhxhEmployee: number;
  bhxhEmployer: number;
  bhytEmployee: number;
  bhytEmployer: number;
  bhtnEmployee: number;
  bhtnEmployer: number;
  totalEmployee: number;
  totalEmployer: number;
  totalInsurance: number;
}

/**
 * Calculate all insurance contributions
 * Returns both employee and employer contributions
 */
export function calculateTotalInsurance(salary: number): InsuranceCalculation {
  if (salary < 0) {
    throw new Error("Salary must be non-negative");
  }

  const cappedSalary = Math.min(salary, SALARY_CAP);

  const bhxhEmployee = Math.round(
    cappedSalary * INSURANCE_RATES.BHXH.employee
  );
  const bhxhEmployer = Math.round(
    cappedSalary * INSURANCE_RATES.BHXH.employer
  );

  const bhytEmployee = Math.round(
    cappedSalary * INSURANCE_RATES.BHYT.employee
  );
  const bhytEmployer = Math.round(
    cappedSalary * INSURANCE_RATES.BHYT.employer
  );

  const bhtnEmployee = Math.round(
    cappedSalary * INSURANCE_RATES.BHTN.employee
  );
  const bhtnEmployer = Math.round(
    cappedSalary * INSURANCE_RATES.BHTN.employer
  );

  const totalEmployee = bhxhEmployee + bhytEmployee + bhtnEmployee;
  const totalEmployer = bhxhEmployer + bhytEmployer + bhtnEmployer;
  const totalInsurance = totalEmployee + totalEmployer;

  return {
    salary,
    cappedSalary,
    bhxhEmployee,
    bhxhEmployer,
    bhytEmployee,
    bhytEmployer,
    bhtnEmployee,
    bhtnEmployer,
    totalEmployee,
    totalEmployer,
    totalInsurance,
  };
}

/**
 * Calculate net salary after insurance deduction
 * Employees pay: BHXH + BHYT + BHTN
 */
export function calculateNetSalary(salary: number): {
  grossSalary: number;
  insuranceDeduction: number;
  netSalary: number;
} {
  if (salary < 0) {
    throw new Error("Salary must be non-negative");
  }

  const calculation = calculateTotalInsurance(salary);
  const insuranceDeduction = calculation.totalEmployee;
  const netSalary = salary - insuranceDeduction;

  return {
    grossSalary: salary,
    insuranceDeduction,
    netSalary: Math.max(0, netSalary),
  };
}

/**
 * Generate monthly insurance report for BHXH agency submission
 * (Báo cáo bảo hiểm xã hội hàng tháng)
 */
export function generateInsuranceReport(employees: InsuranceRecord[]): InsuranceReport {
  if (employees.length === 0) {
    throw new Error("At least one employee required for report");
  }

  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totals = employees.reduce(
    (acc, emp) => ({
      totalSalary: acc.totalSalary + emp.salary,
      totalBHXH: acc.totalBHXH + emp.bhxhAmount,
      totalBHYT: acc.totalBHYT + emp.bhytAmount,
      totalBHTN: acc.totalBHTN + emp.bhtnAmount,
      totalInsurance: acc.totalInsurance + emp.totalInsuranceAmount,
    }),
    { totalSalary: 0, totalBHXH: 0, totalBHYT: 0, totalBHTN: 0, totalInsurance: 0 }
  );

  // Extract company info from first employee record (should be provided separately in real usage)
  return {
    companyName: "",
    taxCode: "",
    reportPeriod: yearMonth,
    reportDate: now,
    employees,
    totalSalary: totals.totalSalary,
    totalBHXH: totals.totalBHXH,
    totalBHYT: totals.totalBHYT,
    totalBHTN: totals.totalBHTN,
    totalInsurance: totals.totalInsurance,
  };
}

/**
 * Generate insurance report XML
 * Format for BHXH agency submission
 */
export function generateInsuranceReportXML(report: InsuranceReport): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<InsuranceReport>
  <CompanyName>${escapeXML(report.companyName)}</CompanyName>
  <TaxCode>${escapeXML(report.taxCode)}</TaxCode>
  <ReportPeriod>${escapeXML(report.reportPeriod)}</ReportPeriod>
  <ReportDate>${formatDateVN(report.reportDate)}</ReportDate>
  <Employees>`;

  for (const emp of report.employees) {
    xml += `
    <Employee>
      <Id>${escapeXML(emp.employeeId)}</Id>
      <Name>${escapeXML(emp.employeeName)}</Name>
      <Salary>${emp.salary}</Salary>
      <BHXH>${emp.bhxhAmount}</BHXH>
      <BHYT>${emp.bhytAmount}</BHYT>
      <BHTN>${emp.bhtnAmount}</BHTN>
      <TotalInsurance>${emp.totalInsuranceAmount}</TotalInsurance>
    </Employee>`;
  }

  xml += `
  </Employees>
  <Summary>
    <TotalSalary>${report.totalSalary}</TotalSalary>
    <TotalBHXH>${report.totalBHXH}</TotalBHXH>
    <TotalBHYT>${report.totalBHYT}</TotalBHYT>
    <TotalBHTN>${report.totalBHTN}</TotalBHTN>
    <TotalInsurance>${report.totalInsurance}</TotalInsurance>
  </Summary>
</InsuranceReport>`;

  return xml;
}

/**
 * Check if salary is above cap
 */
export function isSalaryAboveCap(salary: number): boolean {
  return salary > SALARY_CAP;
}

/**
 * Get salary cap
 */
export function getSalaryCap(): number {
  return SALARY_CAP;
}

/**
 * Format insurance amount with currency
 */
export function formatInsuranceAmount(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Format date in Vietnamese style
 */
function formatDateVN(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default {
  calculateBHXH,
  calculateBHYT,
  calculateBHTN,
  calculateTotalInsurance,
  calculateNetSalary,
  generateInsuranceReport,
  generateInsuranceReportXML,
  isSalaryAboveCap,
  getSalaryCap,
  formatInsuranceAmount,
};
