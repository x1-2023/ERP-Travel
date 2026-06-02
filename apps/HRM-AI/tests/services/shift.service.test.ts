// tests/services/shift.service.test.ts
// Unit tests cho Shift Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
    db: {
        shift: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        shiftAssignment: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            createMany: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
    },
}))

import { db } from '@/lib/db'
import { shiftService } from '@/services/shift.service'

describe('Shift Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // SHIFT CRUD
    // ══════════════════════════════════════════════════════════════════════

    describe('findAll', () => {
        it('should return paginated shifts', async () => {
            const mockShifts = [
                { id: '1', name: 'Morning Shift', code: 'MS' },
                { id: '2', name: 'Evening Shift', code: 'ES' },
            ]
            vi.mocked(db.shift.findMany).mockResolvedValue(mockShifts as never)
            vi.mocked(db.shift.count).mockResolvedValue(10)

            const result = await shiftService.findAll('tenant-1')

            expect(result.data).toHaveLength(2)
            expect(result.pagination.total).toBe(10)
        })

        it('should filter by search term', async () => {
            vi.mocked(db.shift.findMany).mockResolvedValue([])
            vi.mocked(db.shift.count).mockResolvedValue(0)

            await shiftService.findAll('tenant-1', { search: 'Morning' })

            expect(db.shift.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ name: expect.any(Object) }),
                        ]),
                    }),
                })
            )
        })

        it('should filter by shift type', async () => {
            vi.mocked(db.shift.findMany).mockResolvedValue([])
            vi.mocked(db.shift.count).mockResolvedValue(0)

            await shiftService.findAll('tenant-1', { shiftType: 'FIXED' })

            expect(db.shift.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ shiftType: 'FIXED' }),
                })
            )
        })

        it('should filter by active status', async () => {
            vi.mocked(db.shift.findMany).mockResolvedValue([])
            vi.mocked(db.shift.count).mockResolvedValue(0)

            await shiftService.findAll('tenant-1', { isActive: true })

            expect(db.shift.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ isActive: true }),
                })
            )
        })
    })

    describe('findById', () => {
        it('should return shift with relations', async () => {
            const mockShift = { id: '1', name: 'Morning', _count: { assignments: 5 } }
            vi.mocked(db.shift.findFirst).mockResolvedValue(mockShift as never)

            const result = await shiftService.findById('tenant-1', '1')

            expect(result).toEqual(mockShift)
        })

        it('should return null if not found', async () => {
            vi.mocked(db.shift.findFirst).mockResolvedValue(null)

            const result = await shiftService.findById('tenant-1', 'non-existent')

            expect(result).toBeNull()
        })
    })

    describe('findByCode', () => {
        it('should find shift by code', async () => {
            const mockShift = { id: '1', code: 'MS' }
            vi.mocked(db.shift.findFirst).mockResolvedValue(mockShift as never)

            const result = await shiftService.findByCode('tenant-1', 'MS')

            expect(result?.code).toBe('MS')
        })
    })

    describe('create', () => {
        it('should create shift', async () => {
            vi.mocked(db.shift.create).mockResolvedValue({ id: 'new-1', name: 'New Shift' } as never)

            const result = await shiftService.create('tenant-1', {
                name: 'New Shift',
                code: 'NS',
                startTime: new Date('2026-01-01T08:00:00'),
                endTime: new Date('2026-01-01T17:00:00'),
            })

            expect(result.id).toBe('new-1')
        })
    })

    describe('update', () => {
        it('should update shift if exists', async () => {
            vi.mocked(db.shift.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.shift.update).mockResolvedValue({ id: '1', name: 'Updated' } as never)

            const result = await shiftService.update('tenant-1', '1', { name: 'Updated' })

            expect(result.name).toBe('Updated')
        })

        it('should throw if shift not found', async () => {
            vi.mocked(db.shift.findFirst).mockResolvedValue(null)

            await expect(
                shiftService.update('tenant-1', 'non-existent', { name: 'Test' })
            ).rejects.toThrow('Ca làm việc không tồn tại')
        })
    })

    describe('delete', () => {
        it('should delete shift if no constraints', async () => {
            vi.mocked(db.shift.findFirst).mockResolvedValue({
                id: '1',
                _count: { assignments: 0, attendances: 0 },
            } as never)
            vi.mocked(db.shift.delete).mockResolvedValue({ id: '1' } as never)

            await shiftService.delete('tenant-1', '1')

            expect(db.shift.delete).toHaveBeenCalled()
        })

        it('should throw if shift not found', async () => {
            vi.mocked(db.shift.findFirst).mockResolvedValue(null)

            await expect(
                shiftService.delete('tenant-1', 'non-existent')
            ).rejects.toThrow('Ca làm việc không tồn tại')
        })

        it('should throw if shift has assignments', async () => {
            vi.mocked(db.shift.findFirst).mockResolvedValue({
                id: '1',
                _count: { assignments: 5, attendances: 0 },
            } as never)

            await expect(
                shiftService.delete('tenant-1', '1')
            ).rejects.toThrow('Không thể xóa ca làm việc đang được gán cho nhân viên')
        })

        it('should throw if shift has attendance records', async () => {
            vi.mocked(db.shift.findFirst).mockResolvedValue({
                id: '1',
                _count: { assignments: 0, attendances: 10 },
            } as never)

            await expect(
                shiftService.delete('tenant-1', '1')
            ).rejects.toThrow('Không thể xóa ca làm việc đã có dữ liệu chấm công')
        })
    })

    describe('getActiveShifts', () => {
        it('should return only active shifts', async () => {
            vi.mocked(db.shift.findMany).mockResolvedValue([{ id: '1', isActive: true }] as never)

            await shiftService.getActiveShifts('tenant-1')

            expect(db.shift.findMany).toHaveBeenCalledWith({
                where: { tenantId: 'tenant-1', isActive: true },
                orderBy: { name: 'asc' },
            })
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // SHIFT ASSIGNMENT
    // ══════════════════════════════════════════════════════════════════════

    describe('findAssignments', () => {
        it('should return paginated assignments', async () => {
            const mockAssignments = [
                { id: '1', employeeId: 'emp-1', shiftId: 'shift-1' },
            ]
            vi.mocked(db.shiftAssignment.findMany).mockResolvedValue(mockAssignments as never)
            vi.mocked(db.shiftAssignment.count).mockResolvedValue(5)

            const result = await shiftService.findAssignments('tenant-1')

            expect(result.data).toHaveLength(1)
            expect(result.pagination.total).toBe(5)
        })

        it('should filter by employee', async () => {
            vi.mocked(db.shiftAssignment.findMany).mockResolvedValue([])
            vi.mocked(db.shiftAssignment.count).mockResolvedValue(0)

            await shiftService.findAssignments('tenant-1', { employeeId: 'emp-1' })

            expect(db.shiftAssignment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ employeeId: 'emp-1' }),
                })
            )
        })

        it('should filter by isPrimary', async () => {
            vi.mocked(db.shiftAssignment.findMany).mockResolvedValue([])
            vi.mocked(db.shiftAssignment.count).mockResolvedValue(0)

            await shiftService.findAssignments('tenant-1', { isPrimary: true })

            expect(db.shiftAssignment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ isPrimary: true }),
                })
            )
        })
    })

    describe('assignShift', () => {
        it('should create new shift assignment', async () => {
            vi.mocked(db.shiftAssignment.create).mockResolvedValue({ id: 'new-1' } as never)

            await shiftService.assignShift('tenant-1', {
                employeeId: 'emp-1',
                shiftId: 'shift-1',
                startDate: new Date('2026-01-01'),
            })

            expect(db.shiftAssignment.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        employeeId: 'emp-1',
                        shiftId: 'shift-1',
                        daysOfWeek: [1, 2, 3, 4, 5], // Default weekdays
                    }),
                })
            )
        })

        it('should remove primary flag from other assignments when assigning primary', async () => {
            vi.mocked(db.shiftAssignment.updateMany).mockResolvedValue({ count: 1 } as never)
            vi.mocked(db.shiftAssignment.create).mockResolvedValue({ id: 'new-1' } as never)

            await shiftService.assignShift('tenant-1', {
                employeeId: 'emp-1',
                shiftId: 'shift-1',
                startDate: new Date(),
                isPrimary: true,
            })

            expect(db.shiftAssignment.updateMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 'tenant-1',
                    employeeId: 'emp-1',
                    isPrimary: true,
                },
                data: { isPrimary: false },
            })
        })
    })

    describe('updateAssignment', () => {
        it('should update assignment if exists', async () => {
            vi.mocked(db.shiftAssignment.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.shiftAssignment.update).mockResolvedValue({ id: '1' } as never)

            await shiftService.updateAssignment('tenant-1', '1', { notes: 'Updated' })

            expect(db.shiftAssignment.update).toHaveBeenCalled()
        })

        it('should throw if assignment not found', async () => {
            vi.mocked(db.shiftAssignment.findFirst).mockResolvedValue(null)

            await expect(
                shiftService.updateAssignment('tenant-1', 'non-existent', {})
            ).rejects.toThrow('Phân ca không tồn tại')
        })
    })

    describe('deleteAssignment', () => {
        it('should delete assignment if exists', async () => {
            vi.mocked(db.shiftAssignment.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.shiftAssignment.delete).mockResolvedValue({ id: '1' } as never)

            await shiftService.deleteAssignment('tenant-1', '1')

            expect(db.shiftAssignment.delete).toHaveBeenCalled()
        })

        it('should throw if assignment not found', async () => {
            vi.mocked(db.shiftAssignment.findFirst).mockResolvedValue(null)

            await expect(
                shiftService.deleteAssignment('tenant-1', 'non-existent')
            ).rejects.toThrow('Phân ca không tồn tại')
        })
    })

    describe('getEmployeeShift', () => {
        it('should return shift for employee on given date', async () => {
            const mockShift = { id: 'shift-1', name: 'Morning' }
            vi.mocked(db.shiftAssignment.findFirst).mockResolvedValue({
                id: 'assignment-1',
                shift: mockShift,
            } as never)

            const result = await shiftService.getEmployeeShift('emp-1', new Date('2026-01-15'))

            expect(result).toEqual(mockShift)
        })

        it('should return null if no assignment found', async () => {
            vi.mocked(db.shiftAssignment.findFirst).mockResolvedValue(null)

            const result = await shiftService.getEmployeeShift('emp-1', new Date())

            expect(result).toBeNull()
        })
    })

    describe('bulkAssignShift', () => {
        it('should assign shift to multiple employees', async () => {
            vi.mocked(db.shiftAssignment.updateMany).mockResolvedValue({ count: 2 } as never)
            vi.mocked(db.shiftAssignment.createMany).mockResolvedValue({ count: 3 } as never)

            await shiftService.bulkAssignShift(
                'tenant-1',
                ['emp-1', 'emp-2', 'emp-3'],
                'shift-1',
                new Date()
            )

            expect(db.shiftAssignment.createMany).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({ employeeId: 'emp-1' }),
                    expect.objectContaining({ employeeId: 'emp-2' }),
                    expect.objectContaining({ employeeId: 'emp-3' }),
                ]),
            })
        })

        it('should remove existing primary assignments before bulk assign', async () => {
            vi.mocked(db.shiftAssignment.updateMany).mockResolvedValue({ count: 2 } as never)
            vi.mocked(db.shiftAssignment.createMany).mockResolvedValue({ count: 2 } as never)

            await shiftService.bulkAssignShift(
                'tenant-1',
                ['emp-1', 'emp-2'],
                'shift-1',
                new Date()
            )

            expect(db.shiftAssignment.updateMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 'tenant-1',
                    employeeId: { in: ['emp-1', 'emp-2'] },
                    isPrimary: true,
                },
                data: { isPrimary: false },
            })
        })
    })
})
