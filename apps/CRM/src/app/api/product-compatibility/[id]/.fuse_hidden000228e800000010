import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError, NotFound } from '@/lib/api/errors'

// DELETE /api/product-compatibility/[id] — Remove rule
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const existing = await prisma.productCompatibility.findUnique({ where: { id: params.id } })
    if (!existing) return handleApiError(NotFound('Compatibility rule'), '/api/product-compatibility/[id]')

    await prisma.productCompatibility.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, '/api/product-compatibility/[id]')
  }
}
