import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { validateRequest, createEmailTemplateSchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'

// GET /api/email-templates — List templates
export async function GET() {
  try {
    await getCurrentUser()

    const templates = await prisma.emailTemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(templates)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/email-templates')
  }
}

// POST /api/email-templates — Create template (MANAGER+)
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result
    const user = result
    const body = await req.json()
    const data = validateRequest(createEmailTemplateSchema, body)

    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        category: data.category || 'campaign',
        isDefault: data.isDefault || false,
        createdById: user.id,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    return handleApiError(error, '/api/email-templates')
  }
}
