// ══════════════════════════════════════════════════════════════════════════════
//                    MOCK DATA: FINANCE MODULE
// ══════════════════════════════════════════════════════════════════════════════

import { subDays, format, addMonths, addDays } from 'date-fns';

const today = new Date();

// ═══════════════════════════════════════════════════════════════════════
// ACCRUALS
// ═══════════════════════════════════════════════════════════════════════

export const accrualStatuses = ['PENDING', 'CALCULATED', 'POSTED', 'REVERSED'] as const;

export const mockAccruals = [
  {
    id: 'acc-001',
    code: 'ACC-2026-001',
    promotionId: 'promo-001',
    promotionCode: 'SUMMER-2026',
    promotionName: 'Khuyến mãi Hè 2026',
    period: '2026-01',
    status: 'POSTED',
    estimatedAmount: 45000000,
    actualAmount: 42500000,
    variance: -2500000,
    variancePercent: -5.56,
    glAccountCode: '6410',
    glAccountName: 'Chi phí khuyến mãi',
    journalId: 'jnl-001',
    calculatedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    postedAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 10), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
    notes: 'Accrual tháng 1 cho chương trình SUMMER-2026',
  },
  {
    id: 'acc-002',
    code: 'ACC-2026-002',
    promotionId: 'promo-001',
    promotionCode: 'SUMMER-2026',
    promotionName: 'Khuyến mãi Hè 2026',
    period: '2026-02',
    status: 'CALCULATED',
    estimatedAmount: 55000000,
    actualAmount: null,
    variance: null,
    variancePercent: null,
    glAccountCode: '6410',
    glAccountName: 'Chi phí khuyến mãi',
    calculatedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
  },
  {
    id: 'acc-003',
    code: 'ACC-2026-003',
    promotionId: 'promo-004',
    promotionCode: 'REBATE-2026',
    promotionName: 'Chương trình hoàn tiền',
    period: '2025-12',
    status: 'POSTED',
    estimatedAmount: 85000000,
    actualAmount: 92000000,
    variance: 7000000,
    variancePercent: 8.24,
    glAccountCode: '6420',
    glAccountName: 'Chi phí hoàn tiền',
    journalId: 'jnl-002',
    calculatedAt: format(subDays(today, 30), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    postedAt: format(subDays(today, 25), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 35), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 25), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
  },
];

