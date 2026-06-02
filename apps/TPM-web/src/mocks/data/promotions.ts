// ══════════════════════════════════════════════════════════════════════════════
//                    MOCK DATA: PROMOTIONS
// ══════════════════════════════════════════════════════════════════════════════

import { addDays, subDays, format } from 'date-fns';

const today = new Date();

export const promotionStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const;
export const promotionTypes = ['DISCOUNT', 'BUNDLE', 'GIFT', 'REBATE', 'DISPLAY', 'VOLUME'] as const;

export const mockPromotions = [
  {
    id: 'promo-001',
    code: 'SUMMER-2026',
    name: 'Khuyến mãi Hè 2026',
    description: 'Chương trình khuyến mãi mùa hè với giảm giá 20% cho tất cả sản phẩm',
    type: 'DISCOUNT',
    status: 'ACTIVE',
    startDate: format(subDays(today, 10), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 50), 'yyyy-MM-dd'),
    budget: 500000000,
    spentAmount: 125000000,
    targetRevenue: 2000000000,
    actualRevenue: 580000000,
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    products: ['prod-001', 'prod-002', 'prod-003'],
    regions: ['HCM', 'HN', 'DN'],
    createdAt: format(subDays(today, 30), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 2), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-001',
    approvedById: 'user-002',
    approvedAt: format(subDays(today, 25), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'promo-002',
    code: 'TET-2026',
    name: 'Khuyến mãi Tết Nguyên Đán',
    description: 'Chương trình khuyến mãi đặc biệt dịp Tết với quà tặng hấp dẫn',
    type: 'GIFT',
    status: 'PENDING',
    startDate: format(addDays(today, 20), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 45), 'yyyy-MM-dd'),
    budget: 800000000,
    spentAmount: 0,
    targetRevenue: 3500000000,
    actualRevenue: 0,
    customerId: 'cust-002',
    customerName: 'Siêu thị Big C',
    products: ['prod-001', 'prod-004', 'prod-005'],
    regions: ['HCM', 'HN'],
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 1), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-001',
  },
  {
    id: 'promo-003',
    code: 'BUNDLE-Q1',
    name: 'Combo tiết kiệm Q1',
    description: 'Mua 2 tặng 1 cho các sản phẩm chọn lọc',
    type: 'BUNDLE',
    status: 'APPROVED',
    startDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 35), 'yyyy-MM-dd'),
    budget: 300000000,
    spentAmount: 0,
    targetRevenue: 1200000000,
    actualRevenue: 0,
    customerId: 'cust-003',
    customerName: 'VinMart',
    products: ['prod-002', 'prod-003'],
    regions: ['HCM'],
    createdAt: format(subDays(today, 10), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-002',
    approvedById: 'user-003',
    approvedAt: format(subDays(today, 3), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'promo-004',
    code: 'REBATE-2026',
    name: 'Chương trình hoàn tiền',
    description: 'Hoàn tiền 5% cho đơn hàng trên 10 triệu',
    type: 'REBATE',
    status: 'COMPLETED',
    startDate: format(subDays(today, 60), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    budget: 200000000,
    spentAmount: 185000000,
    targetRevenue: 1500000000,
    actualRevenue: 1620000000,
    customerId: 'cust-001',
    customerName: 'Siêu thị CoopMart',
    products: ['prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005'],
    regions: ['HCM', 'HN', 'DN', 'CT'],
    createdAt: format(subDays(today, 90), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-001',
    approvedById: 'user-002',
    approvedAt: format(subDays(today, 85), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    completedAt: format(subDays(today, 5), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
  },
  {
    id: 'promo-005',
    code: 'DISPLAY-001',
    name: 'Trưng bày sản phẩm mới',
    description: 'Hỗ trợ chi phí trưng bày cho sản phẩm mới ra mắt',
    type: 'DISPLAY',
    status: 'DRAFT',
    startDate: format(addDays(today, 30), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 90), 'yyyy-MM-dd'),
    budget: 150000000,
    spentAmount: 0,
    targetRevenue: 600000000,
    actualRevenue: 0,
    customerId: 'cust-004',
    customerName: 'Lotte Mart',
    products: ['prod-006'],
    regions: ['HCM', 'HN'],
    createdAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(today, 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: 'user-001',
  },
];

// Generate more promotions for pagination testing
for (let i = 6; i <= 24; i++) {
  const randomStatus = promotionStatuses[Math.floor(Math.random() * promotionStatuses.length)];
  const randomType = promotionTypes[Math.floor(Math.random() * promotionTypes.length)];
  const budget = Math.floor(Math.random() * 500000000) + 100000000;
  const spentPercent = randomStatus === 'ACTIVE' ? Math.random() * 0.5 : 
                       randomStatus === 'COMPLETED' ? 0.8 + Math.random() * 0.2 : 0;
  
  mockPromotions.push({
    id: `promo-${String(i).padStart(3, '0')}`,
    code: `PROMO-${String(i).padStart(3, '0')}`,
    name: `Chương trình khuyến mãi ${i}`,
    description: `Mô tả cho chương trình khuyến mãi số ${i}`,
    type: randomType,
    status: randomStatus,
    startDate: format(addDays(today, Math.floor(Math.random() * 60) - 30), 'yyyy-MM-dd'),
    endDate: format(addDays(today, Math.floor(Math.random() * 90) + 30), 'yyyy-MM-dd'),
    budget: budget,
    spentAmount: Math.floor(budget * spentPercent),
    targetRevenue: budget * 4,
    actualRevenue: Math.floor(budget * 4 * spentPercent * (0.8 + Math.random() * 0.4)),
    customerId: `cust-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
    customerName: ['Siêu thị CoopMart', 'Big C', 'VinMart', 'Lotte Mart', 'AEON'][Math.floor(Math.random() * 5)],
    products: [`prod-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`],
    regions: ['HCM', 'HN', 'DN'].slice(0, Math.floor(Math.random() * 3) + 1),
    createdAt: format(subDays(today, Math.floor(Math.random() * 60)), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    updatedAt: format(subDays(today, Math.floor(Math.random() * 10)), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    createdById: `user-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
  });
}

export const mockPromotionStats = {
  total: mockPromotions.length,
  active: mockPromotions.filter(p => p.status === 'ACTIVE').length,
  pending: mockPromotions.filter(p => p.status === 'PENDING').length,
  completed: mockPromotions.filter(p => p.status === 'COMPLETED').length,
  draft: mockPromotions.filter(p => p.status === 'DRAFT').length,
  totalBudget: mockPromotions.reduce((sum, p) => sum + p.budget, 0),
  totalSpent: mockPromotions.reduce((sum, p) => sum + p.spentAmount, 0),
  totalRevenue: mockPromotions.reduce((sum, p) => sum + p.actualRevenue, 0),
};

export type Promotion = typeof mockPromotions[0];
