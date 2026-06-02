// tests/lib/payroll/insurance-calculator.test.ts
// Unit tests cho BHXH/BHYT/BHTN Calculator

import { describe, it, expect } from 'vitest'
import {
    INSURANCE_RATES,
    INSURANCE_SALARY_CAP,
    BASE_SALARY_REFERENCE,
} from '@/lib/payroll/constants'

describe('Insurance Calculator - BHXH/BHYT/BHTN', () => {
    // ══════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS (simulating what would be in insurance-calculator.ts)
    // ══════════════════════════════════════════════════════════════════════

    function calculateEmployeeInsurance(salary: number): {
        bhxh: number
        bhyt: number
        bhtn: number
        total: number
    } {
        const cappedSalary = Math.min(salary, INSURANCE_SALARY_CAP)
        return {
            bhxh: Math.round(cappedSalary * INSURANCE_RATES.BHXH.EMPLOYEE),
            bhyt: Math.round(cappedSalary * INSURANCE_RATES.BHYT.EMPLOYEE),
            bhtn: Math.round(cappedSalary * INSURANCE_RATES.BHTN.EMPLOYEE),
            total: Math.round(cappedSalary * INSURANCE_RATES.TOTAL_EMPLOYEE),
        }
    }

    function calculateEmployerInsurance(salary: number): {
        bhxh: number
        bhyt: number
        bhtn: number
        total: number
    } {
        const cappedSalary = Math.min(salary, INSURANCE_SALARY_CAP)
        return {
            bhxh: Math.round(cappedSalary * INSURANCE_RATES.BHXH.EMPLOYER),
            bhyt: Math.round(cappedSalary * INSURANCE_RATES.BHYT.EMPLOYER),
            bhtn: Math.round(cappedSalary * INSURANCE_RATES.BHTN.EMPLOYER),
            total: Math.round(cappedSalary * INSURANCE_RATES.TOTAL_EMPLOYER),
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // CONSTANTS TESTS
    // ══════════════════════════════════════════════════════════════════════

    describe('Insurance Rates Constants', () => {
        it('should have correct employee BHXH rate (8%)', () => {
            expect(INSURANCE_RATES.BHXH.EMPLOYEE).toBe(0.08)
        })

        it('should have correct employer BHXH rate (17.5%)', () => {
            expect(INSURANCE_RATES.BHXH.EMPLOYER).toBe(0.175)
        })

        it('should have correct employee BHYT rate (1.5%)', () => {
            expect(INSURANCE_RATES.BHYT.EMPLOYEE).toBe(0.015)
        })

        it('should have correct employer BHYT rate (3%)', () => {
            expect(INSURANCE_RATES.BHYT.EMPLOYER).toBe(0.03)
        })

        it('should have correct employee BHTN rate (1%)', () => {
            expect(INSURANCE_RATES.BHTN.EMPLOYEE).toBe(0.01)
        })

        it('should have correct employer BHTN rate (1%)', () => {
            expect(INSURANCE_RATES.BHTN.EMPLOYER).toBe(0.01)
        })

        it('should have correct total employee rate (10.5%)', () => {
            const calculated =
                INSURANCE_RATES.BHXH.EMPLOYEE +
                INSURANCE_RATES.BHYT.EMPLOYEE +
                INSURANCE_RATES.BHTN.EMPLOYEE
            expect(calculated).toBe(INSURANCE_RATES.TOTAL_EMPLOYEE)
            expect(INSURANCE_RATES.TOTAL_EMPLOYEE).toBe(0.105)
        })

        it('should have correct total employer rate (21.5%)', () => {
            const calculated =
                INSURANCE_RATES.BHXH.EMPLOYER +
                INSURANCE_RATES.BHYT.EMPLOYER +
                INSURANCE_RATES.BHTN.EMPLOYER
            expect(calculated).toBe(INSURANCE_RATES.TOTAL_EMPLOYER)
            expect(INSURANCE_RATES.TOTAL_EMPLOYER).toBe(0.215)
        })
    })

    describe('Salary Cap Constants', () => {
        it('should have correct base salary reference (2,340,000)', () => {
            expect(BASE_SALARY_REFERENCE).toBe(2_340_000)
        })

        it('should have correct insurance cap = 20 x base salary', () => {
            expect(INSURANCE_SALARY_CAP).toBe(BASE_SALARY_REFERENCE * 20)
            expect(INSURANCE_SALARY_CAP).toBe(46_800_000)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // EMPLOYEE INSURANCE CALCULATIONS
    // ══════════════════════════════════════════════════════════════════════

    describe('Employee Insurance Calculation', () => {
        it('should calculate correctly for normal salary', () => {
            const salary = 20_000_000
            const result = calculateEmployeeInsurance(salary)

            expect(result.bhxh).toBe(1_600_000)   // 20M x 8%
            expect(result.bhyt).toBe(300_000)     // 20M x 1.5%
            expect(result.bhtn).toBe(200_000)     // 20M x 1%
            expect(result.total).toBe(2_100_000)  // 20M x 10.5%
        })

        it('should cap at maximum salary for high earners', () => {
            const salary = 100_000_000 // Above cap
            const result = calculateEmployeeInsurance(salary)

            // Should use cap (46.8M) not actual salary
            expect(result.bhxh).toBe(3_744_000)   // 46.8M x 8%
            expect(result.bhyt).toBe(702_000)     // 46.8M x 1.5%
            expect(result.bhtn).toBe(468_000)     // 46.8M x 1%
            expect(result.total).toBe(4_914_000)  // 46.8M x 10.5%
        })

        it('should calculate correctly for salary exactly at cap', () => {
            const result = calculateEmployeeInsurance(INSURANCE_SALARY_CAP)
            expect(result.total).toBe(Math.round(INSURANCE_SALARY_CAP * 0.105))
        })

        it('should handle zero salary', () => {
            const result = calculateEmployeeInsurance(0)
            expect(result.total).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // EMPLOYER INSURANCE CALCULATIONS
    // ══════════════════════════════════════════════════════════════════════

    describe('Employer Insurance Calculation', () => {
        it('should calculate correctly for normal salary', () => {
            const salary = 20_000_000
            const result = calculateEmployerInsurance(salary)

            expect(result.bhxh).toBe(3_500_000)   // 20M x 17.5%
            expect(result.bhyt).toBe(600_000)     // 20M x 3%
            expect(result.bhtn).toBe(200_000)     // 20M x 1%
            expect(result.total).toBe(4_300_000)  // 20M x 21.5%
        })

        it('should cap at maximum salary for high earners', () => {
            const salary = 100_000_000
            const result = calculateEmployerInsurance(salary)

            // Should use cap (46.8M)
            expect(result.total).toBe(Math.round(INSURANCE_SALARY_CAP * 0.215))
        })

        it('should always be higher than employee contribution', () => {
            const salary = 30_000_000
            const employeeIns = calculateEmployeeInsurance(salary)
            const employerIns = calculateEmployerInsurance(salary)

            expect(employerIns.total).toBeGreaterThan(employeeIns.total)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // EDGE CASES
    // ══════════════════════════════════════════════════════════════════════

    describe('Edge Cases', () => {
        it('should handle minimum wage', () => {
            const minimumWage = 4_680_000 // Region I minimum wage 2024
            const result = calculateEmployeeInsurance(minimumWage)

            expect(result.total).toBe(Math.round(minimumWage * 0.105))
        })

        it('should handle salary just below cap', () => {
            const salary = INSURANCE_SALARY_CAP - 1
            const result = calculateEmployeeInsurance(salary)

            expect(result.total).toBe(Math.round(salary * 0.105))
        })

        it('should handle salary just above cap', () => {
            const salary = INSURANCE_SALARY_CAP + 1
            const result = calculateEmployeeInsurance(salary)

            // Should still use cap
            expect(result.total).toBe(Math.round(INSURANCE_SALARY_CAP * 0.105))
        })
    })
})
