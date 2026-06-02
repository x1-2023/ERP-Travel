import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export interface PortalContext {
  portalUser: {
    id: string
    email: string
    firstName: string
    lastName: string
    companyId: string
    company: { id: string; name: string }
  }
}

export async function getPortalSession(): Promise<PortalContext | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('portal_session')?.value
    if (!token) return null

    const session = await prisma.portalSession.findUnique({
      where: { token },
      include: {
        portalUser: {
          include: { company: { select: { id: true, name: true } } },
        },
      },
    })

    if (!session || session.expiresAt < new Date() || !session.portalUser.isActive) {
      return null
    }

    return { portalUser: session.portalUser as PortalContext['portalUser'] }
  } catch {
    return null
  }
}
