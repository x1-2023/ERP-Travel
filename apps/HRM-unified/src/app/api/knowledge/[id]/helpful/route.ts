// src/app/api/knowledge/[id]/helpful/route.ts
// Mark Article as Helpful API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { knowledgeService } from '@/services/knowledge.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await knowledgeService.markHelpful(session.user.tenantId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark helpful error:', error)

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
