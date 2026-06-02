import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

export async function GET() {
  try {
    const user = await getCurrentUser()
    return apiSuccess({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/auth/me')
    }
    return handleApiError(error, '/api/auth/me')
  }
}
