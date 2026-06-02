// src/app/api/knowledge/[id]/route.ts
// Single Knowledge Article API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { knowledgeService } from '@/services/knowledge.service'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  keywords: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const article = await knowledgeService.getByIdWithView(
      session.user.tenantId,
      id
    )

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Regular users can only see published articles
    if (
      !article.isPublished &&
      !['ADMIN', 'HR_MANAGER'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Get knowledge article error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const data = updateArticleSchema.parse(body)

    const article = await knowledgeService.update(
      session.user.tenantId,
      id,
      data
    )

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Update knowledge article error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Bài viết không tồn tại') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params

    await knowledgeService.delete(session.user.tenantId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete knowledge article error:', error)

    if (error instanceof Error && error.message === 'Bài viết không tồn tại') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
