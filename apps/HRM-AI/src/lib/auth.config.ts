import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-compatible auth configuration
 * This file should NOT import bcryptjs, Prisma, or any Node.js-only modules
 * Used by middleware.ts which runs in Edge Runtime
 */

/** Edge-compatible user agent hash using Web Crypto API */
async function hashUserAgentEdge(ua: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ua)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl, headers } }) {
      const isLoggedIn = !!auth?.user

      // Session fingerprint validation: check if user agent matches the one at login
      if (isLoggedIn && auth?.user) {
        const storedHash = (auth as any).uaHash as string | undefined
        if (storedHash) {
          const currentUA = headers.get('user-agent') || ''
          const currentHash = await hashUserAgentEdge(currentUA)
          if (storedHash !== currentHash) {
            // User agent changed since login — possible session theft
            // Force re-authentication by rejecting the session
            return false
          }
        }
      }

      const isOnDashboard = nextUrl.pathname.startsWith('/employees') ||
                           nextUrl.pathname.startsWith('/contracts') ||
                           nextUrl.pathname.startsWith('/organization') ||
                           nextUrl.pathname.startsWith('/settings') ||
                           nextUrl.pathname.startsWith('/attendance') ||
                           nextUrl.pathname.startsWith('/leave') ||
                           nextUrl.pathname.startsWith('/payroll') ||
                           nextUrl.pathname.startsWith('/recruitment') ||
                           nextUrl.pathname.startsWith('/performance') ||
                           nextUrl.pathname.startsWith('/learning') ||
                           nextUrl.pathname.startsWith('/analytics') ||
                           nextUrl.pathname.startsWith('/admin') ||
                           nextUrl.pathname.startsWith('/ai') ||
                           nextUrl.pathname.startsWith('/reports') ||
                           nextUrl.pathname.startsWith('/compensation') ||
                           nextUrl.pathname.startsWith('/compliance') ||
                           nextUrl.pathname.startsWith('/command-center') ||
                           nextUrl.pathname.startsWith('/notifications') ||
                           nextUrl.pathname.startsWith('/ess') ||
                           nextUrl.pathname === '/'
      const isOnAuth = nextUrl.pathname.startsWith('/login') ||
                       nextUrl.pathname.startsWith('/register') ||
                       nextUrl.pathname.startsWith('/forgot-password')
      const isPublicRoute = nextUrl.pathname.startsWith('/careers') ||
                           nextUrl.pathname.startsWith('/api') ||
                           nextUrl.pathname.startsWith('/_next')
      const isSSOCallback = nextUrl.pathname === '/api/auth/sso-callback'

      if (isPublicRoute || isSSOCallback) {
        return true
      }

      // SSO: If user has Supabase cookie but no NextAuth session, redirect to SSO callback
      if (!isLoggedIn && isOnDashboard) {
        const cookies = nextUrl.searchParams // Edge can't read cookies directly in authorized
        // The actual cookie check happens in middleware.ts
        return false // Redirect to login (middleware may intercept for SSO)
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      } else if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl))
        }
        return true
      }
      return true
    },
  },
  providers: [], // Providers are added in auth.ts (not edge-compatible)
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
}
