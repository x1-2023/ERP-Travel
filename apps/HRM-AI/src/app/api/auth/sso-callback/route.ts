import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'

/**
 * SSO Callback Route for HRM
 *
 * Flow:
 * 1. Middleware detects Supabase cookie + no NextAuth session → redirects here
 * 2. Extracts Supabase access token from the cookie
 * 3. Calls signIn('supabase-sso') → validates + creates/syncs tenant + user
 * 4. NextAuth creates JWT session with tenantId + role
 * 5. Redirects to the original page
 */
export async function GET(request: NextRequest) {
  if (process.env.ENABLE_SUPABASE_SSO !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/'

  try {
    // Find the Supabase auth cookie
    const sbCookie = request.cookies.getAll().find(c =>
      c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    )

    if (!sbCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Parse the cookie to extract access_token
    let accessToken: string
    try {
      let cookieValue = sbCookie.value
      try {
        cookieValue = Buffer.from(cookieValue, 'base64').toString('utf-8')
      } catch {
        // Not base64
      }
      const parsed = JSON.parse(cookieValue)
      accessToken = parsed.access_token || parsed[0]?.access_token
    } catch {
      accessToken = sbCookie.value
    }

    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    await signIn('supabase-sso', {
      accessToken,
      redirect: false,
    })

    return NextResponse.redirect(new URL(callbackUrl, request.url))
  } catch (error) {
    console.error('[SSO] HRM callback error:', error)
    return NextResponse.redirect(new URL('/login?error=sso_failed', request.url))
  }
}
