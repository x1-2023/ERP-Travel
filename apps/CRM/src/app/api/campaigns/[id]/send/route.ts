import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { sendEmail, renderTemplate } from '@/lib/email'
import { getAudienceContacts } from '@/lib/campaigns/audience'
import { replaceVariables, getContactVariables } from '@/lib/campaigns/template-engine'
import { generateUnsubscribeUrl } from '@/lib/campaigns/unsubscribe'
import { injectOpenTracker, rewriteLinksForTracking } from '@/lib/campaigns/tracking'
import { BadRequest, Forbidden, NotFound, Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { logger } from '@/lib/logger'
import { eventBus, CRM_EVENTS } from '@/lib/events'

const SEND_DELAY_MS = Number(process.env.CAMPAIGN_SEND_DELAY_MS) || 500

// POST /api/campaigns/[id]/send — Send campaign emails
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    // RBAC: ADMIN or MANAGER only
    if (!canAccess(user, 'manage_campaigns')) {
      throw Forbidden()
    }

    // Fetch campaign with variants and audience
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { createdAt: 'asc' } },
        audience: { select: { id: true, name: true } },
      },
    })

    if (!campaign) throw NotFound('Chiến dịch')

    // Validation
    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      throw BadRequest('Chỉ có thể gửi chiến dịch ở trạng thái Nháp hoặc Đã lên lịch')
    }

    if (campaign.type !== 'EMAIL') {
      throw BadRequest('Hiện chỉ hỗ trợ gửi chiến dịch Email')
    }

    if (campaign.variants.length === 0) {
      throw BadRequest('Chiến dịch chưa có nội dung (variant)')
    }

    // Check at least one variant has content
    const validVariants = campaign.variants.filter((v) => v.content || v.subject)
    if (validVariants.length === 0) {
      throw BadRequest('Chiến dịch chưa có variant nào có nội dung')
    }

    if (!campaign.audienceId || !campaign.audience) {
      throw BadRequest('Chiến dịch chưa chọn đối tượng')
    }

    // Resolve audience contacts (filters out no-email and unsubscribed)
    const contacts = await getAudienceContacts(campaign.audienceId)
    if (contacts.length === 0) {
      throw BadRequest('Không có liên hệ hợp lệ trong đối tượng (có thể đã hủy đăng ký hoặc thiếu email)')
    }

    // Update status to SENDING
    await prisma.campaign.update({
      where: { id },
      data: { status: 'SENDING' },
    })

    // Split contacts by variant A/B percentages
    const variants = campaign.variants
    const contactAssignments: Array<{
      contact: typeof contacts[number]
      variant: typeof variants[number]
    }> = []

    if (variants.length === 1) {
      contacts.forEach((c) => contactAssignments.push({ contact: c, variant: variants[0] }))
    } else {
      // A/B split
      const splitPoint = Math.floor(contacts.length * (variants[0].splitPercent / 100))
      contacts.forEach((c, idx) => {
        const variant = idx < splitPoint ? variants[0] : variants[1]
        contactAssignments.push({ contact: c, variant })
      })
    }

    // Send emails sequentially with delay
    let totalSent = 0
    let totalFailed = 0
    const errors: Array<{ email: string; error: string }> = []

    for (const { contact, variant } of contactAssignments) {
      // Build template variables
      const unsubscribeUrl = generateUnsubscribeUrl(contact.email!, campaign.id)
      const variables = getContactVariables(contact, { unsubscribeUrl })

      // Use variant subject/content or fall back to campaign level
      const subject = replaceVariables(
        variant.subject || campaign.subject,
        variables
      )
      const rawContent = variant.content || campaign.content || ''
      const content = replaceVariables(rawContent, variables)

      // Create CampaignSend record first (need ID for tracking)
      const send = await prisma.campaignSend.create({
        data: {
          campaignId: campaign.id,
          variantId: variant.id,
          contactId: contact.id,
          status: 'PENDING',
        },
      })

      // Render campaign template to HTML
      let html: string
      try {
        html = await renderTemplate('campaign', {
          content,
          recipientName: `${contact.firstName} ${contact.lastName}`.trim(),
          unsubscribeUrl,
        })
      } catch {
        // If template rendering fails, mark as failed and continue
        await prisma.campaignSend.update({
          where: { id: send.id },
          data: { status: 'FAILED' },
        })
        totalFailed++
        errors.push({ email: contact.email!, error: 'Template rendering failed' })
        continue
      }

      // Inject open tracking pixel + rewrite links for click tracking
      html = injectOpenTracker(html, send.id)
      html = rewriteLinksForTracking(html, send.id)

      // Send via Resend with pre-rendered HTML (includes tracking)
      const result = await sendEmail(
        {
          to: contact.email!,
          subject,
          template: 'campaign',
          data: {},
          html, // Pre-rendered HTML with tracking injected
        },
        user.id
      )

      if (result.success) {
        await prisma.campaignSend.update({
          where: { id: send.id },
          data: { status: 'SENT', sentAt: new Date() },
        })
        totalSent++
      } else {
        await prisma.campaignSend.update({
          where: { id: send.id },
          data: { status: 'FAILED' },
        })
        totalFailed++
        errors.push({ email: contact.email!, error: result.error || 'Unknown error' })
      }

      // Rate limit delay between sends
      if (SEND_DELAY_MS > 0) {
        await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS))
      }
    }

    // Determine final status
    const totalAttempted = totalSent + totalFailed
    const failRate = totalAttempted > 0 ? totalFailed / totalAttempted : 0
    const finalStatus = failRate > 0.5 ? 'DRAFT' : 'SENT'

    // Update campaign stats
    await prisma.campaign.update({
      where: { id },
      data: {
        status: finalStatus,
        sentAt: totalSent > 0 ? new Date() : undefined,
        completedAt: new Date(),
        totalSent,
        totalBounced: totalFailed,
      },
    })

    // Update variant stats
    for (const variant of variants) {
      const variantSends = await prisma.campaignSend.count({
        where: { campaignId: id, variantId: variant.id, status: 'SENT' },
      })
      await prisma.campaignVariant.update({
        where: { id: variant.id },
        data: { totalSent: variantSends },
      })
    }

    logger.audit('campaign.send', user.id, {
      campaignId: id,
      totalSent,
      totalFailed,
      finalStatus,
    })

    // Fire-and-forget: emit campaign sent event
    eventBus.emit(CRM_EVENTS.CAMPAIGN_SENT, {
      timestamp: new Date().toISOString(),
      userId: user.id,
      campaignId: id,
      campaign: { name: campaign.name },
      sentCount: totalSent,
      createdById: campaign.createdById,
    }).catch(() => {})

    return apiSuccess({
      success: true,
      totalSent,
      failed: totalFailed,
      errors: errors.slice(0, 10), // Limit error details
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/campaigns/[id]/send')
    }
    return handleApiError(error, '/api/campaigns/[id]/send')
  }
}
