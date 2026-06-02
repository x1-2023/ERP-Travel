/**
 * Demo Data Seed
 * Phase 5: Budget & Target Integration
 *
 * Creates sample budgets, targets, allocations, and fund activities
 */

import { PrismaClient, GeographicLevel, Prisma } from '@prisma/client';

const Decimal = Prisma.Decimal;

const prisma = new PrismaClient();

export async function seedDemoData() {
  console.log('📊 Seeding demo data...');

  // Get geographic units for allocations
  const regions = await prisma.geographicUnit.findMany({
    where: { level: GeographicLevel.REGION },
  });

  const provinces = await prisma.geographicUnit.findMany({
    where: { level: GeographicLevel.PROVINCE },
    include: { parent: true },
  });

  if (regions.length === 0) {
    console.log('⚠️ No geographic units found. Run geographic seed first.');
    return;
  }

  // ========================================
  // BUDGETS
  // ========================================
  console.log('  Creating budgets...');

  const budgets = [
    {
      code: 'BUD-2024-Q1-PROMO',
      name: 'Ngân sách Khuyến mãi Q1 2024',
      description: 'Ngân sách cho các chương trình khuyến mãi quý 1 năm 2024',
      category: 'PROMOTIONAL',
      fundType: 'PROMOTIONAL',
      totalAmount: new Decimal(5000000000), // 5 tỷ VND
      spentAmount: new Decimal(3200000000),
      year: 2024,
      quarter: 1,
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
    },
    {
      code: 'BUD-2024-Q1-TRADE',
      name: 'Ngân sách Trade Marketing Q1 2024',
      description: 'Ngân sách cho hoạt động trade marketing quý 1',
      category: 'TRADE_MARKETING',
      fundType: 'TRADE_SPEND',
      totalAmount: new Decimal(3000000000), // 3 tỷ VND
      spentAmount: new Decimal(1800000000),
      year: 2024,
      quarter: 1,
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
    },
    {
      code: 'BUD-2024-Q2-PROMO',
      name: 'Ngân sách Khuyến mãi Q2 2024',
      description: 'Ngân sách cho các chương trình khuyến mãi quý 2 năm 2024',
      category: 'PROMOTIONAL',
      fundType: 'PROMOTIONAL',
      totalAmount: new Decimal(6000000000), // 6 tỷ VND
      spentAmount: new Decimal(1500000000),
      year: 2024,
      quarter: 2,
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
    },
    {
      code: 'BUD-2024-DISPLAY',
      name: 'Ngân sách Trưng bày 2024',
      description: 'Ngân sách cho các chương trình trưng bày cả năm',
      category: 'FIXED_INVESTMENT',
      fundType: 'DISPLAY',
      totalAmount: new Decimal(2000000000), // 2 tỷ VND
      spentAmount: new Decimal(800000000),
      year: 2024,
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
    },
  ];

  const createdBudgets = [];
  for (const budgetData of budgets) {
    const budget = await prisma.budget.upsert({
      where: { code: budgetData.code },
      update: {},
      create: budgetData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });
    createdBudgets.push(budget);
  }
  console.log(`    ✓ Created ${createdBudgets.length} budgets`);

  // ========================================
  // BUDGET ALLOCATIONS
  // ========================================
  console.log('  Creating budget allocations...');

  const mainBudget = createdBudgets[0]; // Q1 Promo budget
  let budgetAllocCount = 0;

  // Allocate to regions
  const regionAllocations: Record<string, string> = {};
  for (const region of regions) {
    const allocAmount = Math.floor(Number(mainBudget.totalAmount) / regions.length);
    const spentAmount = Math.floor(allocAmount * (0.4 + Math.random() * 0.4)); // 40-80% spent

    const allocation = await prisma.budgetAllocation.upsert({
      where: { budgetId_geographicUnitId: { budgetId: mainBudget.id, geographicUnitId: region.id } },
      update: {},
      create: {
        code: `BA-${mainBudget.code}-${region.code}`,
        budgetId: mainBudget.id,
        geographicUnitId: region.id,
        allocatedAmount: new Decimal(allocAmount),
        spentAmount: new Decimal(spentAmount),
        status: 'APPROVED',
      },
    });
    regionAllocations[region.code] = allocation.id;
    budgetAllocCount++;

    // Allocate to some provinces under each region
    const regionProvinces = provinces.filter(p => p.parentId === region.id).slice(0, 3);
    for (const province of regionProvinces) {
      const provAllocAmount = Math.floor(allocAmount / 5);
      const provSpentAmount = Math.floor(provAllocAmount * (0.3 + Math.random() * 0.5));

      await prisma.budgetAllocation.upsert({
        where: { budgetId_geographicUnitId: { budgetId: mainBudget.id, geographicUnitId: province.id } },
        update: {},
        create: {
          code: `BA-${mainBudget.code}-${province.code}`,
          budgetId: mainBudget.id,
          geographicUnitId: province.id,
          parentId: allocation.id,
          allocatedAmount: new Decimal(provAllocAmount),
          spentAmount: new Decimal(provSpentAmount),
          status: 'APPROVED',
        },
      });
      budgetAllocCount++;
    }
  }
  console.log(`    ✓ Created ${budgetAllocCount} budget allocations`);

  // ========================================
  // TARGETS
  // ========================================
  console.log('  Creating targets...');

  const targets = [
    {
      code: 'TGT-2024-Q1-SALES',
      name: 'Mục tiêu Doanh số Q1 2024',
      description: 'Mục tiêu doanh số cho quý 1 năm 2024',
      targetType: 'SALES',
      metric: 'REVENUE_VND',
      totalTarget: new Decimal(50000000000), // 50 tỷ VND
      totalAchieved: new Decimal(38500000000), // 77%
      year: 2024,
      quarter: 1,
      status: 'ACTIVE',
    },
    {
      code: 'TGT-2024-Q1-VOLUME',
      name: 'Mục tiêu Sản lượng Q1 2024',
      description: 'Mục tiêu sản lượng thùng hàng cho quý 1',
      targetType: 'VOLUME',
      metric: 'CASES',
      totalTarget: new Decimal(100000), // 100,000 thùng
      totalAchieved: new Decimal(82000), // 82%
      year: 2024,
      quarter: 1,
      status: 'ACTIVE',
    },
    {
      code: 'TGT-2024-Q2-SALES',
      name: 'Mục tiêu Doanh số Q2 2024',
      description: 'Mục tiêu doanh số cho quý 2 năm 2024',
      targetType: 'SALES',
      metric: 'REVENUE_VND',
      totalTarget: new Decimal(55000000000), // 55 tỷ VND
      totalAchieved: new Decimal(15000000000), // ~27%
      year: 2024,
      quarter: 2,
      status: 'ACTIVE',
    },
  ];

  const createdTargets = [];
  for (const targetData of targets) {
    const { targetType, ...data } = targetData as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const target = await prisma.target.upsert({
      where: { code: data.code },
      update: {},
      create: data,
    });
    createdTargets.push(target);
  }
  console.log(`    ✓ Created ${createdTargets.length} targets`);

  // ========================================
  // TARGET ALLOCATIONS
  // ========================================
  console.log('  Creating target allocations...');

  const mainTarget = createdTargets[0]; // Q1 Sales target
  let targetAllocCount = 0;

  // Allocate to regions
  for (const region of regions) {
    const targetVal = Math.floor(Number(mainTarget.totalTarget) / regions.length);
    const achievedVal = Math.floor(targetVal * (0.6 + Math.random() * 0.35)); // 60-95%

    const allocation = await prisma.targetAllocation.upsert({
      where: { targetId_geographicUnitId: { targetId: mainTarget.id, geographicUnitId: region.id } },
      update: {},
      create: {
        code: `TA-${mainTarget.code}-${region.code}`,
        targetId: mainTarget.id,
        geographicUnitId: region.id,
        targetValue: new Decimal(targetVal),
        achievedValue: new Decimal(achievedVal),
        metric: 'REVENUE_VND',
        progressPercent: new Decimal((achievedVal / targetVal) * 100),
        status: 'APPROVED',
      },
    });
    targetAllocCount++;

    // Allocate to some provinces
    const regionProvinces = provinces.filter(p => p.parentId === region.id).slice(0, 3);
    let childrenTotal = 0;
    for (const province of regionProvinces) {
      const provTargetVal = Math.floor(targetVal / 5);
      const provAchievedVal = Math.floor(provTargetVal * (0.5 + Math.random() * 0.5));
      childrenTotal += provTargetVal;

      await prisma.targetAllocation.upsert({
        where: { targetId_geographicUnitId: { targetId: mainTarget.id, geographicUnitId: province.id } },
        update: {},
        create: {
          code: `TA-${mainTarget.code}-${province.code}`,
          targetId: mainTarget.id,
          geographicUnitId: province.id,
          parentId: allocation.id,
          targetValue: new Decimal(provTargetVal),
          achievedValue: new Decimal(provAchievedVal),
          metric: 'REVENUE_VND',
          progressPercent: new Decimal((provAchievedVal / provTargetVal) * 100),
          status: 'APPROVED',
        },
      });
      targetAllocCount++;
    }

    // Update parent's childrenTarget
    await prisma.targetAllocation.update({
      where: { id: allocation.id },
      data: { childrenTarget: new Decimal(childrenTotal) },
    });
  }
  console.log(`    ✓ Created ${targetAllocCount} target allocations`);

  // ========================================
  // FUND ACTIVITIES
  // ========================================
  console.log('  Creating fund activities...');

  const activities = [
    {
      budgetId: mainBudget.id,
      activityType: 'promotion',
      activityName: 'Khuyến mãi Tết Nguyên Đán 2024',
      activityCode: 'PROMO-TET-2024',
      allocatedAmount: new Decimal(1500000000),
      spentAmount: new Decimal(1450000000),
      revenueGenerated: new Decimal(8500000000),
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      status: 'COMPLETED',
    },
    {
      budgetId: mainBudget.id,
      activityType: 'display',
      activityName: 'Trưng bày Tết tại siêu thị',
      activityCode: 'DISP-TET-2024',
      allocatedAmount: new Decimal(500000000),
      spentAmount: new Decimal(480000000),
      revenueGenerated: new Decimal(2200000000),
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-02-20'),
      status: 'COMPLETED',
    },
    {
      budgetId: mainBudget.id,
      activityType: 'sampling',
      activityName: 'Dùng thử sản phẩm mới Q1',
      activityCode: 'SAMP-Q1-2024',
      allocatedAmount: new Decimal(300000000),
      spentAmount: new Decimal(250000000),
      revenueGenerated: new Decimal(600000000),
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-31'),
      status: 'ACTIVE',
    },
    {
      budgetId: mainBudget.id,
      activityType: 'event',
      activityName: 'Sự kiện ra mắt sản phẩm',
      activityCode: 'EVENT-LAUNCH-2024',
      allocatedAmount: new Decimal(800000000),
      spentAmount: new Decimal(750000000),
      revenueGenerated: new Decimal(3500000000),
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-15'),
      status: 'COMPLETED',
    },
    {
      budgetId: mainBudget.id,
      activityType: 'listing_fee',
      activityName: 'Phí listing siêu thị Q1',
      activityCode: 'LIST-Q1-2024',
      allocatedAmount: new Decimal(200000000),
      spentAmount: new Decimal(200000000),
      revenueGenerated: new Decimal(800000000),
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      status: 'COMPLETED',
    },
    {
      budgetId: createdBudgets[2].id, // Q2 budget
      activityType: 'promotion',
      activityName: 'Khuyến mãi Hè 2024',
      activityCode: 'PROMO-SUMMER-2024',
      allocatedAmount: new Decimal(2000000000),
      spentAmount: new Decimal(500000000),
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-07-31'),
      status: 'ACTIVE',
    },
  ];

  let activityCount = 0;
  for (const activityData of activities) {
    // Calculate ROI if we have spent and revenue
    let roi = null;
    if (activityData.spentAmount && activityData.revenueGenerated) {
      roi = new Decimal(
        Number(activityData.revenueGenerated) / Number(activityData.spentAmount)
      );
    }

    await prisma.fundActivity.create({
      data: {
        ...activityData,
        roi,
      },
    });
    activityCount++;
  }
  console.log(`    ✓ Created ${activityCount} fund activities`);

  // ========================================
  // Q1 2026 BUDGET (500B VND) - Phase 5 Demo
  // ========================================
  console.log('  Creating Q1 2026 Marketing Budget (500B VND)...');

  const company = await prisma.company.findUnique({ where: { code: 'DEMO' } });
  const admin = company ? await prisma.user.findFirst({ where: { companyId: company.id, role: 'ADMIN' } }) : null;

  const budget2026 = await prisma.budget.upsert({
    where: { code: 'BDG-MKT-Q1-2026' },
    update: {},
    create: {
      code: 'BDG-MKT-Q1-2026',
      name: 'Q1 2026 Marketing Budget',
      description: 'Ngân sách marketing quý 1/2026 - toàn quốc',
      category: 'Trade Marketing',
      fundType: 'PROMOTIONAL',
      year: 2026,
      quarter: 1,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      totalAmount: new Decimal(500000000000),
      allocatedAmount: new Decimal(500000000000),
      spentAmount: new Decimal(60000000000), // 12% spent
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      companyId: company?.id ?? null,
      createdBy: admin?.id ?? null,
    },
  });

  // Budget allocations: VN → 3 regions → provinces
  const vnUnit = await prisma.geographicUnit.findUnique({ where: { code: 'VN' } });
  const northUnit = await prisma.geographicUnit.findUnique({ where: { code: 'REG-NORTH' } });
  const centralUnit = await prisma.geographicUnit.findUnique({ where: { code: 'REG-CENTRAL' } });
  const southUnit = await prisma.geographicUnit.findUnique({ where: { code: 'REG-SOUTH' } });

  if (vnUnit && northUnit && centralUnit && southUnit) {
    const totalBudgetAmt = 500_000_000_000;

    // Root: VN
    const rootBA = await prisma.budgetAllocation.upsert({
      where: { budgetId_geographicUnitId: { budgetId: budget2026.id, geographicUnitId: vnUnit.id } },
      update: {},
      create: {
        code: 'BA-MKT26-VN',
        budgetId: budget2026.id,
        geographicUnitId: vnUnit.id,
        allocatedAmount: new Decimal(totalBudgetAmt),
        spentAmount: new Decimal(Math.round(totalBudgetAmt * 0.12)),
        childrenAllocated: new Decimal(totalBudgetAmt),
        availableToAllocate: new Decimal(0),
        status: 'APPROVED',
        createdBy: admin?.id ?? null,
      },
    });

    // Region allocations: North 40%, Central 25%, South 35%
    const regionBASplits = [
      { unit: northUnit, code: 'BA-MKT26-NORTH', pct: 0.40, spentPct: 0.10 },
      { unit: centralUnit, code: 'BA-MKT26-CENTRAL', pct: 0.25, spentPct: 0.08 },
      { unit: southUnit, code: 'BA-MKT26-SOUTH', pct: 0.35, spentPct: 0.15 },
    ];

    for (const rs of regionBASplits) {
      const regionAmt = Math.round(totalBudgetAmt * rs.pct);
      const regionSpent = Math.round(regionAmt * rs.spentPct);

      const regionProvs = await prisma.geographicUnit.findMany({
        where: { parentId: rs.unit.id, level: 'PROVINCE', isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      const perProv = regionProvs.length > 0 ? Math.round(regionAmt / regionProvs.length) : 0;

      const regionBA = await prisma.budgetAllocation.upsert({
        where: { budgetId_geographicUnitId: { budgetId: budget2026.id, geographicUnitId: rs.unit.id } },
        update: {},
        create: {
          code: rs.code,
          budgetId: budget2026.id,
          geographicUnitId: rs.unit.id,
          parentId: rootBA.id,
          allocatedAmount: new Decimal(regionAmt),
          spentAmount: new Decimal(regionSpent),
          childrenAllocated: new Decimal(perProv * regionProvs.length),
          availableToAllocate: new Decimal(regionAmt - perProv * regionProvs.length),
          status: 'APPROVED',
          createdBy: admin?.id ?? null,
        },
      });

      for (const prov of regionProvs) {
        const provSpent = Math.round(perProv * (0.05 + Math.random() * 0.15));
        await prisma.budgetAllocation.upsert({
          where: { budgetId_geographicUnitId: { budgetId: budget2026.id, geographicUnitId: prov.id } },
          update: {},
          create: {
            code: `BA-MKT26-${prov.code}`,
            budgetId: budget2026.id,
            geographicUnitId: prov.id,
            parentId: regionBA.id,
            allocatedAmount: new Decimal(perProv),
            spentAmount: new Decimal(provSpent),
            childrenAllocated: new Decimal(0),
            availableToAllocate: new Decimal(perProv),
            status: 'APPROVED',
            createdBy: admin?.id ?? null,
          },
        });
      }
    }

    const ba2026Count = await prisma.budgetAllocation.count({ where: { budgetId: budget2026.id } });
    console.log(`    ✓ Budget BDG-MKT-Q1-2026 (500B VND) with ${ba2026Count} allocations`);
  }

  // ========================================
  // Q1 2026 TARGET (150K cases) - Phase 5 Demo
  // ========================================
  console.log('  Creating Q1 2026 Sales Target (150K cases)...');

  const totalCases = 150_000;
  const target2026 = await prisma.target.upsert({
    where: { code: 'TGT-SALES-Q1-2026' },
    update: {},
    create: {
      code: 'TGT-SALES-Q1-2026',
      name: 'Q1 2026 Sales Target',
      description: 'Chỉ tiêu bán hàng quý 1/2026 - toàn quốc - đơn vị: thùng',
      year: 2026,
      quarter: 1,
      totalTarget: new Decimal(totalCases),
      totalAchieved: new Decimal(Math.round(totalCases * 0.18)),
      metric: 'CASES',
      status: 'ACTIVE',
      createdBy: admin?.id ?? null,
    },
  });

  if (vnUnit && northUnit && centralUnit && southUnit) {
    // Root: VN
    const rootTA = await prisma.targetAllocation.upsert({
      where: { targetId_geographicUnitId: { targetId: target2026.id, geographicUnitId: vnUnit.id } },
      update: {},
      create: {
        code: 'TA-SALES26-VN',
        targetId: target2026.id,
        geographicUnitId: vnUnit.id,
        targetValue: new Decimal(totalCases),
        achievedValue: new Decimal(Math.round(totalCases * 0.18)),
        metric: 'CASES',
        childrenTarget: new Decimal(totalCases),
        progressPercent: new Decimal(18),
        status: 'APPROVED',
        createdBy: admin?.id ?? null,
      },
    });

    // Region splits: North 35%, Central 25%, South 40%
    const regionTASplits = [
      { unit: northUnit, code: 'TA-SALES26-NORTH', pct: 0.35, achievedPct: 0.16 },
      { unit: centralUnit, code: 'TA-SALES26-CENTRAL', pct: 0.25, achievedPct: 0.15 },
      { unit: southUnit, code: 'TA-SALES26-SOUTH', pct: 0.40, achievedPct: 0.21 },
    ];

    for (const rs of regionTASplits) {
      const regionTarget = Math.round(totalCases * rs.pct);
      const regionAchieved = Math.round(regionTarget * rs.achievedPct);

      const regionProvs = await prisma.geographicUnit.findMany({
        where: { parentId: rs.unit.id, level: 'PROVINCE', isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      const perProv = regionProvs.length > 0 ? Math.round(regionTarget / regionProvs.length) : 0;

      const regionTA = await prisma.targetAllocation.upsert({
        where: { targetId_geographicUnitId: { targetId: target2026.id, geographicUnitId: rs.unit.id } },
        update: {},
        create: {
          code: rs.code,
          targetId: target2026.id,
          geographicUnitId: rs.unit.id,
          parentId: rootTA.id,
          targetValue: new Decimal(regionTarget),
          achievedValue: new Decimal(regionAchieved),
          metric: 'CASES',
          childrenTarget: new Decimal(perProv * regionProvs.length),
          progressPercent: new Decimal(regionTarget > 0 ? Math.round((regionAchieved / regionTarget) * 1000) / 10 : 0),
          status: 'APPROVED',
          createdBy: admin?.id ?? null,
        },
      });

      for (const prov of regionProvs) {
        const provAchieved = Math.round(perProv * (0.10 + Math.random() * 0.15));
        const provProgress = perProv > 0 ? Math.round((provAchieved / perProv) * 1000) / 10 : 0;

        await prisma.targetAllocation.upsert({
          where: { targetId_geographicUnitId: { targetId: target2026.id, geographicUnitId: prov.id } },
          update: {},
          create: {
            code: `TA-SALES26-${prov.code}`,
            targetId: target2026.id,
            geographicUnitId: prov.id,
            parentId: regionTA.id,
            targetValue: new Decimal(perProv),
            achievedValue: new Decimal(provAchieved),
            metric: 'CASES',
            childrenTarget: new Decimal(0),
            progressPercent: new Decimal(provProgress),
            status: 'APPROVED',
            createdBy: admin?.id ?? null,
          },
        });
      }
    }

    const ta2026Count = await prisma.targetAllocation.count({ where: { targetId: target2026.id } });
    console.log(`    ✓ Target TGT-SALES-Q1-2026 (150K cases) with ${ta2026Count} allocations`);
  }

  // ========================================
  // SUMMARY
  // ========================================
  const totalBudgets = await prisma.budget.count();
  const totalBudgetAllocs = await prisma.budgetAllocation.count();
  const totalTargets = await prisma.target.count();
  const totalTargetAllocs = await prisma.targetAllocation.count();
  const totalActivities = await prisma.fundActivity.count();

  console.log('✅ Demo data seed complete:');
  console.log(`   - Budgets: ${totalBudgets}`);
  console.log(`   - Budget Allocations: ${totalBudgetAllocs}`);
  console.log(`   - Targets: ${totalTargets}`);
  console.log(`   - Target Allocations: ${totalTargetAllocs}`);
  console.log(`   - Fund Activities: ${totalActivities}`);
}

export default seedDemoData;
