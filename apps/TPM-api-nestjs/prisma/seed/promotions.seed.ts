import { PrismaClient, PromotionStatus } from '@prisma/client';

interface SeedDeps {
  companyId: string;
  customers: { id: string; name: string }[];
  funds: { id: string }[];
  users: { id: string; role: string }[];
}

export async function seedPromotions(
  prisma: PrismaClient,
  deps: SeedDeps,
) {
  console.log('  Seeding promotions...');

  // Pick KAM users for createdById
  const kamUsers = deps.users.filter((u) => u.role === 'KAM');
  const managerUsers = deps.users.filter((u) => u.role === 'MANAGER');

  const promotionsData = [
    {
      code: 'PROMO-2026-001',
      name: 'Tet Nguyen Dan 2026 - Pepsi',
      description: 'Chuong trinh khuyen mai Tet Nguyen Dan - giam gia Pepsi 15%',
      status: PromotionStatus.COMPLETED,
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-02-15'),
      budget: 500000000,
      actualSpend: 480000000,
      customerId: deps.customers[0].id, // Big C
      fundId: deps.funds[0].id,
      createdById: kamUsers[0].id,
    },
    {
      code: 'PROMO-2026-002',
      name: 'Valentine Combo - 7UP & Sting',
      description: 'Mua 2 tang 1 combo 7UP + Sting cho ngay Valentine',
      status: PromotionStatus.EXECUTING,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-28'),
      budget: 300000000,
      actualSpend: 150000000,
      customerId: deps.customers[1].id, // VinMart
      fundId: deps.funds[0].id,
      createdById: kamUsers[1].id,
    },
    {
      code: 'PROMO-2026-003',
      name: 'He Vui Khoe - Aquafina',
      description: 'Khuyen mai mua he - giam 20% Aquafina khi mua thung',
      status: PromotionStatus.CONFIRMED,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-07-31'),
      budget: 400000000,
      actualSpend: null,
      customerId: deps.customers[2].id, // Co.op Mart
      fundId: deps.funds[1].id,
      createdById: kamUsers[0].id,
    },
    {
      code: 'PROMO-2026-004',
      name: 'Back To School - Snack Combo',
      description: 'Khuyen mai mua lai truong - combo Lay\'s + O\'Star',
      status: PromotionStatus.PLANNED,
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-09-30'),
      budget: 250000000,
      actualSpend: null,
      customerId: deps.customers[5].id, // Dai Ly Hoang Long (GT)
      fundId: deps.funds[3].id,
      createdById: kamUsers[2].id,
    },
    {
      code: 'PROMO-2026-005',
      name: 'HORECA Summer Push - Mirinda',
      description: 'Khuyen mai kenh HORECA - Mirinda trung bay noi bat',
      status: PromotionStatus.DRAFT,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-31'),
      budget: 200000000,
      actualSpend: null,
      customerId: deps.customers[10].id, // Highland Coffee
      fundId: deps.funds[1].id,
      createdById: kamUsers[3].id,
    },
    {
      code: 'PROMO-2026-006',
      name: 'Flash Sale Shopee - Pepsi',
      description: 'Flash sale Shopee - giam 25% Pepsi 330ml',
      status: PromotionStatus.EXECUTING,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-03-31'),
      budget: 350000000,
      actualSpend: 120000000,
      customerId: deps.customers[13].id, // Shopee
      fundId: deps.funds[2].id,
      createdById: kamUsers[1].id,
    },
    {
      code: 'PROMO-2026-007',
      name: 'GT Distribution Drive Q1',
      description: 'Day manh phan phoi kenh GT khu vuc Mien Nam',
      status: PromotionStatus.CANCELLED,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      budget: 150000000,
      actualSpend: 25000000,
      customerId: deps.customers[9].id, // Dai Ly Mekong
      fundId: deps.funds[3].id,
      createdById: kamUsers[0].id,
    },
    {
      code: 'PROMO-2026-008',
      name: 'Display Premium AEON - Tet',
      description: 'Trung bay quay rieng Pepsi tai AEON dip Tet',
      status: PromotionStatus.COMPLETED,
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-02-10'),
      budget: 600000000,
      actualSpend: 590000000,
      customerId: deps.customers[3].id, // AEON
      fundId: deps.funds[2].id,
      createdById: kamUsers[2].id,
    },
  ];

  const promotions = await prisma.$transaction(
    promotionsData.map((p) =>
      prisma.promotion.create({
        data: {
          code: p.code,
          name: p.name,
          description: p.description,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          budget: p.budget,
          actualSpend: p.actualSpend,
          customerId: p.customerId,
          fundId: p.fundId,
          createdById: p.createdById,
        },
      }),
    ),
  );

  console.log(`  Created ${promotions.length} promotions`);
  return promotions;
}
