import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as courseService from '@/services/learning/course.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const params = {
      tenantId,
      status: searchParams.get('status') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      search: searchParams.get('search') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      limit: safeParseInt(searchParams.get('limit'), 20),
    }

    const result = await courseService.getCourses(
      tenantId,
      { status: params.status, categoryId: params.categoryId, search: params.search },
      params.page,
      params.limit
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const body = await request.json()
    const result = await courseService.createCourse(tenantId, userId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
