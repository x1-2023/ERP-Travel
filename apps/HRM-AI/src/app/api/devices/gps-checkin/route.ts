// src/app/api/devices/gps-checkin/route.ts
// API endpoint for GPS check-in

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createGPSCheckInService } from '@/lib/devices'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// REQUEST SCHEMA
// ═══════════════════════════════════════════════════════════════

const checkInSchema = z.object({
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().nonnegative(),
    altitude: z.number().optional(),
    timestamp: z.string().datetime().optional(),
  }),
  locationId: z.string().optional(),
  wifiSSID: z.string().optional(),
  photoUrl: z.string().url().optional(),
  deviceInfo: z
    .object({
      deviceId: z.string(),
      platform: z.string(),
      appVersion: z.string(),
    })
    .optional(),
})

// ═══════════════════════════════════════════════════════════════
// POST - GPS Check-in
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = checkInSchema.parse(body)

    // Get employee ID from user session
    const employeeId = session.user.employeeId
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin nhân viên' },
        { status: 400 }
      )
    }

    const service = createGPSCheckInService(session.user.tenantId)

    const result = await service.checkIn({
      employeeId,
      coordinates: {
        ...validated.coordinates,
        timestamp: validated.coordinates.timestamp
          ? new Date(validated.coordinates.timestamp)
          : new Date(),
      },
      locationId: validated.locationId,
      wifiSSID: validated.wifiSSID,
      photoUrl: validated.photoUrl,
      deviceInfo: validated.deviceInfo,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.issues },
        { status: 400 }
      )
    }

    console.error('GPS check-in error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể chấm công' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════
// GET - Get office locations and today's history
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'locations'

    const service = createGPSCheckInService(session.user.tenantId)

    if (type === 'history') {
      const employeeId = session.user.employeeId
      if (!employeeId) {
        return NextResponse.json(
          { error: 'Không tìm thấy thông tin nhân viên' },
          { status: 400 }
        )
      }

      const history = await service.getTodayHistory(employeeId)
      return NextResponse.json({
        success: true,
        data: history,
      })
    }

    const locations = await service.getOfficeLocations()
    return NextResponse.json({
      success: true,
      data: locations,
    })
  } catch (error) {
    console.error('Get GPS data error:', error)
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu' },
      { status: 500 }
    )
  }
}
