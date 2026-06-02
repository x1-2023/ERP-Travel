import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { generateQuotePDF } from '@/lib/pdf/generate'
import { rateLimitPdf } from '@/lib/api/rate-limit'
import { Forbidden, NotFound, RateLimited, InternalError, Unauthorized, handleApiError } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

// GET /api/quotes/[id]/pdf — Generate and download quote PDF
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    // Rate limit
    const rl = rateLimitPdf(user.id)
    if (!rl.success) throw RateLimited(rl.resetAt)

    // Check quote exists and ownership
    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { createdById: true, quoteNumber: true },
    })

    if (!quote) {
      throw NotFound('Báo giá')
    }

    if (!canAccess(user, 'view_all') && quote.createdById !== user.id) {
      throw Forbidden()
    }

    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generateQuotePDF(id)
    } catch (pdfError) {
      logger.error('PDF generation failed', pdfError instanceof Error ? pdfError : null, {
        quoteId: id, userId: user.id,
      })
      throw InternalError('Không thể tạo PDF')
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quote.quoteNumber}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/quotes/[id]/pdf')
    }
    return handleApiError(error, '/api/quotes/[id]/pdf')
  }
}
