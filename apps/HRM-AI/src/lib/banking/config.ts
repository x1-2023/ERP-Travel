// src/lib/banking/config.ts
// Bank API Configuration

export interface BankAPIConfig {
  bankCode: string
  bankName: string
  environment: 'sandbox' | 'production'

  // API Endpoints
  baseUrl: string
  tokenUrl: string

  // Credentials
  clientId: string
  clientSecret: string

  // Company Account
  accountNumber: string
  accountName: string
  branchCode: string

  // Security
  privateKey?: string // For signing requests
  publicKey?: string // Bank's public key for verification
  encryptionKey?: string // For encrypting sensitive data

  // Limits
  maxBatchSize: number
  maxDailyAmount: number
  cutoffTime: string // "15:30" - after this, next business day
}

// Vietnamese bank codes
export const BANK_CODES = {
  VCB: { code: 'VCB', name: 'Vietcombank', napasCode: '970436' },
  TCB: { code: 'TCB', name: 'Techcombank', napasCode: '970407' },
  MB: { code: 'MB', name: 'MB Bank', napasCode: '970422' },
  ACB: { code: 'ACB', name: 'ACB', napasCode: '970416' },
  VPB: { code: 'VPB', name: 'VPBank', napasCode: '970432' },
  TPB: { code: 'TPB', name: 'TPBank', napasCode: '970423' },
  BIDV: { code: 'BIDV', name: 'BIDV', napasCode: '970418' },
  VTB: { code: 'VTB', name: 'VietinBank', napasCode: '970415' },
  SCB: { code: 'SCB', name: 'Sacombank', napasCode: '970403' },
  SHB: { code: 'SHB', name: 'SHB', napasCode: '970443' },
  MSB: { code: 'MSB', name: 'MSB', napasCode: '970426' },
  HDBank: { code: 'HDB', name: 'HDBank', napasCode: '970437' },
  OCB: { code: 'OCB', name: 'OCB', napasCode: '970448' },
  VIB: { code: 'VIB', name: 'VIB', napasCode: '970441' },
  SeABank: { code: 'SEAB', name: 'SeABank', napasCode: '970440' },
} as const

export type BankCode = keyof typeof BANK_CODES | 'OTHER'

// Load bank configuration from environment
export function loadBankConfig(bankCode: string): BankAPIConfig {
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'

  const configs: Record<string, Partial<BankAPIConfig>> = {
    VCB: {
      bankCode: 'VCB',
      bankName: 'Vietcombank',
      environment: env,
      baseUrl:
        env === 'production'
          ? 'https://api.vietcombank.com.vn/v1'
          : 'https://sandbox.vietcombank.com.vn/v1',
      tokenUrl:
        env === 'production'
          ? 'https://api.vietcombank.com.vn/oauth/token'
          : 'https://sandbox.vietcombank.com.vn/oauth/token',
      clientId: process.env.VCB_CLIENT_ID || '',
      clientSecret: process.env.VCB_CLIENT_SECRET || '',
      accountNumber: process.env.VCB_ACCOUNT_NUMBER || '',
      accountName: process.env.VCB_ACCOUNT_NAME || '',
      branchCode: process.env.VCB_BRANCH_CODE || '',
      privateKey: process.env.VCB_PRIVATE_KEY,
      publicKey: process.env.VCB_PUBLIC_KEY,
      maxBatchSize: 500,
      maxDailyAmount: 50_000_000_000, // 50 billion VND
      cutoffTime: '15:30',
    },
    TCB: {
      bankCode: 'TCB',
      bankName: 'Techcombank',
      environment: env,
      baseUrl:
        env === 'production'
          ? 'https://api.techcombank.com.vn/v2'
          : 'https://sandbox.techcombank.com.vn/v2',
      tokenUrl:
        env === 'production'
          ? 'https://api.techcombank.com.vn/oauth2/token'
          : 'https://sandbox.techcombank.com.vn/oauth2/token',
      clientId: process.env.TCB_CLIENT_ID || '',
      clientSecret: process.env.TCB_CLIENT_SECRET || '',
      accountNumber: process.env.TCB_ACCOUNT_NUMBER || '',
      accountName: process.env.TCB_ACCOUNT_NAME || '',
      branchCode: process.env.TCB_BRANCH_CODE || '',
      privateKey: process.env.TCB_PRIVATE_KEY,
      maxBatchSize: 1000,
      maxDailyAmount: 100_000_000_000,
      cutoffTime: '16:00',
    },
    MB: {
      bankCode: 'MB',
      bankName: 'MB Bank',
      environment: env,
      baseUrl:
        env === 'production'
          ? 'https://api.mbbank.com.vn/ms/openapi'
          : 'https://sandbox.mbbank.com.vn/ms/openapi',
      tokenUrl:
        env === 'production'
          ? 'https://api.mbbank.com.vn/ms/oauth/token'
          : 'https://sandbox.mbbank.com.vn/ms/oauth/token',
      clientId: process.env.MB_CLIENT_ID || '',
      clientSecret: process.env.MB_CLIENT_SECRET || '',
      accountNumber: process.env.MB_ACCOUNT_NUMBER || '',
      accountName: process.env.MB_ACCOUNT_NAME || '',
      branchCode: process.env.MB_BRANCH_CODE || '',
      privateKey: process.env.MB_PRIVATE_KEY,
      maxBatchSize: 500,
      maxDailyAmount: 50_000_000_000,
      cutoffTime: '15:00',
    },
    ACB: {
      bankCode: 'ACB',
      bankName: 'ACB',
      environment: env,
      baseUrl:
        env === 'production'
          ? 'https://api.acb.com.vn/v1'
          : 'https://sandbox.acb.com.vn/v1',
      tokenUrl:
        env === 'production'
          ? 'https://api.acb.com.vn/oauth/token'
          : 'https://sandbox.acb.com.vn/oauth/token',
      clientId: process.env.ACB_CLIENT_ID || '',
      clientSecret: process.env.ACB_CLIENT_SECRET || '',
      accountNumber: process.env.ACB_ACCOUNT_NUMBER || '',
      accountName: process.env.ACB_ACCOUNT_NAME || '',
      branchCode: process.env.ACB_BRANCH_CODE || '',
      maxBatchSize: 500,
      maxDailyAmount: 50_000_000_000,
      cutoffTime: '15:30',
    },
  }

  const config = configs[bankCode]
  if (!config) {
    throw new Error(`Unknown bank code: ${bankCode}`)
  }

  return config as BankAPIConfig
}

