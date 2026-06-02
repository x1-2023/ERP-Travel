import {
  PrismaClient,
  BudgetFundType,
  BudgetApprovalStatus,
  FundType,
  AllocationStatus,
} from '@prisma/client';

interface GeoUnits {
  country: { id: string };
  regions: { id: string }[];
  provinces: { id: string }[];
}

export async function seedBudgets(
  prisma: PrismaClient,
  companyId: string,
  adminUserId: string,
  geoUnits: GeoUnits,
) {
  console.log('  Seeding budgets, allocations, and funds...');

  // --- 4 Quarterly Budgets for 2026 ---
  const budgetsData = [
    {
      code: 'BDG-2026-Q1',
      name: 'Ngan sach Q1/2026',
      description: 'Trade marketing budget for Q1 2026',
      category: 'Trade Marketing',
      fundType: BudgetFundType.PROMOTIONAL,
      year: 2026,
      quarter: 1,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      totalAmount: 5000000000, // 5 billion VND
      allocatedAmount: 4000000000,
      spentAmount: 1200000000,
      approvalStatus: BudgetApprovalStatus.APPROVED,
      approvalLevel: 3,
      currentLevel: 3,
      status: 'APPROVED',
    },
    {
      code: 'BDG-2026-Q2',
      name: 'Ngan sach Q2/2026',
      description: 'Trade marketing budget for Q2 2026',
      category: 'Trade Marketing',
      fundType: BudgetFundType.TACTICAL,
      year: 2026,
      quarter: 2,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
      totalAmount: 4500000000,
      allocatedAmount: 2000000000,
      spentAmount: 0,
      approvalStatus: BudgetApprovalStatus.APPROVED,
      approvalLevel: 3,
      currentLevel: 3,
      status: 'APPROVED',
    },
    {
      code: 'BDG-2026-Q3',
      name: 'Ngan sach Q3/2026',
      description: 'Trade marketing budget for Q3 2026 - Summer push',
      category: 'Trade Marketing',
      fundType: BudgetFundType.TRADE_SPEND,
      year: 2026,
      quarter: 3,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-09-30'),
      totalAmount: 6000000000,
      allocatedAmount: 0,
      spentAmount: 0,
      approvalStatus: BudgetApprovalStatus.SUBMITTED,
      approvalLevel: 3,
      currentLevel: 1,
      status: 'SUBMITTED',
    },
    {
      code: 'BDG-2026-Q4',
      name: 'Ngan sach Q4/2026',
      description: 'Trade marketing budget for Q4 2026 - Year end',
      category: 'Sales',
      fundType: BudgetFundType.FIXED_INVESTMENT,
      year: 2026,
      quarter: 4,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      totalAmount: 5500000000,
      allocatedAmount: 0,
      spentAmount: 0,
      approvalStatus: BudgetApprovalStatus.DRAFT,
      approvalLevel: 0,
      currentLevel: 0,
      status: 'DRAFT',
    },
  ];

  const budgets = await prisma.$transaction(
    budgetsData.map((b) =>
      prisma.budget.create({
        data: {
          code: b.code,
          name: b.name,
          description: b.description,
          category: b.category,
          fundType: b.fundType,
          year: b.year,
          quarter: b.quarter,
          startDate: b.startDate,
          endDate: b.endDate,
          totalAmount: b.totalAmount,
          allocatedAmount: b.allocatedAmount,
          spentAmount: b.spentAmount,
          approvalStatus: b.approvalStatus,
          approvalLevel: b.approvalLevel,
          currentLevel: b.currentLevel,
          status: b.status,
          isActive: true,
          companyId,
          createdBy: adminUserId,
        },
      }),
    ),
  );

  // --- Budget Allocations for Q1 budget (the approved one) ---
  const q1Budget = budgets[0];

  // Country-level allocation
  const countryAlloc = await prisma.budgetAllocation.create({
    data: {
      code: 'ALLOC-Q1-VN',
      budgetId: q1Budget.id,
      geographicUnitId: geoUnits.country.id,
      allocatedAmount: 4000000000,
      spentAmount: 1200000000,
      childrenAllocated: 4000000000,
      availableToAllocate: 0,
      status: AllocationStatus.APPROVED,
      createdBy: adminUserId,
    },
  });

  // Region-level allocations
  const regionAllocData = [
    { code: 'ALLOC-Q1-N', geoId: geoUnits.regions[0].id, allocated: 1500000000, spent: 500000000 },
    { code: 'ALLOC-Q1-C', geoId: geoUnits.regions[1].id, allocated: 1000000000, spent: 300000000 },
    { code: 'ALLOC-Q1-S', geoId: geoUnits.regions[2].id, allocated: 1500000000, spent: 400000000 },
  ];

  const regionAllocs = await prisma.$transaction(
    regionAllocData.map((r) =>
      prisma.budgetAllocation.create({
        data: {
          code: r.code,
          budgetId: q1Budget.id,
          geographicUnitId: r.geoId,
          parentId: countryAlloc.id,
          allocatedAmount: r.allocated,
          spentAmount: r.spent,
          childrenAllocated: 0,
          availableToAllocate: r.allocated - r.spent,
          status: AllocationStatus.APPROVED,
          createdBy: adminUserId,
        },
      }),
    ),
  );

  // --- Funds (linked to company, some to customers) ---
  const fundsData = [
    {
      code: 'FUND-FIX-2026',
      name: 'Quy Khuyen Mai Co Dinh 2026',
      type: FundType.FIXED,
      year: 2026,
      totalBudget: 3000000000,
      committed: 800000000,
      available: 2200000000,
      customerId: null as string | null,
    },
    {
      code: 'FUND-VAR-2026',
      name: 'Quy Khuyen Mai Bien Doi 2026',
      type: FundType.VARIABLE,
      year: 2026,
      totalBudget: 2000000000,
      committed: 350000000,
      available: 1650000000,
      customerId: null as string | null,
    },
    {
      code: 'FUND-FIX-MT-2026',
      name: 'Quy On-Invoice MT 2026',
      type: FundType.FIXED,
      year: 2026,
      totalBudget: 1500000000,
      committed: 400000000,
      available: 1100000000,
      customerId: null as string | null,
    },
    {
      code: 'FUND-VAR-GT-2026',
      name: 'Quy Off-Invoice GT 2026',
      type: FundType.VARIABLE,
      year: 2026,
      totalBudget: 1000000000,
      committed: 200000000,
      available: 800000000,
      customerId: null as string | null,
    },
  ];

  const funds = await prisma.$transaction(
    fundsData.map((f) =>
      prisma.fund.create({
        data: {
          code: f.code,
          name: f.name,
          type: f.type,
          year: f.year,
          totalBudget: f.totalBudget,
          committed: f.committed,
          available: f.available,
          isActive: true,
          companyId,
          customerId: f.customerId,
        },
      }),
    ),
  );

  console.log(`  Created ${budgets.length} budgets, ${regionAllocs.length + 1} allocations, ${funds.length} funds`);

  return {
    budgets,
    allocations: [countryAlloc, ...regionAllocs],
    funds,
  };
}
