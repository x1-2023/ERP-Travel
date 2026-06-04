import { NextResponse } from 'next/server'
import { clearErpCrmSessionCookie } from '@/lib/erp-bridge/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  clearErpCrmSessionCookie(response)
  return response
}
