// ============================================================
// Invoice Engine — AP/AR Business Logic
// Manages accounts payable and accounts receivable workflows
// ============================================================

import Decimal from 'decimal.js';
import type { GLJournalEntry, GLJournalLine } from '../gl-engine';

// ==================== Types ====================

export interface InvoiceInput {
  invoiceNumber: string;
  counterpartyId: string;     // supplierId (AP) or customerId (AR)
  counterpartyName: string;
  counterpartyTaxCode?: string;
  invoiceDate: Date;
  dueDate: Date;
  lines: InvoiceLineInput[];
  currency?: string;
  exchangeRate?: number;
  description?: string;
  paymentTermDays?: number;
  glAccountId?: string;       // Override default GL account
}

export interface InvoiceLineInput {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;            // 0, 0.05, 0.08, 0.10
  accountId?: string;         // GL expense/revenue account
  productId?: string;
  departmentId?: string;
  costCenterId?: string;
  projectId?: string;
}

export interface InvoiceCalculation {
  subtotal: Decimal;
  vatAmount: Decimal;
  totalAmount: Decimal;
  lines: Array<InvoiceLineInput & {
    amount: Decimal;
    vatAmount: Decimal;
    totalAmount: Decimal;
  }>;
}

export interface AgingBucket {
  label: string;
  days: string;
  count: number;
  amount: Decimal;
  invoices: Array<{ id: string; number: string; counterparty: string; amount: number; daysOverdue: number }>;
}

// ==================== Invoice Calculation ====================

/**
 * Calculate invoice totals from lines
 */
export function calculateInvoice(lines: InvoiceLineInput[]): InvoiceCalculation {
  let subtotal = new Decimal(0);
  let vatTotal = new Decimal(0);

  const calculatedLines = lines.map(line => {
    const qty = new Decimal(line.quantity);
    const price = new Decimal(line.unitPrice);
    const amount = qty.times(price);
    const vat = amount.times(new Decimal(line.vatRate));
    const total = amount.plus(vat);

    subtotal = subtotal.plus(amount);
    vatTotal = vatTotal.plus(vat);

    return { ...line, amount, vatAmount: vat, totalAmount: total };
  });

  return {
    subtotal,
    vatAmount: vatTotal,
    totalAmount: subtotal.plus(vatTotal),
    lines: calculatedLines,
  };
}

/**
 * Calculate remaining amount after payments
 */
export function calculateRemainingAmount(totalAmount: number, paidAmount: number): Decimal {
  return new Decimal(totalAmount).minus(new Decimal(paidAmount));
}

/**
 * Determine invoice status based on amounts and dates
 */
export function determineInvoiceStatus(
  totalAmount: number,
  paidAmount: number,
  dueDate: Date,
  currentDate: Date = new Date()
): string {
  const remaining = new Decimal(totalAmount).minus(new Decimal(paidAmount));

  if (remaining.isZero() || remaining.isNegative()) return 'PAID';
  if (paidAmount > 0) return 'PARTIALLY_PAID';
  if (currentDate > dueDate) return 'OVERDUE';
  return 'SENT';
}

// ==================== GL Posting ====================

/**
 * Generate GL journal entry for AP Invoice
 * Debit: Expense accounts (6xx) + Input VAT (1331)
 * Credit: Accounts Payable (331)
 */
export function generateAPJournalEntry(
  invoice: InvoiceInput,
  calculation: InvoiceCalculation,
  apAccountId: string,        // TK 331
  inputVatAccountId: string   // TK 1331
): GLJournalEntry {
  const lines: GLJournalLine[] = [];

  // Debit expense accounts
  for (const line of calculation.lines) {
    if (line.amount.greaterThan(0)) {
      lines.push({
        accountId: line.accountId || invoice.glAccountId || '',
        description: line.description,
        debitAmount: line.amount.toNumber(),
        creditAmount: 0,
        departmentId: line.departmentId,
        costCenterId: line.costCenterId,
        projectId: line.projectId,
        productId: line.productId,
        supplierId: invoice.counterpartyId,
      });
    }
  }

  // Debit input VAT
  if (calculation.vatAmount.greaterThan(0)) {
    lines.push({
      accountId: inputVatAccountId,
      description: `Thuế GTGT đầu vào - ${invoice.counterpartyName}`,
      debitAmount: calculation.vatAmount.toNumber(),
      creditAmount: 0,
      supplierId: invoice.counterpartyId,
    });
  }

  // Credit AP
  lines.push({
    accountId: apAccountId,
    description: `Phải trả ${invoice.counterpartyName} - ${invoice.invoiceNumber}`,
    debitAmount: 0,
    creditAmount: calculation.totalAmount.toNumber(),
    supplierId: invoice.counterpartyId,
  });

  return {
    entryDate: invoice.invoiceDate,
    journalType: 'PURCHASE',
    source: 'SYSTEM',
    sourceModule: 'accounting',
    sourceRef: invoice.invoiceNumber,
    description: `Mua hàng - ${invoice.counterpartyName} - HĐ ${invoice.invoiceNumber}`,
    currency: invoice.currency,
    exchangeRate: invoice.exchangeRate,
    lines,
  };
}

/**
 * Generate GL journal entry for AR Invoice
 * Debit: Accounts Receivable (131)
 * Credit: Revenue accounts (511x) + Output VAT (33311)
 */