// Get bank info by NAPAS code
export function getBankByNapasCode(napasCode: string): (typeof BANK_CODES)[keyof typeof BANK_CODES] | null {
  for (const bank of Object.values(BANK_CODES)) {
    if (bank.napasCode === napasCode) {
      return bank
    }
  }
  return null
}

// Detect bank code from bank name
export function detectBankCode(bankName: string): BankCode {
  const normalizedName = bankName.toUpperCase()

  const bankPatterns: Record<string, string[]> = {
    VCB: ['VIETCOMBANK', 'VCB', 'NGOẠI THƯƠNG', 'NGOAI THUONG'],
    TCB: ['TECHCOMBANK', 'TCB', 'KỸ THƯƠNG', 'KY THUONG'],
    MB: ['MBBANK', 'MB BANK', 'QUÂN ĐỘI', 'QUAN DOI', 'MILITARY'],
    ACB: ['ACB', 'Á CHÂU', 'A CHAU', 'ASIA COMMERCIAL'],
    VPB: ['VPBANK', 'VPB', 'VIỆT NAM THỊNH VƯỢNG', 'VIET NAM THINH VUONG'],
    TPB: ['TPBANK', 'TPB', 'TIÊN PHONG', 'TIEN PHONG'],
    BIDV: ['BIDV', 'ĐẦU TƯ VÀ PHÁT TRIỂN', 'DAU TU VA PHAT TRIEN'],
    VTB: ['VIETINBANK', 'VTB', 'CTG', 'CÔNG THƯƠNG', 'CONG THUONG'],
    SCB: ['SACOMBANK', 'SCB', 'SÀI GÒN THƯƠNG TÍN', 'SAI GON THUONG TIN'],
    SHB: ['SHB', 'SÀI GÒN HÀ NỘI', 'SAI GON HA NOI'],
    MSB: ['MSB', 'MARITIME', 'HÀNG HẢI', 'HANG HAI'],
    HDB: ['HDBANK', 'HDB', 'PHÁT TRIỂN TP HCM', 'PHAT TRIEN TP HCM'],
    OCB: ['OCB', 'PHƯƠNG ĐÔNG', 'PHUONG DONG', 'ORIENT'],
    VIB: ['VIB', 'QUỐC TẾ', 'QUOC TE', 'INTERNATIONAL'],
    SEAB: ['SEABANK', 'ĐÔNG NAM Á', 'DONG NAM A', 'SOUTHEAST'],
  }

  for (const [code, patterns] of Object.entries(bankPatterns)) {
    if (patterns.some((p) => normalizedName.includes(p))) {
      return code as BankCode
    }
  }

  return 'OTHER'
}

// Error code mappings
export const VCB_ERROR_CODES: Record<string, string> = {
  E001: 'Số dư không đủ',
  E002: 'Tài khoản không hợp lệ',
  E003: 'Vượt quá hạn mức giao dịch',
  E004: 'Tài khoản bị khóa',
  E005: 'Giao dịch trùng lặp',
  E006: 'Thời gian giao dịch không hợp lệ',
  E007: 'Tên người nhận không khớp',
  E008: 'Ngân hàng thụ hưởng không hỗ trợ',
  E009: 'Lỗi xác thực',
  E010: 'Phiên giao dịch hết hạn',
  E999: 'Lỗi hệ thống ngân hàng',
}

export const TCB_ERROR_CODES: Record<string, string> = {
  '00': 'Thành công',
  '01': 'Tài khoản không tồn tại',
  '02': 'Số dư không đủ',
  '03': 'Tài khoản bị khóa',
  '04': 'Vượt hạn mức',
  '99': 'Lỗi hệ thống',
}

export const MB_ERROR_CODES: Record<string, string> = {
  '000': 'Thành công',
  '001': 'Tài khoản không hợp lệ',
  '002': 'Số dư không đủ',
  '003': 'Tài khoản bị đóng băng',
  '999': 'Lỗi không xác định',
}
