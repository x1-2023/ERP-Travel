/**
 * Sprint 1 Fix 3: Status Transition Validation (State Machine)
 * Enforces valid status transitions for Promotion, Claim, and Budget.
 * Prevents invalid jumps like DRAFT → ACTIVE (skipping approval).
 */

// ============================================================================
// PROMOTION STATUS MACHINE
// Uses actual enum values from schema: DRAFT, PLANNED, CONFIRMED, EXECUTING, COMPLETED, CANCELLED
// ============================================================================

const PROMOTION_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PLANNED', 'CANCELLED'],
  PLANNED: ['CONFIRMED', 'DRAFT', 'CANCELLED'],
  CONFIRMED: ['EXECUTING', 'CANCELLED'],
  EXECUTING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

// ============================================================================
// CLAIM STATUS MACHINE (Phase 6 expanded)
// Full lifecycle: DRAFT → SUBMITTED → VALIDATING → PENDING_MATCH → MATCHED → APPROVED → SETTLED
// ============================================================================

const CLAIM_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['VALIDATING', 'CANCELLED'],
  VALIDATING: ['VALIDATION_FAILED', 'PENDING_MATCH', 'SUBMITTED'],
  VALIDATION_FAILED: ['DRAFT', 'CANCELLED'],
  PENDING_MATCH: ['MATCHED', 'UNDER_REVIEW'],
  MATCHED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED'],
  APPROVED: ['SETTLED', 'PARTIALLY_SETTLED'],
  PARTIALLY_APPROVED: ['APPROVED', 'REJECTED'],
  PARTIALLY_SETTLED: ['SETTLED'],
  SETTLED: [], // Terminal state
  REJECTED: ['DRAFT'], // Can resubmit
  CANCELLED: [], // Terminal state
  // Backward compat
  PENDING: ['SUBMITTED', 'MATCHED', 'APPROVED', 'REJECTED'],
  DISPUTED: ['MATCHED', 'REJECTED'],
};

// ============================================================================
// BUDGET APPROVAL STATUS MACHINE
// Uses actual enum values from schema: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, REVISION_NEEDED
// ============================================================================

const BUDGET_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'REVISION_NEEDED'],
  APPROVED: [], // Terminal
  REJECTED: ['DRAFT'],
  REVISION_NEEDED: ['SUBMITTED'],
};

// ============================================================================
// ERROR CLASS
// ============================================================================

export class InvalidStatusTransitionError extends Error {
  constructor(
    public entityType: string,
    public currentStatus: string,
    public requestedStatus: string,
    public allowedStatuses: string[]
  ) {
    super(
      `Invalid status transition for ${entityType}: ` +
      `Cannot change from ${currentStatus} to ${requestedStatus}. ` +
      `Allowed: ${allowedStatuses.join(', ') || 'none (terminal state)'}`
    );
    this.name = 'InvalidStatusTransitionError';
  }
}

// ============================================================================
// VALIDATORS
// ============================================================================

export function validatePromotionTransition(
  currentStatus: string,
  newStatus: string
): void {
  const allowed = PROMOTION_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new InvalidStatusTransitionError('Promotion', currentStatus, newStatus, allowed);
  }
}

export function validateClaimTransition(
  currentStatus: string,
  newStatus: string
): void {
  const allowed = CLAIM_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new InvalidStatusTransitionError('Claim', currentStatus, newStatus, allowed);
  }
}

export function validateBudgetTransition(
  currentStatus: string,
  newStatus: string
): void {
  const allowed = BUDGET_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new InvalidStatusTransitionError('Budget', currentStatus, newStatus, allowed);
  }
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

export function getPromotionAllowedTransitions(currentStatus: string): string[] {
  return PROMOTION_TRANSITIONS[currentStatus] || [];
}

export function getClaimAllowedTransitions(currentStatus: string): string[] {
  return CLAIM_TRANSITIONS[currentStatus] || [];
}

export function getBudgetAllowedTransitions(currentStatus: string): string[] {
  return BUDGET_TRANSITIONS[currentStatus] || [];
}
