// ============================================================
// Tax Engine — Vietnamese Tax Calculations & e-Tax Integration
// Supports: VAT, CIT, PIT, FCT
// Reference: Luật Thuế GTGT, Luật Thuế TNDN, Luật Thuế TNCN
// ============================================================

import Decimal from 'decimal.js';

// ==================== VAT — Thuế Giá Trị Gia Tăng ====================

export const VAT_RATES = {
  STANDARD: 0.10,     // 10% — Rate chính
  REDUCED: 0.08,      // 8%  — Giảm theo Nghị định (temporary reduction)
  LOW: 0.05,          // 5%  — Hàng hóa/dịch vụ thiết yếu
  EXEMPT: 0,          // 0%  — Miễn thuế
  NOT_SUBJECT: -1,    // Không chịu thuế GTGT
} as const;

export interface VATDeclarationInput {
  period: string;                // "2026-03" or "2026-Q1"
  outputInvoices: Array<{
    invoiceNumber: string;
    buyerTaxCode?: string;
    buyerName: string;
    amount: number;
    vatRate: number;
    vatAmount: number;
  }>;
  inputInvoices: Array<{
    invoiceNumber: string;
    sellerTaxCode: string;
    sellerName: string;
    amount: number;
    vatRate: number;
    vatAmount: number;
  }>;
  previousPeriodCarryForward?: number;
}

export interface VATDeclarationResult {
  period: string;
  // Thuế đầu ra
  totalOutputRevenue: Decimal;
  totalOutputVAT: Decimal;
  // Thuế đầu vào
  totalInputCost: Decimal;
  totalInputVAT: Decimal;
  deductibleInputVAT: Decimal;
  // Kết quả
  vatPayable: Decimal;                // > 0: phải nộp, < 0: được khấu trừ
  carryForwardAmount: Decimal;        // Số thuế được chuyển kỳ sau
  refundableAmount: Decimal;          // Số thuế được hoàn
}

/**
 * Calculate VAT declaration (Tờ khai thuế GTGT)
 * Method: Khấu trừ (Deduction method) — for enterprises with annual revenue > 1 billion VND
 */
export function calculateVATDeclaration(input: VATDeclarationInput): VATDeclarationResult {
  // Output VAT
  let totalOutputRevenue = new Decimal(0);
  let totalOutputVAT = new Decimal(0);

  for (const inv of input.outputInvoices) {
    totalOutputRevenue = totalOutputRevenue.plus(inv.amount);
    totalOutputVAT = totalOutputVAT.plus(inv.vatAmount);
  }

  // Input VAT
  let totalInputCost = new Decimal(0);
  let totalInputVAT = new Decimal(0);

  for (const inv of input.inputInvoices) {
    totalInputCost = totalInputCost.plus(inv.amount);
    totalInputVAT = totalInputVAT.plus(inv.vatAmount);
  }

  // Deductible input VAT (only from legitimate invoices with seller tax codes)
  const deductibleInputVAT = totalInputVAT; // Simplified — full deduction

  // Previous period carry forward
  const carryForward = new Decimal(input.previousPeriodCarryForward || 0);

  // VAT payable = Output VAT - Deductible Input VAT - Carry forward
  const vatPayable = totalOutputVAT.minus(deductibleInputVAT).minus(carryForward);

  return {
    period: input.period,
    totalOutputRevenue,
    totalOutputVAT,
    totalInputCost,
    totalInputVAT,
    deductibleInputVAT,
    vatPayable: vatPayable.greaterThan(0) ? vatPayable : new Decimal(0),
    carryForwardAmount: vatPayable.lessThan(0) ? vatPayable.abs() : new Decimal(0),
    refundableAmount: new Decimal(0), // Requires 12-month threshold check
  };
}

// ==================== CIT — Thuế Thu Nhập Doanh Nghiệp ====================

export const CIT_STANDARD_RATE = 0.20; // 20%

export interface CITDeclarationInput {
  fiscalYear: number;
  totalRevenue: number;
  deductibleExpenses: number;
  nonDeductibleExpenses: number;
  taxExemptIncome: number;
  lossCarryForward: number;        // Lỗ chuyển từ năm trước (max 5 years)
  taxIncentiveRate?: number;        // Ưu đãi thuế suất (10%, 15%, etc.)
  taxHolidayReduction?: number;     // Giảm thuế (50%, 100%)
}

