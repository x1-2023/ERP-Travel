// src/lib/banking/adapters/vcb.ts
// Vietcombank (VCB) Bank Adapter
// Note: This is a simulation. Production implementation requires VCB API credentials.

import { BaseBankAdapter } from './base'
import type {
  BankCode,
  BankApiConfig,
  PaymentRequest,
  PaymentResponse,
  BatchPaymentRequest,
  BatchPaymentResponse,
  PaymentTransactionStatus,
  AccountValidation,
} from '../types'

// ═══════════════════════════════════════════════════════════════
// VCB ADAPTER
// ═══════════════════════════════════════════════════════════════

export class VCBAdapter extends BaseBankAdapter {
  readonly bankCode: BankCode = 'VCB'
  readonly bankName = 'Vietcombank'

  configure(config: BankApiConfig): void {
    this.config = config
  }

  // ─────────────────────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────────────────────

  async authenticate(): Promise<boolean> {
    this.ensureConfigured()

    try {
      // In production, call VCB OAuth endpoint
      // Simulate successful auth
      this.accessToken = 'simulated-vcb-token-' + Date.now()
      this.tokenExpiry = new Date(Date.now() + 3600000) // 1 hour

      return true
    } catch (error) {
      console.error('VCB authentication failed:', error)
      return false
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Account Operations
  // ─────────────────────────────────────────────────────────────

  async validateAccount(accountNumber: string, bankCode: BankCode): Promise<AccountValidation> {
    this.ensureConfigured()

    // Basic validation
    if (!/^\d{10,20}$/.test(accountNumber)) {
      return {
        valid: false,
        accountNumber,
        bankCode,
        errorMessage: 'Số tài khoản không hợp lệ',
      }
    }

    // Simulated response
    return {
      valid: true,
      accountNumber,
      bankCode,
      accountName: 'NGUYEN VAN A',
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Payment Operations
  // ─────────────────────────────────────────────────────────────

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    this.ensureConfigured()

    // Simulated response
    return {
      success: true,
      transactionId: request.transactionId,
      bankTransactionId: `VCB${Date.now()}`,
      responseCode: '00',
      responseMessage: 'Thành công',
      processedAt: new Date(),
      status: 'SUCCESS',
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Batch Operations
  // ─────────────────────────────────────────────────────────────

  async createBatchPayment(request: BatchPaymentRequest): Promise<BatchPaymentResponse> {
    this.ensureConfigured()

    const transactions: BatchPaymentResponse['transactions'] = request.payments.map((p) => ({
      transactionId: p.transactionId,
      status: 'SUCCESS' as PaymentTransactionStatus,
      bankTransactionId: `VCB${Date.now()}${Math.random().toString(36).substring(2, 6)}`,
      responseCode: '00',
      responseMessage: 'Thành công',
    }))

    return {
      success: true,
      batchId: request.batchId,
      bankBatchId: `VCBBATCH${Date.now()}`,
      successCount: request.payments.length,
      failedCount: 0,
      responseCode: '00',
      responseMessage: 'Batch thực hiện thành công',
      transactions,
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createVCBAdapter(): VCBAdapter {
  return new VCBAdapter()
}
