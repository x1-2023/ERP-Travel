import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { db } from '@/lib/db'

const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 1000
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function authenticateApiRequest(
  request: NextRequest,
  requiredPermission?: string
): Promise<{
  success: boolean
  tenantId?: string
  error?: string
  statusCode?: number
}> {
  const apiKey = request.headers.get('X-API-Key')

  if (!apiKey) {
    return { success: false, error: 'API key required', statusCode: 401 }
  }

  const hash = createHash('sha256').update(apiKey).digest('hex')
  const keyRecord = await db.apiKey.findUnique({ where: { keyHash: hash } })

  if (!keyRecord || !keyRecord.isActive) {
    return { success: false, error: 'Invalid API key', statusCode: 401 }
  }

  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
    return { success: false, error: 'API key expired', statusCode: 401 }
  }

  const permissions = keyRecord.permissions as string[]
  if (requiredPermission && !hasPermission(permissions, requiredPermission)) {
    return { success: false, error: 'Insufficient permissions', statusCode: 403 }
  }

  // Rate limiting
  const now = Date.now()
  const rateKey = keyRecord.id
  const rateLimit = rateLimitMap.get(rateKey) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW }

  if (now > rateLimit.resetAt) {
    rateLimit.count = 0
    rateLimit.resetAt = now + RATE_LIMIT_WINDOW
  }

  rateLimit.count++
  rateLimitMap.set(rateKey, rateLimit)

  if (rateLimit.count > RATE_LIMIT_MAX) {
    return { success: false, error: 'Rate limit exceeded', statusCode: 429 }
  }

  // Update last used
  await db.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() },
  })

  return { success: true, tenantId: keyRecord.tenantId }
}

export function hasPermission(permissions: string[], required: string): boolean {
  if (permissions.includes('*')) return true
  if (permissions.includes(required)) return true
  const [action, resource] = required.split(':')
  if (permissions.includes(`${action}:*`)) return true
  if (permissions.includes(`*:${resource}`)) return true
  return false
}

export function apiResponse<T>(data: T, meta?: { page?: number; limit?: number; total?: number }) {
  return NextResponse.json({ success: true, data, meta })
}

export function apiError(error: string, statusCode = 400) {
  return NextResponse.json({ success: false, error }, { status: statusCode })
}