// Generate more accruals
for (let i = 4; i <= 10; i++) {
  const status = accrualStatuses[Math.floor(Math.random() * accrualStatuses.length)];
  const estimated = Math.floor(Math.random() * 100000000) + 20000000;
  const actual = status === 'POSTED' ? Math.floor(estimated * (0.9 + Math.random() * 0.2)) : null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockAccruals as any[]).push({
    id: `acc-${String(i).padStart(3, '0')}`,
    code: `ACC-2026-${String(i).padStart(3, '0')}`,
    promotionId: `promo-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
    promotionCode: `PROMO-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
    promotionName: `Chương trình KM ${Math.floor(Math.random() * 5) + 1}`,
    period: format(addMonths(today, -Math.floor(Math.random() * 6)), 'yyyy-MM'),
    status: status,
    estimatedAmount: estimated,
    actualAmount: actual,
    variance: actual ? actual - estimated : null,
    variancePercent: actual ? ((actual - estimated) / estimated) * 100 : null,
    glAccountCode: ['6410', '6420', '6430'][Math.floor(Math.random() * 3)],
    glAccountName: ['Chi phí khuyến mãi', 'Chi phí hoàn tiền', 'Chi phí trưng bày'][Math.floor(Math.random() * 3)],
    journalId: status === 'POSTED' ? `jnl-${String(i).padStart(3, '0')}` : undefined,
    calculatedAt: format(subDays(today, Math.floor(Math.random() * 20)), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    postedAt: status === 'POSTED' ? format(subDays(today, Math.floor(Math.random() * 15)), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'') : undefined,
    createdAt: format(subDays(today, Math.floor(Math.random() * 30) + 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, Math.floor(Math.random() * 5)), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
  });
}

// ═══════════════════════════════════════════════════════════════════════
// DEDUCTIONS
// ═══════════════════════════════════════════════════════════════════════

export const deductionStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'] as const;
export const deductionTypes = ['CLAIM', 'PENALTY', 'RETURN', 'DAMAGE', 'OTHER'] as const;

export const mockDeductions = [
  {
    id: 'ded-001',
    code: 'DED-2026-001',
    claimId: 'claim-002',
    claimCode: 'CLM-2026-002',
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    type: 'CLAIM',
    status: 'PROCESSED',
    amount: 35000000,
    description: 'Khấu trừ claim CLM-2026-002',
    invoiceNumber: 'INV-2026-0125',
    invoiceDate: format(subDays(today, 20), 'yyyy-MM-dd'),
    deductionDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    approvedAt: format(subDays(today, 7), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    processedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 10), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
    approvedById: 'user-002',
  },
  {
    id: 'ded-002',
    code: 'DED-2026-002',
    claimId: 'claim-001',
    claimCode: 'CLM-2026-001',
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    type: 'CLAIM',
    status: 'APPROVED',
    amount: 25000000,
    description: 'Khấu trừ claim CLM-2026-001',
    invoiceNumber: 'INV-2026-0156',
    invoiceDate: format(subDays(today, 10), 'yyyy-MM-dd'),
    approvedAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
    approvedById: 'user-002',
  },
  {
    id: 'ded-003',
    code: 'DED-2026-003',
    customerId: 'cust-002',
    customerName: 'Siêu thị Big C',
    type: 'DAMAGE',
    status: 'PENDING',
    amount: 8500000,
    description: 'Khấu trừ hàng hư hỏng đợt giao 15/01',
    invoiceNumber: 'INV-2026-0178',
    invoiceDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    createdAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-003',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// GL JOURNALS
// ═══════════════════════════════════════════════════════════════════════

export const journalStatuses = ['DRAFT', 'PENDING', 'POSTED', 'REVERSED'] as const;

export const mockJournals = [
  {
    id: 'jnl-001',
    code: 'JNL-2026-001',
    description: 'Ghi nhận accrual khuyến mãi tháng 1/2026',
    status: 'POSTED',
    postingDate: format(subDays(today, 3), 'yyyy-MM-dd'),
    period: '2026-01',
    totalDebit: 42500000,
    totalCredit: 42500000,
    lines: [
      { accountCode: '6410', accountName: 'Chi phí khuyến mãi', debit: 42500000, credit: 0 },
      { accountCode: '3388', accountName: 'Phải trả KH', debit: 0, credit: 42500000 },
    ],
    reference: 'ACC-2026-001',
    referenceType: 'ACCRUAL',
    postedAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
    postedById: 'user-004',
  },
  {
    id: 'jnl-002',
    code: 'JNL-2026-002',
    description: 'Ghi nhận accrual hoàn tiền tháng 12/2025',
    status: 'POSTED',
    postingDate: format(subDays(today, 25), 'yyyy-MM-dd'),
    period: '2025-12',
    totalDebit: 92000000,
    totalCredit: 92000000,
    lines: [
      { accountCode: '6420', accountName: 'Chi phí hoàn tiền', debit: 92000000, credit: 0 },
      { accountCode: '3388', accountName: 'Phải trả KH', debit: 0, credit: 92000000 },
    ],
    reference: 'ACC-2026-003',
    referenceType: 'ACCRUAL',
    postedAt: format(subDays(today, 25), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 28), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 25), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
    postedById: 'user-004',
  },
  {
    id: 'jnl-003',
    code: 'JNL-2026-003',
    description: 'Thanh toán claim CLM-2026-002',
    status: 'POSTED',
    postingDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    period: '2026-01',
    totalDebit: 35000000,
    totalCredit: 35000000,
    lines: [
      { accountCode: '3388', accountName: 'Phải trả KH', debit: 35000000, credit: 0 },
      { accountCode: '1121', accountName: 'Tiền gửi ngân hàng', debit: 0, credit: 35000000 },
    ],
    reference: 'CLM-2026-002',
    referenceType: 'CLAIM_PAYMENT',
    postedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 6), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
    postedById: 'user-004',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// CHEQUES/PAYMENTS
// ═══════════════════════════════════════════════════════════════════════

export const chequeStatuses = ['DRAFT', 'ISSUED', 'DELIVERED', 'CASHED', 'CANCELLED', 'BOUNCED'] as const;

export const mockCheques = [
  {
    id: 'chq-001',
    code: 'CHQ-2026-001',
    chequeNumber: '0012345678',
    bankName: 'Vietcombank',
    bankAccount: '0071001234567',
    payee: 'Siêu thị CoopMart',
    customerId: 'cust-001',
    amount: 35000000,
    issueDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    dueDate: format(addDays(today, 10), 'yyyy-MM-dd'),
    status: 'ISSUED',
    claimId: 'claim-002',
    claimCode: 'CLM-2026-002',
    journalId: 'jnl-003',
    notes: 'Thanh toán claim tháng 2',
    createdAt: format(subDays(today, 6), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
    issuedById: 'user-002',
  },
  {
    id: 'chq-002',
    code: 'CHQ-2026-002',
    chequeNumber: '0012345679',
    bankName: 'Vietcombank',
    bankAccount: '0071001234567',
    payee: 'Siêu thị CoopMart',
    customerId: 'cust-001',
    amount: 25000000,
    issueDate: format(today, 'yyyy-MM-dd'),
    dueDate: format(addDays(today, 15), 'yyyy-MM-dd'),
    status: 'DRAFT',
    claimId: 'claim-001',
    claimCode: 'CLM-2026-001',
    notes: 'Thanh toán claim tháng 1',
    createdAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-004',
  },
];

// Finance Stats
export const mockFinanceStats = {
  totalAccruals: mockAccruals.reduce((sum, a) => sum + a.estimatedAmount, 0),
  postedAccruals: mockAccruals.filter(a => a.status === 'POSTED').reduce((sum, a) => sum + (a.actualAmount || 0), 0),
  pendingDeductions: mockDeductions.filter(d => d.status === 'PENDING').reduce((sum, d) => sum + d.amount, 0),
  processedDeductions: mockDeductions.filter(d => d.status === 'PROCESSED').reduce((sum, d) => sum + d.amount, 0),
  outstandingCheques: mockCheques.filter(c => c.status === 'ISSUED').reduce((sum, c) => sum + c.amount, 0),
  totalJournalEntries: mockJournals.length,
};

export type Accrual = typeof mockAccruals[0];
export type Deduction = typeof mockDeductions[0];
export type Journal = typeof mockJournals[0];
export type Cheque = typeof mockCheques[0];
