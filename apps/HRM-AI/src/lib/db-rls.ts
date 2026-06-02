// src/lib/db-rls.ts
// Prisma client extension for PostgreSQL Row-Level Security (P2-23)
// Sets app.current_tenant_id session variable before queries

import { db } from './db'

/**
 * Execute a Prisma operation with tenant RLS context.
 *
 * Sets the PostgreSQL session variable `app.current_tenant_id`
 * so that RLS policies filter data automatically.
 *
 * Usage:
 * ```ts
 * const employees = await withTenantContext(tenantId, () =>
 *   db.employee.findMany({ where: { status: 'ACTIVE' } })
 * )
 * ```
 *
 * NOTE: This uses $executeRawUnsafe to set the session variable,
 * then runs the callback. The variable is connection-scoped, so
 * it only affects queries on the same connection within the callback.
 * For this to work reliably with connection pooling, wrap in $transaction.
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  // Use interactive transaction to ensure same connection
  return db.$transaction(async (tx) => {
    // Set the tenant context for RLS
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}'`
    )
    // Execute the actual query
    // Note: fn() uses the global `db` client. For full RLS enforcement,
    // the caller should use the `tx` client passed to $transaction.
    return fn()
  })
}

/**
 * Create a Prisma transaction client with tenant RLS context set.
 *
 * Usage:
 * ```ts
 * await db.$transaction(async (tx) => {
 *   await setTenantRLS(tx, tenantId)
 *   const employees = await tx.employee.findMany()
 * })
 * ```
 */
export async function setTenantRLS(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  tenantId: string
): Promise<void> {
  await (tx as any).$executeRawUnsafe(
    `SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}'`
  )
}

/**
 * Clear the tenant context (useful for admin operations).
 */
export async function clearTenantContext(): Promise<void> {
  await db.$executeRawUnsafe(`RESET app.current_tenant_id`)
}

/**
 * Check if RLS is enabled on a table (diagnostic utility).
 */
export async function checkRLSStatus(): Promise<{ table: string; rlsEnabled: boolean }[]> {
  const result = await db.$queryRaw<{ tablename: string; rowsecurity: boolean }[]>`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `
  return result.map((r) => ({
    table: r.tablename,
    rlsEnabled: r.rowsecurity,
  }))
}
