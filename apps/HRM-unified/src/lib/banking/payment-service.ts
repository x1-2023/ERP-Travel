// src/lib/banking/payment-service.ts
// Payment Batch Service

import prisma from '@/lib/db'
import { VCBAdapter } from './adapters/vcb'
import type {
  BankCode,
  IBankAdapter,
  BankApiConfig,
  PaymentRequest,
  BatchPaymentRequest,
  PaymentTransactionStatus,
} from './types'

// ═══════════════════════════════════════════════════════════════
// PAYMENT SERVICE
// ═══════════════════════════════════════════════════════════════

export class PaymentService {
  private tenantId: string
  private adapters = new Map<BankCode, IBankAdapter>()

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  // ─────────────────────────────────────────────────────────────
  // Adapter Management
  // ─────────────────────────────────────────────────────────────

  private getAdapter(bankCode: BankCode): IBankAdapter {
    if (this.adapters.has(bankCode)) {
      return this.adapters.get(bankCode)!
    }

    let adapter: IBankAdapter

    switch (bankCode) {
      case 'VCB':
        adapter = new VCBAdapter()
        break
      case 'TCB':
        // TODO: Implement Techcombank adapter
        throw new Error('Techcombank adapter not implemented')
      case 'MB':
        // TODO: Implement MB Bank adapter
        throw new Error('MB Bank adapter not implemented')
      default:
        throw new Error(`Bank adapter not available for: ${bankCode}`)
    }

    this.adapters.set(bankCode, adapter)
    return adapter
  }

  private async configureAdapter(adapter: IBankAdapter, bankConfigId: string): Promise<void> {
    const bankConfig = await prisma.bankConfiguration.findUnique({
      where: { id: bankConfigId },
    })

    if (!bankConfig) {
      throw new Error('Bank configuration not found')
    }

    const config: BankApiConfig = {
      apiEndpoint: bankConfig.apiEndpoint || '',
      apiVersion: bankConfig.apiVersion || undefined,
      clientId: bankConfig.clientId || '',
      clientSecret: bankConfig.encryptedSecret || '', // In production, decrypt this
    }

    adapter.configure(config)
  }

