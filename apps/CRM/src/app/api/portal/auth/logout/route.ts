import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// POST /api/portal/auth/logout — Invalidate session + clear cookie
export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('portal_session')?.value

    if (token) {
      // Delete session from DB
      await prisma.portalSession.deleteMany({ where: { token } })
    }

    // Clear cookie
    const res = NextResponse.json({ message: 'Logged out' })
    res.cookies.set('portal_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return res
  } catch (error) {
    console.error('POST /api/portal/auth/logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
