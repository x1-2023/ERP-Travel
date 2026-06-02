import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendEmail } from '@/lib/email/client'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { to } = await request.json()
    if (!to) return NextResponse.json({ error: 'Email address required' }, { status: 400 })

    const result = await sendEmail(
      session.user.tenantId,
      to,
      '[Lạc Việt HR] Test Email',
      '<h2>Test Email</h2><p>Cấu hình email hoạt động!</p>',
      'Test Email - Cấu hình email hoạt động!'
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send test email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
