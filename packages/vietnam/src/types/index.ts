/**
 * Vietnamese Market Types and Enums
 * Compliance with TT200, NĐ123, BHXH/BHYT/BHTN regulations
 */

/**
 * VAT Rates - Nghị định 44/2023/NĐ-CP
 * Percentage values per current Vietnamese regulations
 */
export enum VATRate {
  ZERO = 0,
  REDUCED = 5,
  SPECIAL = 8,
  STANDARD = 10,
}

/**
 * Tax Declaration Types
 */
export enum TaxDeclarationType {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUAL = "ANNUAL",
}

/**
 * E-Invoice Service Providers
 * Per Nghị định 123/2020/NĐ-CP
 */
export enum EInvoiceProvider {
  VNPT = "VNPT",
  VIETTEL = "VIETTEL",
  FPT = "FPT",
  BKAV = "BKAV",
}

/**
 * Insurance Types
 * Social, Health, Unemployment insurance
 */
export enum InsuranceType {
  BHXH = "BHXH", // Social Insurance (Bảo hiểm xã hội)
  BHYT = "BHYT", // Health Insurance (Bảo hiểm y tế)
  BHTN = "BHTN", // Unemployment Insurance (Bảo hiểm thất nghiệp)
}

/**
 * Vietnamese Banking Codes
 * Top 20 banks with BIN codes for VietQR
 */
export enum BankCode {
  VCB = "VCB",   // Vietcombank
  BIDV = "BIDV", // BIDV
  TCB = "TCB",   // Techcombank
  MB = "MB",     // MB Bank
  VPB = "VPB",   // VPBank
  ACB = "ACB",   // ACB
  SHB = "SHB",   // SHB
  TPB = "TPB",   // TPBank
  HDB = "HDB",   // HDBank
  STB = "STB",   // Sacombank
  EXB = "EXB",   // Exim Bank
  MBB = "MBB",   // Military Bank
  VIB = "VIB",   // VIB
  CTG = "CTG",   // SeABank
  OCB = "OCB",   // OCB
  VRB = "VRB",   // VRB
  NAB = "NAB",   // Nam Á Bank
  BVB = "BVB",   // BVBANK
  PGB = "PGB",   // PGB
  BAB = "BAB",   // Bắc Á Bank
}

/**
 * VAT Exemption Categories
 * Per Vietnamese tax regulations
 */
export enum VATExemptCategory {
  EDUCATION = "EDUCATION",
  HEALTHCARE = "HEALTHCARE",
  AGRICULTURE = "AGRICULTURE",
  EXPORT = "EXPORT",
  FOOD_FOR_POOR = "FOOD_FOR_POOR",
  RELIGIOUS = "RELIGIOUS",
}

/**
 * Company Size for Tax Incentives
 */
