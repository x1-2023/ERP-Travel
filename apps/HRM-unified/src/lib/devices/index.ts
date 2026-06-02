// src/lib/devices/index.ts
// Attendance Device Module - Main export

// Types
export * from './types'

// GPS Check-in
export { GPSCheckInService, createGPSCheckInService, calculateDistance, isWithinRadius } from './gps-checkin'

// Device Sync
export { DeviceSyncService, createDeviceSyncService } from './sync-service'

// SDK
export { ZKTecoSDK, createZKTecoSDK } from './sdk/zkteco'
