/**
 * Tax Report Generation Module
 * Creates XML/structured reports matching Tổng cục Thuế (General Department of Taxation) format
 * - Mẫu 01/GTGT: VAT Declaration
 * - Mẫu 05/KK-TNCN: PIT Declaration
 * - Mẫu 03/TNDN: CIT Declaration
 */

import {
  VATDeclarationData,
  PITDeclarationData,
  CITDeclarationData,
} from "../types/index.js";

/**
 * VAT Declaration Report (Mẫu 01/GTGT)
 */
export interface VATDeclarationReport {
  formCode: string;
  taxCode: string;
  companyName: string;
  taxYear: number;
  taxMonth: number;
  declarationDate: Date;
  totalSalesVAT: number;
  totalPurchaseVAT: number;
  exportSales: number;
  exemptSales: number;
  payableVAT: number;
  overpaidVAT: number;
}

/**
 * Generate VAT Declaration (Mẫu 01/GTGT)
 * Per Vietnamese tax authority format
 */
export function generateVATDeclaration(
  data: VATDeclarationData
): VATDeclarationReport {
  const overpaidVAT = Math.max(0, data.totalPurchaseVAT - data.totalSalesVAT);
  const payableVAT = Math.max(0, data.totalSalesVAT - data.totalPurchaseVAT);

  return {
    formCode: "01/GTGT",
    taxCode: data.taxCode,
    companyName: data.companyName,
    taxYear: data.taxYear,
    taxMonth: data.taxMonth,
    declarationDate: new Date(),
    totalSalesVAT: data.totalSalesVAT,
    totalPurchaseVAT: data.totalPurchaseVAT,
    exportSales: data.exportSales,
    exemptSales: data.exemptSales,
    payableVAT: payableVAT || data.payableVAT,
    overpaidVAT,
  };
}

/**
 * Convert VAT Declaration to XML string
 */
export function generateVATDeclarationXML(
  report: VATDeclarationReport
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<TaxDeclaration>
  <FormCode>${escapeXML(report.formCode)}</FormCode>
  <TaxCode>${escapeXML(report.taxCode)}</TaxCode>
  <CompanyName>${escapeXML(report.companyName)}</CompanyName>
  <TaxYear>${report.taxYear}</TaxYear>
  <TaxMonth>${String(report.taxMonth).padStart(2, "0")}</TaxMonth>
  <DeclarationDate>${formatDateVN(report.declarationDate)}</DeclarationDate>
  <VAT>
    <TotalSalesVAT>${report.totalSalesVAT}</TotalSalesVAT>
    <TotalPurchaseVAT>${report.totalPurchaseVAT}</TotalPurchaseVAT>
    <ExportSales>${report.exportSales}</ExportSales>
    <ExemptSales>${report.exemptSales}</ExemptSales>
    <PayableVAT>${report.payableVAT}</PayableVAT>
    <OverpaidVAT>${report.overpaidVAT}</OverpaidVAT>
  </VAT>
</TaxDeclaration>`;
}

/**
 * PIT Declaration Report (Mẫu 05/KK-TNCN)
 */
export interface PITDeclarationReport {
  formCode: string;
  taxCode: string;
  taxpayerName: string;
  taxYear: number;
  declarationDate: Date;
  incomeType: string;
  grossIncome: number;
  allowances: number;
  deductions: number;
  taxableIncome: number;
  pitTax: number;
  dependents: number;
}

/**
 * Generate PIT Declaration (Mẫu 05/KK-TNCN)
 */
export function generatePITDeclaration(
  data: PITDeclarationData
): PITDeclarationReport {
  const personalDeduction = 11_000_000;
  const dependentDeduction = data.dependents * 4_400_000;
  const totalDeductions = personalDeduction + dependentDeduction + data.deductions;
  const taxableIncome = Math.max(0, data.grossIncome - totalDeductions);
  const pitTax = calculatePITFromTaxableIncome(taxableIncome);

  return {
    formCode: "05/KK-TNCN",
    taxCode: data.taxCode,
    taxpayerName: data.taxpayerName,
    taxYear: data.taxYear,
    declarationDate: new Date(),
    incomeType: data.incomeType,
    grossIncome: data.grossIncome,
    allowances: data.allowances,
    deductions: totalDeductions,
    taxableIncome,
    pitTax: Math.round(pitTax),
    dependents: data.dependents,
  };
}

/**
 * Simple PIT calculation for reporting
 */
function calculatePITFromTaxableIncome(income: number): number {
  if (income <= 0) return 0;

  const brackets = [
    { limit: 5_000_000, rate: 0.05 },
    { limit: 10_000_000, rate: 0.1 },
    { limit: 18_000_000, rate: 0.15 },
    { limit: 32_000_000, rate: 0.2 },
    { limit: 52_000_000, rate: 0.25 },
    { limit: 80_000_000, rate: 0.3 },
    { limit: Number.MAX_SAFE_INTEGER, rate: 0.35 },
  ];

  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (income <= previousLimit) break;

    const taxableInBracket = Math.min(
      income,
      bracket.limit
    ) - previousLimit;
    tax += taxableInBracket * bracket.rate;
    previousLimit = bracket.limit;

    if (income <= bracket.limit) break;
  }

  return tax;
}

/**
 * Convert PIT Declaration to XML string
 */
export function generatePITDeclarationXML(
  report: PITDeclarationReport
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<TaxDeclaration>
  <FormCode>${escapeXML(report.formCode)}</FormCode>
  <TaxCode>${escapeXML(report.taxCode)}</TaxCode>
  <TaxpayerName>${escapeXML(report.taxpayerName)}</TaxpayerName>
  <TaxYear>${report.taxYear}</TaxYear>
  <DeclarationDate>${formatDateVN(report.declarationDate)}</DeclarationDate>
  <PIT>
    <IncomeType>${escapeXML(report.incomeType)}</IncomeType>
    <GrossIncome>${report.grossIncome}</GrossIncome>
    <Allowances>${report.allowances}</Allowances>
    <Deductions>${report.deductions}</Deductions>
    <TaxableIncome>${report.taxableIncome}</TaxableIncome>
    <PITTax>${report.pitTax}</PITTax>
    <Dependents>${report.dependents}</Dependents>
  </PIT>
</TaxDeclaration>`;
}

