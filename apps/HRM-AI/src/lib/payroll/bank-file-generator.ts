// src/lib/payroll/bank-file-generator.ts
// Bank Payment File Generator
// Supports VCB, TCB, BIDV, and Generic CSV formats

import { format } from 'date-fns'
import { BANK_CODE_LABELS } from './constants'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface PaymentRecord {
  /** Số thứ tự */
  seq: number
  /** Mã nhân viên */
  employeeCode: string
  /** Tên nhân viên */
  employeeName: string
  /** Số tài khoản */
  bankAccount: string
  /** Tên ngân hàng */
  bankName: string
  /** Mã ngân hàng (SWIFT/BIN) */
  bankCode: string
  /** Chi nhánh */
  bankBranch?: string
  /** Số tiền */
  amount: number
  /** Nội dung chuyển khoản */
  description: string
  /** Số CMND/CCCD (optional) */
  idNumber?: string
}

export interface BankFileOptions {
  /** Mã đợt thanh toán */
  batchNumber: string
  /** Ngày thanh toán */
  paymentDate: Date
  /** Kỳ lương (tháng/năm) */
  periodMonth: number
  periodYear: number
  /** Thông tin công ty */
  companyName: string
  companyAccount: string
  companyBankCode: string
}

export interface GeneratedFile {
  fileName: string
  content: string
  format: string
  encoding: 'utf-8' | 'utf-16le'
  totalRecords: number
  totalAmount: number
}

// ═══════════════════════════════════════════════════════════════
// Bank File Generators
// ═══════════════════════════════════════════════════════════════

/**
 * Generate Vietcombank (VCB) payment file
 * Format: CSV with specific columns
 */
export function generateVCBFile(
  records: PaymentRecord[],
  options: BankFileOptions
): GeneratedFile {
  const { batchNumber, paymentDate, periodMonth, periodYear, companyName, companyAccount } = options

  // VCB format header
  const headers = [
    'STT',
    'Số tài khoản',
    'Tên người thụ hưởng',
    'Mã ngân hàng',
    'Số tiền',
    'Nội dung',
  ]

  const lines: string[] = []

  // Add metadata as comment
  lines.push(`# Đợt thanh toán: ${batchNumber}`)
  lines.push(`# Ngày: ${format(paymentDate, 'dd/MM/yyyy')}`)
  lines.push(`# Kỳ lương: ${periodMonth}/${periodYear}`)
  lines.push(`# Công ty: ${companyName}`)
  lines.push(`# Tài khoản nguồn: ${companyAccount}`)
  lines.push('')

  // Add header
  lines.push(headers.join(','))

  // Add records
  let totalAmount = 0
  for (const record of records) {
    const row = [
      record.seq.toString(),
      `"${record.bankAccount}"`,
      `"${removeVietnameseAccents(record.employeeName)}"`,
      record.bankCode,
      record.amount.toString(),
      `"${removeVietnameseAccents(record.description)}"`,
    ]
    lines.push(row.join(','))
    totalAmount += record.amount
  }

  // Add footer
  lines.push('')
  lines.push(`# Tổng số bản ghi: ${records.length}`)
  lines.push(`# Tổng số tiền: ${totalAmount.toLocaleString('vi-VN')} VND`)

  const fileName = `VCB_${batchNumber}_${format(paymentDate, 'yyyyMMdd')}.csv`

  return {
    fileName,
    content: lines.join('\n'),
    format: 'VCB_CSV',
    encoding: 'utf-8',
    totalRecords: records.length,
    totalAmount,
  }
}

/**
 * Generate Techcombank (TCB) payment file
 * Format: TXT with fixed-width columns
 */
