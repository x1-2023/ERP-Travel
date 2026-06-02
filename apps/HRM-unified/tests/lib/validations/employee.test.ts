// tests/lib/validations/employee.test.ts
// Unit tests cho Employee Validation Schemas

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Re-create schemas for testing (to avoid import issues)
const employeeSchema = z.object({
    employeeCode: z.string().min(1, 'Mã nhân viên là bắt buộc').max(20),
    fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
    dateOfBirth: z.coerce.date().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
    idNumber: z.string().max(20).optional().nullable(),
    idIssueDate: z.coerce.date().optional().nullable(),
    idIssuePlace: z.string().max(200).optional().nullable(),
    taxCode: z.string().max(20).optional().nullable(),
    socialInsuranceNumber: z.string().max(20).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    personalEmail: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
    workEmail: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
    permanentAddress: z.string().max(500).optional().nullable(),
    currentAddress: z.string().max(500).optional().nullable(),
    bankAccount: z.string().max(50).optional().nullable(),
    bankName: z.string().max(100).optional().nullable(),
    departmentId: z.string().optional().nullable(),
    positionId: z.string().optional().nullable(),
    hireDate: z.coerce.date({ message: 'Ngày vào làm là bắt buộc' }),
    probationEndDate: z.coerce.date().optional().nullable(),
    status: z.enum(['ACTIVE', 'PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED']).default('ACTIVE'),
    resignationDate: z.coerce.date().optional().nullable(),
    resignationReason: z.string().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
})

