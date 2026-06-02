import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { emailService } from '@/services/email.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const templates = await emailService.getTemplates(session.user.tenantId)
    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('Get email templates error:', error)
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
    const template = await emailService.createTemplate(session.user.tenantId, body)
    return NextResponse.json({ data: template }, { status: 201 })
  } catch (error) {
    console.error('Create email template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