export function generateTCBFile(
  records: PaymentRecord[],
  options: BankFileOptions
): GeneratedFile {
  const { batchNumber, paymentDate, companyName, companyAccount } = options

  const lines: string[] = []

  // TCB Header line (H record)
  const headerLine = [
    'H', // Record type
    padRight(batchNumber, 20),
    format(paymentDate, 'ddMMyyyy'),
    padRight(companyAccount, 20),
    padRight(companyName.substring(0, 50), 50),
    padLeft(records.length.toString(), 6, '0'),
    padLeft(records.reduce((sum, r) => sum + r.amount, 0).toString(), 18, '0'),
  ].join('|')
  lines.push(headerLine)

  // TCB Detail lines (D records)
  let totalAmount = 0
  for (const record of records) {
    const detailLine = [
      'D', // Record type
      padLeft(record.seq.toString(), 6, '0'),
      padRight(record.bankAccount, 20),
      padRight(removeVietnameseAccents(record.employeeName).substring(0, 50), 50),
      padRight(record.bankCode, 10),
      padLeft(record.amount.toString(), 18, '0'),
      padRight(removeVietnameseAccents(record.description).substring(0, 100), 100),
    ].join('|')
    lines.push(detailLine)
    totalAmount += record.amount
  }

  // TCB Footer line (T record)
  const footerLine = [
    'T', // Record type
    padLeft(records.length.toString(), 6, '0'),
    padLeft(totalAmount.toString(), 18, '0'),
  ].join('|')
  lines.push(footerLine)

  const fileName = `TCB_${batchNumber}_${format(paymentDate, 'yyyyMMdd')}.txt`

  return {
    fileName,
    content: lines.join('\r\n'),
    format: 'TCB_TXT',
    encoding: 'utf-8',
    totalRecords: records.length,
    totalAmount,
  }
}

/**
 * Generate BIDV payment file
 * Format: Excel-compatible CSV
 */
export function generateBIDVFile(
  records: PaymentRecord[],
  options: BankFileOptions
): GeneratedFile {
  const { batchNumber, paymentDate } = options

  const headers = [
    'STT',
    'Số tài khoản người nhận',
    'Tên người nhận',
    'CMND/CCCD',
    'Ngân hàng nhận',
    'Mã ngân hàng',
    'Số tiền',
    'Nội dung chuyển tiền',
  ]

  const lines: string[] = []

  // Add BOM for Excel UTF-8
  lines.push('\uFEFF' + headers.join(','))

  let totalAmount = 0
  for (const record of records) {
    const row = [
      record.seq.toString(),
      `"${record.bankAccount}"`,
      `"${record.employeeName}"`,
      `"${record.idNumber || ''}"`,
      `"${record.bankName}"`,
      record.bankCode,
      record.amount.toString(),
      `"${record.description}"`,
    ]
    lines.push(row.join(','))
    totalAmount += record.amount
  }

  const fileName = `BIDV_${batchNumber}_${format(paymentDate, 'yyyyMMdd')}.csv`

  return {
    fileName,
    content: lines.join('\n'),
    format: 'BIDV_CSV',
    encoding: 'utf-8',
    totalRecords: records.length,
    totalAmount,
  }
}

/**
 * Generate Generic CSV payment file
 * Universal format for any bank
 */
export function generateGenericFile(
  records: PaymentRecord[],
  options: BankFileOptions
): GeneratedFile {
  const { batchNumber, paymentDate, periodMonth, periodYear } = options

  const headers = [
    'STT',
    'Mã NV',
    'Họ tên',
    'Số tài khoản',
    'Ngân hàng',
    'Mã NH',
    'Chi nhánh',
    'Số tiền',
    'Nội dung',
    'Kỳ lương',
  ]

  const lines: string[] = []

  // Add BOM for Excel UTF-8
  lines.push('\uFEFF' + headers.join(','))

  let totalAmount = 0
  for (const record of records) {
    const row = [
      record.seq.toString(),
      `"${record.employeeCode}"`,
      `"${record.employeeName}"`,
      `"${record.bankAccount}"`,
      `"${record.bankName}"`,
      record.bankCode,
      `"${record.bankBranch || ''}"`,
      record.amount.toString(),
      `"${record.description}"`,
      `"${periodMonth}/${periodYear}"`,
    ]
    lines.push(row.join(','))
    totalAmount += record.amount
  }

  // Add summary row
  lines.push('')
  lines.push(`"","","TỔNG CỘNG","","","","",${totalAmount},"","",`)

  const fileName = `SALARY_${batchNumber}_${format(paymentDate, 'yyyyMMdd')}.csv`

  return {
    fileName,
    content: lines.join('\n'),
    format: 'GENERIC_CSV',
    encoding: 'utf-8',
    totalRecords: records.length,
    totalAmount,
  }
}