export interface CITDeclarationResult {
  fiscalYear: number;
  totalRevenue: Decimal;
  totalDeductibleExpenses: Decimal;
  accountingProfit: Decimal;           // Lợi nhuận kế toán
  nonDeductibleAdjustment: Decimal;    // Điều chỉnh tăng
  taxExemptAdjustment: Decimal;        // Điều chỉnh giảm
  taxableIncome: Decimal;              // Thu nhập chịu thuế
  lossUtilized: Decimal;               // Lỗ đã bù trừ
  taxableIncomeAfterLoss: Decimal;     // TNCT sau bù lỗ
  applicableRate: Decimal;             // Thuế suất áp dụng
  citBeforeIncentive: Decimal;         // Thuế TNDN trước ưu đãi
  incentiveReduction: Decimal;         // Giảm thuế ưu đãi
  citPayable: Decimal;                 // Thuế TNDN phải nộp
}

/**
 * Calculate CIT declaration (Quyết toán thuế TNDN)
 */
export function calculateCITDeclaration(input: CITDeclarationInput): CITDeclarationResult {
  const totalRevenue = new Decimal(input.totalRevenue);
  const totalDeductible = new Decimal(input.deductibleExpenses);

  // Accounting profit
  const accountingProfit = totalRevenue.minus(totalDeductible);

  // Tax adjustments
  const nonDeductibleAdj = new Decimal(input.nonDeductibleExpenses);
  const taxExemptAdj = new Decimal(input.taxExemptIncome);

  // Taxable income
  let taxableIncome = accountingProfit.plus(nonDeductibleAdj).minus(taxExemptAdj);
  if (taxableIncome.isNegative()) taxableIncome = new Decimal(0);

  // Loss carry forward (max 5 years, cannot exceed taxable income)
  const lossAvailable = new Decimal(input.lossCarryForward);
  const lossUtilized = Decimal.min(lossAvailable, taxableIncome);
  const taxableAfterLoss = taxableIncome.minus(lossUtilized);

  // Tax rate
  const rate = new Decimal(input.taxIncentiveRate || CIT_STANDARD_RATE);

  // CIT before incentive
  const citBefore = taxableAfterLoss.times(rate);

  // Tax holiday reduction
  const reductionPct = new Decimal(input.taxHolidayReduction || 0);
  const incentiveReduction = citBefore.times(reductionPct);

  return {
    fiscalYear: input.fiscalYear,
    totalRevenue,
    totalDeductibleExpenses: totalDeductible,
    accountingProfit,
    nonDeductibleAdjustment: nonDeductibleAdj,
    taxExemptAdjustment: taxExemptAdj,
    taxableIncome,
    lossUtilized,
    taxableIncomeAfterLoss: taxableAfterLoss,
    applicableRate: rate,
    citBeforeIncentive: citBefore,
    incentiveReduction,
    citPayable: citBefore.minus(incentiveReduction),
  };
}

// ==================== PIT — Thuế Thu Nhập Cá Nhân ====================

/**
 * Vietnam PIT progressive tax brackets (for employment income)
 * Per Luật Thuế TNCN and Nghị quyết 954/2020
 */
export const PIT_BRACKETS = [
  { min: 0,          max: 5_000_000,   rate: 0.05 },
  { min: 5_000_000,  max: 10_000_000,  rate: 0.10 },
  { min: 10_000_000, max: 18_000_000,  rate: 0.15 },
  { min: 18_000_000, max: 32_000_000,  rate: 0.20 },
  { min: 32_000_000, max: 52_000_000,  rate: 0.25 },
  { min: 52_000_000, max: 80_000_000,  rate: 0.30 },
  { min: 80_000_000, max: Infinity,    rate: 0.35 },
];

export const PIT_PERSONAL_DEDUCTION = 11_000_000;   // Giảm trừ bản thân
export const PIT_DEPENDENT_DEDUCTION = 4_400_000;    // Giảm trừ người phụ thuộc

