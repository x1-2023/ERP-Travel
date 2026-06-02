// tests/services/contract.service.test.ts
// Unit tests cho Contract Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
    db: {
        contract: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
    },
}))

import { db } from '@/lib/db'
import { contractService } from '@/services/contract.service'

describe('Contract Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // FIND ALL CONTRACTS
    // ══════════════════════════════════════════════════════════════════════

    describe('findAll', () => {
        it('should return paginated contracts', async () => {
            const mockContracts = [
                { id: '1', contractNumber: 'HD2026/0001', status: 'ACTIVE' },
                { id: '2', contractNumber: 'HD2026/0002', status: 'ACTIVE' },
            ]

            vi.mocked(db.contract.findMany).mockResolvedValue(mockContracts as never)
            vi.mocked(db.contract.count).mockResolvedValue(25)

            const result = await contractService.findAll('tenant-1', { page: 1, pageSize: 20 })

            expect(result.data).toHaveLength(2)
            expect(result.pagination.total).toBe(25)
            expect(result.pagination.totalPages).toBe(2)
        })

        it('should filter by employee ID', async () => {
            vi.mocked(db.contract.findMany).mockResolvedValue([])
            vi.mocked(db.contract.count).mockResolvedValue(0)

            await contractService.findAll('tenant-1', { employeeId: 'emp-1' })

            expect(db.contract.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ employeeId: 'emp-1' }),
                })
            )
        })

        it('should filter by status', async () => {
            vi.mocked(db.contract.findMany).mockResolvedValue([])
            vi.mocked(db.contract.count).mockResolvedValue(0)

            await contractService.findAll('tenant-1', { status: 'ACTIVE' })

            expect(db.contract.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'ACTIVE' }),
                })
            )
        })

        it('should filter by contract type', async () => {
            vi.mocked(db.contract.findMany).mockResolvedValue([])
            vi.mocked(db.contract.count).mockResolvedValue(0)

            await contractService.findAll('tenant-1', { contractType: 'INDEFINITE' })

            expect(db.contract.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ contractType: 'INDEFINITE' }),
                })
            )
        })

        it('should search by contract number or employee name', async () => {
            vi.mocked(db.contract.findMany).mockResolvedValue([])
            vi.mocked(db.contract.count).mockResolvedValue(0)

            await contractService.findAll('tenant-1', { search: 'HD2026' })

            expect(db.contract.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ contractNumber: expect.any(Object) }),
                        ]),
                    }),
                })
            )
        })

        it('should use default pagination values', async () => {
            vi.mocked(db.contract.findMany).mockResolvedValue([])
            vi.mocked(db.contract.count).mockResolvedValue(0)

            await contractService.findAll('tenant-1')

            expect(db.contract.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 0,
                    take: 20,
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // FIND BY ID
    // ══════════════════════════════════════════════════════════════════════

    describe('findById', () => {
        it('should return contract if found', async () => {
            const mockContract = { id: '1', contractNumber: 'HD2026/0001', tenantId: 'tenant-1' }
            vi.mocked(db.contract.findFirst).mockResolvedValue(mockContract as never)

            const result = await contractService.findById('tenant-1', '1')

            expect(result).toEqual(mockContract)
        })

        it('should return null if not found', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue(null)

            const result = await contractService.findById('tenant-1', 'non-existent')

            expect(result).toBeNull()
        })

        it('should respect tenant isolation', async () => {
            await contractService.findById('tenant-1', 'contract-1')

            expect(db.contract.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'contract-1', tenantId: 'tenant-1' },
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // FIND BY EMPLOYEE ID
    // ══════════════════════════════════════════════════════════════════════

    describe('findByEmployeeId', () => {
        it('should return all contracts for an employee', async () => {
            const mockContracts = [
                { id: '1', contractNumber: 'HD2026/0001' },
                { id: '2', contractNumber: 'HD2025/0010' },
            ]
            vi.mocked(db.contract.findMany).mockResolvedValue(mockContracts as never)

            const result = await contractService.findByEmployeeId('tenant-1', 'emp-1')

            expect(result).toHaveLength(2)
            expect(db.contract.findMany).toHaveBeenCalledWith({
                where: { tenantId: 'tenant-1', employeeId: 'emp-1' },
                orderBy: { startDate: 'desc' },
            })
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // CREATE CONTRACT
    // ══════════════════════════════════════════════════════════════════════

    describe('create', () => {
        it('should create contract with required fields', async () => {
            const mockCreated = { id: 'new-1', contractNumber: 'HD2026/0001' }
            vi.mocked(db.contract.create).mockResolvedValue(mockCreated as never)

            const input = {
                employeeId: 'emp-1',
                contractNumber: 'HD2026/0001',
                contractType: 'DEFINITE' as const,
                startDate: '2026-01-01',
                baseSalary: 15000000,
                salaryType: 'GROSS' as const,
                status: 'ACTIVE' as const,
            }

            const result = await contractService.create('tenant-1', input)

            expect(result.id).toBe('new-1')
            expect(db.contract.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        tenantId: 'tenant-1',
                        employeeId: 'emp-1',
                        contractNumber: 'HD2026/0001',
                    }),
                })
            )
        })

        it('should handle optional date fields', async () => {
            vi.mocked(db.contract.create).mockResolvedValue({ id: 'new-1' } as never)

            const input = {
                employeeId: 'emp-1',
                contractNumber: 'HD2026/0001',
                contractType: 'DEFINITE' as const,
                startDate: '2026-01-01',
                endDate: '2027-01-01',
                signedDate: '2025-12-15',
                baseSalary: 15000000,
                salaryType: 'GROSS' as const,
                status: 'ACTIVE' as const,
            }

            await contractService.create('tenant-1', input)

            expect(db.contract.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        startDate: expect.any(Date),
                        endDate: expect.any(Date),
                        signedDate: expect.any(Date),
                    }),
                })
            )
        })

        it('should handle null optional dates', async () => {
            vi.mocked(db.contract.create).mockResolvedValue({ id: 'new-1' } as never)

            const input = {
                employeeId: 'emp-1',
                contractNumber: 'HD2026/0001',
                contractType: 'INDEFINITE' as const,
                startDate: '2026-01-01',
                baseSalary: 15000000,
                salaryType: 'GROSS' as const,
                status: 'ACTIVE' as const,
            }

            await contractService.create('tenant-1', input)

            expect(db.contract.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        endDate: null,
                        signedDate: null,
                    }),
                })
            )
        })

        it('should handle allowances array', async () => {
            vi.mocked(db.contract.create).mockResolvedValue({ id: 'new-1' } as never)

            const input = {
                employeeId: 'emp-1',
                contractNumber: 'HD2026/0001',
                contractType: 'DEFINITE' as const,
                startDate: '2026-01-01',
                baseSalary: 15000000,
                salaryType: 'GROSS' as const,
                status: 'ACTIVE' as const,
                allowances: [{ name: 'Lunch', amount: 500000 }],
            }

            await contractService.create('tenant-1', input)

            expect(db.contract.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        allowances: [{ name: 'Lunch', amount: 500000 }],
                    }),
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // UPDATE CONTRACT
    // ══════════════════════════════════════════════════════════════════════

    describe('update', () => {
        it('should update contract if exists', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.contract.update).mockResolvedValue({ id: '1', baseSalary: 20000000 } as never)

            const result = await contractService.update('tenant-1', '1', { baseSalary: 20000000 })

            expect(result.baseSalary).toBe(20000000)
        })

        it('should throw if contract not found', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue(null)

            await expect(
                contractService.update('tenant-1', 'non-existent', { baseSalary: 20000000 })
            ).rejects.toThrow('Hợp đồng không tồn tại')
        })

        it('should only update provided fields', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.contract.update).mockResolvedValue({ id: '1' } as never)

            await contractService.update('tenant-1', '1', { notes: 'Updated notes' })

            expect(db.contract.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { notes: 'Updated notes' },
                })
            )
        })

        it('should handle date field updates', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.contract.update).mockResolvedValue({ id: '1' } as never)

            await contractService.update('tenant-1', '1', {
                startDate: '2026-02-01',
                endDate: '2027-02-01',
            })

            expect(db.contract.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        startDate: expect.any(Date),
                        endDate: expect.any(Date),
                    }),
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // DELETE CONTRACT
    // ══════════════════════════════════════════════════════════════════════

    describe('delete', () => {
        it('should delete contract if exists', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.contract.delete).mockResolvedValue({ id: '1' } as never)

            await contractService.delete('tenant-1', '1')

            expect(db.contract.delete).toHaveBeenCalledWith({ where: { id: '1' } })
        })

        it('should throw if contract not found', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue(null)

            await expect(
                contractService.delete('tenant-1', 'non-existent')
            ).rejects.toThrow('Hợp đồng không tồn tại')
        })

        it('should respect tenant isolation on delete', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue(null)

            await expect(contractService.delete('tenant-1', 'contract-from-tenant-2')).rejects.toThrow()

            expect(db.contract.findFirst).toHaveBeenCalledWith({
                where: { id: 'contract-from-tenant-2', tenantId: 'tenant-1' },
            })
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // GET NEXT CONTRACT NUMBER
    // ══════════════════════════════════════════════════════════════════════

    describe('getNextContractNumber', () => {
        it('should return first contract number when no contracts exist', async () => {
            vi.mocked(db.contract.findFirst).mockResolvedValue(null)

            const result = await contractService.getNextContractNumber('tenant-1')

            const currentYear = new Date().getFullYear()
            expect(result).toBe(`HD${currentYear}/0001`)
        })

        it('should increment from last contract number', async () => {
            const currentYear = new Date().getFullYear()
            vi.mocked(db.contract.findFirst).mockResolvedValue({
                contractNumber: `HD${currentYear}/0005`,
            } as never)

            const result = await contractService.getNextContractNumber('tenant-1')

            expect(result).toBe(`HD${currentYear}/0006`)
        })

        it('should handle high contract numbers', async () => {
            const currentYear = new Date().getFullYear()
            vi.mocked(db.contract.findFirst).mockResolvedValue({
                contractNumber: `HD${currentYear}/0999`,
            } as never)

            const result = await contractService.getNextContractNumber('tenant-1')

            expect(result).toBe(`HD${currentYear}/1000`)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // GET EXPIRING CONTRACTS
    // ══════════════════════════════════════════════════════════════════════

    describe('getExpiringContracts', () => {
        it('should return contracts expiring within default 30 days', async () => {
            const mockContracts = [
                { id: '1', endDate: new Date('2026-02-15') },
                { id: '2', endDate: new Date('2026-02-20') },
            ]
            vi.mocked(db.contract.findMany).mockResolvedValue(mockContracts as never)

            const result = await contractService.getExpiringContracts('tenant-1')

            expect(result).toHaveLength(2)
            expect(db.contract.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: 'ACTIVE',
                        endDate: expect.objectContaining({
                            gte: expect.any(Date),
                            lte: expect.any(Date),
                        }),
                    }),
                })
            )
        })

        it('should accept custom days parameter', async () => {
            vi.mocked(db.contract.findMany).mockResolvedValue([])

            await contractService.getExpiringContracts('tenant-1', 60)

            expect(db.contract.findMany).toHaveBeenCalled()
        })

        it('should order by end date ascending', async () => {
            vi.mocked(db.contract.findMany).mockResolvedValue([])

            await contractService.getExpiringContracts('tenant-1')

            expect(db.contract.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { endDate: 'asc' },
                })
            )
        })
    })
})
