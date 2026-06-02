import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { handleApiError } from '@/lib/api/errors'
import { getSignedUrl, deleteFile } from '@/lib/supabase/storage'

// GET /api/documents/[id] — Get signed download URL
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser()
    const { id } = await params

    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const signedUrl = await getSignedUrl(doc.storagePath, 3600) // 1 hour
    if (!signedUrl) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
    }

    return NextResponse.json({ url: signedUrl, document: doc })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/documents/[id]')
  }
}

// PATCH /api/documents/[id] — Update metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser()
    const { id } = await params
    const body = await req.json()

    const doc = await prisma.document.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(doc)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    return handleApiError(error, '/api/documents/[id]')
  }
}

// DELETE /api/documents/[id] — Delete document
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser()
    const { id } = await params

    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete from storage
    try {
      await deleteFile(doc.storagePath)
    } catch {
      // Continue even if storage delete fails
    }

    // Delete from DB
    await prisma.document.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/documents/[id]')
  }
}