export interface PITCalculationInput {
  grossSalary: number;
  allowances: number;           // Phụ cấp không tính thuế
  insuranceEmployee: number;    // BHXH, BHYT, BHTN phần NLĐ
  numberOfDependents: number;
}

export interface PITCalculationResult {
  grossIncome: Decimal;
  taxableIncome: Decimal;
  personalDeduction: Decimal;
  dependentDeduction: Decimal;
  insuranceDeduction: Decimal;
  assessableIncome: Decimal;    // Thu nhập tính thuế
  pitAmount: Decimal;
  effectiveRate: Decimal;       // Thuế suất thực tế
  netSalary: Decimal;
  brackets: Array<{
    bracket: string;
    rate: number;
    taxableAmount: Decimal;
    taxAmount: Decimal;
  }>;
}

/**
 * Calculate Personal Income Tax (Thuế TNCN)
 */
export function calculatePIT(input: PITCalculationInput): PITCalculationResult {
  const gross = new Decimal(input.grossSalary);
  const allowances = new Decimal(input.allowances);
  const insurance = new Decimal(input.insuranceEmployee);
  const personalDed = new Decimal(PIT_PERSONAL_DEDUCTION);
  const dependentDed = new Decimal(PIT_DEPENDENT_DEDUCTION).times(input.numberOfDependents);

  // Taxable income = Gross - Allowances
  const taxableIncome = gross.minus(allowances);

  // Assessable income = Taxable - Insurance - Personal deduction - Dependent deduction
  let assessableIncome = taxableIncome.minus(insurance).minus(personalDed).minus(dependentDed);
  if (assessableIncome.isNegative()) assessableIncome = new Decimal(0);

  // Progressive tax calculation
  let totalTax = new Decimal(0);
  let remaining = assessableIncome;
  const bracketDetails: PITCalculationResult['brackets'] = [];

  for (const bracket of PIT_BRACKETS) {
    if (remaining.isZero() || remaining.isNegative()) break;

    const bracketWidth = bracket.max === Infinity
      ? remaining
      : new Decimal(bracket.max - bracket.min);

    const taxableInBracket = Decimal.min(remaining, bracketWidth);
    const taxInBracket = taxableInBracket.times(bracket.rate);

    totalTax = totalTax.plus(taxInBracket);
    remaining = remaining.minus(taxableInBracket);

    bracketDetails.push({
      bracket: bracket.max === Infinity
        ? `Trên ${(bracket.min / 1_000_000).toFixed(0)} triệu`
        : `${(bracket.min / 1_000_000).toFixed(0)} - ${(bracket.max / 1_000_000).toFixed(0)} triệu`,
      rate: bracket.rate,
      taxableAmount: taxableInBracket,
      taxAmount: taxInBracket,
    });
  }

  const effectiveRate = assessableIncome.greaterThan(0)
    ? totalTax.div(assessableIncome)
    : new Decimal(0);

  return {
    grossIncome: gross,
    taxableIncome,
    personalDeduction: personalDed,
    dependentDeduction: dependentDed,
    insuranceDeduction: insurance,
    assessableIncome,
    pitAmount: totalTax,
    effectiveRate,
    netSalary: gross.minus(insurance).minus(totalTax),
    brackets: bracketDetails,
  };
}

// ==================== Social Insurance ====================

export const INSURANCE_RATES = {
  // Employee contributions
  BHXH_EMPLOYEE: 0.08,     // 8% BHXH
  BHYT_EMPLOYEE: 0.015,    // 1.5% BHYT
  BHTN_EMPLOYEE: 0.01,     // 1% BHTN

  // Employer contributions
  BHXH_EMPLOYER: 0.175,    // 17.5% BHXH (illness 3%, maternity 2%, occupational 0.5%, retirement 14%)
  BHYT_EMPLOYER: 0.03,     // 3% BHYT
  BHTN_EMPLOYER: 0.01,     // 1% BHTN
  UNION_EMPLOYER: 0.02,    // 2% Kinh phí công đoàn

  // Salary cap for insurance (20x base salary = 36,000,000 VND for 2024)
  SALARY_CAP: 36_000_000,
};

