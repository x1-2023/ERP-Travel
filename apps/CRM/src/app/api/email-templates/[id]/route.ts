import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { validateRequest, updateEmailTemplateSchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'

type Params = { params: { id: string } }

// GET /api/email-templates/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await getCurrentUser()

    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/email-templates/[id]')
  }
}

// PATCH /api/email-templates/[id] — Update template (MANAGER+)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result
    const body = await req.json()
    const data = validateRequest(updateEmailTemplateSchema, body)

    const existing = await prisma.emailTemplate.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(template)
  } catch (error) {
    return handleApiError(error, '/api/email-templates/[id]')
  }
}

// DELETE /api/email-templates/[id] — Delete template (MANAGER+)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const existing = await prisma.emailTemplate.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await prisma.emailTemplate.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, '/api/email-templates/[id]')
  }
}
