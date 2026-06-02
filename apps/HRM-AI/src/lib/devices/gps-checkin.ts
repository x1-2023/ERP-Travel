// src/lib/devices/gps-checkin.ts
// GPS Check-in Service

import prisma from '@/lib/db'
import type { GPSCheckInRequest, GPSCheckInResult, GPSCoordinates } from './types'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const DEFAULT_RADIUS_METERS = 100
const EARTH_RADIUS_KM = 6371

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceKm = EARTH_RADIUS_KM * c

  return Math.round(distanceKm * 1000) // Convert to meters
}

/**
 * Check if coordinates are within radius of office location
 */
export function isWithinRadius(
  userLat: number,
  userLon: number,
  officeLat: number,
  officeLon: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLon, officeLat, officeLon)
  return distance <= radiusMeters
}

// ═══════════════════════════════════════════════════════════════
// GPS CHECK-IN SERVICE
// ═══════════════════════════════════════════════════════════════

export class GPSCheckInService {
  private tenantId: string

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  /**
   * Process GPS check-in request
   */
  async checkIn(request: GPSCheckInRequest): Promise<GPSCheckInResult> {
    const { employeeId, coordinates, locationId, wifiSSID } = request
    const warnings: string[] = []

    // Validate employee
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: this.tenantId,
        status: 'ACTIVE',
      },
    })

    if (!employee) {
      throw new Error('Nhân viên không tồn tại hoặc không hoạt động')
    }

    // Find matching office location
    let matchedLocation = null
    let distanceFromOffice: number | undefined

    if (locationId) {
      // Check specific location
      matchedLocation = await prisma.officeLocation.findFirst({
        where: {
          id: locationId,
          tenantId: this.tenantId,
          isActive: true,
        },
      })
    } else {
      // Find nearest office location
      const locations = await prisma.officeLocation.findMany({
        where: {
          tenantId: this.tenantId,
          isActive: true,
          latitude: { not: null },
          longitude: { not: null },
        },
      })

      let minDistance = Infinity

      for (const location of locations) {
        if (location.latitude && location.longitude) {
          const distance = calculateDistance(
            coordinates.latitude,
            coordinates.longitude,
            Number(location.latitude),
            Number(location.longitude)
          )

          if (distance < minDistance) {
            minDistance = distance
            matchedLocation = location
            distanceFromOffice = distance
          }
        }
      }
    }

    // Determine location type
    let locationType: 'OFFICE' | 'REMOTE' | 'FIELD' = 'REMOTE'
    let isWithinAllowedRadius = false
    let locationName: string | undefined

    if (matchedLocation) {
      locationName = matchedLocation.locationName
      const allowedRadius = matchedLocation.radiusMeters || DEFAULT_RADIUS_METERS

      if (distanceFromOffice === undefined && matchedLocation.latitude && matchedLocation.longitude) {
        distanceFromOffice = calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          Number(matchedLocation.latitude),
          Number(matchedLocation.longitude)
        )
      }

      isWithinAllowedRadius = (distanceFromOffice || 0) <= allowedRadius

      if (isWithinAllowedRadius) {
        locationType = 'OFFICE'
      } else {
        locationType = 'FIELD'
        warnings.push(
          `Khoảng cách đến ${locationName}: ${distanceFromOffice}m (cho phép: ${allowedRadius}m)`
        )
      }

      // Check WiFi SSID if configured
      if (wifiSSID && matchedLocation.allowedWifiSSIDs.length > 0) {
        const isAllowedWifi = matchedLocation.allowedWifiSSIDs.includes(wifiSSID)
        if (!isAllowedWifi) {
          warnings.push(`WiFi "${wifiSSID}" không trong danh sách cho phép`)
        }
      }
    }

    // Check GPS accuracy
    if (coordinates.accuracy > 50) {
      warnings.push(`Độ chính xác GPS thấp: ${coordinates.accuracy}m`)
    }

    // Create GPS check-in device if not exists
    let gpsDevice = await prisma.attendanceDevice.findFirst({
      where: {
        tenantId: this.tenantId,
        deviceType: 'GPS_CHECKIN',
        deviceCode: 'GPS-MOBILE',
      },
    })

    if (!gpsDevice) {
      gpsDevice = await prisma.attendanceDevice.create({
        data: {
          tenantId: this.tenantId,
          deviceCode: 'GPS-MOBILE',
          deviceName: 'GPS Mobile Check-in',
          deviceType: 'GPS_CHECKIN',
          status: 'ONLINE',
        },
      })
    }

    // Create raw punch log
    await prisma.rawPunchLog.create({
      data: {
        tenantId: this.tenantId,
        deviceId: gpsDevice.id,
        deviceUserId: employee.employeeCode,
        punchTime: new Date(),
        punchType: 0, // Check-in
        verifyType: 3, // Face/GPS
        employeeId: employee.id,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: coordinates.accuracy,
        rawData: JSON.parse(JSON.stringify({
          coordinates,
          locationId: matchedLocation?.id,
          locationType,
          wifiSSID,
          deviceInfo: request.deviceInfo,
        })),
        isProcessed: false,
      },
    })

    return {
      success: true,
      checkInTime: new Date(),
      locationType,
      locationName,
      distanceFromOffice,
      isWithinRadius: isWithinAllowedRadius,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Get office locations for employee
   */
  async getOfficeLocations(): Promise<
    Array<{
      id: string
      name: string
      address: string | null
      latitude: number | null
      longitude: number | null
      radiusMeters: number
    }>
  > {
    const locations = await prisma.officeLocation.findMany({
      where: {
        tenantId: this.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        locationName: true,
        address: true,
        latitude: true,
        longitude: true,
        radiusMeters: true,
      },
    })

    return locations.map((loc) => ({
      id: loc.id,
      name: loc.locationName,
      address: loc.address,
      latitude: loc.latitude ? Number(loc.latitude) : null,
      longitude: loc.longitude ? Number(loc.longitude) : null,
      radiusMeters: loc.radiusMeters,
    }))
  }

  /**
   * Get today's check-in/out history for employee
   */
  async getTodayHistory(employeeId: string): Promise<
    Array<{
      time: Date
      type: 'IN' | 'OUT'
      location: string | null
      method: string
    }>
  > {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const logs = await prisma.rawPunchLog.findMany({
      where: {
        tenantId: this.tenantId,
        employeeId,
        punchTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        punchTime: 'asc',
      },
      include: {
        device: true,
      },
    })

    return logs.map((log) => ({
      time: log.punchTime,
      type: log.punchType === 0 ? 'IN' : 'OUT',
      location: (log.rawData as Record<string, unknown>)?.locationType as string | null,
      method: log.device.deviceType,
    }))
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createGPSCheckInService(tenantId: string): GPSCheckInService {
  return new GPSCheckInService(tenantId)
}
