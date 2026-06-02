import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'
import { prisma } from '@/lib/prisma'
import { generateQuotePDF } from '@/lib/pdf/generate'
import { logger } from '@/lib/logger'

// GET /api/portal/quotes/[id]/pdf — Download quote PDF (portal)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  const quote = await prisma.quote.findUnique({
    where: { id },
    select: { companyId: true, quoteNumber: true },
  })

  if (!quote) {
    return NextResponse.json({ error: 'Không tìm thấy báo giá' }, { status: 404 })
  }

  if (quote.companyId !== session.portalUser.companyId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const pdfBuffer = await generateQuotePDF(id)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quote.quoteNumber}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    logger.error('Portal PDF generation failed', error instanceof Error ? error : null, {
      quoteId: id,
      portalUserId: session.portalUser.id,
    })
    return NextResponse.json({ error: 'Không thể tạo PDF' }, { status: 500 })
  }
}
