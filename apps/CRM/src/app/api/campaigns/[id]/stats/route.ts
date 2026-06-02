import { NextRequest } from 'next/server'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { prisma } from '@/lib/prisma'
import { getCampaignStats, getVariantStats } from '@/lib/campaigns/stats'
import { NotFound, Forbidden, Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

// GET /api/campaigns/[id]/stats — Real campaign statistics
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    })

    if (!campaign) throw NotFound('Chiến dịch')

    // RBAC: owner or MANAGER+
    if (!canAccess(user, 'view_all') && campaign.createdById !== user.id) {
      throw Forbidden()
    }

    const [stats, variantStats] = await Promise.all([
      getCampaignStats(id),
      getVariantStats(id),
    ])

    return apiSuccess({ ...stats, variants: variantStats })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/campaigns/[id]/stats')
    }
    return handleApiError(error, '/api/campaigns/[id]/stats')
  }
}