export function generateARJournalEntry(
  invoice: InvoiceInput,
  calculation: InvoiceCalculation,
  arAccountId: string,          // TK 131
  outputVatAccountId: string    // TK 33311
): GLJournalEntry {
  const lines: GLJournalLine[] = [];

  // Debit AR
  lines.push({
    accountId: arAccountId,
    description: `Phải thu ${invoice.counterpartyName} - ${invoice.invoiceNumber}`,
    debitAmount: calculation.totalAmount.toNumber(),
    creditAmount: 0,
    customerId: invoice.counterpartyId,
  });

  // Credit revenue accounts
  for (const line of calculation.lines) {
    if (line.amount.greaterThan(0)) {
      lines.push({
        accountId: line.accountId || invoice.glAccountId || '',
        description: line.description,
        debitAmount: 0,
        creditAmount: line.amount.toNumber(),
        departmentId: line.departmentId,
        projectId: line.projectId,
        productId: line.productId,
        customerId: invoice.counterpartyId,
      });
    }
  }

  // Credit output VAT
  if (calculation.vatAmount.greaterThan(0)) {
    lines.push({
      accountId: outputVatAccountId,
      description: `Thuế GTGT đầu ra - ${invoice.counterpartyName}`,
      debitAmount: 0,
      creditAmount: calculation.vatAmount.toNumber(),
      customerId: invoice.counterpartyId,
    });
  }

  return {
    entryDate: invoice.invoiceDate,
    journalType: 'SALES',
    source: 'SYSTEM',
    sourceModule: 'accounting',
    sourceRef: invoice.invoiceNumber,
    description: `Bán hàng - ${invoice.counterpartyName} - HĐ ${invoice.invoiceNumber}`,
    currency: invoice.currency,
    exchangeRate: invoice.exchangeRate,
    lines,
  };
}

/**
 * Generate GL journal entry for payment
 * AP Payment: Debit 331, Credit 111/112
 * AR Receipt: Debit 111/112, Credit 131
 */
export function generatePaymentJournalEntry(
  type: 'AP' | 'AR',
  amount: number,
  counterpartyId: string,
  counterpartyName: string,
  payableReceivableAccountId: string,   // TK 331 or 131
  cashBankAccountId: string,            // TK 111 or 112
  paymentMethod: string,
  reference?: string
): GLJournalEntry {
  const isAP = type === 'AP';

  return {
    entryDate: new Date(),
    journalType: isAP ? 'CASH_PAYMENT' : 'CASH_RECEIPT',
    source: 'SYSTEM',
    sourceModule: 'accounting',
    description: isAP
      ? `Thanh toán cho ${counterpartyName}${reference ? ` - Ref: ${reference}` : ''}`
      : `Thu tiền từ ${counterpartyName}${reference ? ` - Ref: ${reference}` : ''}`,
    lines: [
      {
        accountId: isAP ? payableReceivableAccountId : cashBankAccountId,
        description: isAP ? `Trả nợ ${counterpartyName}` : `Thu tiền ${counterpartyName}`,
        debitAmount: amount,
        creditAmount: 0,
        ...(isAP ? { supplierId: counterpartyId } : { customerId: counterpartyId }),
      },
      {
        accountId: isAP ? cashBankAccountId : payableReceivableAccountId,
        description: isAP ? `Chi ${paymentMethod === 'CASH' ? 'tiền mặt' : 'chuyển khoản'}` : `Ghi nhận thu`,
        debitAmount: 0,
        creditAmount: amount,
        ...(isAP ? { supplierId: counterpartyId } : { customerId: counterpartyId }),
      },
    ],
  };
}

// ==================== Aging Analysis ====================

/**
 * Calculate aging buckets for AP or AR
 */
export function calculateAging(
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    counterpartyName: string;
    remainingAmount: number;
    dueDate: Date;
  }>,
  asOfDate: Date = new Date()
): AgingBucket[] {
  const buckets: AgingBucket[] = [
    { label: 'Chưa đến hạn', days: 'Current', count: 0, amount: new Decimal(0), invoices: [] },
    { label: '1-30 ngày', days: '1-30', count: 0, amount: new Decimal(0), invoices: [] },
    { label: '31-60 ngày', days: '31-60', count: 0, amount: new Decimal(0), invoices: [] },
    { label: '61-90 ngày', days: '61-90', count: 0, amount: new Decimal(0), invoices: [] },
    { label: 'Trên 90 ngày', days: '90+', count: 0, amount: new Decimal(0), invoices: [] },
  ];

  for (const inv of invoices) {
    if (inv.remainingAmount <= 0) continue;

    const daysOverdue = Math.floor((asOfDate.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));

    let bucketIndex: number;
    if (daysOverdue <= 0) bucketIndex = 0;
    else if (daysOverdue <= 30) bucketIndex = 1;
    else if (daysOverdue <= 60) bucketIndex = 2;
    else if (daysOverdue <= 90) bucketIndex = 3;
    else bucketIndex = 4;

    buckets[bucketIndex].count++;
    buckets[bucketIndex].amount = buckets[bucketIndex].amount.plus(inv.remainingAmount);
    buckets[bucketIndex].invoices.push({
      id: inv.id,
      number: inv.invoiceNumber,
      counterparty: inv.counterpartyName,
      amount: inv.remainingAmount,
      daysOverdue: Math.max(0, daysOverdue),
    });
  }

  return buckets;
}
