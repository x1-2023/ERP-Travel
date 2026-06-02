import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authConfig } from '@/lib/auth.config'

/**
 * Edge Runtime compatible middleware
 * Uses auth.config.ts which does NOT import bcryptjs or Prisma
 * SSO: Detects Supabase cookie and redirects to SSO callback
 */
const { auth } = NextAuth(authConfig)

// Wrap auth middleware with SSO cookie detection
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // SSO: Check for Supabase auth cookie before NextAuth check
  if (process.env.ENABLE_SUPABASE_SSO === 'true' && pathname !== '/api/auth/sso-callback') {
    const hasSupabaseCookie = request.cookies.getAll().some(c =>
      c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    )
    const nextAuthCookie = request.cookies.get('authjs.session-token') ||
                          request.cookies.get('__Secure-authjs.session-token')

    if (hasSupabaseCookie && !nextAuthCookie) {
      const isPublicRoute = pathname.startsWith('/careers') ||
                           pathname.startsWith('/api') ||
                           pathname.startsWith('/_next') ||
                           pathname === '/login' ||
                           pathname === '/register' ||
                           pathname === '/forgot-password'

      if (!isPublicRoute) {
        const callbackUrl = new URL('/api/auth/sso-callback', request.url)
        callbackUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(callbackUrl)
      }
    }
  }

  // Proceed with normal NextAuth middleware
  return (auth as any)(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