export enum CompanySize {
  STARTUP = "STARTUP",
  MICRO = "MICRO",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

/**
 * Preferential Tax Zones
 * Special Economic Zones in Vietnam
 */
export enum PrefTaxZone {
  HIGHLAND = "HIGHLAND",               // Central Highlands
  EXTREME_DIFFICULTY = "EXTREME_DIFFICULTY", // Extremely difficult areas
  TECH_PARK = "TECH_PARK",             // Tech Parks
  EXPORT_ZONE = "EXPORT_ZONE",         // Export Processing Zones
  FREE_TRADE_ZONE = "FREE_TRADE_ZONE", // Free Trade Zones
}

/**
 * E-Invoice Status
 */
export enum EInvoiceStatus {
  DRAFT = "DRAFT",
  ISSUED = "ISSUED",
  CANCELLED = "CANCELLED",
  REPLACED = "REPLACED",
  REJECTED = "REJECTED",
}

/**
 * Payment Methods
 */
export enum PaymentMethod {
  CASH = "01",
  TRANSFER = "02",
  CHECK = "03",
  CREDIT_CARD = "04",
  E_WALLET = "05",
  OTHER = "99",
}

/**
 * Currency Code
 * Vietnamese Dong (VNĐ)
 */
export const CURRENCY_CODE = "VND";

/**
 * Minimum Wage (2024)
 * Base for salary cap calculations
 */
export const MINIMUM_WAGE_2024 = 1_800_000; // VNĐ

/**
 * Personal Income Tax (PIT) Brackets
 * Mẫu 05/KK-TNCN - Progressive tax table
 */
export interface PITBracket {
  fromIncome: number;
  toIncome: number;
  rate: number; // percentage
  deductionAmount: number;
}

/**
 * VAT Declaration Data
 */
export interface VATDeclarationData {
  taxCode: string;
  taxYear: number;
  taxMonth: number;
  companyName: string;
  totalSalesVAT: number;
  totalPurchaseVAT: number;
  exportSales: number;
  exemptSales: number;
  payableVAT: number;
}

/**
 * PIT Declaration Data
 */
export interface PITDeclarationData {
  taxCode: string;
  taxpayerName: string;
  taxYear: number;
  grossIncome: number;
  dependents: number;
  incomeType: "EMPLOYMENT" | "BUSINESS" | "INVESTMENT" | "OTHER";
  allowances: number;
  deductions: number;
}

/**
 * CIT Declaration Data
 */
export interface CITDeclarationData {
  taxCode: string;
  companyName: string;
  taxYear: number;
  taxableIncome: number;
  companySize: CompanySize;
  preferentialZone?: PrefTaxZone;
  hasInvestmentIncentives: boolean;
}

/**
 * E-Invoice Interface
 * Nghị định 123/2020/NĐ-CP format
 */
export interface EInvoice {
  id?: string;
  invoiceNumber: string;
  series: string;
  date: Date;
  dueDate?: Date;
  seller: EInvoiceParty;
  buyer: EInvoiceParty;
  items: EInvoiceItem[];
  totalBeforeVAT: number;
  totalVAT: number;
  totalAfterVAT: number;
  totalDiscount?: number;
  paymentMethod: PaymentMethod;
  currencyCode: string;
  status: EInvoiceStatus;
  signature?: string;
  provider?: EInvoiceProvider;
  notes?: string;
}

/**
 * E-Invoice Party (Seller/Buyer)
 */
export interface EInvoiceParty {
  name: string;
  taxCode?: string;
  address: string;
  phone?: string;
  email?: string;
  accountNumber?: string;
  bankName?: string;
}

/**
 * E-Invoice Item
 */
export interface EInvoiceItem {
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  discount?: number;
  discountPercentage?: number;
  vatRate: VATRate;
  amount: number;
  vatAmount: number;
  totalAmount: number;
}

/**
 * Bank Account Information
 */
export interface BankAccount {
  accountNumber: string;
  accountHolder: string;
  bankCode: BankCode;
  bankName: string;
  swiftCode: string;
  bin: string;
}

/**
 * VietQR Transfer
 */
export interface VietQRTransfer {
  bankCode: BankCode;
  accountNumber: string;
  amount?: number;
  description?: string;
}

/**
 * Insurance Data
 */
export interface InsuranceRecord {
  employeeId: string;
  employeeName: string;
  salary: number;
  bhxhRate: number; // % of salary
  bhytRate: number; // % of salary
  bhtnRate: number; // % of salary
  bhxhAmount: number;
  bhytAmount: number;
  bhtnAmount: number;
  totalInsuranceAmount: number;
}

/**
 * Insurance Report
 */
export interface InsuranceReport {
  companyName: string;
  taxCode: string;
  reportPeriod: string; // "YYYY-MM"
  reportDate: Date;
  employees: InsuranceRecord[];
  totalSalary: number;
  totalBHXH: number;
  totalBHYT: number;
  totalBHTN: number;
  totalInsurance: number;
}

/**
 * Bank Information
 * Vietnamese bank metadata for VietQR
 */
export interface BankInfo {
  code: BankCode;
  name: string;
  englishName: string;
  swiftCode: string;
  bin: string; // For VietQR
}

export default {
  VATRate,
  TaxDeclarationType,
  EInvoiceProvider,
  InsuranceType,
  BankCode,
  VATExemptCategory,
  CompanySize,
  PrefTaxZone,
  EInvoiceStatus,
  PaymentMethod,
  CURRENCY_CODE,
  MINIMUM_WAGE_2024,
};