  // ─────────────────────────────────────────────────────────────
  // Payment Batch Operations
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a payment batch from payroll period
   */
  async createPaymentBatchFromPayroll(
    payrollPeriodId: string,
    bankConfigId: string,
    options?: { batchName?: string }
  ): Promise<string> {
    // Get bank configuration
    const bankConfig = await prisma.bankConfiguration.findUnique({
      where: { id: bankConfigId, tenantId: this.tenantId },
    })

    if (!bankConfig) {
      throw new Error('Không tìm thấy cấu hình ngân hàng')
    }

    // Get payroll records for the period
    const payrolls = await prisma.payroll.findMany({
      where: {
        tenantId: this.tenantId,
        periodId: payrollPeriodId,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            bankAccount: true,
            bankName: true,
          },
        },
      },
    })

    if (payrolls.length === 0) {
      throw new Error('Không có dữ liệu lương để thanh toán')
    }

    // Create payment batch
    const batchCode = `PAY-${Date.now().toString(36).toUpperCase()}`

    const batch = await prisma.paymentBatch.create({
      data: {
        tenantId: this.tenantId,
        bankConfigId,
        batchCode,
        batchName: options?.batchName || `Thanh toán lương - ${new Date().toLocaleDateString('vi-VN')}`,
        batchType: 'SALARY',
        payrollPeriodId,
        totalTransactions: payrolls.length,
        totalAmount: payrolls.reduce((sum, p) => sum + Number(p.netSalary), 0),
        status: 'DRAFT',
      },
    })

    // Create payment transactions
    await prisma.paymentTransaction.createMany({
      data: payrolls.map((payroll) => ({
        batchId: batch.id,
        employeeId: payroll.employeeId,
        recipientName: payroll.employee.fullName,
        recipientBank: payroll.employee.bankName || '',
        recipientAccount: payroll.employee.bankAccount || '',
        amount: Number(payroll.netSalary),
        currency: 'VND',
        description: `Luong thang ${new Date().getMonth() + 1}`,
        status: 'PENDING',
      })),
    })

    return batch.id
  }

  /**
   * Process a payment batch
   */
  async processBatch(batchId: string): Promise<{
    success: boolean
    successCount: number
    failedCount: number
    errors: string[]
  }> {
    const batch = await prisma.paymentBatch.findUnique({
      where: { id: batchId, tenantId: this.tenantId },
      include: {
        bankConfig: true,
        transactions: true,
      },
    })

    if (!batch) {
      throw new Error('Không tìm thấy batch thanh toán')
    }

    if (batch.status !== 'APPROVED') {
      throw new Error('Batch chưa được duyệt')
    }

    // Get and configure adapter
    const adapter = this.getAdapter(batch.bankConfig.bankCode as BankCode)
    await this.configureAdapter(adapter, batch.bankConfigId)

    // Update batch status
    await prisma.paymentBatch.update({
      where: { id: batchId },
      data: { status: 'PROCESSING', processedAt: new Date() },
    })

    // Prepare batch payment request
    const batchRequest: BatchPaymentRequest = {
      batchId: batch.batchCode,
      batchName: batch.batchName,
      sourceAccount: {
        accountNumber: batch.bankConfig.accountNumber,
        accountName: batch.bankConfig.accountName,
        bankCode: batch.bankConfig.bankCode as BankCode,
        branchCode: batch.bankConfig.branchCode || undefined,
      },
      payments: batch.transactions.map((tx) => ({
        transactionId: tx.id,
        amount: Number(tx.amount),
        currency: tx.currency,
        description: tx.description || '',
        sourceAccount: {
          accountNumber: batch.bankConfig.accountNumber,
          accountName: batch.bankConfig.accountName,
          bankCode: batch.bankConfig.bankCode as BankCode,
        },
        destinationAccount: {
          accountNumber: tx.recipientAccount,
          accountName: tx.recipientName,
          bankCode: (tx.recipientBank as BankCode) || 'OTHER',
          branchCode: tx.recipientBranch || undefined,
        },
      })),
    }

    try {
      // Process batch payment
      const result = await adapter.createBatchPayment(batchRequest)

      // Update transactions
      for (const txResult of result.transactions) {
        await prisma.paymentTransaction.update({
          where: { id: txResult.transactionId },
          data: {
            status: txResult.status,
            bankTransactionId: txResult.bankTransactionId,
            bankResponseCode: txResult.responseCode,
            bankResponseMessage: txResult.responseMessage,
            processedAt: new Date(),
          },
        })
      }

      // Update batch
      await prisma.paymentBatch.update({
        where: { id: batchId },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          successCount: result.successCount,
          failedCount: result.failedCount,
          bankReferenceId: result.bankBatchId,
          bankResponseData: JSON.parse(JSON.stringify(result)),
          completedAt: new Date(),
        },
      })

      return {
        success: result.success,
        successCount: result.successCount,
        failedCount: result.failedCount,
        errors: [],
      }
    } catch (error) {
      // Update batch as failed
      await prisma.paymentBatch.update({
        where: { id: batchId },
        data: {
          status: 'FAILED',
          bankResponseData: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      })

      return {
        success: false,
        successCount: 0,
        failedCount: batch.transactions.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Approve a payment batch
   */
  async approveBatch(batchId: string, approverId: string): Promise<void> {
    await prisma.paymentBatch.update({
      where: { id: batchId, tenantId: this.tenantId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: approverId,
      },
    })
  }

  /**
   * Cancel a payment batch
   */
  async cancelBatch(batchId: string): Promise<void> {
    const batch = await prisma.paymentBatch.findUnique({
      where: { id: batchId, tenantId: this.tenantId },
    })

    if (!batch) {
      throw new Error('Không tìm thấy batch thanh toán')
    }

    if (!['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(batch.status)) {
      throw new Error('Không thể hủy batch ở trạng thái này')
    }

    await prisma.paymentBatch.update({
      where: { id: batchId },
      data: { status: 'CANCELLED' },
    })

    await prisma.paymentTransaction.updateMany({
      where: { batchId },
      data: { status: 'CANCELLED' },
    })
  }

  /**
   * Get payment batches
   */
  async getBatches(options?: {
    status?: string
    bankConfigId?: string
    limit?: number
  }): Promise<
    Array<{
      id: string
      batchCode: string
      batchName: string
      status: string
      totalTransactions: number
      totalAmount: number
      successCount: number
      failedCount: number
      createdAt: Date
      processedAt: Date | null
    }>
  > {
    const where: Record<string, unknown> = { tenantId: this.tenantId }

    if (options?.status) where.status = options.status
    if (options?.bankConfigId) where.bankConfigId = options.bankConfigId

    const batches = await prisma.paymentBatch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    })

    return batches.map((b) => ({
      id: b.id,
      batchCode: b.batchCode,
      batchName: b.batchName,
      status: b.status,
      totalTransactions: b.totalTransactions,
      totalAmount: Number(b.totalAmount),
      successCount: b.successCount,
      failedCount: b.failedCount,
      createdAt: b.createdAt,
      processedAt: b.processedAt,
    }))
  }

  /**
   * Validate employee bank accounts
   */
  async validateEmployeeAccounts(employeeIds: string[]): Promise<
    Array<{
      employeeId: string
      valid: boolean
      accountName?: string
      errorMessage?: string
    }>
  > {
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
        tenantId: this.tenantId,
      },
      select: {
        id: true,
        bankAccount: true,
        bankName: true,
      },
    })

    const results = []

    for (const emp of employees) {
      if (!emp.bankAccount) {
        results.push({
          employeeId: emp.id,
          valid: false,
          errorMessage: 'Chưa có số tài khoản ngân hàng',
        })
        continue
      }

      // Get appropriate adapter
      try {
        const bankCode = (emp.bankName as BankCode) || 'OTHER'
        const adapter = this.getAdapter(bankCode)

        const validation = await adapter.validateAccount(emp.bankAccount, bankCode)
        results.push({
          employeeId: emp.id,
          valid: validation.valid,
          accountName: validation.accountName,
          errorMessage: validation.errorMessage,
        })
      } catch {
        results.push({
          employeeId: emp.id,
          valid: false,
          errorMessage: 'Không thể xác thực tài khoản',
        })
      }
    }

    return results
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createPaymentService(tenantId: string): PaymentService {
  return new PaymentService(tenantId)
}
