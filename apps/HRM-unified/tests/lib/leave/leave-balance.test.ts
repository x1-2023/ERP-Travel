// tests/lib/leave/leave-balance.test.ts
// Unit tests cho Leave Balance Logic

import { describe, it, expect } from 'vitest'

describe('Leave Balance Logic', () => {
    // ══════════════════════════════════════════════════════════════════════
    // LEAVE BALANCE TYPES
    // ══════════════════════════════════════════════════════════════════════

    type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'WEDDING' | 'BEREAVEMENT' | 'UNPAID'

    interface LeaveBalance {
        type: LeaveType
        entitled: number
        used: number
        pending: number
        carryOver: number
    }

    interface LeavePolicy {
        type: LeaveType
        annualEntitlement: number
        maxCarryOver: number
        requiresApproval: boolean
        minDaysNotice: number
        maxConsecutiveDays: number
    }

    // ══════════════════════════════════════════════════════════════════════
    // BALANCE CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Balance Calculation', () => {
        function getAvailable(balance: LeaveBalance): number {
            return balance.entitled + balance.carryOver - balance.used - balance.pending
        }

        function hasEnoughBalance(balance: LeaveBalance, requestedDays: number): boolean {
            return getAvailable(balance) >= requestedDays
        }

        it('should calculate available balance', () => {
            const balance: LeaveBalance = {
                type: 'ANNUAL',
                entitled: 14,
                used: 5,
                pending: 2,
                carryOver: 3,
            }
            expect(getAvailable(balance)).toBe(10) // 14 + 3 - 5 - 2
        })

        it('should check if enough balance for request', () => {
            const balance: LeaveBalance = {
                type: 'ANNUAL',
                entitled: 14,
                used: 10,
                pending: 0,
                carryOver: 0,
            }
            expect(hasEnoughBalance(balance, 3)).toBe(true)
            expect(hasEnoughBalance(balance, 5)).toBe(false)
        })

        it('should handle zero balance', () => {
            const balance: LeaveBalance = {
                type: 'ANNUAL',
                entitled: 14,
                used: 14,
                pending: 0,
                carryOver: 0,
            }
            expect(getAvailable(balance)).toBe(0)
            expect(hasEnoughBalance(balance, 1)).toBe(false)
        })

        it('should include carry over in available', () => {
            const balance: LeaveBalance = {
                type: 'ANNUAL',
                entitled: 14,
                used: 14,
                pending: 0,
                carryOver: 5,
            }
            expect(getAvailable(balance)).toBe(5)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // PRORATED ENTITLEMENT
    // ══════════════════════════════════════════════════════════════════════

    describe('Prorated Entitlement', () => {
        function calculateProratedEntitlement(
            annualEntitlement: number,
            hireDate: Date,
            year: number
        ): number {
            const yearStart = new Date(year, 0, 1)
            const yearEnd = new Date(year, 11, 31)

            // If hired before year start, full entitlement
            if (hireDate <= yearStart) {
                return annualEntitlement
            }

            // If hired after year end, no entitlement
            if (hireDate > yearEnd) {
                return 0
            }

            // Calculate remaining months
            const monthsRemaining = 12 - hireDate.getMonth()
            return Math.round((annualEntitlement * monthsRemaining) / 12 * 2) / 2 // Round to 0.5
        }

        it('should give full entitlement for start of year hire', () => {
            const hireDate = new Date('2024-01-01')
            expect(calculateProratedEntitlement(14, hireDate, 2024)).toBe(14)
        })

        it('should give half entitlement for mid-year hire', () => {
            const hireDate = new Date('2024-07-01')
            expect(calculateProratedEntitlement(12, hireDate, 2024)).toBe(6)
        })

        it('should give prorated for Q2 hire', () => {
            const hireDate = new Date('2024-04-01')
            expect(calculateProratedEntitlement(12, hireDate, 2024)).toBe(9) // 9 months remaining
        })

        it('should give zero for future year hire', () => {
            const hireDate = new Date('2025-01-01')
            expect(calculateProratedEntitlement(14, hireDate, 2024)).toBe(0)
        })

        it('should give full for previous year hire', () => {
            const hireDate = new Date('2023-06-01')
            expect(calculateProratedEntitlement(14, hireDate, 2024)).toBe(14)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // CARRY OVER CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Carry Over Calculation', () => {
        function calculateCarryOver(
            unusedDays: number,
            maxCarryOver: number,
            expiryMonths: number = 3
        ): { carryOverDays: number; expiryDate: Date } {
            const carryOverDays = Math.min(unusedDays, maxCarryOver)
            const now = new Date()
            const expiryDate = new Date(now.getFullYear() + 1, expiryMonths - 1, 31)

            return { carryOverDays, expiryDate }
        }

        it('should limit carry over to max', () => {
            const result = calculateCarryOver(10, 5)
            expect(result.carryOverDays).toBe(5)
        })

        it('should allow full carry over if under max', () => {
            const result = calculateCarryOver(3, 5)
            expect(result.carryOverDays).toBe(3)
        })

        it('should set expiry date', () => {
            const result = calculateCarryOver(5, 5, 3)
            expect(result.expiryDate.getMonth()).toBe(2) // March
        })

        it('should handle zero unused days', () => {
            const result = calculateCarryOver(0, 5)
            expect(result.carryOverDays).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // LEAVE VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Leave Validation', () => {
        interface LeaveRequest {
            type: LeaveType
            startDate: Date
            endDate: Date
            days: number
        }

        interface ValidationResult {
            valid: boolean
            errors: string[]
        }

        function validateLeaveRequest(
            request: LeaveRequest,
            balance: LeaveBalance,
            policy: LeavePolicy
        ): ValidationResult {
            const errors: string[] = []
            const available = balance.entitled + balance.carryOver - balance.used - balance.pending

            // Check balance
            if (request.days > available) {
                errors.push(`Không đủ số ngày phép (còn lại: ${available}, yêu cầu: ${request.days})`)
            }

            // Check max consecutive days
            if (request.days > policy.maxConsecutiveDays) {
                errors.push(`Vượt quá số ngày nghỉ liên tiếp tối đa (${policy.maxConsecutiveDays} ngày)`)
            }

            // Check notice period
            const today = new Date()
            const daysDiff = Math.ceil((request.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            if (daysDiff < policy.minDaysNotice) {
                errors.push(`Cần báo trước ít nhất ${policy.minDaysNotice} ngày`)
            }

            // Check if start date is before end date
            if (request.startDate > request.endDate) {
                errors.push('Ngày bắt đầu phải trước ngày kết thúc')
            }

            return {
                valid: errors.length === 0,
                errors,
            }
        }

        const defaultPolicy: LeavePolicy = {
            type: 'ANNUAL',
            annualEntitlement: 14,
            maxCarryOver: 5,
            requiresApproval: true,
            minDaysNotice: 3,
            maxConsecutiveDays: 14,
        }

        const defaultBalance: LeaveBalance = {
            type: 'ANNUAL',
            entitled: 14,
            used: 5,
            pending: 0,
            carryOver: 0,
        }

        it('should validate valid request', () => {
            const request: LeaveRequest = {
                type: 'ANNUAL',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                days: 2,
            }
            const result = validateLeaveRequest(request, defaultBalance, defaultPolicy)
            expect(result.valid).toBe(true)
        })

        it('should reject insufficient balance', () => {
            const balance = { ...defaultBalance, used: 14 }
            const request: LeaveRequest = {
                type: 'ANNUAL',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
                days: 3,
            }
            const result = validateLeaveRequest(request, balance, defaultPolicy)
            expect(result.valid).toBe(false)
            expect(result.errors[0]).toContain('Không đủ số ngày phép')
        })

        it('should reject exceeding max consecutive days', () => {
            const request: LeaveRequest = {
                type: 'ANNUAL',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
                days: 15,
            }
            const balance = { ...defaultBalance, entitled: 30 }
            const result = validateLeaveRequest(request, balance, defaultPolicy)
            expect(result.valid).toBe(false)
            expect(result.errors.some(e => e.includes('ngày nghỉ liên tiếp'))).toBe(true)
        })

        it('should reject insufficient notice', () => {
            const request: LeaveRequest = {
                type: 'ANNUAL',
                startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
                endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                days: 2,
            }
            const result = validateLeaveRequest(request, defaultBalance, defaultPolicy)
            expect(result.valid).toBe(false)
            expect(result.errors.some(e => e.includes('báo trước'))).toBe(true)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // LEAVE TYPE SPECIFIC RULES
    // ══════════════════════════════════════════════════════════════════════

    describe('Leave Type Specific Rules', () => {
        function getLeaveTypeConfig(type: LeaveType): {
            requiresDocument: boolean
            maxDays: number
            isPaid: boolean
        } {
            const configs: Record<LeaveType, { requiresDocument: boolean; maxDays: number; isPaid: boolean }> = {
                ANNUAL: { requiresDocument: false, maxDays: 14, isPaid: true },
                SICK: { requiresDocument: true, maxDays: 30, isPaid: true },
                MATERNITY: { requiresDocument: true, maxDays: 180, isPaid: true },
                PATERNITY: { requiresDocument: true, maxDays: 5, isPaid: true },
                WEDDING: { requiresDocument: true, maxDays: 3, isPaid: true },
                BEREAVEMENT: { requiresDocument: true, maxDays: 3, isPaid: true },
                UNPAID: { requiresDocument: false, maxDays: 30, isPaid: false },
            }
            return configs[type]
        }

        it('should return correct config for annual leave', () => {
            const config = getLeaveTypeConfig('ANNUAL')
            expect(config.requiresDocument).toBe(false)
            expect(config.isPaid).toBe(true)
        })

        it('should require document for sick leave', () => {
            const config = getLeaveTypeConfig('SICK')
            expect(config.requiresDocument).toBe(true)
        })

        it('should have correct maternity leave max days', () => {
            const config = getLeaveTypeConfig('MATERNITY')
            expect(config.maxDays).toBe(180)
        })

        it('should mark unpaid leave as not paid', () => {
            const config = getLeaveTypeConfig('UNPAID')
            expect(config.isPaid).toBe(false)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // ACCRUAL CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Accrual Calculation', () => {
        type AccrualFrequency = 'MONTHLY' | 'YEARLY' | 'BIWEEKLY'

        function calculateAccrual(
            annualEntitlement: number,
            frequency: AccrualFrequency,
            periodsCompleted: number
        ): number {
            const totalPeriods = frequency === 'MONTHLY' ? 12 :
                frequency === 'BIWEEKLY' ? 26 : 1

            const perPeriod = annualEntitlement / totalPeriods
            const accrued = perPeriod * periodsCompleted

            // Round to nearest 0.5
            return Math.round(accrued * 2) / 2
        }

        it('should calculate monthly accrual', () => {
            // 12 days/year = 1 day/month
            expect(calculateAccrual(12, 'MONTHLY', 6)).toBe(6)
        })

        it('should calculate biweekly accrual', () => {
            // 26 pay periods per year
            expect(calculateAccrual(13, 'BIWEEKLY', 13)).toBe(6.5)
        })

        it('should calculate yearly accrual', () => {
            expect(calculateAccrual(14, 'YEARLY', 1)).toBe(14)
        })

        it('should round to half days', () => {
            expect(calculateAccrual(14, 'MONTHLY', 1)).toBe(1) // 14/12 = 1.17, rounds to 1
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // BALANCE SUMMARY
    // ══════════════════════════════════════════════════════════════════════

    describe('Balance Summary', () => {
        interface BalanceSummary {
            totalEntitled: number
            totalUsed: number
            totalPending: number
            totalCarryOver: number
            totalAvailable: number
            byType: LeaveBalance[]
        }

        function calculateSummary(balances: LeaveBalance[]): BalanceSummary {
            return {
                totalEntitled: balances.reduce((sum, b) => sum + b.entitled, 0),
                totalUsed: balances.reduce((sum, b) => sum + b.used, 0),
                totalPending: balances.reduce((sum, b) => sum + b.pending, 0),
                totalCarryOver: balances.reduce((sum, b) => sum + b.carryOver, 0),
                totalAvailable: balances.reduce((sum, b) =>
                    sum + b.entitled + b.carryOver - b.used - b.pending, 0),
                byType: balances,
            }
        }

        it('should calculate summary of all balances', () => {
            const balances: LeaveBalance[] = [
                { type: 'ANNUAL', entitled: 14, used: 5, pending: 2, carryOver: 3 },
                { type: 'SICK', entitled: 30, used: 2, pending: 0, carryOver: 0 },
            ]

            const summary = calculateSummary(balances)

            expect(summary.totalEntitled).toBe(44)
            expect(summary.totalUsed).toBe(7)
            expect(summary.totalPending).toBe(2)
            expect(summary.totalAvailable).toBe(38) // 14+3-5-2 + 30-2 = 10 + 28 = 38
        })
    })
})
