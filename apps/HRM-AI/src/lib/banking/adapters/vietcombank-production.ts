// src/lib/banking/adapters/vietcombank-production.ts
// Vietcombank Production Adapter with OAuth2 & Request Signing

import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import type {
  IBankAdapter,
  BankApiConfig,
  PaymentRequest,
  PaymentResponse,
  BatchPaymentRequest,
  BatchPaymentResponse,
  BatchPaymentStatus,
  AccountValidation,
  BankCode,
} from '../types'
import { loadBankConfig, VCB_ERROR_CODES } from '../config'

// ═══════════════════════════════════════════════════════════════
// VIETCOMBANK PRODUCTION ADAPTER
// ═══════════════════════════════════════════════════════════════

export class VietcombankProductionAdapter implements IBankAdapter {
  readonly bankCode: BankCode = 'VCB'
  readonly bankName = 'Vietcombank'

  private config: ReturnType<typeof loadBankConfig> | null = null
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    try {
      this.config = loadBankConfig('VCB')
    } catch {
      // Config will be set via configure()
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Configuration
  // ─────────────────────────────────────────────────────────────

  configure(config: BankApiConfig & { accountNumber?: string; accountName?: string; branchCode?: string }): void {
    this.config = {
      ...this.config!,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      accountNumber: config.accountNumber ?? this.config?.accountNumber ?? '',
      accountName: config.accountName ?? this.config?.accountName ?? '',
      branchCode: config.branchCode ?? this.config?.branchCode ?? '',
    } as ReturnType<typeof loadBankConfig>
  }

  private ensureConfigured(): void {
    if (!this.config?.clientId) {
      throw new Error('VCB adapter not configured. Call configure() first.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // OAuth2 Authentication
  // ─────────────────────────────────────────────────────────────

  async authenticate(): Promise<boolean> {
    this.ensureConfigured()

    try {
      // Check if token is still valid
      if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return true
      }

      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config!.clientId,
        client_secret: this.config!.clientSecret,
        scope: 'payment transfer inquiry',
      })

      const response = await fetch(this.config!.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      if (!response.ok) {
        console.error('VCB: OAuth failed', await response.text())
        return false
      }

      const data = await response.json()
      this.accessToken = data.access_token
      // Set expiry 5 minutes before actual expiry
      const expiresIn = (data.expires_in - 300) * 1000
      this.tokenExpiry = new Date(Date.now() + expiresIn)

      return true
    } catch (error) {
      console.error('VCB: Failed to authenticate', error)
      return false
    }
  }

  private async getAccessToken(): Promise<string> {
    const authenticated = await this.authenticate()
    if (!authenticated || !this.accessToken) {
      throw new Error('Failed to authenticate with Vietcombank')
    }
    return this.accessToken
  }

  // ─────────────────────────────────────────────────────────────
  // Request Signing
  // ─────────────────────────────────────────────────────────────

  private signPayload(payload: string, timestamp: string): string {
    if (!this.config?.privateKey) {
      // Use HMAC if no private key
      return crypto
        .createHmac('sha256', this.config!.clientSecret)
        .update(payload + timestamp)
        .digest('base64')
    }

    const sign = crypto.createSign('RSA-SHA256')
    sign.update(payload + timestamp)
    return sign.sign(this.config.privateKey, 'base64')
  }

  private verifySignature(payload: string, signature: string): boolean {
    if (!this.config?.publicKey) {
      console.warn('VCB: Public key not configured, skipping signature verification')
      return true
    }

    try {
      const verify = crypto.createVerify('RSA-SHA256')
      verify.update(payload)
      return verify.verify(this.config.publicKey, signature, 'base64')
    } catch {
      return false
    }
  }

  // ─────────────────────────────────────────────────────────────
  // API Request Helper
  // ─────────────────────────────────────────────────────────────

  private async apiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    const token = await this.getAccessToken()
    const requestId = uuidv4()
    const timestamp = new Date().toISOString()

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Request-ID': requestId,
      'X-Timestamp': timestamp,
      'X-Client-ID': this.config!.clientId,
    }

    // Sign request body if present
    if (data) {
      const payload = JSON.stringify(data)
      const signature = this.signPayload(payload, timestamp)
      headers['X-Signature'] = signature
    }

    const url = `${this.config!.baseUrl}${endpoint}`

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    const responseData = await response.json()

    // Verify response signature
    const responseSignature = response.headers.get('x-signature')
    if (responseSignature) {
      const isValid = this.verifySignature(JSON.stringify(responseData), responseSignature)
      if (!isValid) {
        throw new Error('Invalid response signature from bank')
      }
    }

    if (!response.ok) {
      const errorCode = responseData?.responseCode || 'E999'
      const errorMessage = VCB_ERROR_CODES[errorCode] || responseData?.message || 'Lỗi kết nối ngân hàng'
      const error = new Error(errorMessage) as Error & { code: string; friendlyMessage: string }
      error.code = errorCode
      error.friendlyMessage = errorMessage
      throw error
    }

    return responseData as T
  }

