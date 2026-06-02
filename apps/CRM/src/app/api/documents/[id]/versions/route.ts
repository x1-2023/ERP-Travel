import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { handleApiError } from '@/lib/api/errors'
import { uploadDocument, buildStoragePath } from '@/lib/supabase/storage'

// POST /api/documents/[id]/versions — Upload new version
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    const parentDoc = await prisma.document.findUnique({ where: { id } })
    if (!parentDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const entityType = parentDoc.dealId ? 'deals' : parentDoc.companyId ? 'companies' : parentDoc.contactId ? 'contacts' : 'general'
    const entityId = parentDoc.dealId || parentDoc.companyId || parentDoc.contactId || 'misc'

    const buffer = Buffer.from(await file.arrayBuffer())
    const storagePath = buildStoragePath(entityType, entityId, file.name)

    await uploadDocument(buffer, storagePath, file.type)

    // Find max version of this document chain
    const maxVersion = await prisma.document.aggregate({
      where: {
        OR: [
          { id: parentDoc.id },
          { parentId: parentDoc.id },
        ],
      },
      _max: { version: true },
    })

    const newDoc = await prisma.document.create({
      data: {
        name: parentDoc.name,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath,
        category: parentDoc.category,
        description: parentDoc.description,
        version: (maxVersion._max.version || 1) + 1,
        parentId: parentDoc.id,
        dealId: parentDoc.dealId,
        companyId: parentDoc.companyId,
        contactId: parentDoc.contactId,
        uploadedById: user.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(newDoc, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/documents/[id]/versions')
  }
}
