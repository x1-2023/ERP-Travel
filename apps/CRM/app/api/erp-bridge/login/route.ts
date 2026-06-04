import { NextRequest, NextResponse } from 'next/server'
import {
  setErpCrmSessionCookie,
  upsertCrmUserFromErp,
  verifyErpBridgeLaunchToken,
} from '@/lib/erp-bridge/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  const nextPath = normalizeNextPath(request.nextUrl.searchParams.get('next'))
  const payload = verifyErpBridgeLaunchToken(token)

  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Invalid or expired ERP CRM bridge token' }, { status: 401 })
  }

  const user = await upsertCrmUserFromErp(payload)
  const response = NextResponse.redirect(new URL(nextPath, request.nextUrl.origin))
  setErpCrmSessionCookie(response, user)
  return response
}

function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/travelops'
  return value
}
