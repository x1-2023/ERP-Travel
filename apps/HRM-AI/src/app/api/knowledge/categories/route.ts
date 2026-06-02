// src/app/api/knowledge/categories/route.ts
// Knowledge Categories API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { knowledgeService } from '@/services/knowledge.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const categories = await knowledgeService.getCategories(
      session.user.tenantId
    )

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error('Get knowledge categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
