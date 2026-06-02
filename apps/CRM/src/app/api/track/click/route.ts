import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAllowedRedirect(rawUrl: string, reqUrl: URL): boolean {
  try {
    const parsed = new URL(rawUrl, reqUrl.origin)
    const appHost = process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
      : reqUrl.hostname
    return parsed.hostname === reqUrl.hostname || parsed.hostname === appHost
  } catch {
    return false
  }
}

// GET /api/track/click?id=sendId&url=encodedUrl — Click tracking redirect (no auth)
export async function GET(req: NextRequest) {
  const sendId = req.nextUrl.searchParams.get('id')
  const url = req.nextUrl.searchParams.get('url')

  if (sendId) {
    // Fire-and-forget: update CampaignSend clickedAt (first click only)
    prisma.campaignSend
      .updateMany({
        where: { id: sendId, clickedAt: null },
        data: { clickedAt: new Date(), status: 'CLICKED' },
      })
      .catch(() => {
        // Silently ignore tracking errors
      })
  }

  // Validate redirect URL — only allow same-origin or app URL hostname
  const redirectUrl = url && isAllowedRedirect(url, req.nextUrl) ? url : '/'
  return NextResponse.redirect(new URL(redirectUrl, req.nextUrl.origin), 302)
}
