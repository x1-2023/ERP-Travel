// ══════════════════════════════════════════════════════════════════════════════
//                    MOCK DATA: CLAIMS
// ══════════════════════════════════════════════════════════════════════════════

import { subDays, format } from 'date-fns';

const today = new Date();

export const claimStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'] as const;
export const claimTypes = ['DISCOUNT', 'REBATE', 'DISPLAY', 'DAMAGE', 'RETURN', 'OTHER'] as const;

export const mockClaims = [
  {
    id: 'claim-001',
    code: 'CLM-2026-001',
    promotionId: 'promo-001',
    promotionCode: 'SUMMER-2026',
    promotionName: 'Khuyến mãi Hè 2026',
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    type: 'DISCOUNT',
    status: 'APPROVED',
    amount: 25000000,
    approvedAmount: 25000000,
    description: 'Claim cho chiết khấu tháng 1',
    evidenceUrls: ['/uploads/invoice-001.pdf', '/uploads/receipt-001.jpg'],
    submittedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    reviewedAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    approvedAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 7), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-001',
    reviewedById: 'user-002',
    approvedById: 'user-003',
    notes: 'Đã xác minh với chứng từ đầy đủ',
  },
  {
    id: 'claim-002',
    code: 'CLM-2026-002',
    promotionId: 'promo-001',
    promotionCode: 'SUMMER-2026',
    promotionName: 'Khuyến mãi Hè 2026',
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    type: 'DISCOUNT',
    status: 'PAID',
    amount: 35000000,
    approvedAmount: 35000000,
    paidAmount: 35000000,
    description: 'Claim cho chiết khấu tháng 2',
    evidenceUrls: ['/uploads/invoice-002.pdf'],
    submittedAt: format(subDays(today, 15), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    reviewedAt: format(subDays(today, 12), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    approvedAt: format(subDays(today, 10), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    paidAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 17), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-001',
    reviewedById: 'user-002',
    approvedById: 'user-003',
    paymentRef: 'PAY-2026-0052',
  },
  {
    id: 'claim-003',
    code: 'CLM-2026-003',
    promotionId: 'promo-004',
    promotionCode: 'REBATE-2026',
    promotionName: 'Chương trình hoàn tiền',
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    type: 'REBATE',
    status: 'UNDER_REVIEW',
    amount: 45000000,
    description: 'Claim hoàn tiền Q4-2025',
    evidenceUrls: ['/uploads/invoice-003.pdf', '/uploads/sales-report.xlsx'],
    submittedAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-001',
    reviewedById: 'user-002',
  },
  {
    id: 'claim-004',
    code: 'CLM-2026-004',
    promotionId: 'promo-003',
    promotionCode: 'BUNDLE-Q1',
    promotionName: 'Combo tiết kiệm Q1',
    customerId: 'cust-003',
    customerName: 'VinMart',
    type: 'DISCOUNT',
    status: 'SUBMITTED',
    amount: 18000000,
    description: 'Claim chiết khấu combo',
    evidenceUrls: ['/uploads/invoice-004.pdf'],
    submittedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-002',
  },
  {
    id: 'claim-005',
    code: 'CLM-2026-005',
    promotionId: 'promo-001',
    promotionCode: 'SUMMER-2026',
    promotionName: 'Khuyến mãi Hè 2026',
    customerId: 'cust-002',
    customerName: 'Siêu thị Big C',
    type: 'DISPLAY',
    status: 'REJECTED',
    amount: 15000000,
    description: 'Claim hỗ trợ trưng bày',
    evidenceUrls: ['/uploads/photo-001.jpg'],
    submittedAt: format(subDays(today, 10), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    reviewedAt: format(subDays(today, 8), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    rejectedAt: format(subDays(today, 7), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, 12), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 7), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-002',
    reviewedById: 'user-003',
    rejectionReason: 'Chứng từ không hợp lệ, thiếu hình ảnh trưng bày thực tế',
  },
];

// Generate more claims
for (let i = 6; i <= 12; i++) {
  const randomStatus = claimStatuses[Math.floor(Math.random() * claimStatuses.length)];
  const randomType = claimTypes[Math.floor(Math.random() * claimTypes.length)];
  const amount = Math.floor(Math.random() * 50000000) + 5000000;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockClaims as any[]).push({
    id: `claim-${String(i).padStart(3, '0')}`,
    code: `CLM-2026-${String(i).padStart(3, '0')}`,
    promotionId: `promo-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
    promotionCode: `PROMO-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
    promotionName: `Chương trình KM ${Math.floor(Math.random() * 5) + 1}`,
    customerId: `cust-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
    customerName: ['CoopMart', 'Big C', 'VinMart', 'Lotte Mart', 'AEON'][Math.floor(Math.random() * 5)],
    type: randomType,
    status: randomStatus,
    amount: amount,
    approvedAmount: randomStatus === 'APPROVED' || randomStatus === 'PAID' ? amount : undefined,
    paidAmount: randomStatus === 'PAID' ? amount : undefined,
    description: `Claim số ${i}`,
    evidenceUrls: [`/uploads/invoice-${i}.pdf`],
    submittedAt: format(subDays(today, Math.floor(Math.random() * 20)), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdAt: format(subDays(today, Math.floor(Math.random() * 25)), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, Math.floor(Math.random() * 5)), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: `user-${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`,
  });
}

export const mockClaimStats = {
  total: mockClaims.length,
  submitted: mockClaims.filter(c => c.status === 'SUBMITTED').length,
  underReview: mockClaims.filter(c => c.status === 'UNDER_REVIEW').length,
  approved: mockClaims.filter(c => c.status === 'APPROVED').length,
  paid: mockClaims.filter(c => c.status === 'PAID').length,
  rejected: mockClaims.filter(c => c.status === 'REJECTED').length,
  totalAmount: mockClaims.reduce((sum, c) => sum + c.amount, 0),
  approvedAmount: mockClaims.filter(c => c.approvedAmount).reduce((sum, c) => sum + (c.approvedAmount || 0), 0),
  paidAmount: mockClaims.filter(c => c.paidAmount).reduce((sum, c) => sum + (c.paidAmount || 0), 0),
};

export type Claim = typeof mockClaims[0];
