// tests/services/holiday.service.test.ts
// Unit tests cho Holiday Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
    db: {
        holiday: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            createMany: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
    },
}))

import { db } from '@/lib/db'
import { holidayService } from '@/services/holiday.service'

describe('Holiday Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // CRUD OPERATIONS
    // ══════════════════════════════════════════════════════════════════════

    describe('findAll', () => {
        it('should return paginated holidays', async () => {
            const mockHolidays = [
                { id: '1', name: 'Tết Nguyên Đán', date: new Date('2026-01-29') },
                { id: '2', name: 'Ngày Giải phóng', date: new Date('2026-04-30') },
            ]
            vi.mocked(db.holiday.findMany).mockResolvedValue(mockHolidays as never)
            vi.mocked(db.holiday.count).mockResolvedValue(10)

            const result = await holidayService.findAll('tenant-1')

            expect(result.data).toHaveLength(2)
            expect(result.pagination.total).toBe(10)
        })

        it('should filter by year', async () => {
            vi.mocked(db.holiday.findMany).mockResolvedValue([])
            vi.mocked(db.holiday.count).mockResolvedValue(0)

            await holidayService.findAll('tenant-1', { year: 2026 })

            expect(db.holiday.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        year: 2026,
                    }),
                })
            )
        })

        it('should filter by isNational', async () => {
            vi.mocked(db.holiday.findMany).mockResolvedValue([])
            vi.mocked(db.holiday.count).mockResolvedValue(0)

            await holidayService.findAll('tenant-1', { isNational: true })

            expect(db.holiday.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ isNational: true }),
                })
            )
        })
    })

    describe('findById', () => {
        it('should return holiday if found', async () => {
            const mockHoliday = { id: '1', name: 'Tết' }
            vi.mocked(db.holiday.findFirst).mockResolvedValue(mockHoliday as never)

            const result = await holidayService.findById('tenant-1', '1')

            expect(result?.name).toBe('Tết')
        })

        it('should return null if not found', async () => {
            vi.mocked(db.holiday.findFirst).mockResolvedValue(null)

            const result = await holidayService.findById('tenant-1', 'non-existent')

            expect(result).toBeNull()
        })
    })

    describe('findByDate', () => {
        it('should find holiday matching date', async () => {
            const mockHoliday = { id: '1', name: 'New Year', date: new Date('2026-01-01') }
            vi.mocked(db.holiday.findFirst).mockResolvedValue(mockHoliday as never)

            const result = await holidayService.findByDate('tenant-1', new Date('2026-01-01'))

            expect(result?.name).toBe('New Year')
        })
    })

    describe('create', () => {
        it('should create holiday with required fields', async () => {
            vi.mocked(db.holiday.create).mockResolvedValue({ id: 'new-1', name: 'Company Day' } as never)

            const result = await holidayService.create('tenant-1', {
                name: 'Company Day',
                date: new Date('2026-06-01'),
            })

            expect(result.id).toBe('new-1')
            expect(db.holiday.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    tenantId: 'tenant-1',
                    name: 'Company Day',
                }),
            })
        })

        it('should handle multi-day holiday', async () => {
            vi.mocked(db.holiday.create).mockResolvedValue({ id: 'new-1' } as never)

            await holidayService.create('tenant-1', {
                name: 'Tết Holiday',
                date: new Date('2026-01-29'),
                endDate: new Date('2026-02-02'),
            })

            expect(db.holiday.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    endDate: expect.any(Date),
                }),
            })
        })

        it('should set isRecurring flag', async () => {
            vi.mocked(db.holiday.create).mockResolvedValue({ id: 'new-1' } as never)

            await holidayService.create('tenant-1', {
                name: 'Annual Party',
                date: new Date('2026-12-20'),
                isRecurring: true,
            })

            expect(db.holiday.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    isRecurring: true,
                }),
            })
        })
    })

    describe('update', () => {
        it('should update holiday if exists', async () => {
            vi.mocked(db.holiday.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.holiday.update).mockResolvedValue({ id: '1', name: 'Updated' } as never)

            const result = await holidayService.update('tenant-1', '1', { name: 'Updated' })

            expect(result.name).toBe('Updated')
        })

        it('should throw if holiday not found', async () => {
            vi.mocked(db.holiday.findFirst).mockResolvedValue(null)

            await expect(
                holidayService.update('tenant-1', 'non-existent', { name: 'Test' })
            ).rejects.toThrow('Ngày lễ không tồn tại')
        })
    })

    describe('delete', () => {
        it('should delete holiday if exists', async () => {
            vi.mocked(db.holiday.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.holiday.delete).mockResolvedValue({ id: '1' } as never)

            await holidayService.delete('tenant-1', '1')

            expect(db.holiday.delete).toHaveBeenCalledWith({ where: { id: '1' } })
        })

        it('should throw if holiday not found', async () => {
            vi.mocked(db.holiday.findFirst).mockResolvedValue(null)

            await expect(
                holidayService.delete('tenant-1', 'non-existent')
            ).rejects.toThrow('Ngày lễ không tồn tại')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════════

    describe('getHolidaysInRange', () => {
        it('should return holidays within date range', async () => {
            const mockHolidays = [
                { id: '1', date: new Date('2026-01-01') },
                { id: '2', date: new Date('2026-01-29') },
            ]
            vi.mocked(db.holiday.findMany).mockResolvedValue(mockHolidays as never)

            const result = await holidayService.getHolidaysInRange(
                'tenant-1',
                new Date('2026-01-01'),
                new Date('2026-02-28')
            )

            expect(result).toHaveLength(2)
        })
    })

    describe('getHolidayDates', () => {
        it('should return array of holiday dates for year', async () => {
            const mockHolidays = [
                { date: new Date('2026-01-01'), endDate: null },
                { date: new Date('2026-01-29'), endDate: new Date('2026-02-02') },
            ]
            vi.mocked(db.holiday.findMany).mockResolvedValue(mockHolidays as never)

            const result = await holidayService.getHolidayDates('tenant-1', 2026)

            expect(result.length).toBeGreaterThan(0)
        })
    })

    describe('isHoliday', () => {
        it('should return true if date is a holiday', async () => {
            vi.mocked(db.holiday.findFirst).mockResolvedValue({ id: '1' } as never)

            const result = await holidayService.isHoliday('tenant-1', new Date('2026-01-01'))

            expect(result).toBe(true)
        })

        it('should return false if date is not a holiday', async () => {
            vi.mocked(db.holiday.findFirst).mockResolvedValue(null)

            const result = await holidayService.isHoliday('tenant-1', new Date('2026-01-05'))

            expect(result).toBe(false)
        })
    })

    describe('getUpcomingHolidays', () => {
        it('should return upcoming holidays', async () => {
            vi.mocked(db.holiday.findMany).mockResolvedValue([{ id: '1' }, { id: '2' }] as never)

            const result = await holidayService.getUpcomingHolidays('tenant-1', 5)

            expect(result).toHaveLength(2)
            expect(db.holiday.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 5,
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // SEED NATIONAL HOLIDAYS
    // ══════════════════════════════════════════════════════════════════════

    describe('seedNationalHolidays', () => {
        it('should create Vietnam national holidays for year', async () => {
            // Mock findFirst to return null (no existing holidays) then return created
            vi.mocked(db.holiday.findFirst).mockResolvedValue(null)
            vi.mocked(db.holiday.create).mockResolvedValue({ id: 'new-1' } as never)

            const result = await holidayService.seedNationalHolidays('tenant-1', 2026)

            // Should have called create for each national holiday
            expect(db.holiday.create).toHaveBeenCalled()
            expect(result.created).toBeGreaterThan(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // COMPENSATORY DAYS
    // ══════════════════════════════════════════════════════════════════════

    describe('getCompensatoryDays', () => {
        it('should return compensatory days for year', async () => {
            vi.mocked(db.holiday.findMany).mockResolvedValue([{ id: '1', dayType: 'COMPENSATORY' }] as never)

            await holidayService.getCompensatoryDays('tenant-1', 2026)

            expect(db.holiday.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        dayType: 'COMPENSATORY',
                    }),
                })
            )
        })
    })

    describe('addCompensatoryDay', () => {
        it('should create compensatory day', async () => {
            vi.mocked(db.holiday.create).mockResolvedValue({ id: 'new-1', dayType: 'COMPENSATORY' } as never)

            await holidayService.addCompensatoryDay('tenant-1', {
                name: 'Compensatory for Tet',
                date: new Date('2026-02-07'),
                forHolidayId: 'holiday-1',
            })

            expect(db.holiday.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    dayType: 'COMPENSATORY',
                }),
            })
        })
    })
})
