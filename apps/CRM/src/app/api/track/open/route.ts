import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TRANSPARENT_GIF } from '@/lib/campaigns/tracking'

// GET /api/track/open?id=sendId — Tracking pixel endpoint (no auth)
export async function GET(req: NextRequest) {
  const sendId = req.nextUrl.searchParams.get('id')

  if (sendId) {
    // Fire-and-forget: update CampaignSend openedAt (first open only)
    prisma.campaignSend
      .updateMany({
        where: { id: sendId, openedAt: null },
        data: { openedAt: new Date(), status: 'OPENED' },
      })
      .catch(() => {
        // Silently ignore tracking errors
      })
  }

  // Always return 1x1 transparent GIF regardless of tracking success
  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  })
}
