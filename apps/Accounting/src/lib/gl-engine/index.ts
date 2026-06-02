// ============================================================
// GL Engine — General Ledger Core Business Logic
// Handles journal entry creation, validation, posting, reversal
// ============================================================

import Decimal from 'decimal.js';

// ==================== Types ====================

export interface GLJournalEntry {
  entryDate: Date;
  journalType: string;
  source: string;
  sourceModule?: string;
  sourceRef?: string;
  description: string;
  currency?: string;
  exchangeRate?: number;
  lines: GLJournalLine[];
  tags?: string[];
}

export interface GLJournalLine {
  accountId: string;
  accountNumber?: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  currency?: string;
  exchangeRate?: number;
  departmentId?: string;
  costCenterId?: string;
  projectId?: string;
  customerId?: string;
  supplierId?: string;
  employeeId?: string;
  productId?: string;
}

export interface GLPostingResult {
  success: boolean;
  entryId?: string;
  entryNumber?: string;
  errors?: string[];
  balanceUpdates?: Array<{ accountId: string; newBalance: number }>;
}

export interface TrialBalanceRow {
  accountId: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface AccountBalance {
  accountId: string;
  accountNumber: string;
  debitTotal: Decimal;
  creditTotal: Decimal;
  balance: Decimal;
  normalBalance: 'DEBIT' | 'CREDIT';
}

// ==================== Validation ====================

/**
 * Validate journal entry before posting
 * Ensures debit = credit and all required fields present
 */
export function validateJournalEntry(entry: GLJournalEntry): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Must have at least 2 lines
  if (!entry.lines || entry.lines.length < 2) {
    errors.push('Bút toán phải có ít nhất 2 dòng (Journal entry must have at least 2 lines)');
  }

  // Check entry date
  if (!entry.entryDate) {
    errors.push('Thiếu ngày bút toán (Entry date is required)');
  }

  // Check description
  if (!entry.description || entry.description.trim() === '') {
    errors.push('Thiếu diễn giải (Description is required)');
  }

  // Each line must have either debit or credit (not both, not neither)
  for (let i = 0; i < (entry.lines?.length || 0); i++) {
    const line = entry.lines[i];

    if (!line.accountId && !line.accountNumber) {
      errors.push(`Dòng ${i + 1}: Thiếu tài khoản (Line ${i + 1}: Account is required)`);
    }

    const debit = new Decimal(line.debitAmount || 0);
    const credit = new Decimal(line.creditAmount || 0);

    if (debit.isNegative()) {
      errors.push(`Dòng ${i + 1}: Số tiền Nợ không được âm (Debit amount cannot be negative)`);
    }

    if (credit.isNegative()) {
      errors.push(`Dòng ${i + 1}: Số tiền Có không được âm (Credit amount cannot be negative)`);
    }

    if (debit.isZero() && credit.isZero()) {
      errors.push(`Dòng ${i + 1}: Phải có Nợ hoặc Có (Must have debit or credit)`);
    }

    if (debit.greaterThan(0) && credit.greaterThan(0)) {
      errors.push(`Dòng ${i + 1}: Không được vừa Nợ vừa Có (Cannot have both debit and credit)`);
    }
  }

