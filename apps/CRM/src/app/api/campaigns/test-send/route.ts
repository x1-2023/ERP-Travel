import { NextRequest, NextResponse } from 'next/server'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { replaceVariables } from '@/lib/campaigns/template-engine'
import { renderTemplate, sendEmail } from '@/lib/email'

// Preview variable values for test sends
const PREVIEW_VARIABLES: Record<string, string> = {
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  fullName: 'Nguyễn Văn A',
  email: 'a@email.com',
  company: 'ABC Corp',
  title: 'Giám đốc',
  first_name: 'Nguyễn',
  last_name: 'Văn A',
  full_name: 'Nguyễn Văn A',
  company_name: 'ABC Corp',
  unsubscribeUrl: '#',
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 3600_000 })
    return true
  }

  if (entry.count >= 10) return false
  entry.count++
  return true
}

// POST /api/campaigns/test-send
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result
    const user = result

    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Đã vượt giới hạn 10 email test/giờ' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { subject, body: emailBody, to } = body

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Thiếu tiêu đề hoặc nội dung' },
        { status: 400 }
      )
    }

    const recipient = to || user.email
    const processedSubject = replaceVariables(subject, PREVIEW_VARIABLES)
    const processedBody = replaceVariables(emailBody, PREVIEW_VARIABLES)

    // Render through campaign template for consistent email wrapper
    const html = await renderTemplate('campaign', {
      content: processedBody,
      recipientName: PREVIEW_VARIABLES.fullName,
      unsubscribeUrl: '#',
    })

    const emailResult = await sendEmail(
      {
        to: recipient,
        subject: `[TEST] ${processedSubject}`,
        template: 'campaign',
        data: {},
        html,
      },
      user.id
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Gửi email test thất bại' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, to: recipient })
  } catch (error) {
    return handleApiError(error, '/api/campaigns/test-send')
  }
}
