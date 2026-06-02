// src/lib/devices/types.ts
// Attendance Device Types

// ═══════════════════════════════════════════════════════════════
// DEVICE TYPES
// ═══════════════════════════════════════════════════════════════

export type DeviceType = 'FINGERPRINT' | 'FACE_RECOGNITION' | 'CARD_READER' | 'GPS_CHECKIN' | 'QR_CODE'

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR'

export type DeviceManufacturer = 'ZKTECO' | 'HIKVISION' | 'SUPREMA' | 'DAHUA' | 'CUSTOM'

export type ConnectionType = 'TCP' | 'HTTP' | 'SDK' | 'USB'

export type PunchType = 0 | 1 | 2 | 3 | 4 | 5 // Check-in, Check-out, Break-out, Break-in, OT-in, OT-out

export type VerifyType = 0 | 1 | 2 | 3 | 4 | 15 // Password, Fingerprint, Card, Face, Palm, Multiple

// ═══════════════════════════════════════════════════════════════
// DEVICE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface DeviceConfig {
  ipAddress: string
  port: number
  connectionType: ConnectionType
  commKey?: string // Communication key for ZKTeco
  timeout?: number // Connection timeout in ms
  retryAttempts?: number
  timezone?: string
}

export interface DeviceInfo {
  serialNumber: string
  model: string
  manufacturer: DeviceManufacturer
  firmwareVersion: string
  deviceName: string
  platform?: string
  macAddress?: string
  totalUsers?: number
  totalRecords?: number
  freeMemory?: number
}

// ═══════════════════════════════════════════════════════════════
// PUNCH/ATTENDANCE LOG
// ═══════════════════════════════════════════════════════════════

export interface RawPunchRecord {
  deviceUserId: string
  punchTime: Date
  punchType: PunchType
  verifyType: VerifyType
  workCode?: number
  reserved?: string
}

export interface EnrichedPunchRecord extends RawPunchRecord {
  deviceId: string
  deviceName: string
  employeeId?: string
  employeeName?: string
  locationName?: string
}

// ═══════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export interface DeviceUser {
  userId: string
  name: string
  privilege: number // 0: User, 1: Enroller, 2: Administrator, 3: Super Admin
  password?: string
  cardNumber?: string
  enabled: boolean
}

export interface BiometricTemplate {
  userId: string
  fingerIndex: number // 0-9 for fingers
  template: Buffer
  templateType: 'FINGERPRINT' | 'FACE' | 'PALM'
}

// ═══════════════════════════════════════════════════════════════
// SYNC OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface SyncOptions {
  syncType: 'FULL' | 'INCREMENTAL'
  fromDate?: Date
  toDate?: Date
  clearAfterSync?: boolean
}

export interface SyncResult {
  success: boolean
  recordsFetched: number
  recordsProcessed: number
  recordsFailed: number
  lastSyncTime: Date
  errors?: string[]
}

// ═══════════════════════════════════════════════════════════════
// GPS CHECK-IN
// ═══════════════════════════════════════════════════════════════

export interface GPSCoordinates {
  latitude: number
  longitude: number
  accuracy: number // in meters
  altitude?: number
  timestamp: Date
}

export interface GPSCheckInRequest {
  employeeId: string
  coordinates: GPSCoordinates
  locationId?: string
  deviceInfo?: {
    deviceId: string
    platform: string
    appVersion: string
  }
  wifiSSID?: string
  photoUrl?: string
}

export interface GPSCheckInResult {
  success: boolean
  checkInTime: Date
  locationType: 'OFFICE' | 'REMOTE' | 'FIELD'
  locationName?: string
  distanceFromOffice?: number
  isWithinRadius: boolean
  warnings?: string[]
}

// ═══════════════════════════════════════════════════════════════
// DEVICE SDK INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface IDeviceSDK {
  // Connection
  connect(): Promise<boolean>
  disconnect(): Promise<void>
  isConnected(): boolean

  // Device info
  getDeviceInfo(): Promise<DeviceInfo>
  getDeviceStatus(): Promise<DeviceStatus>

  // Time management
  getDeviceTime(): Promise<Date>
  setDeviceTime(time: Date): Promise<boolean>

  // User management
  getUsers(): Promise<DeviceUser[]>
  getUser(userId: string): Promise<DeviceUser | null>
  setUser(user: DeviceUser): Promise<boolean>
  deleteUser(userId: string): Promise<boolean>

  // Biometric templates
  getFingerprints(userId: string): Promise<BiometricTemplate[]>
  setFingerprint(template: BiometricTemplate): Promise<boolean>
  deleteFingerprint(userId: string, fingerIndex?: number): Promise<boolean>

  // Attendance logs
  getAttendanceLogs(options?: SyncOptions): Promise<RawPunchRecord[]>
  clearAttendanceLogs(): Promise<boolean>

  // Real-time events
  onPunch?(callback: (record: RawPunchRecord) => void): void
  startRealTimeCapture?(): Promise<boolean>
  stopRealTimeCapture?(): Promise<boolean>
}

// ═══════════════════════════════════════════════════════════════
// DEVICE STATUS LABELS
// ═══════════════════════════════════════════════════════════════

export const DEVICE_STATUS_LABELS = {
  ONLINE: { label: 'Hoạt động', color: 'green' },
  OFFLINE: { label: 'Mất kết nối', color: 'red' },
  MAINTENANCE: { label: 'Bảo trì', color: 'yellow' },
  ERROR: { label: 'Lỗi', color: 'red' },
} as const

export const DEVICE_TYPE_LABELS = {
  FINGERPRINT: { label: 'Vân tay', icon: 'fingerprint' },
  FACE_RECOGNITION: { label: 'Nhận diện khuôn mặt', icon: 'face' },
  CARD_READER: { label: 'Thẻ từ', icon: 'card' },
  GPS_CHECKIN: { label: 'GPS Check-in', icon: 'location' },
  QR_CODE: { label: 'QR Code', icon: 'qr-code' },
} as const

export const PUNCH_TYPE_LABELS = {
  0: 'Check-in',
  1: 'Check-out',
  2: 'Break-out',
  3: 'Break-in',
  4: 'OT-in',
  5: 'OT-out',
} as const

export const VERIFY_TYPE_LABELS = {
  0: 'Mật khẩu',
  1: 'Vân tay',
  2: 'Thẻ',
  3: 'Khuôn mặt',
  4: 'Lòng bàn tay',
  15: 'Đa phương thức',
} as const
