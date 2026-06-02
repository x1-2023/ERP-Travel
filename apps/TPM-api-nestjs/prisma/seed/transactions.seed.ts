import { PrismaClient, TransactionType } from '@prisma/client';

interface SeedDeps {
  funds: { id: string }[];
  promotions: { id: string }[];
  claims: { id: string }[];
}

export async function seedTransactions(
  prisma: PrismaClient,
  deps: SeedDeps,
) {
  console.log('  Seeding transactions...');

  const transactionsData = [
    // Budget allocations to funds
    {
      type: TransactionType.BUDGET_ALLOCATION,
      amount: 3000000000,
      description: 'Phan bo ngan sach Q1 vao quy khuyen mai co dinh',
      fundId: deps.funds[0].id,
      promotionId: null,
      claimId: null,
    },
    {
      type: TransactionType.BUDGET_ALLOCATION,
      amount: 2000000000,
      description: 'Phan bo ngan sach Q1 vao quy khuyen mai bien doi',
      fundId: deps.funds[1].id,
      promotionId: null,
      claimId: null,
    },
    // Commitments from promotions
    {
      type: TransactionType.COMMITMENT,
      amount: 500000000,
      description: 'Cam ket ngan sach - PROMO Tet Pepsi',
      fundId: deps.funds[0].id,
      promotionId: deps.promotions[0].id,
      claimId: null,
    },
    {
      type: TransactionType.COMMITMENT,
      amount: 300000000,
      description: 'Cam ket ngan sach - PROMO Valentine 7UP',
      fundId: deps.funds[0].id,
      promotionId: deps.promotions[1].id,
      claimId: null,
    },
    {
      type: TransactionType.COMMITMENT,
      amount: 400000000,
      description: 'Cam ket ngan sach - PROMO He Vui Khoe Aquafina',
      fundId: deps.funds[1].id,
      promotionId: deps.promotions[2].id,
      claimId: null,
    },
    {
      type: TransactionType.COMMITMENT,
      amount: 350000000,
      description: 'Cam ket ngan sach - PROMO Flash Sale Shopee',
      fundId: deps.funds[2].id,
      promotionId: deps.promotions[5].id,
      claimId: null,
    },
    {
      type: TransactionType.COMMITMENT,
      amount: 600000000,
      description: 'Cam ket ngan sach - PROMO Display Premium AEON',
      fundId: deps.funds[2].id,
      promotionId: deps.promotions[7].id,
      claimId: null,
    },
    // Claim settlements
    {
      type: TransactionType.CLAIM_SETTLEMENT,
      amount: 118000000,
      description: 'Thanh toan claim CLM-001 - Big C Tet',
      fundId: deps.funds[0].id,
      promotionId: deps.promotions[0].id,
      claimId: deps.claims[0].id,
    },
    {
      type: TransactionType.CLAIM_SETTLEMENT,
      amount: 95000000,
      description: 'Thanh toan claim CLM-002 - AEON display',
      fundId: deps.funds[2].id,
      promotionId: deps.promotions[7].id,
      claimId: deps.claims[1].id,
    },
    {
      type: TransactionType.CLAIM_SETTLEMENT,
      amount: 170000000,
      description: 'Thanh toan claim CLM-003 - Big C Tet phan 2',
      fundId: deps.funds[0].id,
      promotionId: deps.promotions[0].id,
      claimId: deps.claims[2].id,
    },
    // Release (cancelled promotion)
    {
      type: TransactionType.RELEASE,
      amount: 125000000,
      description: 'Giai phong ngan sach - PROMO GT huy bo',
      fundId: deps.funds[3].id,
      promotionId: deps.promotions[6].id,
      claimId: null,
    },
    // Adjustments
    {
      type: TransactionType.ADJUSTMENT,
      amount: -50000000,
      description: 'Dieu chinh giam quy MT theo ket qua audit',
      fundId: deps.funds[2].id,
      promotionId: null,
      claimId: null,
    },
    {
      type: TransactionType.ADJUSTMENT,
      amount: 100000000,
      description: 'Bo sung ngan sach GT tu quy du phong',
      fundId: deps.funds[3].id,
      promotionId: null,
      claimId: null,
    },
    // Additional commitment
    {
      type: TransactionType.COMMITMENT,
      amount: 200000000,
      description: 'Cam ket ngan sach - PROMO HORECA Mirinda',
      fundId: deps.funds[1].id,
      promotionId: deps.promotions[4].id,
      claimId: null,
    },
    // Additional budget allocation
    {
      type: TransactionType.BUDGET_ALLOCATION,
      amount: 1500000000,
      description: 'Phan bo ngan sach Q1 vao quy On-Invoice MT',
      fundId: deps.funds[2].id,
      promotionId: null,
      claimId: null,
    },
  ];

  const transactions = await prisma.$transaction(
    transactionsData.map((t) =>
      prisma.transaction.create({
        data: {
          type: t.type,
          amount: t.amount,
          description: t.description,
          fundId: t.fundId,
          promotionId: t.promotionId,
          claimId: t.claimId,
        },
      }),
    ),
  );

  console.log(`  Created ${transactions.length} transactions`);
  return transactions;
}
