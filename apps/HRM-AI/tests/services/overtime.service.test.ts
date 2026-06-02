// tests/services/overtime.service.test.ts
// Unit tests cho Overtime Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        overtimeRequest: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
            aggregate: vi.fn(),
        },
    },
}))

vi.mock('@/lib/attendance/ot-calculator', () => ({
    calculateOT: vi.fn(() => ({
        isNightShift: false,
        totalMultiplier: 1.5,
    })),
    validateOTRequest: vi.fn(() => ({
        isValid: true,
        errors: [],
    })),
}))

vi.mock('@/lib/attendance/time-utils', () => ({
    getTimeDiffInHours: vi.fn(() => 3),
    roundHours: vi.fn((h: number) => h),
}))

import { db } from '@/lib/db'
import { overtimeService } from '@/services/overtime.service'
import { validateOTRequest } from '@/lib/attendance/ot-calculator'

describe('Overtime Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // FIND ALL OT REQUESTS
    // ══════════════════════════════════════════════════════════════════════

    describe('findAll', () => {
        it('should return paginated overtime requests', async () => {
            const mockRequests = [
                { id: '1', status: 'PENDING', plannedHours: 3 },
                { id: '2', status: 'APPROVED', plannedHours: 4 },
            ]
            vi.mocked(db.overtimeRequest.findMany).mockResolvedValue(mockRequests as never)
            vi.mocked(db.overtimeRequest.count).mockResolvedValue(50)

            const result = await overtimeService.findAll('tenant-1', { page: 1, pageSize: 20 })

            expect(result.data).toHaveLength(2)
            expect(result.pagination.total).toBe(50)
        })

        it('should filter by employee ID', async () => {
            vi.mocked(db.overtimeRequest.findMany).mockResolvedValue([])
            vi.mocked(db.overtimeRequest.count).mockResolvedValue(0)

            await overtimeService.findAll('tenant-1', { employeeId: 'emp-1' })

            expect(db.overtimeRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ employeeId: 'emp-1' }),
                })
            )
        })

        it('should filter by status', async () => {
            vi.mocked(db.overtimeRequest.findMany).mockResolvedValue([])
            vi.mocked(db.overtimeRequest.count).mockResolvedValue(0)

            await overtimeService.findAll('tenant-1', { status: 'PENDING' })

            expect(db.overtimeRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'PENDING' }),
                })
            )
        })

        it('should filter by date range', async () => {
            vi.mocked(db.overtimeRequest.findMany).mockResolvedValue([])
            vi.mocked(db.overtimeRequest.count).mockResolvedValue(0)

            await overtimeService.findAll('tenant-1', {
                dateFrom: '2026-01-01',
                dateTo: '2026-01-31',
            })

            expect(db.overtimeRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        date: expect.objectContaining({
                            gte: expect.any(Date),
                            lte: expect.any(Date),
                        }),
                    }),
                })
            )
        })

        it('should filter by department', async () => {
            vi.mocked(db.overtimeRequest.findMany).mockResolvedValue([])
            vi.mocked(db.overtimeRequest.count).mockResolvedValue(0)

            await overtimeService.findAll('tenant-1', { departmentId: 'dept-1' })

            expect(db.overtimeRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        employee: { departmentId: 'dept-1' },
                    }),
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // FIND BY ID
    // ══════════════════════════════════════════════════════════════════════

    describe('findById', () => {
        it('should return request with relations', async () => {
            const mockRequest = { id: '1', status: 'PENDING', employee: { id: 'emp-1' } }
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue(mockRequest as never)

            const result = await overtimeService.findById('tenant-1', '1')

            expect(result).toEqual(mockRequest)
        })

        it('should return null if not found', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue(null)

            const result = await overtimeService.findById('tenant-1', 'non-existent')

            expect(result).toBeNull()
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // CREATE OT REQUEST
    // ══════════════════════════════════════════════════════════════════════

    describe('create', () => {
        it('should create overtime request with calculated hours', async () => {
            vi.mocked(db.overtimeRequest.aggregate).mockResolvedValue({ _sum: { plannedHours: 10 } } as never)
            vi.mocked(db.overtimeRequest.create).mockResolvedValue({ id: 'new-1', plannedHours: 3 } as never)

            const result = await overtimeService.create('tenant-1', {
                employeeId: 'emp-1',
                date: new Date('2026-01-15'),
                startTime: new Date('2026-01-15T17:00:00'),
                endTime: new Date('2026-01-15T20:00:00'),
                reason: 'Project deadline',
            })

            expect(result.id).toBe('new-1')
            expect(db.overtimeRequest.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        tenantId: 'tenant-1',
                        employeeId: 'emp-1',
                        status: 'PENDING',
                    }),
                })
            )
        })

        it('should throw if validation fails', async () => {
            vi.mocked(db.overtimeRequest.aggregate).mockResolvedValue({ _sum: { plannedHours: 45 } } as never)
            vi.mocked(validateOTRequest).mockReturnValue({
                isValid: false,
                errors: ['Vượt quá giờ OT cho phép trong tháng'],
            })

            await expect(
                overtimeService.create('tenant-1', {
                    employeeId: 'emp-1',
                    date: new Date(),
                    startTime: new Date(),
                    endTime: new Date(),
                    reason: 'Test',
                })
            ).rejects.toThrow('Vượt quá giờ OT cho phép trong tháng')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // UPDATE OT REQUEST
    // ══════════════════════════════════════════════════════════════════════

    describe('update', () => {
        it('should update pending request', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({
                id: '1',
                status: 'PENDING',
                startTime: new Date(),
                endTime: new Date(),
                dayType: 'NORMAL',
            } as never)
            vi.mocked(db.overtimeRequest.update).mockResolvedValue({ id: '1' } as never)

            await overtimeService.update('tenant-1', '1', { reason: 'Updated reason' })

            expect(db.overtimeRequest.update).toHaveBeenCalled()
        })

        it('should throw if request not found', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue(null)

            await expect(
                overtimeService.update('tenant-1', 'non-existent', { reason: 'Test' })
            ).rejects.toThrow('Đơn tăng ca không tồn tại')
        })

        it('should throw if request is not pending', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({
                id: '1',
                status: 'APPROVED',
            } as never)

            await expect(
                overtimeService.update('tenant-1', '1', { reason: 'Test' })
            ).rejects.toThrow('Chỉ có thể sửa đơn tăng ca đang chờ duyệt')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // DELETE OT REQUEST
    // ══════════════════════════════════════════════════════════════════════

    describe('delete', () => {
        it('should delete pending request', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({ id: '1', status: 'PENDING' } as never)
            vi.mocked(db.overtimeRequest.delete).mockResolvedValue({ id: '1' } as never)

            await overtimeService.delete('tenant-1', '1')

            expect(db.overtimeRequest.delete).toHaveBeenCalledWith({ where: { id: '1' } })
        })

        it('should throw if request not found', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue(null)

            await expect(
                overtimeService.delete('tenant-1', 'non-existent')
            ).rejects.toThrow('Đơn tăng ca không tồn tại')
        })

        it('should throw if request is approved', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({ id: '1', status: 'APPROVED' } as never)

            await expect(
                overtimeService.delete('tenant-1', '1')
            ).rejects.toThrow('Không thể xóa đơn tăng ca đã được duyệt')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // APPROVAL WORKFLOW
    // ══════════════════════════════════════════════════════════════════════

    describe('approve', () => {
        it('should approve pending request', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({
                id: '1',
                status: 'PENDING',
                plannedHours: 3,
            } as never)
            vi.mocked(db.overtimeRequest.update).mockResolvedValue({ id: '1', status: 'APPROVED' } as never)

            const result = await overtimeService.approve('tenant-1', '1', 'approver-1')

            expect(result.status).toBe('APPROVED')
            expect(db.overtimeRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'APPROVED',
                        approvedBy: 'approver-1',
                    }),
                })
            )
        })

        it('should set actual hours when provided', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({
                id: '1',
                status: 'PENDING',
                plannedHours: 3,
            } as never)
            vi.mocked(db.overtimeRequest.update).mockResolvedValue({ id: '1' } as never)

            await overtimeService.approve('tenant-1', '1', 'approver-1', 2.5)

            expect(db.overtimeRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        actualHours: 2.5,
                    }),
                })
            )
        })

        it('should throw if not pending', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({ id: '1', status: 'APPROVED' } as never)

            await expect(
                overtimeService.approve('tenant-1', '1', 'approver-1')
            ).rejects.toThrow('Đơn tăng ca đã được xử lý')
        })
    })

    describe('reject', () => {
        it('should reject pending request with reason', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({ id: '1', status: 'PENDING' } as never)
            vi.mocked(db.overtimeRequest.update).mockResolvedValue({ id: '1', status: 'REJECTED' } as never)

            const result = await overtimeService.reject('tenant-1', '1', 'approver-1', 'Budget constraints')

            expect(result.status).toBe('REJECTED')
            expect(db.overtimeRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: 'REJECTED',
                        rejectionReason: 'Budget constraints',
                    }),
                })
            )
        })

        it('should throw if not pending', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({ id: '1', status: 'APPROVED' } as never)

            await expect(
                overtimeService.reject('tenant-1', '1', 'approver-1', 'reason')
            ).rejects.toThrow('Đơn tăng ca đã được xử lý')
        })
    })

    describe('cancel', () => {
        it('should cancel pending request', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({ id: '1', status: 'PENDING' } as never)
            vi.mocked(db.overtimeRequest.update).mockResolvedValue({ id: '1', status: 'CANCELLED' } as never)

            await overtimeService.cancel('tenant-1', '1')

            expect(db.overtimeRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { status: 'CANCELLED' },
                })
            )
        })

        it('should throw if approved', async () => {
            vi.mocked(db.overtimeRequest.findFirst).mockResolvedValue({ id: '1', status: 'APPROVED' } as never)

            await expect(
                overtimeService.cancel('tenant-1', '1')
            ).rejects.toThrow('Không thể hủy đơn tăng ca đã được duyệt')
        })
    })

    describe('bulkApprove', () => {
        it('should approve multiple pending requests', async () => {
            vi.mocked(db.overtimeRequest.updateMany).mockResolvedValue({ count: 3 } as never)

            await overtimeService.bulkApprove('tenant-1', ['1', '2', '3'], 'approver-1')

            expect(db.overtimeRequest.updateMany).toHaveBeenCalledWith({
                where: {
                    id: { in: ['1', '2', '3'] },
                    tenantId: 'tenant-1',
                    status: 'PENDING',
                },
                data: expect.objectContaining({
                    status: 'APPROVED',
                    approvedBy: 'approver-1',
                }),
            })
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // STATISTICS
    // ══════════════════════════════════════════════════════════════════════

    describe('getPendingCount', () => {
        it('should return count of pending requests', async () => {
            vi.mocked(db.overtimeRequest.count).mockResolvedValue(15)

            const result = await overtimeService.getPendingCount('tenant-1')

            expect(result).toBe(15)
        })
    })

    describe('getEmployeeOTStats', () => {
        it('should calculate OT statistics for an employee', async () => {
            const mockRequests = [
                { dayType: 'NORMAL', actualHours: 3, plannedHours: 3, isNightShift: false },
                { dayType: 'WEEKEND', actualHours: 4, plannedHours: 4, isNightShift: false },
                { dayType: 'HOLIDAY', actualHours: 5, plannedHours: 5, isNightShift: true },
            ]
            vi.mocked(db.overtimeRequest.findMany).mockResolvedValue(mockRequests as never)

            const result = await overtimeService.getEmployeeOTStats('tenant-1', 'emp-1', 2026, 1)

            expect(result.totalHours).toBe(12)
            expect(result.weekdayHours).toBe(3)
            expect(result.weekendHours).toBe(4)
            expect(result.holidayHours).toBe(5)
            expect(result.nightHours).toBe(5)
            expect(result.requestCount).toBe(3)
        })
    })

    describe('getMyPendingRequests', () => {
        it('should return pending requests for an employee', async () => {
            const mockRequests = [{ id: '1' }, { id: '2' }]
            vi.mocked(db.overtimeRequest.findMany).mockResolvedValue(mockRequests as never)

            const result = await overtimeService.getMyPendingRequests('tenant-1', 'emp-1')

            expect(result).toHaveLength(2)
            expect(db.overtimeRequest.findMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 'tenant-1',
                    employeeId: 'emp-1',
                    status: 'PENDING',
                },
                orderBy: { date: 'asc' },
            })
        })
    })
})
