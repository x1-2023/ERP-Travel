import { NextRequest } from 'next/server'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { sendEmail, type EmailTemplate } from '@/lib/email'
import { rateLimitEmail } from '@/lib/api/rate-limit'
import { BadRequest, Forbidden, RateLimited, Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { logger } from '@/lib/logger'

const VALID_TEMPLATES: EmailTemplate[] = [
  'welcome',
  'quote-sent',
  'quote-expiring',
  'portal-magic-link',
  'password-reset',
  'campaign',
]

const CAMPAIGN_TEMPLATES: EmailTemplate[] = ['campaign']

// POST /api/email/send — Internal email sending endpoint
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    // Rate limit
    const rl = rateLimitEmail(user.id)
    if (!rl.success) throw RateLimited(rl.resetAt)

    const body = await req.json()
    const { to, subject, template, data, replyTo } = body

    if (!to || !subject || !template) {
      throw BadRequest('to, subject và template là bắt buộc')
    }

    if (!VALID_TEMPLATES.includes(template)) {
      throw BadRequest(`Template không hợp lệ: ${template}`)
    }

    // Campaign templates require MANAGER+ role
    if (CAMPAIGN_TEMPLATES.includes(template) && !canAccess(user, 'manage_campaigns')) {
      throw Forbidden('Bạn không có quyền gửi email chiến dịch')
    }

    // All other templates require MEMBER+ role
    if (!canAccess(user, 'create')) {
      throw Forbidden('Bạn không có quyền gửi email')
    }

    const result = await sendEmail(
      {
        to,
        subject,
        template,
        data: data || {},
        replyTo,
      },
      user.id
    )

    if (!result.success) {
      logger.error('Email send failed via /api/email/send', null, {
        userId: user.id, template, error: result.error,
      })
      return apiSuccess({ error: result.error || 'Không thể gửi email' }, 502)
    }

    return apiSuccess({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/email/send')
    }
    return handleApiError(error, '/api/email/send')
  }
}
