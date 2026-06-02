import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyUnsubscribeToken } from '@/lib/campaigns/unsubscribe'

// GET /api/unsubscribe?token=xxx — Public endpoint, no auth
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return htmlResponse('Link không hợp lệ', false)
  }

  const decoded = verifyUnsubscribeToken(token)
  if (!decoded) {
    return htmlResponse('Link không hợp lệ hoặc đã hết hạn', false)
  }

  try {
    // Upsert unsubscribe record (idempotent)
    await prisma.unsubscribe.upsert({
      where: { email: decoded.email },
      create: {
        email: decoded.email,
        campaignId: decoded.campaignId || null,
      },
      update: {
        // Already unsubscribed — no-op
      },
    })

    return htmlResponse('Bạn đã hủy đăng ký thành công', true)
  } catch {
    return htmlResponse('Đã xảy ra lỗi. Vui lòng thử lại sau.', false)
  }
}

function htmlResponse(message: string, success: boolean): NextResponse {
  const icon = success ? '&#10003;' : '&#10007;'
  const color = success ? '#10B981' : '#EF4444'

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hủy đăng ký</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0B0F1A;
      color: #EDEDED;
    }
    .container {
      text-align: center;
      padding: 3rem 2rem;
      max-width: 400px;
    }
    .icon {
      font-size: 3rem;
      color: ${color};
      margin-bottom: 1rem;
    }
    .message {
      font-size: 1.125rem;
      line-height: 1.6;
      color: #A3A3A3;
    }
    .footer {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #525252;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <p class="message">${message}</p>
    ${success ? '<p class="footer">Bạn sẽ không nhận email marketing từ chúng tôi nữa.</p>' : ''}
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
