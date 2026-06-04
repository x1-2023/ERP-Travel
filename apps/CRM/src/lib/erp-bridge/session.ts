import { createHmac, createHash, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { User, UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const ERP_CRM_SESSION_COOKIE = 'erp_crm_session'

const SESSION_TTL_SECONDS = 8 * 60 * 60

export type ErpBridgePayload = {
  sub: string
  email: string
  name: string
  role: string
  department: string
  permissions: string[]
  iat: number
  exp: number
}

type CrmSessionPayload = {
  sub: string
  email: string
  source: 'erp'
  iat: number
  exp: number
}

export function verifyErpBridgeLaunchToken(token: string): ErpBridgePayload | null {
  const payload = verifySignedPayload<ErpBridgePayload>(token)
  if (!payload?.sub || !payload.email || !payload.exp) return null
  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  if (!payload.permissions?.includes('*') && !payload.permissions?.includes('crm:read')) return null
  return payload
}

export async function upsertCrmUserFromErp(payload: ErpBridgePayload): Promise<User> {
  const role = mapErpPayloadToCrmRole(payload)
  const userId = buildCrmUserId(payload.sub)

  return prisma.user.upsert({
    where: { email: payload.email.toLowerCase() },
    update: {
      name: payload.name,
      role,
    },
    create: {
      id: userId,
      email: payload.email.toLowerCase(),
      name: payload.name,
      role,
    },
  })
}

export function setErpCrmSessionCookie(response: NextResponse, user: Pick<User, 'id' | 'email'>) {
  response.cookies.set(ERP_CRM_SESSION_COOKIE, createCrmSessionToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookieEnabled(),
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export function clearErpCrmSessionCookie(response: NextResponse) {
  response.cookies.set(ERP_CRM_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookieEnabled(),
    path: '/',
    maxAge: 0,
  })
}

export async function getErpBridgeCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ERP_CRM_SESSION_COOKIE)?.value
  if (!token) return null

  const payload = verifySignedPayload<CrmSessionPayload>(token)
  if (!payload?.sub || !payload.email || payload.source !== 'erp') return null
  if (payload.exp < Math.floor(Date.now() / 1000)) return null

  return prisma.user.findUnique({ where: { id: payload.sub } })
}

function createCrmSessionToken(user: Pick<User, 'id' | 'email'>): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: CrmSessionPayload = {
    sub: user.id,
    email: user.email,
    source: 'erp',
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }
  return signPayload(payload)
}

function signPayload(payload: unknown): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = createHmac('sha256', getBridgeSecret()).update(encodedPayload).digest('base64url')
  return `${encodedPayload}.${signature}`
}

function verifySignedPayload<T>(token: string): T | null {
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const expectedSignature = createHmac('sha256', getBridgeSecret()).update(encodedPayload).digest('base64url')
  if (!safeEqual(signature, expectedSignature)) return null

  try {
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as T
  } catch {
    return null
  }
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function getBridgeSecret(): string {
  const secret = process.env.ERP_CRM_BRIDGE_SECRET ?? process.env.ERP_SESSION_SECRET
  if (!secret || secret.length < 24) {
    throw new Error('ERP_CRM_BRIDGE_SECRET must be configured')
  }
  return secret
}

function mapErpPayloadToCrmRole(payload: ErpBridgePayload): UserRole {
  if (payload.role === 'OWNER' || payload.role === 'GENERAL_MANAGER') return 'ADMIN'
  if (payload.permissions.includes('*') || payload.permissions.includes('crm:write')) return 'MANAGER'
  if (payload.permissions.includes('crm:read')) return 'VIEWER'
  return 'VIEWER'
}

function buildCrmUserId(erpUserId: string): string {
  return `erp_${createHash('sha256').update(erpUserId).digest('hex').slice(0, 24)}`
}

function isSecureCookieEnabled(): boolean {
  if (process.env.ERP_COOKIE_SECURE === 'false') return false
  if (process.env.ERP_COOKIE_SECURE === 'true') return true
  return process.env.NODE_ENV === 'production'
}
