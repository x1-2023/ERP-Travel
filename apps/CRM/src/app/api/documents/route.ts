import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { handleApiError } from '@/lib/api/errors'
import { uploadDocument, buildStoragePath } from '@/lib/supabase/storage'

// GET /api/documents — List documents by entity
export async function GET(req: NextRequest) {
  try {
    await getCurrentUser()
    const { searchParams } = req.nextUrl
    const dealId = searchParams.get('dealId')
    const companyId = searchParams.get('companyId')
    const contactId = searchParams.get('contactId')
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (dealId) where.dealId = dealId
    if (companyId) where.companyId = companyId
    if (contactId) where.contactId = contactId
    if (category) where.category = category

    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: documents })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/documents')
  }
}

// POST /api/documents — Upload document (multipart/form-data)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string
    const category = (formData.get('category') as string) || 'OTHER'
    const description = formData.get('description') as string | null
    const dealId = formData.get('dealId') as string | null
    const companyId = formData.get('companyId') as string | null
    const contactId = formData.get('contactId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Determine entity for storage path
    const entityType = dealId ? 'deals' : companyId ? 'companies' : contactId ? 'contacts' : 'general'
    const entityId = dealId || companyId || contactId || 'misc'

    const buffer = Buffer.from(await file.arrayBuffer())
    const storagePath = buildStoragePath(entityType, entityId, file.name)

    await uploadDocument(buffer, storagePath, file.type)

    const document = await prisma.document.create({
      data: {
        name,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath,
        category: category as any,
        description: description || undefined,
        dealId: dealId || undefined,
        companyId: companyId || undefined,
        contactId: contactId || undefined,
        uploadedById: user.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/documents')
  }
}
