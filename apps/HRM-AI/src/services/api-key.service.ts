import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'
import { audit } from '@/lib/audit/logger'
import type { AuditContext } from '@/types/audit'

export function generateApiKey(isLive = true): { key: string; hash: string; prefix: string } {
  const prefix = isLive ? 'lv_live_' : 'lv_test_'
  const randomPart = randomBytes(24).toString('base64url')
  const key = prefix + randomPart
  const hash = createHash('sha256').update(key).digest('hex')
  return { key, hash, prefix }
}

export const apiKeyService = {
  async create(
    tenantId: string,
    ctx: AuditContext,
    data: { name: string; description?: string; permissions: string[]; expiresAt?: Date },
    isLive = true
  ): Promise<{ id: string; key: string }> {
    const { key, hash, prefix } = generateApiKey(isLive)

    const apiKey = await db.apiKey.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        keyHash: hash,
        keyPrefix: prefix,
        permissions: data.permissions,
        expiresAt: data.expiresAt,
        createdBy: ctx.userId!,
      },
    })

    await audit.create(ctx, 'ApiKey', apiKey.id, data.name)
    return { id: apiKey.id, key }
  },

  async revoke(id: string, tenantId: string, ctx: AuditContext) {
    const apiKey = await db.apiKey.findFirst({ where: { id, tenantId } })
    if (!apiKey) return false

    await db.apiKey.update({ where: { id }, data: { isActive: false } })
    await audit.delete(ctx, 'ApiKey', id, apiKey.name)
    return true
  },

  async getAll(tenantId: string) {
    return db.apiKey.findMany({
      where: { tenantId },
      select: {
        id: true, name: true, description: true, keyPrefix: true,
        permissions: true, isActive: true, lastUsedAt: true,
        expiresAt: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },
}
