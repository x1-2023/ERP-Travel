/**
 * Phase 6: Settlement Service
 * Create, batch, process, GL posting
 */

import prisma from './prisma';

// ============================================================================
// GENERATE SETTLEMENT CODE
// ============================================================================

async function generateSettlementCode(): Promise<string> {
  const date = new Date();
  const prefix = `STL-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.settlement.count({
    where: { code: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

async function generateBatchCode(): Promise<string> {
  const date = new Date();
  const prefix = `BAT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.settlementBatch.count({
    where: { code: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================================================
// CREATE SETTLEMENT
// ============================================================================

export async function createSettlement(
  claimId: string,
  amount: number,
  paymentMethod: string | undefined,
  userId: string
) {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: { settlements: true },
  });

  if (!claim) throw new Error('Claim not found');

  if (!['APPROVED', 'PARTIALLY_APPROVED', 'PARTIALLY_SETTLED'].includes(claim.status)) {
    throw new Error(`Cannot settle claim with status ${claim.status}. Must be APPROVED, PARTIALLY_APPROVED, or PARTIALLY_SETTLED.`);
  }

  // Calculate already settled amount
  const alreadySettled = claim.settlements.reduce(
    (sum, s) => sum + Number(s.settledAmount),
    0
  );
  const claimAmount = Number(claim.approvedAmount || claim.claimedAmount || claim.amount);
  const remaining = claimAmount - alreadySettled;

  if (amount > remaining) {
    throw new Error(
      `Settlement amount (${amount.toLocaleString()}) exceeds remaining (${remaining.toLocaleString()}). ` +
      `Claim: ${claimAmount.toLocaleString()}, Already settled: ${alreadySettled.toLocaleString()}`
    );
  }

  const code = await generateSettlementCode();
  const isFullySettled = (alreadySettled + amount) >= claimAmount;
  const newStatus = isFullySettled ? 'SETTLED' : 'PARTIALLY_SETTLED';

  const result = await prisma.$transaction(async (tx) => {
    const settlement = await tx.settlement.create({
      data: {
        code,
        claimId,
        settledAmount: amount,
        amount,
        variance: claimAmount - (alreadySettled + amount),
        status: 'PENDING',
        paymentMethod: paymentMethod as any || 'BANK_TRANSFER',
        currency: 'VND',
        createdBy: userId,
      },
    });

    await tx.claim.update({
      where: { id: claimId },
      data: {
        status: newStatus,
        settledAmount: alreadySettled + amount,
      },
    });

    await tx.claimAuditLog.create({
      data: {
        claimId,
        action: 'SETTLEMENT_CREATED',
        fromStatus: claim.status,
        toStatus: newStatus,
        userId,
        details: { settlementId: settlement.id, amount, remaining: remaining - amount },
      },
    });

    return settlement;
  });

  return result;
}

// ============================================================================
// CREATE SETTLEMENT BATCH
// ============================================================================

export async function createSettlementBatch(
  companyId: string,
  settlementIds: string[],
  batchDate: Date,
  notes: string | undefined,
  userId: string
) {
  if (settlementIds.length === 0) {
    throw new Error('At least one settlement is required');
  }

  const settlements = await prisma.settlement.findMany({
    where: { id: { in: settlementIds }, status: 'PENDING' },
  });

  if (settlements.length !== settlementIds.length) {
    throw new Error(`Only ${settlements.length} of ${settlementIds.length} settlements are in PENDING status`);
  }

  const totalAmount = settlements.reduce((sum, s) => sum + Number(s.settledAmount), 0);
  const code = await generateBatchCode();

  const batch = await prisma.$transaction(async (tx) => {
    const b = await tx.settlementBatch.create({
      data: {
        code,
        companyId,
        batchDate,
        totalAmount,
        itemCount: settlements.length,
        notes,
        createdBy: userId,
      },
    });

    await tx.settlement.updateMany({
      where: { id: { in: settlementIds } },
      data: { batchId: b.id },
    });

    return b;
  });

  return batch;
}

// ============================================================================
// APPROVE SETTLEMENT BATCH
// ============================================================================

export async function approveSettlementBatch(batchId: string, userId: string) {
  const batch = await prisma.settlementBatch.findUnique({
    where: { id: batchId },
    include: { settlements: true },
  });

  if (!batch) throw new Error('Batch not found');
  if (batch.status !== 'DRAFT' && batch.status !== 'PENDING_APPROVAL') {
    throw new Error(`Cannot approve batch with status ${batch.status}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.settlementBatch.update({
      where: { id: batchId },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    // Update all settlements in batch to APPROVED
    await tx.settlement.updateMany({
      where: { batchId },
      data: { status: 'APPROVED', approvedBy: userId, approvedAt: new Date() },
    });

    return updated;
  });

  return result;
}

// ============================================================================
// PROCESS SETTLEMENT (Payment)
// ============================================================================

export async function processSettlement(
  settlementId: string,
  paymentDetails: {
    paymentReference?: string;
    paymentDate?: string;
    bankName?: string;
    bankAccount?: string;
    bankBranch?: string;
  }
) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  if (!settlement) throw new Error('Settlement not found');
  if (!['PENDING', 'APPROVED'].includes(settlement.status)) {
    throw new Error(`Cannot process settlement with status ${settlement.status}`);
  }

  const updated = await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      status: 'PAID',
      paymentReference: paymentDetails.paymentReference,
      paymentDate: paymentDetails.paymentDate ? new Date(paymentDetails.paymentDate) : new Date(),
      bankName: paymentDetails.bankName,
      bankAccount: paymentDetails.bankAccount,
      bankBranch: paymentDetails.bankBranch,
    },
  });

  return updated;
}

// ============================================================================
// POST SETTLEMENT TO GL
// ============================================================================

export async function postSettlementToGL(settlementId: string, userId: string) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { claim: true },
  });

  if (!settlement) throw new Error('Settlement not found');
  if (settlement.postedToGL) {
    throw new Error('Settlement already posted to GL');
  }
  if (settlement.status !== 'PAID') {
    throw new Error(`Cannot post to GL: settlement status is ${settlement.status}, must be PAID`);
  }

  const updated = await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      postedToGL: true,
      postedAt: new Date(),
      glJournalId: `GL-${settlement.code}`,
    },
  });

  // Create audit log for the claim
  if (settlement.claimId) {
    await prisma.claimAuditLog.create({
      data: {
        claimId: settlement.claimId,
        action: 'GL_POSTED',
        userId,
        details: {
          settlementId,
          amount: Number(settlement.settledAmount),
          glJournalId: updated.glJournalId,
        },
      },
    });
  }

  return updated;
}