export function calculateInsurance(grossSalary: number): {
  employeeTotal: Decimal;
  employerTotal: Decimal;
  bhxhEmployee: Decimal;
  bhytEmployee: Decimal;
  bhtnEmployee: Decimal;
  bhxhEmployer: Decimal;
  bhytEmployer: Decimal;
  bhtnEmployer: Decimal;
  unionEmployer: Decimal;
} {
  const salary = new Decimal(Math.min(grossSalary, INSURANCE_RATES.SALARY_CAP));

  const bhxhEE = salary.times(INSURANCE_RATES.BHXH_EMPLOYEE);
  const bhytEE = salary.times(INSURANCE_RATES.BHYT_EMPLOYEE);
  const bhtnEE = salary.times(INSURANCE_RATES.BHTN_EMPLOYEE);

  const bhxhER = salary.times(INSURANCE_RATES.BHXH_EMPLOYER);
  const bhytER = salary.times(INSURANCE_RATES.BHYT_EMPLOYER);
  const bhtnER = salary.times(INSURANCE_RATES.BHTN_EMPLOYER);
  const unionER = salary.times(INSURANCE_RATES.UNION_EMPLOYER);

  return {
    employeeTotal: bhxhEE.plus(bhytEE).plus(bhtnEE),
    employerTotal: bhxhER.plus(bhytER).plus(bhtnER).plus(unionER),
    bhxhEmployee: bhxhEE,
    bhytEmployee: bhytEE,
    bhtnEmployee: bhtnEE,
    bhxhEmployer: bhxhER,
    bhytEmployer: bhytER,
    bhtnEmployer: bhtnER,
    unionEmployer: unionER,
  };
}

// ==================== e-Tax XML Generation ====================

/**
 * Generate XML for e-Tax submission
 * Format: HTKK (Hỗ trợ kê khai) compatible
 */
export function generateVATDeclarationXML(result: VATDeclarationResult, tenantInfo: {
  taxCode: string;
  companyName: string;
  address: string;
  district: string;
  city: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu xmlns="http://kekhaithue.gdt.gov.vn">
  <HSoKhaiThue>
    <TTinChung>
      <TTinNNT>
        <mst>${tenantInfo.taxCode}</mst>
        <tenNNT>${tenantInfo.companyName}</tenNNT>
        <dchiNNT>${tenantInfo.address}</dchiNNT>
        <phuong_xa></phuong_xa>
        <ma_quan_huyen>${tenantInfo.district}</ma_quan_huyen>
        <ma_tinh_tp>${tenantInfo.city}</ma_tinh_tp>
      </TTinNNT>
      <TTinTKhai>
        <TKhaiThue>
          <maTKhai>01/GTGT</maTKhai>
          <tenTKhai>TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG (Mẫu số 01/GTGT)</tenTKhai>
          <moTaBMau>Dành cho người nộp thuế khai thuế GTGT theo phương pháp khấu trừ</moTaBMau>
        </TKhaiThue>
        <KyKKhai>
          <kieuKy>M</kieuKy>
          <kyKKhai>${result.period}</kyKKhai>
        </KyKKhai>
      </TTinTKhai>
    </TTinChung>
    <CTieuTKhai>
      <!-- Hàng hóa dịch vụ bán ra -->
      <ct21>${result.totalOutputRevenue.toFixed(0)}</ct21>
      <ct22>${result.totalOutputVAT.toFixed(0)}</ct22>
      <!-- Hàng hóa dịch vụ mua vào -->
      <ct23>${result.totalInputCost.toFixed(0)}</ct23>
      <ct24>${result.totalInputVAT.toFixed(0)}</ct24>
      <ct25>${result.deductibleInputVAT.toFixed(0)}</ct25>
      <!-- Thuế GTGT phải nộp -->
      <ct32>${result.vatPayable.toFixed(0)}</ct32>
      <!-- Thuế GTGT chuyển kỳ sau -->
      <ct37>${result.carryForwardAmount.toFixed(0)}</ct37>
    </CTieuTKhai>
  </HSoKhaiThue>
</HSoThueDTu>`;
}
