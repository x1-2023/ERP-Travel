/**
 * Phase 6: Claims & Settlement Seed Data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPhase6Claims() {
  console.log('  Phase 6: Seeding claims & settlement data...');

  // Find existing company and users
  const company = await prisma.company.findFirst({ where: { code: 'DEMO' } });
  if (!company) {
    console.log('  ⚠️ No DEMO company found, skipping Phase 6 seed');
    return;
  }

  const admin = await prisma.user.findFirst({ where: { companyId: company.id, role: 'ADMIN' } });
  const manager = await prisma.user.findFirst({ where: { companyId: company.id, role: 'MANAGER' } });
  const kam = await prisma.user.findFirst({ where: { companyId: company.id, role: 'KAM' } });
  const finance = await prisma.user.findFirst({ where: { companyId: company.id, role: 'FINANCE' } });
  const creatorId = kam?.id || admin?.id || '';
  const approverId = finance?.id || manager?.id || admin?.id || '';

  // Find existing customers and promotions
  const customers = await prisma.customer.findMany({ where: { companyId: company.id }, take: 3 });
  const promotions = await prisma.promotion.findMany({
    where: { customer: { companyId: company.id } },
    take: 3,
  });

  if (customers.length === 0) {
    console.log('  ⚠️ No customers found, skipping Phase 6 seed');
    return;
  }

  // Create sample claims
  const claims = await Promise.all([
    // 1. DRAFT claim
    prisma.claim.create({
      data: {
        code: 'CLM-2026-P6-001',
        amount: 25000000,
        claimedAmount: 25000000,
        status: 'DRAFT',
        claimDate: new Date('2026-02-01'),
        description: 'Chiết khấu Q1 - BigC Thăng Long',
        customerId: customers[0].id,
        promotionId: promotions[0]?.id || null,
        companyId: company.id,
        type: 'REBATE',
        source: 'MANUAL',
        priority: 1,
        createdBy: creatorId,
      },
    }),
    // 2. SUBMITTED claim
    prisma.claim.create({
      data: {
        code: 'CLM-2026-P6-002',
        amount: 50000000,
        claimedAmount: 50000000,
        status: 'SUBMITTED',
        claimDate: new Date('2026-02-05'),
        description: 'Phí trưng bày Tết 2026',
        customerId: customers[0].id,
        promotionId: promotions[0]?.id || null,
        companyId: company.id,
        type: 'DISPLAY',
        source: 'MANUAL',
        priority: 2,
        submittedBy: creatorId,
        submittedAt: new Date('2026-02-06'),
        validationScore: 85,
        validationNotes: 'Claim chưa có chi tiết sản phẩm',
        createdBy: creatorId,
      },
    }),
    // 3. MATCHED claim
    prisma.claim.create({
      data: {
        code: 'CLM-2026-P6-003',
        amount: 75000000,
        claimedAmount: 75000000,
        status: 'MATCHED',
        claimDate: new Date('2026-01-20'),
        description: 'Chiết khấu doanh số T1/2026',
        customerId: customers.length > 1 ? customers[1].id : customers[0].id,
        promotionId: promotions.length > 1 ? promotions[1]?.id : promotions[0]?.id || null,
        companyId: company.id,
        type: 'DISCOUNT',
        source: 'MANUAL',
        invoiceNumber: 'INV-2026-0120',
        invoiceDate: new Date('2026-01-25'),
        invoiceAmount: 75000000,
        createdBy: creatorId,
      },
    }),
    // 4. APPROVED claim
    prisma.claim.create({
      data: {
        code: 'CLM-2026-P6-004',
        amount: 120000000,
        claimedAmount: 120000000,
        approvedAmount: 115000000,
        status: 'APPROVED',
        claimDate: new Date('2026-01-15'),
        description: 'Promotion Tết Aquafina',
        customerId: customers.length > 2 ? customers[2].id : customers[0].id,
        promotionId: promotions.length > 2 ? promotions[2]?.id : promotions[0]?.id || null,
        companyId: company.id,
        type: 'PROMOTION',
        source: 'MANUAL',
        approvedBy: approverId,
        approvedAt: new Date('2026-02-01'),
        createdBy: creatorId,
      },
    }),
    // 5. SETTLED claim
    prisma.claim.create({
      data: {
        code: 'CLM-2026-P6-005',
        amount: 30000000,
        claimedAmount: 30000000,
        approvedAmount: 30000000,
        settledAmount: 30000000,
        status: 'SETTLED',
        claimDate: new Date('2026-01-10'),
        description: 'Flash Sale Weekend - đã thanh toán',
        customerId: customers[0].id,
        promotionId: promotions[0]?.id || null,
        companyId: company.id,
        type: 'PROMOTION',
        source: 'MANUAL',
        approvedBy: approverId,
        approvedAt: new Date('2026-01-20'),
        createdBy: creatorId,
      },
    }),
  ]);

  console.log(`  ✅ Created ${claims.length} sample claims`);

  // Create line items for claim 3
  await prisma.claimLineItem.createMany({
    data: [
      { claimId: claims[2].id, productName: 'Pepsi 330ml (thùng)', quantity: 100, unitPrice: 150000, amount: 15000000 },
      { claimId: claims[2].id, productName: 'Pepsi Zero 330ml (thùng)', quantity: 80, unitPrice: 155000, amount: 12400000 },
      { claimId: claims[2].id, productName: '7Up 330ml (thùng)', quantity: 120, unitPrice: 145000, amount: 17400000 },
      { claimId: claims[2].id, productName: 'Aquafina 500ml (thùng)', quantity: 200, unitPrice: 100000, amount: 20000000 },
      { claimId: claims[2].id, productName: 'Mirinda 330ml (thùng)', quantity: 70, unitPrice: 148000, amount: 10360000, description: 'Khuyến mãi đặc biệt' },
    ],
  });
  console.log('  ✅ Created claim line items');

  // Create promotion matches for claim 3
  if (promotions.length > 0) {
    await prisma.claimPromotionMatch.createMany({
      data: [
        {
          claimId: claims[2].id,
          promotionId: promotions[0].id,
          confidenceScore: 0.92,
          matchReason: 'Auto-matched: dateOverlap=30, amountMatch=35, customerMatch=20, statusBonus=10',
          matchFactors: { dateOverlap: 30, amountMatch: 35, customerMatch: 20, statusBonus: 10 },
          expectedAmount: Number(promotions[0].budget),
          variance: 75000000 - Number(promotions[0].budget),
          variancePercent: ((75000000 - Number(promotions[0].budget)) / Number(promotions[0].budget)) * 100,
          isAccepted: true,
          acceptedBy: approverId,
          acceptedAt: new Date('2026-02-01'),
        },
        ...(promotions.length > 1 ? [{
          claimId: claims[2].id,
          promotionId: promotions[1].id,
          confidenceScore: 0.45,
          matchReason: 'Auto-matched: dateOverlap=15, amountMatch=20, customerMatch=0, statusBonus=5',
          matchFactors: { dateOverlap: 15, amountMatch: 20, customerMatch: 0, statusBonus: 5 },
          expectedAmount: Number(promotions[1].budget),
          variance: 75000000 - Number(promotions[1].budget),
          variancePercent: ((75000000 - Number(promotions[1].budget)) / Number(promotions[1].budget)) * 100,
        }] : []),
      ],
    });
    console.log('  ✅ Created claim promotion matches');
  }

  // Create approvals
  await prisma.claimApproval.createMany({
    data: [
      { claimId: claims[3].id, level: 1, status: 'APPROVED', approverId, approvedAmount: 115000000, comments: 'Approved with minor adjustment', decidedAt: new Date('2026-02-01') },
      { claimId: claims[4].id, level: 1, status: 'APPROVED', approverId, approvedAmount: 30000000, comments: 'Full approval', decidedAt: new Date('2026-01-20') },
    ],
  });
  console.log('  ✅ Created claim approvals');

  // Create audit logs
  await prisma.claimAuditLog.createMany({
    data: [
      { claimId: claims[0].id, action: 'CREATED', toStatus: 'DRAFT', userId: creatorId, notes: 'Claim created' },
      { claimId: claims[1].id, action: 'CREATED', toStatus: 'DRAFT', userId: creatorId },
      { claimId: claims[1].id, action: 'SUBMITTED', fromStatus: 'DRAFT', toStatus: 'SUBMITTED', userId: creatorId },
      { claimId: claims[2].id, action: 'CREATED', toStatus: 'DRAFT', userId: creatorId },
      { claimId: claims[2].id, action: 'SUBMITTED', fromStatus: 'DRAFT', toStatus: 'SUBMITTED', userId: creatorId },
      { claimId: claims[2].id, action: 'AI_MATCHING', fromStatus: 'SUBMITTED', toStatus: 'MATCHED', userId: approverId, details: { matchCount: 2 } },
      { claimId: claims[3].id, action: 'CREATED', toStatus: 'DRAFT', userId: creatorId },
      { claimId: claims[3].id, action: 'SUBMITTED', fromStatus: 'DRAFT', toStatus: 'SUBMITTED', userId: creatorId },
      { claimId: claims[3].id, action: 'APPROVED', fromStatus: 'UNDER_REVIEW', toStatus: 'APPROVED', userId: approverId, details: { approvedAmount: 115000000 }, notes: 'Approved with minor adjustment' },
      { claimId: claims[4].id, action: 'CREATED', toStatus: 'DRAFT', userId: creatorId },
      { claimId: claims[4].id, action: 'APPROVED', fromStatus: 'MATCHED', toStatus: 'APPROVED', userId: approverId },
      { claimId: claims[4].id, action: 'SETTLEMENT_CREATED', fromStatus: 'APPROVED', toStatus: 'SETTLED', userId: approverId },
    ],
  });
  console.log('  ✅ Created claim audit logs');

  // Create settlement for the settled claim
  const settlement = await prisma.settlement.create({
    data: {
      code: 'STL-202602-0001',
      claimId: claims[4].id,
      settledAmount: 30000000,
      amount: 30000000,
      variance: 0,
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: 'TXN-20260201-001',
      paymentDate: new Date('2026-02-01'),
      currency: 'VND',
      postedToGL: true,
      postedAt: new Date('2026-02-02'),
      glJournalId: 'GL-STL-202602-0001',
      createdBy: approverId,
      approvedBy: approverId,
      approvedAt: new Date('2026-01-31'),
      notes: 'Thanh toán đầy đủ',
    },
  });

  // Create a pending settlement for approved claim
  const pendingSettlement = await prisma.settlement.create({
    data: {
      code: 'STL-202602-0002',
      claimId: claims[3].id,
      settledAmount: 115000000,
      amount: 115000000,
      variance: 5000000,
      status: 'PENDING',
      paymentMethod: 'BANK_TRANSFER',
      currency: 'VND',
      createdBy: approverId,
    },
  });

  console.log('  ✅ Created settlements');

  // Create settlement batch
  const batch = await prisma.settlementBatch.create({
    data: {
      code: 'BAT-202602-0001',
      companyId: company.id,
      batchDate: new Date('2026-02-01'),
      status: 'COMPLETED',
      totalAmount: 30000000,
      itemCount: 1,
      notes: 'Batch thanh toán T2/2026 - đợt 1',
      createdBy: approverId,
      approvedBy: approverId,
      approvedAt: new Date('2026-01-31'),
      processedAt: new Date('2026-02-01'),
    },
  });

  // Link settlement to batch
  await prisma.settlement.update({
    where: { id: settlement.id },
    data: { batchId: batch.id },
  });

  console.log('  ✅ Created settlement batch');
  console.log(`  🎉 Phase 6 seed complete: ${claims.length} claims, 2 settlements, 1 batch`);
}
