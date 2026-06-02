// src/lib/banking/index.ts
// Banking Integration Module - Main export

// Types
export * from './types'

// Config (exclude BankCode to avoid duplicate export from types)
export {
  BANK_CODES,
  loadBankConfig,
  getBankByNapasCode,
  detectBankCode,
  VCB_ERROR_CODES,
  TCB_ERROR_CODES,
  MB_ERROR_CODES,
} from './config'
export type { BankAPIConfig } from './config'

// Adapters
export { BaseBankAdapter } from './adapters/base'
export { VCBAdapter, createVCBAdapter } from './adapters/vcb'
export { VietcombankProductionAdapter, createVCBProductionAdapter } from './adapters/vietcombank-production'

// Payment Services
export { PaymentService, createPaymentService } from './payment-service'
export { MultiBankPaymentService, multiBankPaymentService, createMultiBankPaymentService } from './multi-bank-service'