  // ─────────────────────────────────────────────────────────────
  // Account Operations
  // ─────────────────────────────────────────────────────────────

  async validateAccount(accountNumber: string, bankCode: BankCode): Promise<AccountValidation> {
    this.ensureConfigured()

    try {
      interface InquiryResponse {
        responseCode: string
        accountName?: string
        bankName?: string
        message?: string
      }

      const response = await this.apiRequest<InquiryResponse>('POST', '/account/inquiry', {
        accountNumber,
        bankCode,
        inquiryType: 'NAME',
      })

      return {
        valid: response.responseCode === '00',
        accountNumber,
        accountName: response.accountName,
        bankCode,
        bankName: response.bankName,
        errorMessage: response.responseCode !== '00' ? response.message : undefined,
      }
    } catch (error) {
      const err = error as Error & { friendlyMessage?: string }
      return {
        valid: false,
        accountNumber,
        bankCode,
        errorMessage: err.friendlyMessage || err.message,
      }
    }
  }

  async getBalance(): Promise<{
    available: number
    current: number
    currency: string
  }> {
    this.ensureConfigured()

    interface BalanceResponse {
      availableBalance: number
      currentBalance: number
      currency?: string
    }

    const response = await this.apiRequest<BalanceResponse>('GET', '/account/balance')

    return {
      available: response.availableBalance,
      current: response.currentBalance,
      currency: response.currency || 'VND',
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Single Payment
  // ─────────────────────────────────────────────────────────────

  async makePayment(request: PaymentRequest): Promise<PaymentResponse> {
    this.ensureConfigured()

    try {
      // Check cutoff time
      const now = new Date()
      const [cutoffHour, cutoffMin] = this.config!.cutoffTime.split(':').map(Number)
      const cutoff = new Date()
      cutoff.setHours(cutoffHour, cutoffMin, 0, 0)

      if (now > cutoff) {
        console.warn('VCB: After cutoff time, payment will be processed next business day')
      }

      const transferType =
        request.destinationAccount.bankCode === 'VCB' ? 'INTERNAL' : 'NAPAS'

      interface TransferResponse {
        responseCode: string
        bankReferenceNo?: string
        responseMessage?: string
        fee?: number
      }

      const response = await this.apiRequest<TransferResponse>('POST', '/transfer/internal', {
        requestId: request.transactionId,
        transactionDate: new Date().toISOString().split('T')[0],

        // Source account
        sourceAccount: request.sourceAccount.accountNumber,
        sourceAccountName: request.sourceAccount.accountName,
        sourceBranchCode: request.sourceAccount.branchCode,

        // Destination account
        destinationAccount: request.destinationAccount.accountNumber,
        destinationAccountName: request.destinationAccount.accountName,
        destinationBankCode: request.destinationAccount.bankCode,

        // Amount
        amount: request.amount,
        currency: request.currency || 'VND',

        // Description (VCB limit 140 chars)
        description: request.description?.substring(0, 140),
        referenceNumber: request.transactionId,

        // Transfer type
        transferType,
      })

      return {
        success: response.responseCode === '00',
        transactionId: request.transactionId,
        bankTransactionId: response.bankReferenceNo,
        responseCode: response.responseCode,
        responseMessage: response.responseMessage,
        processedAt: new Date(),
        fee: response.fee || 0,
        status: response.responseCode === '00' ? 'SUCCESS' : 'FAILED',
      }
    } catch (error) {
      const err = error as Error & { code?: string; friendlyMessage?: string }
      return {
        success: false,
        transactionId: request.transactionId,
        responseCode: err.code || 'ERROR',
        responseMessage: err.friendlyMessage || err.message,
        status: 'FAILED',
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Batch Payment
  // ─────────────────────────────────────────────────────────────

  async createBatchPayment(request: BatchPaymentRequest): Promise<BatchPaymentResponse> {
    this.ensureConfigured()

    try {
      // Validate batch size
      if (request.payments.length > this.config!.maxBatchSize) {
        throw new Error(`Batch size exceeds limit of ${this.config!.maxBatchSize}`)
      }

      // Check balance
      const balance = await this.getBalance()
      const totalAmount = request.payments.reduce((sum, p) => sum + p.amount, 0)
      if (balance.available < totalAmount) {
        throw new Error(
          `Số dư không đủ. Khả dụng: ${balance.available.toLocaleString()}, Cần: ${totalAmount.toLocaleString()}`
        )
      }

      // Prepare transactions
      const transactions = request.payments.map((tx) => ({
        sequenceNo: tx.transactionId,
        destinationAccount: tx.destinationAccount.accountNumber,
        destinationAccountName: tx.destinationAccount.accountName,
        destinationBankCode: tx.destinationAccount.bankCode,
        amount: tx.amount,
        description: tx.description?.substring(0, 140),
      }))

      interface BatchResponse {
        responseCode: string
        bankBatchNo?: string
        responseMessage?: string
        estimatedCompletionTime?: string
      }

      const response = await this.apiRequest<BatchResponse>('POST', '/transfer/batch', {
        batchId: request.batchId,
        batchDate: new Date().toISOString().split('T')[0],

        // Source account
        sourceAccount: request.sourceAccount.accountNumber,
        sourceAccountName: request.sourceAccount.accountName,

        // Batch details
        totalCount: request.payments.length,
        totalAmount,
        currency: 'VND',

        // Transactions
        transactions,

        // Schedule
        processImmediate: true,
      })

      return {
        success: response.responseCode === '00',
        batchId: request.batchId,
        bankBatchId: response.bankBatchNo,
        successCount: response.responseCode === '00' ? request.payments.length : 0,
        failedCount: response.responseCode === '00' ? 0 : request.payments.length,
        transactions: request.payments.map((p) => ({
          transactionId: p.transactionId,
          status: response.responseCode === '00' ? 'PENDING' : 'FAILED',
          responseCode: response.responseCode,
          responseMessage: response.responseMessage,
        })),
      }
    } catch (error) {
      const err = error as Error & { code?: string; friendlyMessage?: string }
      return {
        success: false,
        batchId: request.batchId,
        successCount: 0,
        failedCount: request.payments.length,
        transactions: request.payments.map((p) => ({
          transactionId: p.transactionId,
          status: 'FAILED',
          responseCode: err.code || 'ERROR',
          responseMessage: err.friendlyMessage || err.message,
        })),
      }
    }
  }

  async getBatchStatus(batchId: string, bankBatchId: string): Promise<BatchPaymentStatus> {
    this.ensureConfigured()

    interface StatusResponse {
      status: string
      totalCount: number
      successCount: number
      failedCount: number
      pendingCount: number
      totalAmount: number
      processedAmount: number
      transactions?: Array<{
        sequenceNo: string
        status: string
        bankReferenceNo?: string
        processedAt?: string
        errorCode?: string
        errorMessage?: string
      }>
    }

    const response = await this.apiRequest<StatusResponse>('GET', `/transfer/batch/${bankBatchId}/status`)

    return {
      batchId,
      bankBatchId,
      status: this.mapBatchStatus(response.status),
      totalCount: response.totalCount,
      successCount: response.successCount,
      failedCount: response.failedCount,
      pendingCount: response.pendingCount,
      totalAmount: response.totalAmount,
      processedAmount: response.processedAmount,
      transactions:
        response.transactions?.map((tx) => ({
          transactionId: tx.sequenceNo,
          status: this.mapTransactionStatus(tx.status),
          bankTransactionId: tx.bankReferenceNo,
          processedAt: tx.processedAt ? new Date(tx.processedAt) : undefined,
          responseCode: tx.errorCode,
          responseMessage: tx.errorMessage,
        })) || [],
      lastUpdated: new Date(),
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Statement
  // ─────────────────────────────────────────────────────────────

  async getStatement(
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
  }> {
    this.ensureConfigured()

    interface StatementResponse {
      transactions: Array<{
        transactionDate: string
        description: string
        amount: number
        creditDebitIndicator: 'C' | 'D'
        balance: number
        referenceNo: string
      }>
    }

    const response = await this.apiRequest<StatementResponse>('GET', '/account/statement')

    return {
      transactions: response.transactions.map((tx) => ({
        date: new Date(tx.transactionDate),
        description: tx.description,
        amount: tx.amount,
        type: tx.creditDebitIndicator === 'C' ? 'CREDIT' : 'DEBIT',
        balance: tx.balance,
        referenceNo: tx.referenceNo,
      })),
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────────────────────────

  private mapBatchStatus(status: string): BatchPaymentStatus['status'] {
    const mapping: Record<string, BatchPaymentStatus['status']> = {
      PENDING: 'PENDING',
      PROCESSING: 'PROCESSING',
      COMPLETED: 'COMPLETED',
      PARTIAL_SUCCESS: 'PARTIAL',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
    }
    return mapping[status] || 'PENDING'
  }

  private mapTransactionStatus(status: string): 'SUCCESS' | 'FAILED' | 'PENDING' {
    const mapping: Record<string, 'SUCCESS' | 'FAILED' | 'PENDING'> = {
      SUCCESS: 'SUCCESS',
      COMPLETED: 'SUCCESS',
      FAILED: 'FAILED',
      REJECTED: 'FAILED',
      PENDING: 'PENDING',
      PROCESSING: 'PENDING',
    }
    return mapping[status] || 'PENDING'
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createVCBProductionAdapter(): VietcombankProductionAdapter {
  return new VietcombankProductionAdapter()
}
