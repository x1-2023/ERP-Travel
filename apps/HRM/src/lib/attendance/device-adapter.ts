/**
 * DeviceAdapter — Phase 2 Stub
 *
 * Future: Direct connection to attendance devices via SDK/API
 * Currently: Placeholder that throws "not implemented"
 *
 * Implementation plan:
 * 1. ZKTeco: Use zklib/node-zklib package → TCP connection to device
 * 2. Ronald Jack: Use proprietary SDK → DLL bridge or HTTP API
 * 3. Suprema: Use BioStar 2 REST API → /api/v2/events
 * 4. Hikvision: Use ISAPI → /ISAPI/AccessControl/AcsEvent
 *
 * Each device adapter will implement:
 *   - connect(config: DeviceConfig) → establish connection
 *   - parse(source: DeviceConfig) → fetch + parse records
 *   - disconnect() → clean up
 *
 * DeviceConfig:
 *   - ip: string (device IP on LAN)
 *   - port: number
 *   - username?: string
 *   - password?: string
 *   - protocol: "tcp" | "http" | "udp"
 */

import type { AttendanceAdapter, ParseResult, ParseOptions } from "./adapter"

export interface DeviceConfig {
  ip: string
  port: number
  username?: string
  password?: string
  protocol: "tcp" | "http" | "udp"
  deviceModel?: string
}

export class DeviceAdapter implements AttendanceAdapter {
  readonly name = "Device Direct"
  readonly type = "device" as const

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async parse(_source: unknown, _options?: ParseOptions): Promise<ParseResult> {
    throw new Error(
      "DeviceAdapter chưa được implement. " +
      "Phase 2: Cần cài đặt SDK tương ứng với hãng máy chấm công. " +
      "Hiện tại sử dụng FileAdapter để import file Excel/CSV."
    )
  }

  /**
   * Phase 2: Test connection to device
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async testConnection(_config: DeviceConfig): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: "Chức năng kết nối trực tiếp máy chấm công đang được phát triển.",
    }
  }
}
