import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSmtpConfig, saveSmtpConfig, testSmtpConnection } from '@/lib/email/client'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const config = await getSmtpConfig(session.user.tenantId)
    if (!config) return NextResponse.json({ data: null })

    // Mask password
    return NextResponse.json({
      data: { ...config, pass: config.pass ? '••••••••' : '' },
    })
  } catch (error) {
    console.error('Get email config error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { host, port, secure, user, pass, from, testConnection } = body

    const config = { host, port, secure, user, pass, from }

    if (testConnection) {
      const result = await testSmtpConnection(config)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }

    await saveSmtpConfig(session.user.tenantId, config, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save email config error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
