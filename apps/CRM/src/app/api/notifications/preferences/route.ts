import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { CRM_EVENTS } from '@/lib/events/types'

// Events that support email notification
const NOTIFIABLE_EVENTS = [
  CRM_EVENTS.QUOTE_ACCEPTED,
  CRM_EVENTS.QUOTE_REJECTED,
  CRM_EVENTS.QUOTE_EXPIRING,
  CRM_EVENTS.TICKET_CREATED,
  CRM_EVENTS.TICKET_ASSIGNED,
  CRM_EVENTS.ORDER_STATUS_CHANGED,
  CRM_EVENTS.CAMPAIGN_SENT,
] as const

// GET /api/notifications/preferences — Get current user's preferences
export async function GET() {
  try {
    const user = await getCurrentUser()

    const existing = await prisma.notificationPreference.findMany({
      where: { userId: user.id },
    })

    const prefMap = new Map(existing.map((p) => [p.eventType, p]))

    const preferences = NOTIFIABLE_EVENTS.map((eventType) => {
      const pref = prefMap.get(eventType)
      return {
        eventType,
        inApp: pref ? pref.inApp : true,
        email: pref ? pref.email : false,
      }
    })

    return apiSuccess(preferences)
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/notifications/preferences')
    return handleApiError(error, '/api/notifications/preferences')
  }
}

// PUT /api/notifications/preferences — Update preferences
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()

    const { preferences } = body as {
      preferences: Array<{ eventType: string; inApp: boolean; email: boolean }>
    }

    if (!Array.isArray(preferences)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Validate event types
    const validEvents = new Set<string>(NOTIFIABLE_EVENTS)

    const upserts = preferences
      .filter((p) => validEvents.has(p.eventType))
      .map((p) =>
        prisma.notificationPreference.upsert({
          where: {
            userId_eventType: { userId: user.id, eventType: p.eventType },
          },
          create: {
            userId: user.id,
            eventType: p.eventType,
            inApp: p.inApp,
            email: p.email,
          },
          update: {
            inApp: p.inApp,
            email: p.email,
          },
        })
      )

    await Promise.all(upserts)

    // Return updated
    const updated = await prisma.notificationPreference.findMany({
      where: { userId: user.id },
    })

    const prefMap = new Map(updated.map((p) => [p.eventType, p]))
    const result = NOTIFIABLE_EVENTS.map((eventType) => {
      const pref = prefMap.get(eventType)
      return {
        eventType,
        inApp: pref ? pref.inApp : true,
        email: pref ? pref.email : false,
      }
    })

    return apiSuccess(result)
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/notifications/preferences')
    return handleApiError(error, '/api/notifications/preferences')
  }
}
