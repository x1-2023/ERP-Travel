export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

// GET /api/portal/auth/verify?token=xxx
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.redirect(new URL('/portal/login?error=invalid', req.url))
    }

    const session = await prisma.portalSession.findUnique({
      where: { magicToken: token },
      include: { portalUser: true },
    })

    if (!session || session.isUsed || session.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/portal/login?error=expired', req.url))
    }

    // Mark as used, create new session token
    const sessionToken = randomBytes(32).toString('hex')
    await prisma.portalSession.update({
      where: { id: session.id },
      data: {
        isUsed: true,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      },
    })

    // Update last login
    await prisma.portalUser.update({
      where: { id: session.portalUserId },
      data: { lastLoginAt: new Date() },
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('portal_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return NextResponse.redirect(new URL('/portal', req.url))
  } catch (error) {
    console.error('GET /api/portal/auth/verify error:', error)
    return NextResponse.redirect(new URL('/portal/login?error=failed', req.url))
  }
}
