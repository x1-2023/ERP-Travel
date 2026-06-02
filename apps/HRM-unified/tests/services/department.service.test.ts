// tests/services/department.service.test.ts
// Unit tests cho Department Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
    db: {
        department: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}))

import { db } from '@/lib/db'
import { departmentService } from '@/services/department.service'

describe('Department Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // FIND ALL DEPARTMENTS
    // ══════════════════════════════════════════════════════════════════════

    describe('findAll', () => {
        it('should return all active departments by default', async () => {
            const mockDepartments = [
                { id: '1', name: 'IT', isActive: true },
                { id: '2', name: 'HR', isActive: true },
            ]
            vi.mocked(db.department.findMany).mockResolvedValue(mockDepartments as never)

            const result = await departmentService.findAll('tenant-1')

            expect(result).toHaveLength(2)
            expect(db.department.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        tenantId: 'tenant-1',
                        isActive: true,
                    }),
                })
            )
        })

        it('should include inactive departments when flag is true', async () => {
            vi.mocked(db.department.findMany).mockResolvedValue([])

            await departmentService.findAll('tenant-1', true)

            expect(db.department.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { tenantId: 'tenant-1' },
                })
            )
        })

        it('should order by sortOrder and name', async () => {
            vi.mocked(db.department.findMany).mockResolvedValue([])

            await departmentService.findAll('tenant-1')

            expect(db.department.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // FIND BY ID
    // ══════════════════════════════════════════════════════════════════════

    describe('findById', () => {
        it('should return department with relations', async () => {
            const mockDepartment = {
                id: '1',
                name: 'IT',
                parent: { id: 'parent-1', name: 'Tech' },
                children: [],
            }
            vi.mocked(db.department.findFirst).mockResolvedValue(mockDepartment as never)

            const result = await departmentService.findById('tenant-1', '1')

            expect(result).toEqual(mockDepartment)
        })

        it('should return null if not found', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue(null)

            const result = await departmentService.findById('tenant-1', 'non-existent')

            expect(result).toBeNull()
        })

        it('should respect tenant isolation', async () => {
            await departmentService.findById('tenant-1', 'dept-1')

            expect(db.department.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'dept-1', tenantId: 'tenant-1' },
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // CREATE DEPARTMENT
    // ══════════════════════════════════════════════════════════════════════

    describe('create', () => {
        it('should create department with required fields', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue(null) // No duplicate
            vi.mocked(db.department.create).mockResolvedValue({ id: 'new-1', name: 'IT', code: 'IT' } as never)

            const result = await departmentService.create('tenant-1', {
                name: 'IT Department',
                code: 'IT',
            })

            expect(result.id).toBe('new-1')
            expect(db.department.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        tenantId: 'tenant-1',
                        name: 'IT Department',
                        code: 'IT',
                        sortOrder: 0,
                        isActive: true,
                    }),
                })
            )
        })

        it('should throw if department code already exists', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue({ id: 'existing', code: 'IT' } as never)

            await expect(
                departmentService.create('tenant-1', { name: 'New IT', code: 'IT' })
            ).rejects.toThrow('Mã phòng ban đã tồn tại')
        })

        it('should create with optional fields', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue(null)
            vi.mocked(db.department.create).mockResolvedValue({ id: 'new-1' } as never)

            await departmentService.create('tenant-1', {
                name: 'IT Department',
                code: 'IT',
                description: 'IT team',
                parentId: 'parent-1',
                managerId: 'manager-1',
                costCenterCode: 'CC001',
                sortOrder: 5,
                isActive: false,
            })

            expect(db.department.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        description: 'IT team',
                        parentId: 'parent-1',
                        managerId: 'manager-1',
                        costCenterCode: 'CC001',
                        sortOrder: 5,
                        isActive: false,
                    }),
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // UPDATE DEPARTMENT
    // ══════════════════════════════════════════════════════════════════════

    describe('update', () => {
        it('should update department if exists', async () => {
            vi.mocked(db.department.findFirst)
                .mockResolvedValueOnce({ id: '1', code: 'IT' } as never) // Current
                .mockResolvedValueOnce(null) // No duplicate
            vi.mocked(db.department.update).mockResolvedValue({ id: '1', name: 'Updated IT' } as never)

            const result = await departmentService.update('tenant-1', '1', { name: 'Updated IT' })

            expect(result.name).toBe('Updated IT')
        })

        it('should throw if department not found', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue(null)

            await expect(
                departmentService.update('tenant-1', 'non-existent', { name: 'Test' })
            ).rejects.toThrow('Phòng ban không tồn tại')
        })

        it('should throw if new code already exists', async () => {
            vi.mocked(db.department.findFirst)
                .mockResolvedValueOnce({ id: '1', code: 'IT' } as never) // Current
                .mockResolvedValueOnce({ id: '2', code: 'HR' } as never) // Duplicate check

            await expect(
                departmentService.update('tenant-1', '1', { code: 'HR' })
            ).rejects.toThrow('Mã phòng ban đã tồn tại')
        })

        it('should prevent circular parent reference', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue({ id: '1', code: 'IT' } as never)

            await expect(
                departmentService.update('tenant-1', '1', { parentId: '1' })
            ).rejects.toThrow('Không thể chọn chính phòng ban này làm phòng ban cha')
        })

        it('should only update provided fields', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue({ id: '1', code: 'IT' } as never)
            vi.mocked(db.department.update).mockResolvedValue({ id: '1' } as never)

            await departmentService.update('tenant-1', '1', { description: 'New description' })

            expect(db.department.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { description: 'New description' },
                })
            )
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // DELETE DEPARTMENT
    // ══════════════════════════════════════════════════════════════════════

    describe('delete', () => {
        it('should delete department if no constraints', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue({
                id: '1',
                children: [],
                _count: { employees: 0 },
            } as never)
            vi.mocked(db.department.delete).mockResolvedValue({ id: '1' } as never)

            await departmentService.delete('tenant-1', '1')

            expect(db.department.delete).toHaveBeenCalledWith({ where: { id: '1' } })
        })

        it('should throw if department not found', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue(null)

            await expect(
                departmentService.delete('tenant-1', 'non-existent')
            ).rejects.toThrow('Phòng ban không tồn tại')
        })

        it('should throw if department has children', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue({
                id: '1',
                children: [{ id: 'child-1' }],
                _count: { employees: 0 },
            } as never)

            await expect(
                departmentService.delete('tenant-1', '1')
            ).rejects.toThrow('Không thể xóa phòng ban có phòng ban con')
        })

        it('should throw if department has employees', async () => {
            vi.mocked(db.department.findFirst).mockResolvedValue({
                id: '1',
                children: [],
                _count: { employees: 5 },
            } as never)

            await expect(
                departmentService.delete('tenant-1', '1')
            ).rejects.toThrow('Không thể xóa phòng ban đang có nhân viên')
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // GET TREE
    // ══════════════════════════════════════════════════════════════════════

    describe('getTree', () => {
        it('should build hierarchical tree structure', async () => {
            const mockDepartments = [
                { id: '1', name: 'Company', parentId: null },
                { id: '2', name: 'IT', parentId: '1' },
                { id: '3', name: 'HR', parentId: '1' },
                { id: '4', name: 'Dev Team', parentId: '2' },
            ]
            vi.mocked(db.department.findMany).mockResolvedValue(mockDepartments as never)

            const result = await departmentService.getTree('tenant-1')

            expect(result).toHaveLength(1) // Only root
            expect(result[0].id).toBe('1')
            expect(result[0].children).toHaveLength(2) // IT and HR
        })

        it('should handle flat structure (no parents)', async () => {
            const mockDepartments = [
                { id: '1', name: 'Dept A', parentId: null },
                { id: '2', name: 'Dept B', parentId: null },
            ]
            vi.mocked(db.department.findMany).mockResolvedValue(mockDepartments as never)

            const result = await departmentService.getTree('tenant-1')

            expect(result).toHaveLength(2)
        })

        it('should return empty array for no departments', async () => {
            vi.mocked(db.department.findMany).mockResolvedValue([])

            const result = await departmentService.getTree('tenant-1')

            expect(result).toEqual([])
        })
    })
})
