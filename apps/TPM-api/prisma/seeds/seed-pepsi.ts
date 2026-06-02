import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPepsiData() {
  console.log('🥤 Seeding Pepsi V3 data...');

  // Get the demo company
  const company = await prisma.company.findUnique({ where: { code: 'DEMO' } });
  if (!company) {
    console.log('⚠️  No DEMO company found. Skipping Pepsi seed.');
    return;
  }

  const companyId = company.id;

  // ============================================================
  // 1. PEPSI PRODUCTS (15 SKUs)
  // ============================================================
  console.log('  📦 Seeding Pepsi products...');

  const products = [
    { sku: 'PEP-CAN-330', name: 'Pepsi Can 330ml', nameVi: 'Pepsi Lon 330ml', category: 'BEVERAGES' as const, brand: 'Pepsi', packType: 'CAN' as const, packSize: '330ml', unitsPerCase: 24, basePrice: 8000, costPrice: 4500 },
    { sku: 'PEP-PET-500', name: 'Pepsi PET 500ml', nameVi: 'Pepsi Chai 500ml', category: 'BEVERAGES' as const, brand: 'Pepsi', packType: 'PET' as const, packSize: '500ml', unitsPerCase: 24, basePrice: 10000, costPrice: 5500 },
    { sku: 'PEP-PET-1500', name: 'Pepsi PET 1.5L', nameVi: 'Pepsi Chai 1.5L', category: 'BEVERAGES' as const, brand: 'Pepsi', packType: 'PET' as const, packSize: '1.5L', unitsPerCase: 12, basePrice: 18000, costPrice: 10000 },
    { sku: '7UP-CAN-330', name: '7Up Can 330ml', nameVi: '7Up Lon 330ml', category: 'BEVERAGES' as const, brand: '7Up', packType: 'CAN' as const, packSize: '330ml', unitsPerCase: 24, basePrice: 8000, costPrice: 4500 },
    { sku: '7UP-PET-500', name: '7Up PET 500ml', nameVi: '7Up Chai 500ml', category: 'BEVERAGES' as const, brand: '7Up', packType: 'PET' as const, packSize: '500ml', unitsPerCase: 24, basePrice: 10000, costPrice: 5500 },
    { sku: 'MRD-CAN-330', name: 'Mirinda Can 330ml', nameVi: 'Mirinda Lon 330ml', category: 'BEVERAGES' as const, brand: 'Mirinda', packType: 'CAN' as const, packSize: '330ml', unitsPerCase: 24, basePrice: 8000, costPrice: 4200 },
    { sku: 'MRD-PET-500', name: 'Mirinda PET 500ml', nameVi: 'Mirinda Chai 500ml', category: 'BEVERAGES' as const, brand: 'Mirinda', packType: 'PET' as const, packSize: '500ml', unitsPerCase: 24, basePrice: 10000, costPrice: 5200 },
    { sku: 'AQF-PET-500', name: 'Aquafina PET 500ml', nameVi: 'Aquafina Chai 500ml', category: 'BEVERAGES' as const, brand: 'Aquafina', packType: 'PET' as const, packSize: '500ml', unitsPerCase: 24, basePrice: 5000, costPrice: 2500 },
    { sku: 'AQF-PET-1500', name: 'Aquafina PET 1.5L', nameVi: 'Aquafina Chai 1.5L', category: 'BEVERAGES' as const, brand: 'Aquafina', packType: 'PET' as const, packSize: '1.5L', unitsPerCase: 12, basePrice: 10000, costPrice: 5000 },
    { sku: 'TEA-PET-500', name: 'Lipton Tea PET 500ml', nameVi: 'Trà Lipton 500ml', category: 'BEVERAGES' as const, brand: 'Lipton', packType: 'PET' as const, packSize: '500ml', unitsPerCase: 24, basePrice: 10000, costPrice: 5500 },
    { sku: 'LAY-BAG-75', name: "Lay's Classic 75g", nameVi: "Lay's Vị Truyền Thống 75g", category: 'SNACKS' as const, brand: "Lay's", packType: 'BAG' as const, packSize: '75g', unitsPerCase: 48, basePrice: 12000, costPrice: 6000 },
    { sku: 'LAY-BAG-150', name: "Lay's Classic 150g", nameVi: "Lay's Vị Truyền Thống 150g", category: 'SNACKS' as const, brand: "Lay's", packType: 'BAG' as const, packSize: '150g', unitsPerCase: 24, basePrice: 22000, costPrice: 11000 },
    { sku: 'DOR-BAG-75', name: 'Doritos Nacho 75g', nameVi: 'Doritos Phô Mai 75g', category: 'SNACKS' as const, brand: 'Doritos', packType: 'BAG' as const, packSize: '75g', unitsPerCase: 48, basePrice: 15000, costPrice: 7500 },
    { sku: 'CHE-BAG-75', name: 'Cheetos Crunchy 75g', nameVi: 'Cheetos Giòn 75g', category: 'SNACKS' as const, brand: 'Cheetos', packType: 'BAG' as const, packSize: '75g', unitsPerCase: 48, basePrice: 12000, costPrice: 6000 },
    { sku: 'QUA-BOX-1L', name: 'Quaker Oats 1kg', nameVi: 'Yến mạch Quaker 1kg', category: 'SNACKS' as const, brand: 'Quaker', packType: 'BOX' as const, packSize: '1kg', unitsPerCase: 12, basePrice: 85000, costPrice: 45000 },
  ];

  for (const p of products) {
    await prisma.pepsiProduct.upsert({
      where: { companyId_sku: { companyId, sku: p.sku } },
      update: {},
      create: { companyId, ...p },
    });
  }
  console.log(`    ✅ ${products.length} Pepsi products seeded`);

  // ============================================================
  // 2. CUSTOMERS (10 key accounts)
  // ============================================================
  console.log('  🏪 Seeding Pepsi customers...');

  const customers = [
    { code: 'BIGC', name: 'Big C Vietnam', channel: 'MT' as const },
    { code: 'AEON', name: 'AEON Vietnam', channel: 'MT' as const },
    { code: 'COOP', name: 'Co.op Mart', channel: 'MT' as const },
    { code: 'LOTTEMART', name: 'Lotte Mart', channel: 'MT' as const },
    { code: 'VINMART', name: 'WinMart (Masan)', channel: 'MT' as const },
    { code: 'BSMART', name: 'B\'s Mart', channel: 'GT' as const },
    { code: 'CIRCLEK', name: 'Circle K Vietnam', channel: 'GT' as const },
    { code: 'GS25', name: 'GS25 Vietnam', channel: 'GT' as const },
    { code: 'GRAB', name: 'GrabMart', channel: 'ECOMMERCE' as const },
    { code: 'HIGHLAND', name: 'Highlands Coffee', channel: 'HORECA' as const },
  ];

  const customerRecords: Record<string, string> = {};
  for (const c of customers) {
    const record = await prisma.customer.upsert({
      where: { companyId_code: { companyId, code: c.code } },
      update: {},
      create: { companyId, ...c, isActive: true },
    });
    customerRecords[c.code] = record.id;
  }
  console.log(`    ✅ ${customers.length} customers seeded`);

  // ============================================================
  // 3. BIG C STORES (12 stores)
  // ============================================================
  console.log('  🏬 Seeding Big C stores...');

  const bigCStores = [
    { code: 'BIGC-Q7', name: 'Big C Quận 7', district: 'Quận 7', city: 'Hồ Chí Minh', region: 'SOUTH' as const, channel: 'MT' as const, tier: 'DIAMOND' as const, monthlyTarget: 500000000 },
    { code: 'BIGC-TB', name: 'Big C Tân Bình', district: 'Tân Bình', city: 'Hồ Chí Minh', region: 'SOUTH' as const, channel: 'MT' as const, tier: 'DIAMOND' as const, monthlyTarget: 450000000 },
    { code: 'BIGC-TD', name: 'Big C Thủ Đức', district: 'Thủ Đức', city: 'Hồ Chí Minh', region: 'SOUTH' as const, channel: 'MT' as const, tier: 'GOLD' as const, monthlyTarget: 350000000 },
    { code: 'BIGC-BT', name: 'Big C Bình Tân', district: 'Bình Tân', city: 'Hồ Chí Minh', region: 'SOUTH' as const, channel: 'MT' as const, tier: 'GOLD' as const, monthlyTarget: 320000000 },
    { code: 'BIGC-DN', name: 'Big C Đà Nẵng', district: 'Hải Châu', city: 'Đà Nẵng', region: 'CENTRAL' as const, channel: 'MT' as const, tier: 'GOLD' as const, monthlyTarget: 300000000 },
    { code: 'BIGC-HUE', name: 'Big C Huế', district: 'TP Huế', city: 'Thừa Thiên Huế', region: 'CENTRAL' as const, channel: 'MT' as const, tier: 'SILVER' as const, monthlyTarget: 200000000 },
    { code: 'BIGC-HN1', name: 'Big C Thăng Long', district: 'Nam Từ Liêm', city: 'Hà Nội', region: 'NORTH' as const, channel: 'MT' as const, tier: 'DIAMOND' as const, monthlyTarget: 480000000 },
    { code: 'BIGC-HN2', name: 'Big C Long Biên', district: 'Long Biên', city: 'Hà Nội', region: 'NORTH' as const, channel: 'MT' as const, tier: 'GOLD' as const, monthlyTarget: 380000000 },
    { code: 'BIGC-HP', name: 'Big C Hải Phòng', district: 'Lê Chân', city: 'Hải Phòng', region: 'NORTH' as const, channel: 'MT' as const, tier: 'SILVER' as const, monthlyTarget: 250000000 },
    { code: 'BIGC-CT', name: 'Big C Cần Thơ', district: 'Ninh Kiều', city: 'Cần Thơ', region: 'SOUTH' as const, channel: 'MT' as const, tier: 'SILVER' as const, monthlyTarget: 220000000 },
    { code: 'BIGC-BD', name: 'Big C Bình Dương', district: 'Thủ Dầu Một', city: 'Bình Dương', region: 'SOUTH' as const, channel: 'MT' as const, tier: 'SILVER' as const, monthlyTarget: 230000000 },
    { code: 'BIGC-DL', name: 'Big C Đà Lạt', district: 'TP Đà Lạt', city: 'Lâm Đồng', region: 'HIGHLAND' as const, channel: 'MT' as const, tier: 'BRONZE' as const, monthlyTarget: 150000000 },
  ];

  for (const s of bigCStores) {
    await prisma.pepsiStore.upsert({
      where: { companyId_code: { companyId, code: s.code } },
      update: {},
      create: {
        companyId,
        customerId: customerRecords['BIGC'],
        ...s,
        monthlyActual: Math.round(s.monthlyTarget * (0.7 + Math.random() * 0.4)),
        isActive: true,
      },
    });
  }
  console.log(`    ✅ ${bigCStores.length} Big C stores seeded`);

  // ============================================================
  // 4. VOLUME CONTRACT (Big C 2026)
  // ============================================================
  console.log('  📝 Seeding volume contract...');

  const contract = await prisma.volumeContract.upsert({
    where: { companyId_code: { companyId, code: 'VC-BIGC-2026' } },
    update: {},
    create: {
      companyId,
      code: 'VC-BIGC-2026',
      name: 'Big C Volume Contract 2026',
      customerId: customerRecords['BIGC'],
      status: 'ACTIVE',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      targetVolume: 120000,
      currentVolume: 10500,
      bonusType: 'TIERED',
      bonusValue: 3.5,
      bonusCondition: {
        tiers: [
          { threshold: 80, bonusPercent: 2 },
          { threshold: 90, bonusPercent: 3 },
          { threshold: 100, bonusPercent: 3.5 },
          { threshold: 110, bonusPercent: 5 },
        ],
      },
      channel: 'MT',
      region: 'SOUTH',
      categories: ['BEVERAGES', 'SNACKS'],
      riskLevel: 'ON_TRACK',
      completionRate: 8.75,
      notes: 'Annual volume agreement with Big C Vietnam - all categories',
    },
  });

  // Milestones
  const milestones = [
    { name: 'Q1 Target', targetVolume: 28000, deadline: new Date('2026-03-31'), achievedVolume: 10500, isAchieved: false },
    { name: 'H1 Target', targetVolume: 58000, deadline: new Date('2026-06-30'), achievedVolume: 0, isAchieved: false },
    { name: '9M Target', targetVolume: 90000, deadline: new Date('2026-09-30'), achievedVolume: 0, isAchieved: false },
    { name: 'FY Target', targetVolume: 120000, deadline: new Date('2026-12-31'), achievedVolume: 0, isAchieved: false },
  ];

  for (const m of milestones) {
    const existing = await prisma.volumeContractMilestone.findFirst({
      where: { contractId: contract.id, name: m.name },
    });
    if (!existing) {
      await prisma.volumeContractMilestone.create({
        data: { contractId: contract.id, ...m },
      });
    }
  }

  // Monthly progress (Jan 2026)
  await prisma.volumeContractProgress.upsert({
    where: { contractId_year_month: { contractId: contract.id, year: 2026, month: 1 } },
    update: {},
    create: {
      contractId: contract.id,
      month: 1,
      year: 2026,
      volume: 10500,
      revenue: 1250000000,
      target: 10000,
      cumVolume: 10500,
      cumTarget: 10000,
      gapPercent: 5.0,
      notes: 'Strong start to the year - exceeded January target',
    },
  });

  console.log('    ✅ Volume contract with milestones and progress seeded');

  // ============================================================
  // 5. PROMO SUGGESTION SAMPLE
  // ============================================================
  console.log('  🤖 Seeding promo suggestion...');

  const existingSuggestion = await prisma.promoSuggestion.findFirst({
    where: { companyId, title: 'Pepsi Tet Display Promotion - Big C' },
  });
  if (!existingSuggestion) {
    await prisma.promoSuggestion.create({
      data: {
        companyId,
        customerId: customerRecords['BIGC'],
        contractId: contract.id,
        type: 'PROMOTION',
        status: 'PENDING',
        priority: 8,
        title: 'Pepsi Tet Display Promotion - Big C',
        description: 'Run a Tet-themed end-cap display promotion across all Big C stores in HCMC to boost Q1 volumes and support the volume contract target.',
        rationale: 'Historical data shows 35% volume uplift during Tet display promotions. Current Q1 run-rate requires 12% acceleration to meet milestone. Display promo at Big C South stores has highest predicted ROI.',
        suggestedConfig: {
          type: 'DISPLAY',
          channel: 'MT',
          region: 'SOUTH',
          duration: 21,
          startDate: '2026-02-10',
          endDate: '2026-03-02',
          budget: 350000000,
          mechanic: 'End-cap display with buy-2-get-1 on Pepsi 330ml cans',
          stores: ['BIGC-Q7', 'BIGC-TB', 'BIGC-TD', 'BIGC-BT'],
        },
        impactEstimate: {
          incrementalRevenue: 850000000,
          incrementalVolume: 3500,
          estimatedROI: 2.4,
          estimatedCost: 350000000,
        },
        confidence: 0.82,
        dataInputs: {
          historicalPromotions: 12,
          seasonalityIndex: 1.35,
          baselineVolume: 8500,
          contractGap: 1500,
        },
        modelVersion: 'pepsi-suggest-v3.1',
      },
    });
  }
  console.log('    ✅ Promo suggestion seeded');

  // ============================================================
  // 6. ALERT RULES (4 samples - extending existing AlertRule)
  // ============================================================
  console.log('  🔔 Seeding alert rules...');

  const admin = await prisma.user.findFirst({
    where: { companyId, role: 'ADMIN' },
  });

  if (admin) {
    const alertRules = [
      {
        name: 'Contract Volume Below Target',
        description: 'Alert when monthly contract volume falls below 85% of target',
        metric: 'contract_volume_achievement',
        condition: 'THRESHOLD_BELOW' as const,
        threshold: 85,
        severity: 'WARNING' as const,
        entityType: 'CONTRACT',
        channels: ['IN_APP' as const, 'EMAIL' as const],
      },
      {
        name: 'High Value Claim Pending',
        description: 'Alert when claim over 100M VND is pending for more than 48 hours',
        metric: 'claim_pending_amount',
        condition: 'THRESHOLD_ABOVE' as const,
        threshold: 100000000,
        severity: 'CRITICAL' as const,
        entityType: 'CLAIM',
        channels: ['IN_APP' as const, 'EMAIL' as const, 'PUSH' as const],
      },
      {
        name: 'Store Performance Drop',
        description: 'Alert when store performance drops more than 20% vs previous month',
        metric: 'store_monthly_performance',
        condition: 'PERCENTAGE_CHANGE' as const,
        threshold: -20,
        severity: 'WARNING' as const,
        entityType: 'STORE',
        channels: ['IN_APP' as const],
      },
      {
        name: 'Promotion Budget Overrun',
        description: 'Alert when promotion spending exceeds 95% of allocated budget',
        metric: 'promotion_budget_utilization',
        condition: 'THRESHOLD_ABOVE' as const,
        threshold: 95,
        severity: 'URGENT' as const,
        entityType: 'PROMOTION',
        channels: ['IN_APP' as const, 'EMAIL' as const, 'PUSH' as const],
      },
    ];

    for (const rule of alertRules) {
      const existing = await prisma.alertRule.findFirst({
        where: { companyId, name: rule.name },
      });
      if (!existing) {
        await prisma.alertRule.create({
          data: {
            companyId,
            userId: admin.id,
            ...rule,
          },
        });
      }
    }
    console.log(`    ✅ ${alertRules.length} alert rules seeded`);
  }

  console.log('🥤 Pepsi V3 seed completed!\n');
}
