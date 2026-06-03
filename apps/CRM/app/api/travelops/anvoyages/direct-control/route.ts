import { NextRequest, NextResponse } from 'next/server'
import {
  createAnVoyagesDirectClientFromEnv,
  handleTravelOpsDirectControlBody,
} from '@vierp/travelops/backoffice/direct-channel-control'

const routePath = '/api/travelops/anvoyages/direct-control'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const actorRef = await authorizeRequest(request)
    if (actorRef instanceof NextResponse) return actorRef

    const body = await readJsonBody(request)
    const result = await handleTravelOpsDirectControlBody(
      {
        ...body,
        actorRef,
      },
      {
        anvoyages: createAnVoyagesDirectClientFromEnv(process.env),
      }
    )

    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    return toErrorResponse(error)
  }
}

async function authorizeRequest(request: NextRequest): Promise<string | NextResponse> {
  const controlToken =
    process.env.VIETERP_TRAVELOPS_CONTROL_TOKEN ?? process.env.TRAVELOPS_DIRECT_CONTROL_TOKEN
  const headerToken =
    request.headers.get('x-erp-control-token') ?? request.headers.get('x-travelops-control-token')

  if (controlToken && headerToken === controlToken) {
    return 'service:travelops-control'
  }

  const { isErrorResponse, requireRole } = await import('@/lib/auth/rbac')
  const user = await requireRole(['ADMIN', 'MANAGER'])
  if (isErrorResponse(user)) return user

  return `crm:${user.id}`
}

async function readJsonBody(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw apiError(400, 'BAD_REQUEST', 'Request body must be a JSON object')
    }
    return body as Record<string, unknown>
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw apiError(400, 'BAD_REQUEST', 'Request body must be valid JSON')
    }
    throw error
  }
}

function toErrorResponse(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json(
      {
        ok: false,
        code: error.code,
        error: error.message,
      },
      { status: error.status }
    )
  }

  return NextResponse.json(
    {
      ok: false,
      code: 'INTERNAL_ERROR',
      error: error instanceof Error ? error.message : String(error),
      path: routePath,
    },
    { status: 500 }
  )
}

function apiError(status: number, code: string, message: string) {
  const error = new Error(message) as Error & { status: number; code: string }
  error.status = status
  error.code = code
  return error
}

function isApiError(error: unknown): error is Error & { status: number; code: string } {
  return error instanceof Error && 'status' in error && 'code' in error
}
