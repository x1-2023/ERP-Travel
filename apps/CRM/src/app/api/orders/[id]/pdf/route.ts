import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { generateOrderPDF } from '@/lib/pdf/generate'
import { rateLimitPdf } from '@/lib/api/rate-limit'
import { Forbidden, NotFound, RateLimited, InternalError, Unauthorized, handleApiError } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

// GET /api/orders/[id]/pdf — Generate and download order PDF
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

    // Check order exists and ownership
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      select: { createdById: true, orderNumber: true },
    })

    if (!order) {
      throw NotFound('Đơn hàng')
    }

    if (!canAccess(user, 'view_all') && order.createdById !== user.id) {
      throw Forbidden()
    }

    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generateOrderPDF(id)
    } catch (pdfError) {
      logger.error('PDF generation failed', pdfError instanceof Error ? pdfError : null, {
        orderId: id, userId: user.id,
      })
      throw InternalError('Không thể tạo PDF')
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${order.orderNumber}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/orders/[id]/pdf')
    }
    return handleApiError(error, '/api/orders/[id]/pdf')
  }
}
