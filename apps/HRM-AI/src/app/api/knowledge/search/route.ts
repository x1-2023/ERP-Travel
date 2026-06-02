// src/app/api/knowledge/search/route.ts
// Knowledge Search API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { knowledgeService } from '@/services/knowledge.service'
import { safeParseInt } from '@/lib/api/parse-params'

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
    const query = searchParams.get('q')
    const limit = safeParseInt(searchParams.get('limit'), 5)

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const articles = await knowledgeService.search(
      session.user.tenantId,
      query,
      limit
    )

    return NextResponse.json({ data: articles })
  } catch (error) {
    console.error('Search knowledge error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
