// src/app/api/knowledge/route.ts
// Knowledge Base API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { knowledgeService } from '@/services/knowledge.service'
import { z } from 'zod'
import { safeParseInt } from '@/lib/api/parse-params'

const createArticleSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề không được để trống' }),
  content: z.string().min(1, { message: 'Nội dung không được để trống' }),
  category: z.string().min(1, { message: 'Danh mục không được để trống' }),
  keywords: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isPublished = searchParams.get('isPublished')
    const page = safeParseInt(searchParams.get('page'), 1)
    const pageSize = safeParseInt(searchParams.get('pageSize'), 20)

    // Regular users only see published articles
    const showPublished = ['ADMIN', 'HR_MANAGER'].includes(session.user.role)
      ? isPublished === 'true'
        ? true
        : isPublished === 'false'
          ? false
          : undefined
      : true

    const result = await knowledgeService.getAll(session.user.tenantId, {
      category: category || undefined,
      search: search || undefined,
      isPublished: showPublished,
      page,
      pageSize,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get knowledge articles error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can create articles
    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = createArticleSchema.parse(body)

    const article = await knowledgeService.create(
      session.user.tenantId,
      session.user.id,
      data
    )

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (error) {
    console.error('Create knowledge article error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
