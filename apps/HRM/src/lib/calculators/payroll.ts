// TIP-008: Payroll Calculation Engine

import { calculatePIT, INSURANCE_RATES, TAX_DEDUCTIONS, TAX_FREE_CAPS, INSURANCE_CAPS } from "./pit"

export interface PayrollInput {
  // Từ Contract
  baseSalary: number
  mealAllowance: number
  phoneAllowance: number
  fuelAllowance: number
  perfAllowance: number

  // Công
  actualDays: number
  standardDays: number

  // Tăng thêm (từ PayrollItems)
  otWeekday: number
  otWeekend: number
  otHoliday: number
  nightShift: number
  businessTrip: number
  hazardAllowance: number
  otherAllowance: number
  kpiCurrent: number
  kpiPrev1: number
  kpiPrev2: number

  // Giảm trừ
  advanceDeduction: number
  dependentCount: number

  // PROBATION → không đóng BH
  isProbation: boolean
}

export interface PayrollResult {
  totalContractSalary: number
  totalActualSalary: number
  totalIncome: number
  insuranceBase: number
  bhxhEmployee: number
  bhytEmployee: number
  bhtnEmployee: number
  totalEmployeeIns: number
  personalDeduction: number
  dependentDeduction: number
  taxableIncome: number
  pitAmount: number
  netSalary: number
  bhxhEmployer: number
  bhytEmployer: number
  bhtnEmployer: number
  bhtnldEmployer: number
  totalEmployerIns: number
}

export function calculatePayroll(input: PayrollInput): PayrollResult {
  // 1. Lương theo HĐ = sum(baseSalary + allowances)
  const totalContractSalary =
    input.baseSalary + input.mealAllowance + input.phoneAllowance +
    input.fuelAllowance + input.perfAllowance

  // 2. Lương theo ngày công
  const totalActualSalary = input.standardDays > 0
    ? totalContractSalary * (input.actualDays / input.standardDays)
    : 0

  // 3. Tổng thu nhập = lương ngày công + tất cả tăng thêm
  const totalAdditions =
    input.otWeekday + input.otWeekend + input.otHoliday +
    input.nightShift + input.businessTrip + input.hazardAllowance +
    input.otherAllowance + input.kpiCurrent + input.kpiPrev1 + input.kpiPrev2
  const totalIncome = totalActualSalary + totalAdditions

  // 4. BH NLĐ đóng — PROBATION không đóng BH
  // Trần BHXH: tối đa 20× lương cơ sở (Nghị định 73/2024)
  const insuranceBase = Math.min(input.baseSalary, INSURANCE_CAPS.maxInsuranceBase)
  let bhxhEmployee = 0
  let bhytEmployee = 0
  let bhtnEmployee = 0
  let totalEmployeeIns = 0

  if (!input.isProbation) {
    bhxhEmployee = Math.round(insuranceBase * INSURANCE_RATES.employee.bhxh)
    bhytEmployee = Math.round(insuranceBase * INSURANCE_RATES.employee.bhyt)
    bhtnEmployee = Math.round(insuranceBase * INSURANCE_RATES.employee.bhtn)
    totalEmployeeIns = bhxhEmployee + bhytEmployee + bhtnEmployee
  }

  // 5. Giảm trừ thuế
  const personalDeduction = TAX_DEDUCTIONS.personal
  const dependentDeduction = input.dependentCount * TAX_DEDUCTIONS.dependent

  // 6. Thu nhập chịu thuế
  // Phụ cấp miễn thuế có trần (Thông tư 78/2021/TT-BTC)
  const taxFreeAllowances =
    Math.min(input.mealAllowance, TAX_FREE_CAPS.meal) +
    Math.min(input.phoneAllowance, TAX_FREE_CAPS.phone) +
    Math.min(input.fuelAllowance, TAX_FREE_CAPS.fuel)
  const taxableIncome = Math.max(
    0,
    totalIncome - taxFreeAllowances - totalEmployeeIns -
    personalDeduction - dependentDeduction
  )

  // 7. Thuế TNCN
  const pitAmount = calculatePIT(taxableIncome)

  // 8. Thực lĩnh
  const netSalary = Math.max(
    0,
    totalIncome - totalEmployeeIns - pitAmount - input.advanceDeduction
  )

  // 9. Công ty đóng — PROBATION không đóng BH
  let bhxhEmployer = 0
  let bhytEmployer = 0
  let bhtnEmployer = 0
  let bhtnldEmployer = 0
  let totalEmployerIns = 0

  if (!input.isProbation) {
    bhxhEmployer = Math.round(insuranceBase * INSURANCE_RATES.employer.bhxh)
    bhytEmployer = Math.round(insuranceBase * INSURANCE_RATES.employer.bhyt)
    bhtnEmployer = Math.round(insuranceBase * INSURANCE_RATES.employer.bhtn)
    bhtnldEmployer = Math.round(insuranceBase * INSURANCE_RATES.employer.bhtnld)
    totalEmployerIns = bhxhEmployer + bhytEmployer + bhtnEmployer + bhtnldEmployer
  }

  return {
    totalContractSalary: Math.round(totalContractSalary),
    totalActualSalary: Math.round(totalActualSalary),
    totalIncome: Math.round(totalIncome),
    insuranceBase: Math.round(insuranceBase),
    bhxhEmployee, bhytEmployee, bhtnEmployee, totalEmployeeIns,
    personalDeduction, dependentDeduction,
    taxableIncome: Math.round(taxableIncome),
    pitAmount,
    netSalary: Math.round(netSalary),
    bhxhEmployer, bhytEmployer, bhtnEmployer, bhtnldEmployer, totalEmployerIns,
  }
}
