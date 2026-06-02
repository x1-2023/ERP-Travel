// src/lib/banking/types.ts
// Banking Integration Types

// ═══════════════════════════════════════════════════════════════
// BANK CODES
// ═══════════════════════════════════════════════════════════════

export type BankCode = 'VCB' | 'TCB' | 'MB' | 'BIDV' | 'VTB' | 'ACB' | 'TPB' | 'VIB' | 'OTHER'

export const BANK_INFO: Record<BankCode, { name: string; fullName: string; swiftCode: string }> = {
  VCB: { name: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam', swiftCode: 'BFTVVNVX' },
  TCB: { name: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam', swiftCode: 'VTCBVNVX' },
  MB: { name: 'MB Bank', fullName: 'Ngân hàng TMCP Quân đội', swiftCode: 'MSCBVNVX' },
  BIDV: { name: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', swiftCode: 'BIDVVNVX' },
  VTB: { name: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương Việt Nam', swiftCode: 'ICBVVNVX' },
  ACB: { name: 'ACB', fullName: 'Ngân hàng TMCP Á Châu', swiftCode: 'ASCBVNVX' },
  TPB: { name: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong', swiftCode: 'TPBVVNVX' },
  VIB: { name: 'VIB', fullName: 'Ngân hàng TMCP Quốc tế Việt Nam', swiftCode: 'VNIBVNVX' },
  OTHER: { name: 'Khác', fullName: 'Ngân hàng khác', swiftCode: '' },
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT STATUS
// ═══════════════════════════════════════════════════════════════

export type PaymentBatchStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

export type PaymentTransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'

export const PAYMENT_STATUS_LABELS = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'yellow' },
  APPROVED: { label: 'Đã duyệt', color: 'blue' },
  PROCESSING: { label: 'Đang xử lý', color: 'blue' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  FAILED: { label: 'Thất bại', color: 'red' },
  CANCELLED: { label: 'Đã hủy', color: 'gray' },
  SUCCESS: { label: 'Thành công', color: 'green' },
  PENDING: { label: 'Đang chờ', color: 'yellow' },
} as const

// ═══════════════════════════════════════════════════════════════
// BANK CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface BankApiConfig {
  apiEndpoint: string
  apiVersion?: string
  clientId: string
  clientSecret: string
  certificatePath?: string
  privateKeyPath?: string
  timeout?: number
}

export interface BankAccountInfo {
  accountNumber: string
  accountName: string
  bankCode: BankCode
  branchCode?: string
  branchName?: string
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT REQUEST/RESPONSE
// ═══════════════════════════════════════════════════════════════

export interface PaymentRequest {
  transactionId: string
  amount: number
  currency: string
  description: string
  sourceAccount: BankAccountInfo
  destinationAccount: {
    accountNumber: string
    accountName: string
    bankCode: BankCode
    branchCode?: string
  }
  metadata?: Record<string, unknown>
}

export interface PaymentResponse {
  success: boolean
  transactionId: string
  bankTransactionId?: string
  responseCode: string
  responseMessage?: string
  processedAt?: Date
  fee?: number
  status: PaymentTransactionStatus
}

export interface AccountValidation {
  valid: boolean
  accountNumber: string
  accountName?: string
  bankCode: BankCode
  bankName?: string
  errorMessage?: string
}

export interface BatchPaymentRequest {
  batchId: string
  batchName: string
  sourceAccount: BankAccountInfo
  payments: PaymentRequest[]
  metadata?: Record<string, unknown>
}

export interface BatchPaymentResponse {
  success: boolean
  batchId: string
  bankBatchId?: string
  successCount: number
  failedCount: number
  responseCode?: string
  responseMessage?: string
  transactions: Array<{
    transactionId: string
    status: PaymentTransactionStatus | 'PENDING'
    bankTransactionId?: string
    responseCode?: string
    responseMessage?: string
  }>
}

export interface BatchPaymentStatus {
  batchId: string
  bankBatchId?: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'CANCELLED'
  totalCount: number
  successCount: number
  failedCount: number
  pendingCount?: number
  totalAmount: number
  processedAmount?: number
  transactions: Array<{
    transactionId: string
    status: 'SUCCESS' | 'FAILED' | 'PENDING'
    bankTransactionId?: string
    processedAt?: Date
    responseCode?: string
    responseMessage?: string
  }>
  lastUpdated: Date
}

// ═══════════════════════════════════════════════════════════════
// BANK ADAPTER INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface IBankAdapter {
  // Bank info
  readonly bankCode: BankCode
  readonly bankName: string

  // Configuration
  configure(config: BankApiConfig): void

  // Authentication
  authenticate(): Promise<boolean>

  // Account operations
  getBalance?(): Promise<{
    available: number
    current: number
    currency: string
  }>

  validateAccount(
    accountNumber: string,
    bankCode: BankCode
  ): Promise<AccountValidation>

  // Payment operations
  makePayment?(request: PaymentRequest): Promise<PaymentResponse>

  // Batch operations
  createBatchPayment(request: BatchPaymentRequest): Promise<BatchPaymentResponse>
  getBatchStatus?(batchId: string, bankBatchId: string): Promise<BatchPaymentStatus>

  // Statement
  getStatement?(
    fromDate: Date,
    toDate: Date
  ): Promise<{
    transactions: Array<{
      date: Date
      description: string
      amount: number
      type: 'CREDIT' | 'DEBIT'
      balance: number
      referenceNo: string
    }>
  }>
}

// ═══════════════════════════════════════════════════════════════
// NAPAS/CITAD CODES
// ═══════════════════════════════════════════════════════════════

export const NAPAS_RESPONSE_CODES: Record<string, { message: string; retry: boolean }> = {
  '00': { message: 'Thành công', retry: false },
  '01': { message: 'Số tài khoản không tồn tại', retry: false },
  '02': { message: 'Số dư không đủ', retry: false },
  '03': { message: 'Tài khoản bị khóa', retry: false },
  '04': { message: 'Sai định dạng', retry: false },
  '05': { message: 'Timeout', retry: true },
  '06': { message: 'Hệ thống bảo trì', retry: true },
  '07': { message: 'Giao dịch trùng lặp', retry: false },
  '99': { message: 'Lỗi hệ thống', retry: true },
}
