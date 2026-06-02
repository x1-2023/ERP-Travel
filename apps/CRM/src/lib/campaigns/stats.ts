import { prisma } from '@/lib/prisma'

// ── Types ────────────────────────────────────────────────────────────

export interface CampaignStats {
  sent: number
  opened: number
  clicked: number
  failed: number
  unsubscribed: number
  openRate: number
  clickRate: number
  bounceRate: number
}

export interface VariantStats {
  variantId: string
  variantName: string
  sent: number
  opened: number
  clicked: number
  openRate: number
  clickRate: number
}

// ── Functions ────────────────────────────────────────────────────────

/**
 * Calculate real campaign stats from CampaignSend records.
 */
export async function getCampaignStats(campaignId: string): Promise<CampaignStats> {
  const sends = await prisma.campaignSend.findMany({
    where: { campaignId },
    select: {
      status: true,
      openedAt: true,
      clickedAt: true,
      unsubscribedAt: true,
    },
  })

  const sent = sends.filter((s) => s.status !== 'PENDING' && s.status !== 'FAILED').length
  const opened = sends.filter((s) => s.openedAt !== null).length
  const clicked = sends.filter((s) => s.clickedAt !== null).length
  const failed = sends.filter((s) => s.status === 'FAILED' || s.status === 'BOUNCED').length
  const unsubscribed = sends.filter((s) => s.unsubscribedAt !== null).length

  return {
    sent,
    opened,
    clicked,
    failed,
    unsubscribed,
    openRate: sent > 0 ? (opened / sent) * 100 : 0,
    clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
    bounceRate: sent > 0 ? (failed / sent) * 100 : 0,
  }
}

/**
 * Calculate per-variant stats for A/B comparison.
 */
export async function getVariantStats(campaignId: string): Promise<VariantStats[]> {
  const variants = await prisma.campaignVariant.findMany({
    where: { campaignId },
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  })

  const sends = await prisma.campaignSend.findMany({
    where: { campaignId },
    select: {
      variantId: true,
      status: true,
      openedAt: true,
      clickedAt: true,
    },
  })

  return variants.map((v) => {
    const variantSends = sends.filter((s) => s.variantId === v.id)
    const sent = variantSends.filter((s) => s.status !== 'PENDING' && s.status !== 'FAILED').length
    const opened = variantSends.filter((s) => s.openedAt !== null).length
    const clicked = variantSends.filter((s) => s.clickedAt !== null).length

    return {
      variantId: v.id,
      variantName: v.name,
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
    }
  })
}