// ═══════════════════════════════════════════════════════════════
// Main Generator
// ═══════════════════════════════════════════════════════════════

export type BankFileFormat = 'VCB' | 'TCB' | 'BIDV' | 'GENERIC'

/**
 * Generate bank payment file based on bank code
 */
export function generateBankFile(
  bankCode: BankFileFormat,
  records: PaymentRecord[],
  options: BankFileOptions
): GeneratedFile {
  switch (bankCode) {
    case 'VCB':
      return generateVCBFile(records, options)
    case 'TCB':
      return generateTCBFile(records, options)
    case 'BIDV':
      return generateBIDVFile(records, options)
    case 'GENERIC':
    default:
      return generateGenericFile(records, options)
  }
}

/**
 * Create payment records from payroll data
 */
export function createPaymentRecords(
  payrolls: Array<{
    employeeCode: string
    employeeName: string
    bankAccount?: string | null
    bankName?: string | null
    bankCode?: string | null
    netSalary: number
  }>,
  periodMonth: number,
  periodYear: number,
  companyName: string
): PaymentRecord[] {
  return payrolls
    .filter(p => p.bankAccount) // Only include those with bank accounts
    .map((p, index) => ({
      seq: index + 1,
      employeeCode: p.employeeCode,
      employeeName: p.employeeName,
      bankAccount: p.bankAccount!,
      bankName: p.bankName || 'Unknown',
      bankCode: p.bankCode || 'OTHER',
      amount: typeof p.netSalary === 'number' ? p.netSalary : Number(p.netSalary),
      description: `Luong T${periodMonth}/${periodYear} - ${companyName}`,
    }))
}

/**
 * Group records by bank for batch processing
 */
export function groupRecordsByBank(
  records: PaymentRecord[]
): Map<string, PaymentRecord[]> {
  const grouped = new Map<string, PaymentRecord[]>()

  for (const record of records) {
    const bankCode = record.bankCode || 'OTHER'
    if (!grouped.has(bankCode)) {
      grouped.set(bankCode, [])
    }
    grouped.get(bankCode)!.push(record)
  }

  return grouped
}

/**
 * Generate batch number
 */
export function generateBatchNumber(
  periodYear: number,
  periodMonth: number,
  sequence: number = 1
): string {
  const monthStr = periodMonth.toString().padStart(2, '0')
  const seqStr = sequence.toString().padStart(3, '0')
  return `PAY-${periodYear}-${monthStr}-${seqStr}`
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Remove Vietnamese accents for bank file compatibility
 */
function removeVietnameseAccents(str: string): string {
  const accentsMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D',
  }

  return str
    .split('')
    .map(char => accentsMap[char] || char)
    .join('')
}

/**
 * Pad string to right
 */
function padRight(str: string, length: number, char: string = ' '): string {
  return str.padEnd(length, char).substring(0, length)
}

/**
 * Pad string to left
 */
function padLeft(str: string, length: number, char: string = ' '): string {
  return str.padStart(length, char).substring(0, length)
}

/**
 * Get bank name from code
 */
export function getBankName(code: string): string {
  return BANK_CODE_LABELS[code] || code
}

/**
 * Validate bank account number
 */
export function validateBankAccount(account: string): boolean {
  // Basic validation: 8-20 digits
  return /^\d{8,20}$/.test(account.replace(/\s/g, ''))
}