/**
 * CIT Declaration Report (Mẫu 03/TNDN)
 */
export interface CITDeclarationReport {
  formCode: string;
  taxCode: string;
  companyName: string;
  taxYear: number;
  declarationDate: Date;
  taxableIncome: number;
  citRate: number;
  citAmount: number;
  hasIncentives: boolean;
}

/**
 * Generate CIT Declaration (Mẫu 03/TNDN)
 */
export function generateCITDeclaration(
  data: CITDeclarationData
): CITDeclarationReport {
  const citRate = data.hasInvestmentIncentives
    ? 5
    : data.preferentialZone
      ? 8
      : 20;

  const citAmount = Math.round((data.taxableIncome * citRate) / 100);

  return {
    formCode: "03/TNDN",
    taxCode: data.taxCode,
    companyName: data.companyName,
    taxYear: data.taxYear,
    declarationDate: new Date(),
    taxableIncome: data.taxableIncome,
    citRate,
    citAmount,
    hasIncentives: data.hasInvestmentIncentives,
  };
}

/**
 * Convert CIT Declaration to XML string
 */
export function generateCITDeclarationXML(
  report: CITDeclarationReport
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<TaxDeclaration>
  <FormCode>${escapeXML(report.formCode)}</FormCode>
  <TaxCode>${escapeXML(report.taxCode)}</TaxCode>
  <CompanyName>${escapeXML(report.companyName)}</CompanyName>
  <TaxYear>${report.taxYear}</TaxYear>
  <DeclarationDate>${formatDateVN(report.declarationDate)}</DeclarationDate>
  <CIT>
    <TaxableIncome>${report.taxableIncome}</TaxableIncome>
    <CITRate>${report.citRate}</CITRate>
    <CITAmount>${report.citAmount}</CITAmount>
    <HasIncentives>${report.hasIncentives}</HasIncentives>
  </CIT>
</TaxDeclaration>`;
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
 * Format date in Vietnamese style for reports
 * Format: dd/MM/yyyy
 */
function formatDateVN(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Generate multiple tax reports summary
 */
export interface TaxReportsSummary {
  taxYear: number;
  taxCode: string;
  companyName: string;
  generatedDate: Date;
  reports: {
    vat?: VATDeclarationReport;
    pit?: PITDeclarationReport;
    cit?: CITDeclarationReport;
  };
}

/**
 * Create combined tax reports
 */
export function generateTaxReportsSummary(
  taxYear: number,
  taxCode: string,
  companyName: string,
  vatData?: VATDeclarationData,
  pitData?: PITDeclarationData,
  citData?: CITDeclarationData
): TaxReportsSummary {
  return {
    taxYear,
    taxCode,
    companyName,
    generatedDate: new Date(),
    reports: {
      vat: vatData ? generateVATDeclaration(vatData) : undefined,
      pit: pitData ? generatePITDeclaration(pitData) : undefined,
      cit: citData ? generateCITDeclaration(citData) : undefined,
    },
  };
}

export default {
  generateVATDeclaration,
  generateVATDeclarationXML,
  generatePITDeclaration,
  generatePITDeclarationXML,
  generateCITDeclaration,
  generateCITDeclarationXML,
  generateTaxReportsSummary,
};
