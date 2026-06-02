import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

// GET /api/users — List staff members (for dropdowns)
export async function GET(req: NextRequest) {
  try {
    await getCurrentUser()

    const users = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER', 'MEMBER'] } },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      orderBy: { name: 'asc' },
    })

    return apiSuccess(users)
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/users')
    return handleApiError(error, '/api/users')
  }
}
