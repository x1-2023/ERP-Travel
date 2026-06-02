// src/lib/devices/sync-service.ts
// Attendance Device Sync Service

import prisma from '@/lib/db'
import { createZKTecoSDK } from './sdk/zkteco'
import type {
  IDeviceSDK,
  DeviceConfig,
  SyncResult,
  SyncOptions,
  RawPunchRecord,
  DeviceManufacturer,
} from './types'

// ═══════════════════════════════════════════════════════════════
// DEVICE SYNC SERVICE
// ═══════════════════════════════════════════════════════════════

export class DeviceSyncService {
  private tenantId: string

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  /**
   * Get SDK instance based on manufacturer
   */
  private getSDK(manufacturer: DeviceManufacturer, config: DeviceConfig): IDeviceSDK {
    switch (manufacturer) {
      case 'ZKTECO':
        return createZKTecoSDK(config)
      case 'HIKVISION':
        // TODO: Implement HikVision SDK
        throw new Error('HikVision SDK not implemented')
      case 'SUPREMA':
        // TODO: Implement Suprema SDK
        throw new Error('Suprema SDK not implemented')
      default:
        throw new Error(`Unknown manufacturer: ${manufacturer}`)
    }
  }

  /**
   * Sync attendance logs from a single device
   */
  async syncDevice(deviceId: string, options?: SyncOptions): Promise<SyncResult> {
    // Get device configuration
    const device = await prisma.attendanceDevice.findFirst({
      where: {
        id: deviceId,
        tenantId: this.tenantId,
        isActive: true,
      },
    })

    if (!device) {
      throw new Error('Device not found or inactive')
    }

    // Create sync log
    const syncLog = await prisma.deviceSyncLog.create({
      data: {
        tenantId: this.tenantId,
        deviceId: device.id,
        syncType: options?.syncType || 'INCREMENTAL',
        syncStartAt: new Date(),
        status: 'IN_PROGRESS',
      },
    })

    try {
      // Get SDK configuration from device
      const sdkConfig = device.sdkConfig as DeviceConfig | null

      if (!sdkConfig || !device.ipAddress) {
        throw new Error('Device configuration incomplete')
      }

      const config: DeviceConfig = {
        ipAddress: device.ipAddress,
        port: device.port || 4370,
        connectionType: (sdkConfig?.connectionType || 'TCP') as DeviceConfig['connectionType'],
        commKey: sdkConfig?.commKey as string | undefined,
      }

      // Get SDK instance
      const sdk = this.getSDK(device.manufacturer as DeviceManufacturer, config)

      // Connect to device
      const connected = await sdk.connect()
      if (!connected) {
        throw new Error('Failed to connect to device')
      }

      try {
        // Get attendance logs
        const logs = await sdk.getAttendanceLogs(options)

        // Process logs
        const processed = await this.processLogs(device.id, logs)

        // Update device last sync time
        await prisma.attendanceDevice.update({
          where: { id: device.id },
          data: {
            lastSyncAt: new Date(),
            status: 'ONLINE',
          },
        })

        // Update sync log
        await prisma.deviceSyncLog.update({
          where: { id: syncLog.id },
          data: {
            syncEndAt: new Date(),
            recordsFetched: logs.length,
            recordsProcessed: processed.success,
            recordsFailed: processed.failed,
            status: 'SUCCESS',
          },
        })

        // Clear logs if requested
        if (options?.clearAfterSync && logs.length > 0) {
          await sdk.clearAttendanceLogs()
        }

        return {
          success: true,
          recordsFetched: logs.length,
          recordsProcessed: processed.success,
          recordsFailed: processed.failed,
          lastSyncTime: new Date(),
        }
      } finally {
        await sdk.disconnect()
      }
    } catch (error) {
      // Update sync log with error
      await prisma.deviceSyncLog.update({
        where: { id: syncLog.id },
        data: {
          syncEndAt: new Date(),
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      // Update device status
      await prisma.attendanceDevice.update({
        where: { id: device.id },
        data: {
          status: 'ERROR',
        },
      })

      return {
        success: false,
        recordsFetched: 0,
        recordsProcessed: 0,
        recordsFailed: 0,
        lastSyncTime: new Date(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Process raw punch logs and save to database
   */
  private async processLogs(
    deviceId: string,
    logs: RawPunchRecord[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const log of logs) {
      try {
        // Find employee by device user ID (employee code)
        const employee = await prisma.employee.findFirst({
          where: {
            tenantId: this.tenantId,
            employeeCode: log.deviceUserId,
          },
          select: {
            id: true,
          },
        })

        // Create raw punch log
        await prisma.rawPunchLog.create({
          data: {
            tenantId: this.tenantId,
            deviceId,
            deviceUserId: log.deviceUserId,
            punchTime: log.punchTime,
            punchType: log.punchType,
            verifyType: log.verifyType,
            employeeId: employee?.id,
            isProcessed: false,
            rawData: JSON.parse(JSON.stringify(log)),
          },
        })

        success++
      } catch (error) {
        console.error(`Failed to process log for user ${log.deviceUserId}:`, error)
        failed++
      }
    }

    return { success, failed }
  }

  /**
   * Sync all active devices
   */
  async syncAllDevices(options?: SyncOptions): Promise<{
    totalDevices: number
    successCount: number
    failedCount: number
    results: Array<{ deviceId: string; deviceName: string; result: SyncResult }>
  }> {
    const devices = await prisma.attendanceDevice.findMany({
      where: {
        tenantId: this.tenantId,
        isActive: true,
        deviceType: { not: 'GPS_CHECKIN' }, // Skip GPS devices
      },
    })

    const results: Array<{ deviceId: string; deviceName: string; result: SyncResult }> = []
    let successCount = 0
    let failedCount = 0

    for (const device of devices) {
      try {
        const result = await this.syncDevice(device.id, options)
        results.push({
          deviceId: device.id,
          deviceName: device.deviceName,
          result,
        })

        if (result.success) {
          successCount++
        } else {
          failedCount++
        }
      } catch (error) {
        results.push({
          deviceId: device.id,
          deviceName: device.deviceName,
          result: {
            success: false,
            recordsFetched: 0,
            recordsProcessed: 0,
            recordsFailed: 0,
            lastSyncTime: new Date(),
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          },
        })
        failedCount++
      }
    }

    return {
      totalDevices: devices.length,
      successCount,
      failedCount,
      results,
    }
  }

  /**
   * Process unprocessed punch logs into attendance records
   */
  async processUnprocessedLogs(): Promise<{
    processed: number
    created: number
    errors: number
  }> {
    const unprocessedLogs = await prisma.rawPunchLog.findMany({
      where: {
        tenantId: this.tenantId,
        isProcessed: false,
        employeeId: { not: null },
      },
      orderBy: [{ employeeId: 'asc' }, { punchTime: 'asc' }],
      take: 1000, // Process in batches
    })

    let processed = 0
    let created = 0
    let errors = 0

    // Group logs by employee and date
    const groupedLogs = new Map<string, typeof unprocessedLogs>()

    for (const log of unprocessedLogs) {
      const date = log.punchTime.toISOString().split('T')[0]
      const key = `${log.employeeId}-${date}`

      if (!groupedLogs.has(key)) {
        groupedLogs.set(key, [])
      }
      groupedLogs.get(key)!.push(log)
    }

    // Process each employee's daily logs
    const entries = Array.from(groupedLogs.entries())
    for (const [key, logs] of entries) {
      try {
        const parts = key.split('-')
        const employeeId = parts[0]
        const dateStr = parts.slice(1).join('-')
        const date = new Date(dateStr)

        // Sort by time
        const sortedLogs = [...logs].sort(
          (a: typeof logs[0], b: typeof logs[0]) => a.punchTime.getTime() - b.punchTime.getTime()
        )

        // First punch is check-in, last punch is check-out
        const checkIn = sortedLogs[0].punchTime
        const checkOut = sortedLogs.length > 1 ? sortedLogs[sortedLogs.length - 1].punchTime : null

        // Check if attendance record exists
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            tenantId: this.tenantId,
            employeeId: employeeId,
            date: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
          },
        })

        if (existingAttendance) {
          // Update existing record if needed
          await prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              checkIn: existingAttendance.checkIn || checkIn,
              checkOut: checkOut || existingAttendance.checkOut,
            },
          })
        } else {
          // Create new attendance record
          await prisma.attendance.create({
            data: {
              tenantId: this.tenantId,
              employeeId: employeeId,
              date: new Date(dateStr),
              checkIn,
              checkOut,
              status: 'PRESENT',
            },
          })
          created++
        }

        // Mark logs as processed
        await prisma.rawPunchLog.updateMany({
          where: {
            id: { in: sortedLogs.map((l: typeof sortedLogs[0]) => l.id) },
          },
          data: {
            isProcessed: true,
            processedAt: new Date(),
          },
        })

        processed += sortedLogs.length
      } catch (error) {
        console.error(`Error processing logs for ${key}:`, error)
        errors++
      }
    }

    return { processed, created, errors }
  }

  /**
   * Get sync history for a device
   */
  async getSyncHistory(
    deviceId: string,
    limit: number = 20
  ): Promise<
    Array<{
      id: string
      syncType: string
      startTime: Date
      endTime: Date | null
      status: string
      recordsFetched: number
      recordsProcessed: number
      recordsFailed: number
      errorMessage: string | null
    }>
  > {
    const logs = await prisma.deviceSyncLog.findMany({
      where: {
        tenantId: this.tenantId,
        deviceId,
      },
      orderBy: {
        syncStartAt: 'desc',
      },
      take: limit,
    })

    return logs.map((log) => ({
      id: log.id,
      syncType: log.syncType,
      startTime: log.syncStartAt,
      endTime: log.syncEndAt,
      status: log.status,
      recordsFetched: log.recordsFetched,
      recordsProcessed: log.recordsProcessed,
      recordsFailed: log.recordsFailed,
      errorMessage: log.errorMessage,
    }))
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createDeviceSyncService(tenantId: string): DeviceSyncService {
  return new DeviceSyncService(tenantId)
}
