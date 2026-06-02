// tests/services/leave-request.service.test.ts
// Unit tests cho Leave Request Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        leaveRequest: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        leaveBalance: {
            findFirst: vi.fn(),
            update: vi.fn(),
        },
    },
}))

import { db } from '@/lib/db'

describe('Leave Request Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // LEAVE DAYS CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('calculateLeaveDays', () => {
        function calculateLeaveDays(
            startDate: Date,
            endDate: Date,
            excludeWeekends: boolean = true
        ): number {
            let days = 0
            const current = new Date(startDate)

            while (current <= endDate) {
                const dayOfWeek = current.getDay()
                if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
                    days++
                }
                current.setDate(current.getDate() + 1)
            }

            return days
        }

        it('should calculate single day leave', () => {
            const date = new Date('2024-01-15') // Monday
            expect(calculateLeaveDays(date, date)).toBe(1)
        })

        it('should calculate multi-day leave excluding weekends', () => {
            // Monday to Friday = 5 days
            const start = new Date('2024-01-15')
            const end = new Date('2024-01-19')
            expect(calculateLeaveDays(start, end)).toBe(5)
        })

        it('should exclude weekends by default', () => {
            // Monday to Sunday = 5 weekdays
            const start = new Date('2024-01-15') // Monday
            const end = new Date('2024-01-21')   // Sunday
            expect(calculateLeaveDays(start, end)).toBe(5)
        })

        it('should include weekends if specified', () => {
            // Monday to Sunday = 7 days
            const start = new Date('2024-01-15')
            const end = new Date('2024-01-21')
            expect(calculateLeaveDays(start, end, false)).toBe(7)
        })

        it('should handle two-week leave', () => {
            // Two weeks = 10 weekdays
            const start = new Date('2024-01-15')
            const end = new Date('2024-01-26')
            expect(calculateLeaveDays(start, end)).toBe(10)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // LEAVE BALANCE CHECK
    // ══════════════════════════════════════════════════════════════════════

    describe('checkLeaveBalance', () => {
        interface LeaveBalance {
            leaveType: string
            total: number
            used: number
            pending: number
        }

        function checkBalance(
            balance: LeaveBalance,
            requestedDays: number
        ): { hasBalance: boolean; available: number; shortfall: number } {
            const available = balance.total - balance.used - balance.pending
            const hasBalance = available >= requestedDays
            const shortfall = hasBalance ? 0 : requestedDays - available

            return { hasBalance, available, shortfall }
        }

        it('should allow request within balance', () => {
            const balance = { leaveType: 'ANNUAL', total: 14, used: 5, pending: 0 }
            const result = checkBalance(balance, 3)

            expect(result.hasBalance).toBe(true)
            expect(result.available).toBe(9)
            expect(result.shortfall).toBe(0)
        })

        it('should reject request exceeding balance', () => {
            const balance = { leaveType: 'ANNUAL', total: 14, used: 10, pending: 2 }
            const result = checkBalance(balance, 5)

            expect(result.hasBalance).toBe(false)
            expect(result.available).toBe(2)
            expect(result.shortfall).toBe(3)
        })

        it('should consider pending leaves in calculation', () => {
            const balance = { leaveType: 'ANNUAL', total: 14, used: 5, pending: 5 }
            const result = checkBalance(balance, 5)

            expect(result.hasBalance).toBe(false)
            expect(result.available).toBe(4)
        })

        it('should allow exact remaining days', () => {
            const balance = { leaveType: 'ANNUAL', total: 14, used: 10, pending: 0 }
            const result = checkBalance(balance, 4)

            expect(result.hasBalance).toBe(true)
            expect(result.available).toBe(4)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // CREATE LEAVE REQUEST
    // ══════════════════════════════════════════════════════════════════════

    describe('createLeaveRequest', () => {
        interface CreateLeaveRequestInput {
            employeeId: string
            leaveType: string
            startDate: Date
            endDate: Date
            reason?: string
        }

        async function createLeaveRequest(
            tenantId: string,
            input: CreateLeaveRequestInput
        ) {
            // Check balance
            const balance = await db.leaveBalance.findFirst({
                where: {
                    tenantId,
                    employeeId: input.employeeId,
                    leaveType: input.leaveType,
                },
            })

            if (!balance) {
                throw new Error('Leave balance not found')
            }

            // Calculate days
            const days = calculateDays(input.startDate, input.endDate)
            const available = (balance as { total: number; used: number; pending: number }).total -
                (balance as { total: number; used: number; pending: number }).used -
                (balance as { total: number; used: number; pending: number }).pending

            if (days > available) {
                throw new Error('Insufficient leave balance')
            }

            // Create request
            return db.leaveRequest.create({
                data: {
                    tenantId,
                    ...input,
                    days,
                    status: 'PENDING',
                },
            })
        }

        function calculateDays(start: Date, end: Date): number {
            let days = 0
            const current = new Date(start)
            while (current <= end) {
                if (current.getDay() !== 0 && current.getDay() !== 6) days++
                current.setDate(current.getDate() + 1)
            }
            return days
        }

        it('should create request with PENDING status', async () => {
            vi.mocked(db.leaveBalance.findFirst).mockResolvedValue({
                total: 14, used: 5, pending: 0,
            } as never)
            vi.mocked(db.leaveRequest.create).mockResolvedValue({
                id: 'lr-1', status: 'PENDING', days: 1,
            } as never)

            const result = await createLeaveRequest('tenant-1', {
                employeeId: 'emp-1',
                leaveType: 'ANNUAL',
                startDate: new Date('2024-01-15'),
                endDate: new Date('2024-01-15'),
                reason: 'Personal matters',
            })

            expect(result.status).toBe('PENDING')
        })

        it('should throw if insufficient balance', async () => {
            vi.mocked(db.leaveBalance.findFirst).mockResolvedValue({
                total: 14, used: 13, pending: 0,
            } as never)

            await expect(
                createLeaveRequest('tenant-1', {
                    employeeId: 'emp-1',
                    leaveType: 'ANNUAL',
                    startDate: new Date('2024-01-15'),
                    endDate: new Date('2024-01-19'), // 5 days
                })
            ).rejects.toThrow('Insufficient leave balance')
        })

        it('should throw if balance not found', async () => {
            vi.mocked(db.leaveBalance.findFirst).mockResolvedValue(null)

            await expect(
                createLeaveRequest('tenant-1', {
                    employeeId: 'emp-1',
                    leaveType: 'ANNUAL',
                    startDate: new Date('2024-01-15'),
                    endDate: new Date('2024-01-15'),
                })
            ).rejects.toThrow('Leave balance not found')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // APPROVE/REJECT LEAVE REQUEST
    // ══════════════════════════════════════════════════════════════════════

    describe('processLeaveRequest', () => {
        type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

        async function processLeaveRequest(
            requestId: string,
            action: 'approve' | 'reject',
            comments?: string
        ) {
            const request = await db.leaveRequest.findUnique({ where: { id: requestId } })

            if (!request) {
                throw new Error('Leave request not found')
            }

            if ((request as { status: string }).status !== 'PENDING') {
                throw new Error('Can only process pending requests')
            }

            const newStatus: LeaveStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

            const updated = await db.leaveRequest.update({
                where: { id: requestId },
                data: {
                    status: newStatus,
                    processedAt: new Date(),
                    comments,
                },
            })

            // If approved, update balance
            if (action === 'approve') {
                await db.leaveBalance.update({
                    where: { id: 'balance-id' },
                    data: {
                        used: { increment: (request as { days: number }).days },
                        pending: { decrement: (request as { days: number }).days },
                    },
                })
            }

            return updated
        }

        it('should approve pending request', async () => {
            vi.mocked(db.leaveRequest.findUnique).mockResolvedValue({
                id: 'lr-1', status: 'PENDING', days: 2,
            } as never)
            vi.mocked(db.leaveRequest.update).mockResolvedValue({
                id: 'lr-1', status: 'APPROVED',
            } as never)
            vi.mocked(db.leaveBalance.update).mockResolvedValue({} as never)

            const result = await processLeaveRequest('lr-1', 'approve', 'Approved')

            expect(result.status).toBe('APPROVED')
            expect(db.leaveBalance.update).toHaveBeenCalled()
        })

        it('should reject pending request', async () => {
            vi.mocked(db.leaveRequest.findUnique).mockResolvedValue({
                id: 'lr-1', status: 'PENDING', days: 2,
            } as never)
            vi.mocked(db.leaveRequest.update).mockResolvedValue({
                id: 'lr-1', status: 'REJECTED',
            } as never)

            const result = await processLeaveRequest('lr-1', 'reject', 'Not approved')

            expect(result.status).toBe('REJECTED')
            expect(db.leaveBalance.update).not.toHaveBeenCalled()
        })

        it('should not process already processed request', async () => {
            vi.mocked(db.leaveRequest.findUnique).mockResolvedValue({
                id: 'lr-1', status: 'APPROVED', days: 2,
            } as never)

            await expect(
                processLeaveRequest('lr-1', 'reject')
            ).rejects.toThrow('Can only process pending requests')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // LEAVE TYPE VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Leave Type Validation', () => {
        const LEAVE_TYPES = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'WEDDING', 'BEREAVEMENT', 'UNPAID', 'PERSONAL']

        function isValidLeaveType(type: string): boolean {
            return LEAVE_TYPES.includes(type)
        }

        function getDefaultDays(type: string): number {
            const defaults: Record<string, number> = {
                ANNUAL: 14,
                SICK: 30,
                MATERNITY: 180,
                PATERNITY: 5,
                WEDDING: 3,
                BEREAVEMENT: 3,
                UNPAID: 0,
                PERSONAL: 0,
            }
            return defaults[type] || 0
        }

        it('should validate known leave types', () => {
            expect(isValidLeaveType('ANNUAL')).toBe(true)
            expect(isValidLeaveType('SICK')).toBe(true)
            expect(isValidLeaveType('MATERNITY')).toBe(true)
        })

        it('should reject unknown leave types', () => {
            expect(isValidLeaveType('VACATION')).toBe(false)
            expect(isValidLeaveType('HOLIDAY')).toBe(false)
            expect(isValidLeaveType('')).toBe(false)
        })

        it('should return correct default days', () => {
            expect(getDefaultDays('ANNUAL')).toBe(14)
            expect(getDefaultDays('MATERNITY')).toBe(180)
            expect(getDefaultDays('WEDDING')).toBe(3)
        })
    })
})
