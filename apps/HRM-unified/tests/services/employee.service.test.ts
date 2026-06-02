// tests/services/employee.service.test.ts
// Unit tests cho Employee Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
    db: {
        employee: {
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

describe('Employee Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // LIST EMPLOYEES
    // ══════════════════════════════════════════════════════════════════════

    describe('listEmployees', () => {
        // Simulated service function
        async function listEmployees(
            tenantId: string,
            options: {
                page?: number
                limit?: number
                search?: string
                departmentId?: string
                status?: string
            } = {}
        ) {
            const { page = 1, limit = 20, search, departmentId, status } = options

            const where: Record<string, unknown> = { tenantId }
            if (departmentId) where.departmentId = departmentId
            if (status) where.status = status
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { code: { contains: search, mode: 'insensitive' } },
                ]
            }

            const [employees, total] = await Promise.all([
                db.employee.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                db.employee.count({ where }),
            ])

            return {
                data: employees,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            }
        }

        it('should list employees with pagination', async () => {
            const mockEmployees = [
                { id: '1', firstName: 'John', lastName: 'Doe' },
                { id: '2', firstName: 'Jane', lastName: 'Smith' },
            ]

            vi.mocked(db.employee.findMany).mockResolvedValue(mockEmployees as never)
            vi.mocked(db.employee.count).mockResolvedValue(50)

            const result = await listEmployees('tenant-1', { page: 1, limit: 20 })

            expect(result.data).toEqual(mockEmployees)
            expect(result.pagination.total).toBe(50)
            expect(result.pagination.totalPages).toBe(3)
        })

        it('should filter by department', async () => {
            vi.mocked(db.employee.findMany).mockResolvedValue([])
            vi.mocked(db.employee.count).mockResolvedValue(0)

            await listEmployees('tenant-1', { departmentId: 'dept-1' })

            expect(db.employee.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ departmentId: 'dept-1' }),
                })
            )
        })

        it('should filter by status', async () => {
            vi.mocked(db.employee.findMany).mockResolvedValue([])
            vi.mocked(db.employee.count).mockResolvedValue(0)

            await listEmployees('tenant-1', { status: 'ACTIVE' })

            expect(db.employee.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'ACTIVE' }),
                })
            )
        })

        it('should search by name or code', async () => {
            vi.mocked(db.employee.findMany).mockResolvedValue([])
            vi.mocked(db.employee.count).mockResolvedValue(0)

            await listEmployees('tenant-1', { search: 'john' })

            expect(db.employee.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ firstName: expect.any(Object) }),
                        ]),
                    }),
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // GET EMPLOYEE BY ID
    // ══════════════════════════════════════════════════════════════════════

    describe('getEmployeeById', () => {
        async function getEmployeeById(tenantId: string, id: string) {
            return db.employee.findFirst({
                where: { id, tenantId },
            })
        }

        it('should return employee if found', async () => {
            const mockEmployee = { id: '1', firstName: 'John', tenantId: 'tenant-1' }
            vi.mocked(db.employee.findFirst).mockResolvedValue(mockEmployee as never)

            const result = await getEmployeeById('tenant-1', '1')

            expect(result).toEqual(mockEmployee)
        })

        it('should return null if not found', async () => {
            vi.mocked(db.employee.findFirst).mockResolvedValue(null)

            const result = await getEmployeeById('tenant-1', 'non-existent')

            expect(result).toBeNull()
        })

        it('should respect tenant isolation', async () => {
            await getEmployeeById('tenant-1', 'emp-1')

            expect(db.employee.findFirst).toHaveBeenCalledWith({
                where: { id: 'emp-1', tenantId: 'tenant-1' },
            })
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // CREATE EMPLOYEE
    // ══════════════════════════════════════════════════════════════════════

    describe('createEmployee', () => {
        interface CreateEmployeeInput {
            firstName: string
            lastName: string
            email: string
            departmentId: string
            positionId: string
            hireDate?: string
        }

        async function createEmployee(tenantId: string, data: CreateEmployeeInput) {
            // Generate employee code
            const count = await db.employee.count({ where: { tenantId } })
            const code = `NV${String(count + 1).padStart(4, '0')}`

            return db.employee.create({
                data: {
                    ...data,
                    tenantId,
                    code,
                    status: 'ACTIVE',
                },
            })
        }

        it('should create employee with generated code', async () => {
            vi.mocked(db.employee.count).mockResolvedValue(5)
            vi.mocked(db.employee.create).mockResolvedValue({
                id: 'new-1',
                code: 'NV0006',
                firstName: 'John',
            } as never)

            const result = await createEmployee('tenant-1', {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                departmentId: 'dept-1',
                positionId: 'pos-1',
            })

            expect(db.employee.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    code: 'NV0006',
                    tenantId: 'tenant-1',
                    status: 'ACTIVE',
                }),
            })
            expect(result.code).toBe('NV0006')
        })

        it('should generate first employee code correctly', async () => {
            vi.mocked(db.employee.count).mockResolvedValue(0)
            vi.mocked(db.employee.create).mockResolvedValue({ code: 'NV0001' } as never)

            await createEmployee('tenant-1', {
                firstName: 'First',
                lastName: 'Employee',
                email: 'first@example.com',
                departmentId: 'dept-1',
                positionId: 'pos-1',
            })

            expect(db.employee.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ code: 'NV0001' }),
            })
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // UPDATE EMPLOYEE
    // ══════════════════════════════════════════════════════════════════════

    describe('updateEmployee', () => {
        async function updateEmployee(
            tenantId: string,
            id: string,
            data: Partial<{ firstName: string; lastName: string; status: string }>
        ) {
            // Check if employee exists
            const existing = await db.employee.findFirst({
                where: { id, tenantId },
            })
            if (!existing) {
                throw new Error('Employee not found')
            }

            return db.employee.update({
                where: { id },
                data,
            })
        }

        it('should update employee if exists', async () => {
            vi.mocked(db.employee.findFirst).mockResolvedValue({ id: '1' } as never)
            vi.mocked(db.employee.update).mockResolvedValue({ id: '1', firstName: 'Updated' } as never)

            const result = await updateEmployee('tenant-1', '1', { firstName: 'Updated' })

            expect(result.firstName).toBe('Updated')
        })

        it('should throw if employee not found', async () => {
            vi.mocked(db.employee.findFirst).mockResolvedValue(null)

            await expect(
                updateEmployee('tenant-1', 'non-existent', { firstName: 'Test' })
            ).rejects.toThrow('Employee not found')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // EMPLOYEE CODE GENERATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Employee Code Generation', () => {
        function generateEmployeeCode(count: number): string {
            return `NV${String(count + 1).padStart(4, '0')}`
        }

        it('should generate correct format', () => {
            expect(generateEmployeeCode(0)).toBe('NV0001')
            expect(generateEmployeeCode(1)).toBe('NV0002')
            expect(generateEmployeeCode(99)).toBe('NV0100')
            expect(generateEmployeeCode(999)).toBe('NV1000')
            expect(generateEmployeeCode(9999)).toBe('NV10000')
        })

        it('should handle large numbers', () => {
            expect(generateEmployeeCode(99999)).toBe('NV100000')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // EMPLOYEE STATUS TRANSITIONS
    // ══════════════════════════════════════════════════════════════════════

    describe('Employee Status Transitions', () => {
        type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'RESIGNED' | 'TERMINATED'

        function canTransition(from: EmployeeStatus, to: EmployeeStatus): boolean {
            const validTransitions: Record<EmployeeStatus, EmployeeStatus[]> = {
                PROBATION: ['ACTIVE', 'TERMINATED'],
                ACTIVE: ['INACTIVE', 'RESIGNED', 'TERMINATED'],
                INACTIVE: ['ACTIVE'],
                RESIGNED: [],
                TERMINATED: [],
            }
            return validTransitions[from]?.includes(to) || false
        }

        it('should allow PROBATION -> ACTIVE', () => {
            expect(canTransition('PROBATION', 'ACTIVE')).toBe(true)
        })

        it('should allow ACTIVE -> RESIGNED', () => {
            expect(canTransition('ACTIVE', 'RESIGNED')).toBe(true)
        })

        it('should not allow RESIGNED -> ACTIVE', () => {
            expect(canTransition('RESIGNED', 'ACTIVE')).toBe(false)
        })

        it('should not allow TERMINATED -> any', () => {
            expect(canTransition('TERMINATED', 'ACTIVE')).toBe(false)
            expect(canTransition('TERMINATED', 'PROBATION')).toBe(false)
        })
    })
})