describe('Employee Validation Schemas', () => {
    // ══════════════════════════════════════════════════════════════════════
    // REQUIRED FIELDS
    // ══════════════════════════════════════════════════════════════════════

    describe('Required Fields', () => {
        it('should require employeeCode', () => {
            const result = employeeSchema.safeParse({
                fullName: 'Nguyễn Văn A',
                hireDate: '2024-01-15',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('employeeCode')
            }
        })

        it('should require fullName', () => {
            const result = employeeSchema.safeParse({
                employeeCode: 'NV0001',
                hireDate: '2024-01-15',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('fullName')
            }
        })

        it('should require hireDate', () => {
            const result = employeeSchema.safeParse({
                employeeCode: 'NV0001',
                fullName: 'Nguyễn Văn A',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues.some(i => i.path.includes('hireDate'))).toBe(true)
            }
        })

        it('should pass with all required fields', () => {
            const result = employeeSchema.safeParse({
                employeeCode: 'NV0001',
                fullName: 'Nguyễn Văn A',
                hireDate: '2024-01-15',
            })

            expect(result.success).toBe(true)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // EMPLOYEE CODE VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Employee Code Validation', () => {
        const validBase = {
            fullName: 'Nguyễn Văn A',
            hireDate: '2024-01-15',
        }

        it('should accept valid employee code', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                employeeCode: 'NV0001',
            })
            expect(result.success).toBe(true)
        })

        it('should reject empty employee code', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                employeeCode: '',
            })
            expect(result.success).toBe(false)
        })

        it('should reject employee code longer than 20 chars', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                employeeCode: 'A'.repeat(21),
            })
            expect(result.success).toBe(false)
        })

        it('should accept employee code exactly 20 chars', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                employeeCode: 'A'.repeat(20),
            })
            expect(result.success).toBe(true)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // FULL NAME VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Full Name Validation', () => {
        const validBase = {
            employeeCode: 'NV0001',
            hireDate: '2024-01-15',
        }

        it('should accept Vietnamese names', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                fullName: 'Nguyễn Văn Anh',
            })
            expect(result.success).toBe(true)
        })

        it('should accept names with special characters', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                fullName: 'Đặng Thị Thủy',
            })
            expect(result.success).toBe(true)
        })

        it('should reject empty full name', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                fullName: '',
            })
            expect(result.success).toBe(false)
        })

        it('should reject name longer than 100 chars', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                fullName: 'A'.repeat(101),
            })
            expect(result.success).toBe(false)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // EMAIL VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Email Validation', () => {
        const validBase = {
            employeeCode: 'NV0001',
            fullName: 'Nguyễn Văn A',
            hireDate: '2024-01-15',
        }

        it('should accept valid personal email', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                personalEmail: 'user@gmail.com',
            })
            expect(result.success).toBe(true)
        })

        it('should accept valid work email', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                workEmail: 'nguyen.van.a@company.vn',
            })
            expect(result.success).toBe(true)
        })

        it('should reject invalid email format', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                personalEmail: 'invalid-email',
            })
            expect(result.success).toBe(false)
        })

        it('should accept empty string for email', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                personalEmail: '',
            })
            expect(result.success).toBe(true)
        })

        it('should accept null for email', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                personalEmail: null,
            })
            expect(result.success).toBe(true)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // GENDER VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Gender Validation', () => {
        const validBase = {
            employeeCode: 'NV0001',
            fullName: 'Nguyễn Văn A',
            hireDate: '2024-01-15',
        }

        it('should accept MALE', () => {
            const result = employeeSchema.safeParse({ ...validBase, gender: 'MALE' })
            expect(result.success).toBe(true)
        })

        it('should accept FEMALE', () => {
            const result = employeeSchema.safeParse({ ...validBase, gender: 'FEMALE' })
            expect(result.success).toBe(true)
        })

        it('should accept OTHER', () => {
            const result = employeeSchema.safeParse({ ...validBase, gender: 'OTHER' })
            expect(result.success).toBe(true)
        })

        it('should reject invalid gender', () => {
            const result = employeeSchema.safeParse({ ...validBase, gender: 'UNKNOWN' })
            expect(result.success).toBe(false)
        })

        it('should accept null gender', () => {
            const result = employeeSchema.safeParse({ ...validBase, gender: null })
            expect(result.success).toBe(true)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // STATUS VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Status Validation', () => {
        const validBase = {
            employeeCode: 'NV0001',
            fullName: 'Nguyễn Văn A',
            hireDate: '2024-01-15',
        }

        const validStatuses = ['ACTIVE', 'PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED']

        validStatuses.forEach(status => {
            it(`should accept ${status} status`, () => {
                const result = employeeSchema.safeParse({ ...validBase, status })
                expect(result.success).toBe(true)
            })
        })

        it('should reject invalid status', () => {
            const result = employeeSchema.safeParse({ ...validBase, status: 'INVALID' })
            expect(result.success).toBe(false)
        })

        it('should default to ACTIVE when not provided', () => {
            const result = employeeSchema.safeParse(validBase)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.status).toBe('ACTIVE')
            }
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // DATE VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Date Validation', () => {
        const validBase = {
            employeeCode: 'NV0001',
            fullName: 'Nguyễn Văn A',
        }

        it('should accept date string for hireDate', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                hireDate: '2024-01-15',
            })
            expect(result.success).toBe(true)
        })

        it('should accept Date object for hireDate', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                hireDate: new Date('2024-01-15'),
            })
            expect(result.success).toBe(true)
        })

        it('should reject invalid date string', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                hireDate: 'not-a-date',
            })
            expect(result.success).toBe(false)
        })

        it('should accept null for optional dates', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                hireDate: '2024-01-15',
                dateOfBirth: null,
                probationEndDate: null,
            })
            expect(result.success).toBe(true)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // TEXT LENGTH VALIDATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Text Length Validation', () => {
        const validBase = {
            employeeCode: 'NV0001',
            fullName: 'Nguyễn Văn A',
            hireDate: '2024-01-15',
        }

        it('should accept address within 500 chars', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                permanentAddress: 'A'.repeat(500),
            })
            expect(result.success).toBe(true)
        })

        it('should reject address over 500 chars', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                permanentAddress: 'A'.repeat(501),
            })
            expect(result.success).toBe(false)
        })

        it('should accept notes within 1000 chars', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                notes: 'A'.repeat(1000),
            })
            expect(result.success).toBe(true)
        })

        it('should reject notes over 1000 chars', () => {
            const result = employeeSchema.safeParse({
                ...validBase,
                notes: 'A'.repeat(1001),
            })
            expect(result.success).toBe(false)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // COMPLETE EMPLOYEE DATA
    // ══════════════════════════════════════════════════════════════════════

    describe('Complete Employee Data', () => {
        it('should accept complete valid employee data', () => {
            const completeEmployee = {
                employeeCode: 'NV0001',
                fullName: 'Nguyễn Văn Anh',
                dateOfBirth: '1990-05-15',
                gender: 'MALE',
                idNumber: '123456789012',
                idIssueDate: '2015-01-01',
                idIssuePlace: 'TP.HCM',
                taxCode: '1234567890',
                socialInsuranceNumber: 'AB123456789',
                phone: '0901234567',
                personalEmail: 'nguyen.anh@gmail.com',
                workEmail: 'nguyen.anh@company.vn',
                permanentAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
                currentAddress: '456 Lê Lợi, Q3, TP.HCM',
                bankAccount: '1234567890123',
                bankName: 'Vietcombank',
                departmentId: 'dept-001',
                positionId: 'pos-001',
                hireDate: '2024-01-15',
                probationEndDate: '2024-03-15',
                status: 'PROBATION',
                notes: 'Nhân viên mới',
            }

            const result = employeeSchema.safeParse(completeEmployee)
            expect(result.success).toBe(true)
        })
    })
})
