/**
 * Sprint 1 Fix 1: Optimistic Locking for Concurrent Edit Detection
 * Prevents "last write wins" data loss when multiple users edit the same entity.
 */

export class OptimisticLockError extends Error {
  constructor(
    public entityType: string,
    public entityId: string,
    public expectedVersion: Date,
    public actualVersion: Date
  ) {
    super(
      `Conflict: ${entityType} has been modified by another user. ` +
      `Your version: ${expectedVersion.toISOString()}, ` +
      `Current version: ${actualVersion.toISOString()}`
    );
    this.name = 'OptimisticLockError';
  }
}

/**
 * Check if entity has been modified since client fetched it.
 * Compares updatedAt timestamps with 1-second tolerance for clock drift.
 */
export function checkVersion(
  currentUpdatedAt: Date,
  clientUpdatedAt: Date | string,
  entityType: string,
  entityId: string
): void {
  const clientDate = new Date(clientUpdatedAt);

  // Allow 1 second tolerance for network/clock differences
  const tolerance = 1000;
  const diff = Math.abs(currentUpdatedAt.getTime() - clientDate.getTime());

  if (diff > tolerance) {
    throw new OptimisticLockError(
      entityType,
      entityId,
      clientDate,
      currentUpdatedAt
    );
  }
}
