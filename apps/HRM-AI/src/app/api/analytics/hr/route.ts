// src/app/api/analytics/hr/route.ts
// HR Analytics API

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { hrAnalyticsService } from '@/services/analytics/hr-analytics.service'
import { withErrorHandler, Errors, successResponse } from '@/lib/errors'
import { checkPermission } from '@/lib/security/rbac'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  // Check permission using RBAC
  checkPermission(session.user.role, 'reports', 'read')

  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get('date')
  const date = dateStr ? new Date(dateStr) : new Date()

  const data = await hrAnalyticsService.getWorkforceComposition(
    session.user.tenantId,
    date
  )

  return successResponse(data)
})

