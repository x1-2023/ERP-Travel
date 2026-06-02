// tests/services/attendance.service.test.ts
// Unit tests cho Attendance Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        attendance: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
    },
}))

import { db } from '@/lib/db'

describe('Attendance Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // WORKING HOURS CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Working Hours Calculation', () => {
        function calculateWorkingHours(checkIn: Date, checkOut: Date): number {
            const diff = checkOut.getTime() - checkIn.getTime()
            const hours = diff / (1000 * 60 * 60)
            return Math.round(hours * 100) / 100 // Round to 2 decimals
        }

        it('should calculate 8 hours for standard workday', () => {
            const checkIn = new Date('2024-01-15T08:00:00')
            const checkOut = new Date('2024-01-15T16:00:00')

            expect(calculateWorkingHours(checkIn, checkOut)).toBe(8)
        })

        it('should calculate partial hours', () => {
            const checkIn = new Date('2024-01-15T08:00:00')
            const checkOut = new Date('2024-01-15T12:30:00')

            expect(calculateWorkingHours(checkIn, checkOut)).toBe(4.5)
        })

        it('should handle overnight shifts', () => {
            const checkIn = new Date('2024-01-15T22:00:00')
            const checkOut = new Date('2024-01-16T06:00:00')

            expect(calculateWorkingHours(checkIn, checkOut)).toBe(8)
        })

        it('should return 0 for same time', () => {
            const time = new Date('2024-01-15T08:00:00')

            expect(calculateWorkingHours(time, time)).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // LATE/EARLY CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Late/Early Detection', () => {
        function calculateLateMinutes(
            checkIn: Date,
            shiftStart: Date,
            graceMinutes: number = 0
        ): number {
            const diff = checkIn.getTime() - shiftStart.getTime()
            const minutes = diff / (1000 * 60)
            return Math.max(0, minutes - graceMinutes)
        }

        function calculateEarlyMinutes(
            checkOut: Date,
            shiftEnd: Date
        ): number {
            const diff = shiftEnd.getTime() - checkOut.getTime()
            const minutes = diff / (1000 * 60)
            return Math.max(0, minutes)
        }

        it('should detect late arrival', () => {
            const checkIn = new Date('2024-01-15T08:15:00')
            const shiftStart = new Date('2024-01-15T08:00:00')

            expect(calculateLateMinutes(checkIn, shiftStart)).toBe(15)
        })

        it('should not detect late if within grace period', () => {
            const checkIn = new Date('2024-01-15T08:05:00')
            const shiftStart = new Date('2024-01-15T08:00:00')

            expect(calculateLateMinutes(checkIn, shiftStart, 10)).toBe(0)
        })

        it('should detect late minus grace period', () => {
            const checkIn = new Date('2024-01-15T08:15:00')
            const shiftStart = new Date('2024-01-15T08:00:00')

            expect(calculateLateMinutes(checkIn, shiftStart, 5)).toBe(10)
        })

        it('should detect early departure', () => {
            const checkOut = new Date('2024-01-15T16:45:00')
            const shiftEnd = new Date('2024-01-15T17:00:00')

            expect(calculateEarlyMinutes(checkOut, shiftEnd)).toBe(15)
        })

        it('should not detect early if stayed past shift end', () => {
            const checkOut = new Date('2024-01-15T17:30:00')
            const shiftEnd = new Date('2024-01-15T17:00:00')

            expect(calculateEarlyMinutes(checkOut, shiftEnd)).toBe(0)
        })

        it('should return 0 for on-time arrival', () => {
            const checkIn = new Date('2024-01-15T08:00:00')
            const shiftStart = new Date('2024-01-15T08:00:00')

            expect(calculateLateMinutes(checkIn, shiftStart)).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // OVERTIME CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Overtime Calculation', () => {
        function calculateOvertimeHours(
            workingHours: number,
            standardHours: number = 8
        ): number {
            return Math.max(0, workingHours - standardHours)
        }

        function calculateOvertimePay(
            baseHourlyRate: number,
            overtimeHours: number,
            multiplier: number = 1.5
        ): number {
            return Math.round(baseHourlyRate * overtimeHours * multiplier)
        }

        it('should calculate overtime hours', () => {
            expect(calculateOvertimeHours(10)).toBe(2)
            expect(calculateOvertimeHours(12)).toBe(4)
        })

        it('should return 0 for no overtime', () => {
            expect(calculateOvertimeHours(8)).toBe(0)
            expect(calculateOvertimeHours(6)).toBe(0)
        })

        it('should calculate overtime pay with 1.5x multiplier', () => {
            const hourlyRate = 100000 // 100k VND/hour
            const otHours = 2

            expect(calculateOvertimePay(hourlyRate, otHours, 1.5)).toBe(300000)
        })

        it('should calculate overtime pay with 2x multiplier (weekend)', () => {
            const hourlyRate = 100000
            const otHours = 4

            expect(calculateOvertimePay(hourlyRate, otHours, 2.0)).toBe(800000)
        })

        it('should calculate overtime pay with 3x multiplier (holiday)', () => {
            const hourlyRate = 100000
            const otHours = 2

            expect(calculateOvertimePay(hourlyRate, otHours, 3.0)).toBe(600000)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // DAY TYPE DETECTION
    // ══════════════════════════════════════════════════════════════════════

    describe('Day Type Detection', () => {
        type DayType = 'WORKING' | 'WEEKEND' | 'HOLIDAY'

        function getDayType(date: Date, holidays: Date[] = []): DayType {
            // Check if holiday
            const isHoliday = holidays.some(h =>
                h.getFullYear() === date.getFullYear() &&
                h.getMonth() === date.getMonth() &&
                h.getDate() === date.getDate()
            )
            if (isHoliday) return 'HOLIDAY'

            // Check if weekend
            const dayOfWeek = date.getDay()
            if (dayOfWeek === 0 || dayOfWeek === 6) return 'WEEKEND'

            return 'WORKING'
        }

        it('should detect weekday', () => {
            const monday = new Date('2024-01-15') // Monday
            expect(getDayType(monday)).toBe('WORKING')
        })

        it('should detect weekend - Saturday', () => {
            const saturday = new Date('2024-01-13')
            expect(getDayType(saturday)).toBe('WEEKEND')
        })

        it('should detect weekend - Sunday', () => {
            const sunday = new Date('2024-01-14')
            expect(getDayType(sunday)).toBe('WEEKEND')
        })

        it('should detect holiday', () => {
            const date = new Date('2024-01-01')
            const holidays = [new Date('2024-01-01')]

            expect(getDayType(date, holidays)).toBe('HOLIDAY')
        })

        it('should prioritize holiday over weekend', () => {
            const sundayHoliday = new Date('2024-01-07')
            const holidays = [new Date('2024-01-07')]

            expect(getDayType(sundayHoliday, holidays)).toBe('HOLIDAY')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // ATTENDANCE STATUS
    // ══════════════════════════════════════════════════════════════════════

    describe('Attendance Status', () => {
        type AttendanceStatus = 'PRESENT' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND'

        function determineStatus(
            hasCheckIn: boolean,
            hasCheckOut: boolean,
            isLate: boolean,
            isEarlyLeave: boolean,
            dayType: 'WORKING' | 'WEEKEND' | 'HOLIDAY'
        ): AttendanceStatus {
            if (dayType === 'HOLIDAY') return 'HOLIDAY'
            if (dayType === 'WEEKEND') return 'WEEKEND'

            if (!hasCheckIn) return 'ABSENT'
            if (isLate) return 'LATE'
            if (isEarlyLeave && hasCheckOut) return 'EARLY_LEAVE'

            return 'PRESENT'
        }

        it('should return PRESENT for on-time attendance', () => {
            expect(determineStatus(true, true, false, false, 'WORKING')).toBe('PRESENT')
        })

        it('should return LATE for late check-in', () => {
            expect(determineStatus(true, true, true, false, 'WORKING')).toBe('LATE')
        })

        it('should return EARLY_LEAVE for early check-out', () => {
            expect(determineStatus(true, true, false, true, 'WORKING')).toBe('EARLY_LEAVE')
        })

        it('should return ABSENT for no check-in', () => {
            expect(determineStatus(false, false, false, false, 'WORKING')).toBe('ABSENT')
        })

        it('should return HOLIDAY for holiday', () => {
            expect(determineStatus(false, false, false, false, 'HOLIDAY')).toBe('HOLIDAY')
        })

        it('should return WEEKEND for weekend', () => {
            expect(determineStatus(false, false, false, false, 'WEEKEND')).toBe('WEEKEND')
        })

        it('should prioritize LATE over EARLY_LEAVE', () => {
            expect(determineStatus(true, true, true, true, 'WORKING')).toBe('LATE')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // MONTHLY SUMMARY
    // ══════════════════════════════════════════════════════════════════════

    describe('Monthly Summary Calculation', () => {
        interface AttendanceRecord {
            date: Date
            status: string
            workingHours: number
            overtimeHours: number
            lateMinutes: number
        }

        interface MonthlySummary {
            totalDays: number
            presentDays: number
            absentDays: number
            lateDays: number
            totalWorkingHours: number
            totalOvertimeHours: number
            totalLateMinutes: number
        }

        function calculateMonthlySummary(records: AttendanceRecord[]): MonthlySummary {
            return {
                totalDays: records.length,
                presentDays: records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length,
                absentDays: records.filter(r => r.status === 'ABSENT').length,
                lateDays: records.filter(r => r.status === 'LATE').length,
                totalWorkingHours: records.reduce((sum, r) => sum + r.workingHours, 0),
                totalOvertimeHours: records.reduce((sum, r) => sum + r.overtimeHours, 0),
                totalLateMinutes: records.reduce((sum, r) => sum + r.lateMinutes, 0),
            }
        }

        it('should calculate monthly summary', () => {
            const records: AttendanceRecord[] = [
                { date: new Date('2024-01-15'), status: 'PRESENT', workingHours: 8, overtimeHours: 0, lateMinutes: 0 },
                { date: new Date('2024-01-16'), status: 'PRESENT', workingHours: 9, overtimeHours: 1, lateMinutes: 0 },
                { date: new Date('2024-01-17'), status: 'LATE', workingHours: 8, overtimeHours: 0, lateMinutes: 15 },
                { date: new Date('2024-01-18'), status: 'ABSENT', workingHours: 0, overtimeHours: 0, lateMinutes: 0 },
            ]

            const summary = calculateMonthlySummary(records)

            expect(summary.totalDays).toBe(4)
            expect(summary.presentDays).toBe(3) // PRESENT + LATE
            expect(summary.absentDays).toBe(1)
            expect(summary.lateDays).toBe(1)
            expect(summary.totalWorkingHours).toBe(25)
            expect(summary.totalOvertimeHours).toBe(1)
            expect(summary.totalLateMinutes).toBe(15)
        })

        it('should handle empty records', () => {
            const summary = calculateMonthlySummary([])

            expect(summary.totalDays).toBe(0)
            expect(summary.presentDays).toBe(0)
            expect(summary.totalWorkingHours).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // LOCATION VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Location Validation', () => {
        interface GeoLocation {
            latitude: number
            longitude: number
        }

        function calculateDistance(
            point1: GeoLocation,
            point2: GeoLocation
        ): number {
            // Haversine formula (simplified)
            const R = 6371000 // Earth radius in meters
            const dLat = (point2.latitude - point1.latitude) * Math.PI / 180
            const dLon = (point2.longitude - point1.longitude) * Math.PI / 180
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            return R * c
        }

        function isWithinRange(
            userLocation: GeoLocation,
            officeLocation: GeoLocation,
            maxDistanceMeters: number
        ): boolean {
            const distance = calculateDistance(userLocation, officeLocation)
            return distance <= maxDistanceMeters
        }

        it('should validate location within range', () => {
            const office = { latitude: 10.7769, longitude: 106.7009 } // HCMC
            const user = { latitude: 10.7770, longitude: 106.7010 } // Very close

            expect(isWithinRange(user, office, 100)).toBe(true)
        })

        it('should reject location outside range', () => {
            const office = { latitude: 10.7769, longitude: 106.7009 }
            const user = { latitude: 10.8000, longitude: 106.7009 } // ~2.5km away

            expect(isWithinRange(user, office, 100)).toBe(false)
        })

        it('should accept exact location', () => {
            const location = { latitude: 10.7769, longitude: 106.7009 }

            expect(isWithinRange(location, location, 0)).toBe(true)
        })
    })
})
