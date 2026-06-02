import { prisma } from '@/lib/prisma'

interface FieldChange {
  field: string
  oldValue: unknown
  newValue: unknown
}

export function computeFieldChanges(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  fields: string[]
): FieldChange[] {
  const changes: FieldChange[] = []
  for (const field of fields) {
    const oldVal = oldData[field]
    const newVal = newData[field]
    if (newVal !== undefined && String(oldVal) !== String(newVal)) {
      changes.push({ field, oldValue: oldVal, newValue: newVal })
    }
  }
  return changes
}

export async function logFieldChanges(params: {
  action: string
  entity: string
  entityId: string
  changes: FieldChange[]
  userId: string
  ipAddress?: string
}) {
  if (params.changes.length === 0) return

  await prisma.auditLog.create({
    data: {
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      changes: params.changes as any,
      userId: params.userId,
      ipAddress: params.ipAddress,
    },
  })
}
