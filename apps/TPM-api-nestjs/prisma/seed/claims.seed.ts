import { PrismaClient, ClaimStatus } from '@prisma/client';

interface SeedDeps {
  customers: { id: string }[];
  promotions: { id: string }[];
  users: { id: string; role: string }[];
}

export async function seedClaims(
  prisma: PrismaClient,
  deps: SeedDeps,
) {
  console.log('  Seeding claims and settlements...');

  const financeUsers = deps.users.filter((u) => u.role === 'FINANCE');
  const managerUsers = deps.users.filter((u) => u.role === 'MANAGER');

  const claimsData = [
    // Settled claims (from completed promotions)
    {
      code: 'CLM-2026-001',
      amount: 120000000,
      status: ClaimStatus.SETTLED,
      claimDate: new Date('2026-02-16'),
      description: 'Claim hoan tra khuyen mai Tet - Big C',
      customerId: deps.customers[0].id,
      promotionId: deps.promotions[0].id,
      reviewedById: financeUsers[0].id,
    },
    {
      code: 'CLM-2026-002',
      amount: 95000000,
      status: ClaimStatus.SETTLED,
      claimDate: new Date('2026-02-17'),
      description: 'Claim khuyen mai Tet - AEON display',
      customerId: deps.customers[3].id,
      promotionId: deps.promotions[7].id,
      reviewedById: financeUsers[0].id,
    },
    {
      code: 'CLM-2026-003',
      amount: 180000000,
      status: ClaimStatus.SETTLED,
      claimDate: new Date('2026-02-18'),
      description: 'Claim phan 2 khuyen mai Tet - Big C',
      customerId: deps.customers[0].id,
      promotionId: deps.promotions[0].id,
      reviewedById: financeUsers[1].id,
    },
    // Approved claims (waiting for settlement)
    {
      code: 'CLM-2026-004',
      amount: 75000000,
      status: ClaimStatus.APPROVED,
      claimDate: new Date('2026-02-20'),
      description: 'Claim Valentine combo - VinMart',
      customerId: deps.customers[1].id,
      promotionId: deps.promotions[1].id,
      reviewedById: managerUsers[0].id,
    },
    {
      code: 'CLM-2026-005',
      amount: 60000000,
      status: ClaimStatus.APPROVED,
      claimDate: new Date('2026-02-22'),
      description: 'Claim flash sale Shopee',
      customerId: deps.customers[13].id,
      promotionId: deps.promotions[5].id,
      reviewedById: financeUsers[0].id,
    },
    // Matched claims
    {
      code: 'CLM-2026-006',
      amount: 45000000,
      status: ClaimStatus.MATCHED,
      claimDate: new Date('2026-02-25'),
      description: 'Claim khuyen mai Valentine - VinMart (matched POP)',
      customerId: deps.customers[1].id,
      promotionId: deps.promotions[1].id,
      reviewedById: null,
    },
    // Pending claims
    {
      code: 'CLM-2026-007',
      amount: 88000000,
      status: ClaimStatus.PENDING,
      claimDate: new Date('2026-03-01'),
      description: 'Claim Shopee flash sale - phan 2',
      customerId: deps.customers[13].id,
      promotionId: deps.promotions[5].id,
      reviewedById: null,
    },
    {
      code: 'CLM-2026-008',
      amount: 32000000,
      status: ClaimStatus.PENDING,
      claimDate: new Date('2026-03-02'),
      description: 'Claim GT distribution - Mekong',
      customerId: deps.customers[9].id,
      promotionId: deps.promotions[6].id,
      reviewedById: null,
    },
    {
      code: 'CLM-2026-009',
      amount: 55000000,
      status: ClaimStatus.PENDING,
      claimDate: new Date('2026-03-05'),
      description: 'Claim hoan tra Co.op Mart',
      customerId: deps.customers[2].id,
      promotionId: null,
      reviewedById: null,
    },
    // Disputed claims
    {
      code: 'CLM-2026-010',
      amount: 150000000,
      status: ClaimStatus.DISPUTED,
      claimDate: new Date('2026-02-20'),
      description: 'Claim AEON display - so lieu khong khop',
      customerId: deps.customers[3].id,
      promotionId: deps.promotions[7].id,
      reviewedById: managerUsers[1].id,
    },
    // Rejected claim
    {
      code: 'CLM-2026-011',
      amount: 200000000,
      status: ClaimStatus.REJECTED,
      claimDate: new Date('2026-02-10'),
      description: 'Claim tu choi - thieu chung tu hop le',
      customerId: deps.customers[5].id,
      promotionId: deps.promotions[6].id,
      reviewedById: financeUsers[1].id,
    },
    // Another pending
    {
      code: 'CLM-2026-012',
      amount: 42000000,
      status: ClaimStatus.PENDING,
      claimDate: new Date('2026-03-08'),
      description: 'Claim Highland Coffee HORECA',
      customerId: deps.customers[10].id,
      promotionId: null,
      reviewedById: null,
    },
  ];

  const claims = await prisma.$transaction(
    claimsData.map((c) =>
      prisma.claim.create({
        data: {
          code: c.code,
          amount: c.amount,
          status: c.status,
          claimDate: c.claimDate,
          description: c.description,
          customerId: c.customerId,
          promotionId: c.promotionId,
          reviewedById: c.reviewedById,
        },
      }),
    ),
  );

  // --- Create settlements for SETTLED claims ---
  const settledClaims = claims.filter(
    (_, i) => claimsData[i].status === ClaimStatus.SETTLED,
  );

  const settlementsData = [
    {
      claimId: settledClaims[0].id,
      settledAmount: 118000000, // slight variance
      variance: -2000000,
      notes: 'Settled with minor deduction for missing receipts',
    },
    {
      claimId: settledClaims[1].id,
      settledAmount: 95000000,
      variance: 0,
      notes: 'Full settlement - all documentation verified',
    },
    {
      claimId: settledClaims[2].id,
      settledAmount: 170000000,
      variance: -10000000,
      notes: 'Partial settlement - 10M deducted for damaged goods',
    },
  ];

  const settlements = await prisma.$transaction(
    settlementsData.map((s) =>
      prisma.settlement.create({
        data: {
          settledAmount: s.settledAmount,
          variance: s.variance,
          notes: s.notes,
          claimId: s.claimId,
        },
      }),
    ),
  );

  console.log(`  Created ${claims.length} claims, ${settlements.length} settlements`);
  return { claims, settlements };
}
