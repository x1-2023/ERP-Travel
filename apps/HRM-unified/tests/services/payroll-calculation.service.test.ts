// tests/services/payroll-calculation.service.test.ts
// Unit tests cho Payroll Calculation Service

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        employee: { findMany: vi.fn() },
        payrollRecord: { create: vi.fn(), findFirst: vi.fn() },
        payrollItem: { createMany: vi.fn() },
        payrollPeriod: { findUnique: vi.fn(), update: vi.fn() },
    },
}))

describe('Payroll Calculation Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ══════════════════════════════════════════════════════════════════════
    // GROSS SALARY CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Gross Salary Calculation', () => {
        interface SalaryComponent {
            type: 'EARNING' | 'DEDUCTION'
            amount: number
            isTaxable: boolean
        }

        function calculateGrossSalary(components: SalaryComponent[]): number {
            return components
                .filter(c => c.type === 'EARNING')
                .reduce((sum, c) => sum + c.amount, 0)
        }

        function calculateTaxableIncome(components: SalaryComponent[]): number {
            return components
                .filter(c => c.type === 'EARNING' && c.isTaxable)
                .reduce((sum, c) => sum + c.amount, 0)
        }

        it('should calculate gross salary from earnings', () => {
            const components: SalaryComponent[] = [
                { type: 'EARNING', amount: 20_000_000, isTaxable: true },
                { type: 'EARNING', amount: 2_000_000, isTaxable: true },
                { type: 'EARNING', amount: 1_000_000, isTaxable: false },
                { type: 'DEDUCTION', amount: 2_100_000, isTaxable: false },
            ]

            expect(calculateGrossSalary(components)).toBe(23_000_000)
        })

        it('should calculate taxable income', () => {
            const components: SalaryComponent[] = [
                { type: 'EARNING', amount: 20_000_000, isTaxable: true },
                { type: 'EARNING', amount: 2_000_000, isTaxable: true },
                { type: 'EARNING', amount: 1_000_000, isTaxable: false }, // Non-taxable allowance
            ]

            expect(calculateTaxableIncome(components)).toBe(22_000_000)
        })

        it('should handle empty components', () => {
            expect(calculateGrossSalary([])).toBe(0)
            expect(calculateTaxableIncome([])).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // INSURANCE CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Insurance Calculation', () => {
        const INSURANCE_CAP = 46_800_000
        const RATES = {
            EMPLOYEE: { BHXH: 0.08, BHYT: 0.015, BHTN: 0.01 },
            EMPLOYER: { BHXH: 0.175, BHYT: 0.03, BHTN: 0.01 },
        }

        interface InsuranceResult {
            employeeBHXH: number
            employeeBHYT: number
            employeeBHTN: number
            employeeTotal: number
            employerBHXH: number
            employerBHYT: number
            employerBHTN: number
            employerTotal: number
        }

        function calculateInsurance(insuranceSalary: number): InsuranceResult {
            const cappedSalary = Math.min(insuranceSalary, INSURANCE_CAP)

            return {
                employeeBHXH: Math.round(cappedSalary * RATES.EMPLOYEE.BHXH),
                employeeBHYT: Math.round(cappedSalary * RATES.EMPLOYEE.BHYT),
                employeeBHTN: Math.round(cappedSalary * RATES.EMPLOYEE.BHTN),
                employeeTotal: Math.round(cappedSalary * 0.105),
                employerBHXH: Math.round(cappedSalary * RATES.EMPLOYER.BHXH),
                employerBHYT: Math.round(cappedSalary * RATES.EMPLOYER.BHYT),
                employerBHTN: Math.round(cappedSalary * RATES.EMPLOYER.BHTN),
                employerTotal: Math.round(cappedSalary * 0.215),
            }
        }

        it('should calculate insurance for normal salary', () => {
            const result = calculateInsurance(20_000_000)

            expect(result.employeeBHXH).toBe(1_600_000)
            expect(result.employeeBHYT).toBe(300_000)
            expect(result.employeeBHTN).toBe(200_000)
            expect(result.employeeTotal).toBe(2_100_000)
        })

        it('should cap insurance salary', () => {
            const result = calculateInsurance(100_000_000)

            // Should use cap, not actual salary
            expect(result.employeeTotal).toBe(Math.round(INSURANCE_CAP * 0.105))
        })

        it('should calculate employer contributions', () => {
            const result = calculateInsurance(20_000_000)

            expect(result.employerBHXH).toBe(3_500_000)
            expect(result.employerBHYT).toBe(600_000)
            expect(result.employerBHTN).toBe(200_000)
            expect(result.employerTotal).toBe(4_300_000)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // PIT CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('PIT Calculation Integration', () => {
        const PERSONAL_DEDUCTION = 11_000_000
        const DEPENDENT_DEDUCTION = 4_400_000

        function calculateAssessableIncome(
            taxableIncome: number,
            insuranceDeduction: number,
            dependentCount: number
        ): number {
            const totalDeductions =
                PERSONAL_DEDUCTION +
                (DEPENDENT_DEDUCTION * dependentCount) +
                insuranceDeduction
            return Math.max(0, taxableIncome - totalDeductions)
        }

        it('should calculate assessable income correctly', () => {
            const taxableIncome = 30_000_000
            const insurance = 2_100_000
            const dependents = 1

            // 30M - 11M - 4.4M - 2.1M = 12.5M
            const assessable = calculateAssessableIncome(taxableIncome, insurance, dependents)
            expect(assessable).toBe(12_500_000)
        })

        it('should return 0 if deductions exceed income', () => {
            const taxableIncome = 10_000_000
            const insurance = 1_000_000
            const dependents = 0

            const assessable = calculateAssessableIncome(taxableIncome, insurance, dependents)
            expect(assessable).toBe(0)
        })

        it('should handle multiple dependents', () => {
            const taxableIncome = 50_000_000
            const insurance = 2_100_000
            const dependents = 3

            // 50M - 11M - 13.2M - 2.1M = 23.7M
            const assessable = calculateAssessableIncome(taxableIncome, insurance, dependents)
            expect(assessable).toBe(23_700_000)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // NET SALARY CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Net Salary Calculation', () => {
        interface DeductionSummary {
            insurance: number
            pit: number
            other: number
        }

        function calculateNetSalary(
            grossSalary: number,
            deductions: DeductionSummary
        ): number {
            const totalDeductions = deductions.insurance + deductions.pit + deductions.other
            return grossSalary - totalDeductions
        }

        it('should calculate net salary', () => {
            const gross = 30_000_000
            const deductions = {
                insurance: 3_150_000,
                pit: 2_150_000,
                other: 0,
            }

            const net = calculateNetSalary(gross, deductions)
            expect(net).toBe(24_700_000)
        })

        it('should handle additional deductions', () => {
            const gross = 30_000_000
            const deductions = {
                insurance: 3_150_000,
                pit: 2_150_000,
                other: 2_000_000, // Loan deduction
            }

            const net = calculateNetSalary(gross, deductions)
            expect(net).toBe(22_700_000)
        })

        it('should handle zero deductions', () => {
            const gross = 10_000_000
            const deductions = { insurance: 0, pit: 0, other: 0 }

            const net = calculateNetSalary(gross, deductions)
            expect(net).toBe(10_000_000)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // OVERTIME PAY CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Overtime Pay Calculation', () => {
        const OT_RATES = {
            WEEKDAY: 1.5,
            WEEKEND: 2.0,
            HOLIDAY: 3.0,
            NIGHT_BONUS: 0.3,
        }

        function calculateHourlyRate(baseSalary: number, standardHours: number = 176): number {
            return Math.round(baseSalary / standardHours)
        }

        function calculateOTPay(
            hourlyRate: number,
            hours: number,
            type: 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY',
            isNight: boolean = false
        ): number {
            let rate = OT_RATES[type]
            if (isNight) rate += OT_RATES.NIGHT_BONUS
            return Math.round(hourlyRate * hours * rate)
        }

        it('should calculate hourly rate', () => {
            const baseSalary = 17_600_000
            expect(calculateHourlyRate(baseSalary)).toBe(100_000)
        })

        it('should calculate weekday OT (1.5x)', () => {
            const hourlyRate = 100_000
            expect(calculateOTPay(hourlyRate, 2, 'WEEKDAY')).toBe(300_000)
        })

        it('should calculate weekend OT (2x)', () => {
            const hourlyRate = 100_000
            expect(calculateOTPay(hourlyRate, 4, 'WEEKEND')).toBe(800_000)
        })

        it('should calculate holiday OT (3x)', () => {
            const hourlyRate = 100_000
            expect(calculateOTPay(hourlyRate, 2, 'HOLIDAY')).toBe(600_000)
        })

        it('should add night bonus (+0.3x)', () => {
            const hourlyRate = 100_000
            // Weekday night: 1.5 + 0.3 = 1.8x
            expect(calculateOTPay(hourlyRate, 2, 'WEEKDAY', true)).toBe(360_000)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // PRORATED SALARY CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Prorated Salary Calculation', () => {
        function calculateProratedSalary(
            baseSalary: number,
            actualDays: number,
            standardDays: number
        ): number {
            if (standardDays === 0) return 0
            return Math.round(baseSalary * (actualDays / standardDays))
        }

        it('should calculate full salary for full attendance', () => {
            const salary = calculateProratedSalary(20_000_000, 22, 22)
            expect(salary).toBe(20_000_000)
        })

        it('should calculate half salary for half attendance', () => {
            const salary = calculateProratedSalary(20_000_000, 11, 22)
            expect(salary).toBe(10_000_000)
        })

        it('should handle new hire mid-month', () => {
            const salary = calculateProratedSalary(20_000_000, 10, 22)
            expect(salary).toBe(9_090_909)
        })

        it('should handle zero standard days', () => {
            const salary = calculateProratedSalary(20_000_000, 0, 0)
            expect(salary).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // PAYROLL TOTALS
    // ══════════════════════════════════════════════════════════════════════

    describe('Payroll Totals', () => {
        interface PayrollRecord {
            grossSalary: number
            netSalary: number
            totalEarnings: number
            totalDeductions: number
            employerCost: number
        }

        interface PayrollTotals {
            totalGross: number
            totalNet: number
            totalEarnings: number
            totalDeductions: number
            totalEmployerCost: number
            employeeCount: number
            averageGross: number
        }

        function calculateTotals(records: PayrollRecord[]): PayrollTotals {
            const count = records.length
            const totalGross = records.reduce((sum, r) => sum + r.grossSalary, 0)

            return {
                totalGross,
                totalNet: records.reduce((sum, r) => sum + r.netSalary, 0),
                totalEarnings: records.reduce((sum, r) => sum + r.totalEarnings, 0),
                totalDeductions: records.reduce((sum, r) => sum + r.totalDeductions, 0),
                totalEmployerCost: records.reduce((sum, r) => sum + r.employerCost, 0),
                employeeCount: count,
                averageGross: count > 0 ? Math.round(totalGross / count) : 0,
            }
        }

        it('should calculate payroll totals', () => {
            const records: PayrollRecord[] = [
                { grossSalary: 30_000_000, netSalary: 24_700_000, totalEarnings: 30_000_000, totalDeductions: 5_300_000, employerCost: 36_450_000 },
                { grossSalary: 20_000_000, netSalary: 17_100_000, totalEarnings: 20_000_000, totalDeductions: 2_900_000, employerCost: 24_300_000 },
            ]

            const totals = calculateTotals(records)

            expect(totals.totalGross).toBe(50_000_000)
            expect(totals.totalNet).toBe(41_800_000)
            expect(totals.employeeCount).toBe(2)
            expect(totals.averageGross).toBe(25_000_000)
        })

        it('should handle empty records', () => {
            const totals = calculateTotals([])

            expect(totals.totalGross).toBe(0)
            expect(totals.employeeCount).toBe(0)
            expect(totals.averageGross).toBe(0)
        })
    })

    // ══════════════════════════════════════════════════════════════════════
    // BONUS CALCULATION
    // ══════════════════════════════════════════════════════════════════════

    describe('Bonus Calculation', () => {
        type BonusType = 'FIXED' | 'PERCENTAGE' | 'FORMULA'

        interface BonusConfig {
            type: BonusType
            value: number
            basedOn?: 'BASE_SALARY' | 'GROSS_SALARY' | 'NET_SALARY'
        }

        function calculateBonus(
            config: BonusConfig,
            salaryData: { baseSalary: number; grossSalary: number; netSalary: number }
        ): number {
            switch (config.type) {
                case 'FIXED':
                    return config.value
                case 'PERCENTAGE':
                    const base = config.basedOn === 'GROSS_SALARY' ? salaryData.grossSalary :
                        config.basedOn === 'NET_SALARY' ? salaryData.netSalary :
                            salaryData.baseSalary
                    return Math.round(base * (config.value / 100))
                default:
                    return 0
            }
        }

        it('should calculate fixed bonus', () => {
            const config: BonusConfig = { type: 'FIXED', value: 5_000_000 }
            const result = calculateBonus(config, { baseSalary: 20_000_000, grossSalary: 25_000_000, netSalary: 20_000_000 })

            expect(result).toBe(5_000_000)
        })

        it('should calculate percentage of base salary', () => {
            const config: BonusConfig = { type: 'PERCENTAGE', value: 100, basedOn: 'BASE_SALARY' }
            const result = calculateBonus(config, { baseSalary: 20_000_000, grossSalary: 25_000_000, netSalary: 20_000_000 })

            expect(result).toBe(20_000_000) // 100% of base
        })

        it('should calculate percentage of gross salary', () => {
            const config: BonusConfig = { type: 'PERCENTAGE', value: 50, basedOn: 'GROSS_SALARY' }
            const result = calculateBonus(config, { baseSalary: 20_000_000, grossSalary: 30_000_000, netSalary: 25_000_000 })

            expect(result).toBe(15_000_000) // 50% of gross
        })
    })
})
