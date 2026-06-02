import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'
import { prisma } from '@/lib/prisma'

// POST /api/portal/quotes/[id]/viewed — Mark quote as VIEWED (fire-and-forget)
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getPortalSession()
    if (!session) {
      return NextResponse.json({ success: true })
    }

    const { id } = params

    // Only transition SENT → VIEWED (idempotent, won't overwrite ACCEPTED/REJECTED/etc.)
    await prisma.quote.updateMany({
      where: {
        id,
        companyId: session.portalUser.companyId,
        status: 'SENT',
      },
      data: { status: 'VIEWED' },
    })

    return NextResponse.json({ success: true })
  } catch {
    // Swallow errors — tracking is best-effort
    return NextResponse.json({ success: true })
  }
}