  // Total debits must equal total credits
  if (entry.lines && entry.lines.length >= 2) {
    const { totalDebit, totalCredit } = calculateTotals(entry.lines);

    if (!totalDebit.equals(totalCredit)) {
      errors.push(
        `Tổng Nợ (${totalDebit.toFixed(4)}) ≠ Tổng Có (${totalCredit.toFixed(4)}) — ` +
        `Chênh lệch: ${totalDebit.minus(totalCredit).abs().toFixed(4)} ` +
        `(Debits must equal credits)`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate total debits and credits for journal lines
 */
export function calculateTotals(lines: GLJournalLine[]): {
  totalDebit: Decimal;
  totalCredit: Decimal;
  isBalanced: boolean;
} {
  let totalDebit = new Decimal(0);
  let totalCredit = new Decimal(0);

  for (const line of lines) {
    totalDebit = totalDebit.plus(new Decimal(line.debitAmount || 0));
    totalCredit = totalCredit.plus(new Decimal(line.creditAmount || 0));
  }

  return {
    totalDebit,
    totalCredit,
    isBalanced: totalDebit.equals(totalCredit),
  };
}

/**
 * Generate the next journal entry number
 * Format: JV-{YYYY}-{NNNNNN} (e.g., JV-2026-000001)
 */
export function generateEntryNumber(year: number, sequence: number, prefix?: string): string {
  const pfx = prefix || 'JV';
  return `${pfx}-${year}-${String(sequence).padStart(6, '0')}`;
}

/**
 * Get journal type prefix for numbering
 */
export function getJournalTypePrefix(journalType: string): string {
  const prefixes: Record<string, string> = {
    GENERAL: 'JV',
    CASH_RECEIPT: 'PT',     // Phiếu thu
    CASH_PAYMENT: 'PC',     // Phiếu chi
    BANK_RECEIPT: 'BC',     // Báo có
    BANK_PAYMENT: 'BN',     // Báo nợ
    SALES: 'HD',            // Hóa đơn
    PURCHASE: 'PM',         // Phiếu mua
    PAYROLL: 'BL',          // Bảng lương
    DEPRECIATION: 'KH',     // Khấu hao
    ADJUSTMENT: 'DC',       // Điều chỉnh
    CLOSING: 'KC',          // Kết chuyển
    OPENING: 'DK',          // Đầu kỳ
    REVERSAL: 'DP',         // Đảo phiếu
  };
  return prefixes[journalType] || 'JV';
}

// ==================== Account Balance Calculation ====================

/**
 * Calculate account balance based on normal balance side
 * DEBIT normal: balance = debit - credit (positive = debit balance)
 * CREDIT normal: balance = credit - debit (positive = credit balance)
 */
export function calculateAccountBalance(
  debitTotal: number,
  creditTotal: number,
  normalBalance: 'DEBIT' | 'CREDIT'
): Decimal {
  const debit = new Decimal(debitTotal);
  const credit = new Decimal(creditTotal);

  if (normalBalance === 'DEBIT') {
    return debit.minus(credit);
  }
  return credit.minus(debit);
}

/**
 * Build trial balance from account balances
 */
export function buildTrialBalance(
  accounts: Array<{
    id: string;
    accountNumber: string;
    name: string;
    accountType: string;
    normalBalance: string;
    openingBalance: number;
    periodDebits: number;
    periodCredits: number;
  }>
): TrialBalanceRow[] {
  return accounts.map(acc => {
    const opening = new Decimal(acc.openingBalance);
    const periodDebit = new Decimal(acc.periodDebits);
    const periodCredit = new Decimal(acc.periodCredits);

    // Opening split into debit/credit based on normal balance
    const openingDebit = acc.normalBalance === 'DEBIT' && opening.greaterThan(0)
      ? opening
      : acc.normalBalance === 'CREDIT' && opening.lessThan(0)
        ? opening.abs()
        : new Decimal(0);

    const openingCredit = acc.normalBalance === 'CREDIT' && opening.greaterThan(0)
      ? opening
      : acc.normalBalance === 'DEBIT' && opening.lessThan(0)
        ? opening.abs()
        : new Decimal(0);

    // Closing balance
    const closingBalance = opening.plus(periodDebit).minus(periodCredit);
    const closingDebit = closingBalance.greaterThanOrEqualTo(0) && acc.normalBalance === 'DEBIT'
      ? closingBalance
      : closingBalance.lessThan(0) && acc.normalBalance === 'CREDIT'
        ? closingBalance.abs()
        : new Decimal(0);

    const closingCredit = closingBalance.greaterThanOrEqualTo(0) && acc.normalBalance === 'CREDIT'
      ? closingBalance
      : closingBalance.lessThan(0) && acc.normalBalance === 'DEBIT'
        ? closingBalance.abs()
        : new Decimal(0);

    return {
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      accountName: acc.name,
      accountType: acc.accountType,
      openingDebit: openingDebit.toNumber(),
      openingCredit: openingCredit.toNumber(),
      periodDebit: periodDebit.toNumber(),
      periodCredit: periodCredit.toNumber(),
      closingDebit: closingDebit.toNumber(),
      closingCredit: closingCredit.toNumber(),
    };
  });
}

// ==================== Period Close Entries ====================

/**
 * Generate closing entries for period-end (Kết chuyển cuối kỳ)
 * Closes revenue (5xx) and expense (6xx, 8xx) to Income Summary (911)
 * Then closes 911 to Retained Earnings (4212)
 */
export function generateClosingEntries(
  revenueAccounts: Array<{ accountId: string; balance: number }>,
  expenseAccounts: Array<{ accountId: string; balance: number }>,
  incomeSummaryAccountId: string,
  retainedEarningsAccountId: string
): GLJournalEntry[] {
  const entries: GLJournalEntry[] = [];

  // 1. Close revenue to income summary (Debit Revenue, Credit 911)
  const revenueLines: GLJournalLine[] = [];
  let totalRevenue = new Decimal(0);

  for (const rev of revenueAccounts) {
    if (rev.balance !== 0) {
      revenueLines.push({
        accountId: rev.accountId,
        debitAmount: Math.abs(rev.balance),
        creditAmount: 0,
      });
      totalRevenue = totalRevenue.plus(Math.abs(rev.balance));
    }
  }

  if (revenueLines.length > 0) {
    revenueLines.push({
      accountId: incomeSummaryAccountId,
      debitAmount: 0,
      creditAmount: totalRevenue.toNumber(),
    });

    entries.push({
      entryDate: new Date(),
      journalType: 'CLOSING',
      source: 'SYSTEM',
      sourceModule: 'accounting',
      description: 'Kết chuyển doanh thu cuối kỳ (Close revenue accounts)',
      lines: revenueLines,
    });
  }

  // 2. Close expenses to income summary (Debit 911, Credit Expense)
  const expenseLines: GLJournalLine[] = [];
  let totalExpense = new Decimal(0);

  for (const exp of expenseAccounts) {
    if (exp.balance !== 0) {
      expenseLines.push({
        accountId: exp.accountId,
        debitAmount: 0,
        creditAmount: Math.abs(exp.balance),
      });
      totalExpense = totalExpense.plus(Math.abs(exp.balance));
    }
  }

  if (expenseLines.length > 0) {
    expenseLines.push({
      accountId: incomeSummaryAccountId,
      debitAmount: totalExpense.toNumber(),
      creditAmount: 0,
    });

    entries.push({
      entryDate: new Date(),
      journalType: 'CLOSING',
      source: 'SYSTEM',
      sourceModule: 'accounting',
      description: 'Kết chuyển chi phí cuối kỳ (Close expense accounts)',
      lines: expenseLines,
    });
  }

  // 3. Close income summary to retained earnings
  const netIncome = totalRevenue.minus(totalExpense);
  if (!netIncome.isZero()) {
    entries.push({
      entryDate: new Date(),
      journalType: 'CLOSING',
      source: 'SYSTEM',
      sourceModule: 'accounting',
      description: `Kết chuyển lãi/lỗ: ${netIncome.greaterThan(0) ? 'Lãi' : 'Lỗ'} ${netIncome.abs().toFixed(0)} VND`,
      lines: [
        {
          accountId: incomeSummaryAccountId,
          debitAmount: netIncome.greaterThan(0) ? netIncome.toNumber() : 0,
          creditAmount: netIncome.lessThan(0) ? netIncome.abs().toNumber() : 0,
        },
        {
          accountId: retainedEarningsAccountId,
          debitAmount: netIncome.lessThan(0) ? netIncome.abs().toNumber() : 0,
          creditAmount: netIncome.greaterThan(0) ? netIncome.toNumber() : 0,
        },
      ],
    });
  }

  return entries;
}

// ==================== Reversal ====================

/**
 * Create a reversal entry from an existing journal entry
 * Swaps debit/credit amounts on all lines
 */
export function createReversalEntry(
  originalEntry: GLJournalEntry & { id: string },
  reversalDate: Date
): GLJournalEntry {
  return {
    entryDate: reversalDate,
    journalType: 'REVERSAL',
    source: 'MANUAL',
    sourceModule: originalEntry.sourceModule,
    sourceRef: originalEntry.id,
    description: `Đảo bút toán: ${originalEntry.description}`,
    currency: originalEntry.currency,
    exchangeRate: originalEntry.exchangeRate,
    lines: originalEntry.lines.map(line => ({
      ...line,
      debitAmount: line.creditAmount,
      creditAmount: line.debitAmount,
    })),
  };
}

// ==================== Currency ====================

/**
 * Convert amount to base currency (VND)
 */
export function convertToBaseCurrency(amount: number, exchangeRate: number): Decimal {
  return new Decimal(amount).times(new Decimal(exchangeRate));
}

/**
 * Format VND amount (Vietnamese Dong formatting)
 */
export function formatVND(amount: number | Decimal): string {
  const num = amount instanceof Decimal ? amount.toNumber() : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Convert number to Vietnamese words for invoice amount
 */
export function numberToVietnameseWords(n: number): string {
  if (n === 0) return 'Không đồng';

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readGroup(num: number): string {
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;
    let result = '';

    if (h > 0) result += digits[h] + ' trăm ';
    if (t > 1) result += digits[t] + ' mươi ';
    else if (t === 1) result += 'mười ';
    else if (t === 0 && h > 0 && u > 0) result += 'lẻ ';

    if (u === 1 && t > 1) result += 'mốt';
    else if (u === 5 && t > 0) result += 'lăm';
    else if (u > 0) result += digits[u];

    return result.trim();
  }

  const groups: number[] = [];
  let remaining = Math.abs(Math.floor(n));
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      result += readGroup(groups[i]) + ' ' + units[i] + ' ';
    }
  }

  result = result.trim();
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return (n < 0 ? 'Âm ' : '') + result + ' đồng';
}
