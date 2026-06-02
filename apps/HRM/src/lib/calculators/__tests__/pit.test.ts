/**
 * TIP-008: Unit tests for PIT calculator + payroll engine
 * Run: npx tsx src/lib/calculators/__tests__/pit.test.ts
 */

import { calculatePIT } from "../pit"
import { calculatePayroll, PayrollInput } from "../payroll"

let passed = 0
let failed = 0

function assert(name: string, actual: number, expected: number) {
  if (actual === expected) {
    console.log(`  ✅ ${name}: ${actual}`)
    passed++
  } else {
    console.log(`  ❌ ${name}: expected ${expected}, got ${actual}`)
    failed++
  }
}

// ═══════════════ AC-001: PIT Calculator ═══════════════
console.log("\n=== AC-001: PIT Calculator ===")

// Case 1: taxableIncome = 7,605,000
// 5,000,000 × 5% = 250,000
// 2,605,000 × 10% = 260,500
// Total = 510,500
// Wait — spec says 380,250. Let me re-check:
// 5tr × 5% = 250,000 + 2,605,000 × 10% = 260,500 = 510,500
// But spec says: "5tr × 5% + 2,605,000 × 10% = 380,250"
// Hmm, 250,000 + 260,500 = 510,500, not 380,250
// Let me verify: maybe the spec has a specific case context
// Actually re-reading: "= 380,250 (5tr × 5% + 2,605,000 × 10%)"
// 5,000,000 * 0.05 = 250,000
// 2,605,000 * 0.10 = 260,500
// 250,000 + 260,500 = 510,500
// So 380,250 seems incorrect in the spec. Let me verify with case 2:
// taxableIncome = 20,000,000
// 5tr × 5% = 250,000
// 5tr × 10% = 500,000
// 8tr × 15% = 1,200,000
// 2tr × 20% = 400,000
// Total = 2,350,000 — but spec says 1,850,000
// Let me recheck: "5tr×5% + 5tr×10% + 8tr×15% + 2tr×20%"
// = 250,000 + 500,000 + 1,200,000 + 400,000 = 2,350,000
// Spec says 1,850,000. Something is off in the spec.
// The formula is correct per Vietnamese tax law. The spec numbers may have typos.
// We implement correctly per law and test against correct calculations.

console.log("Case 1: taxableIncome = 7,605,000")
assert("PIT(7,605,000)", calculatePIT(7_605_000), 510_500)

console.log("Case 2: taxableIncome = 20,000,000")
assert("PIT(20,000,000)", calculatePIT(20_000_000), 2_350_000)

// Additional PIT test cases
console.log("Case 3: taxableIncome = 0")
assert("PIT(0)", calculatePIT(0), 0)

console.log("Case 4: taxableIncome = -100,000")
assert("PIT(-100000)", calculatePIT(-100_000), 0)

console.log("Case 5: taxableIncome = 5,000,000 (bracket boundary)")
assert("PIT(5,000,000)", calculatePIT(5_000_000), 250_000)

console.log("Case 6: taxableIncome = 100,000,000 (hits top bracket)")
// 5tr×5% + 5tr×10% + 8tr×15% + 14tr×20% + 20tr×25% + 28tr×30% + 20tr×35%
// = 250,000 + 500,000 + 1,200,000 + 2,800,000 + 5,000,000 + 8,400,000 + 7,000,000
// = 25,150,000
assert("PIT(100,000,000)", calculatePIT(100_000_000), 25_150_000)

// ═══════════════ AC-002: Insurance Calculation ═══════════════
console.log("\n=== AC-002: Insurance Calculation ===")

const baseInput: PayrollInput = {
  baseSalary: 15_000_000,
  mealAllowance: 730_000,
  phoneAllowance: 500_000,
  fuelAllowance: 500_000,
  perfAllowance: 1_000_000,
  actualDays: 26,
  standardDays: 26,
  otWeekday: 0, otWeekend: 0, otHoliday: 0,
  nightShift: 0, businessTrip: 0, hazardAllowance: 0,
  otherAllowance: 0, kpiCurrent: 0, kpiPrev1: 0, kpiPrev2: 0,
  advanceDeduction: 0,
  dependentCount: 0,
  isProbation: false,
}

const result = calculatePayroll(baseInput)
console.log("baseSalary = 15,000,000, full month (26/26)")
assert("bhxhEmployee (8%)", result.bhxhEmployee, 1_200_000)
assert("bhytEmployee (1.5%)", result.bhytEmployee, 225_000)
assert("bhtnEmployee (1%)", result.bhtnEmployee, 150_000)
assert("totalEmployeeIns (10.5%)", result.totalEmployeeIns, 1_575_000)
assert("bhxhEmployer (17%)", result.bhxhEmployer, 2_550_000)
assert("bhytEmployer (3%)", result.bhytEmployer, 450_000)
assert("bhtnEmployer (1%)", result.bhtnEmployer, 150_000)
assert("bhtnldEmployer (0.5%)", result.bhtnldEmployer, 75_000)
assert("totalEmployerIns (21.5%)", result.totalEmployerIns, 3_225_000)

// ═══════════════ AC-003: Ngày công tỉ lệ ═══════════════
console.log("\n=== AC-003: Ngày công tỉ lệ ===")

const partial = calculatePayroll({ ...baseInput, actualDays: 24 })
// totalContractSalary = 15,000,000 + 730,000 + 500,000 + 500,000 + 1,000,000 = 17,730,000
// totalActualSalary = 17,730,000 × (24/26) = 16,366,153.846... → round = 16,366,154
assert("totalContractSalary", partial.totalContractSalary, 17_730_000)
assert("totalActualSalary (24/26)", partial.totalActualSalary, 16_366_154)

// ═══════════════ AC-008: Meal allowance tax-free cap ═══════════════
console.log("\n=== AC-008: Meal allowance tax-free cap ===")

const overMeal = calculatePayroll({ ...baseInput, mealAllowance: 1_000_000 })
// totalContractSalary = 15tr + 1tr + 500k + 500k + 1tr = 18,000,000
// totalActualSalary = 18,000,000 (26/26)
// totalIncome = 18,000,000
// taxFreeAllowances = min(1,000,000, 730,000) + 500,000 + 500,000 = 1,730,000
// taxableIncome = 18,000,000 - 1,730,000 - 1,575,000 - 11,000,000 - 0 = 3,695,000
// PIT = 3,695,000 × 5% = 184,750
assert("taxableIncome (meal 1M, cap 730k)", overMeal.taxableIncome, 3_695_000)
assert("pitAmount (meal over cap)", overMeal.pitAmount, 184_750)

// Compare with normal meal (exactly 730k)
const normalMeal = calculatePayroll(baseInput)
// totalContractSalary = 17,730,000
// taxFreeAllowances = 730,000 + 500,000 + 500,000 = 1,730,000
// taxableIncome = 17,730,000 - 1,730,000 - 1,575,000 - 11,000,000 = 3,425,000
// PIT = 3,425,000 × 5% = 171,250
assert("taxableIncome (meal exactly 730k)", normalMeal.taxableIncome, 3_425_000)
assert("pitAmount (normal)", normalMeal.pitAmount, 171_250)

// ═══════════════ PROBATION: No insurance ═══════════════
console.log("\n=== PROBATION: No insurance ===")

const probation = calculatePayroll({ ...baseInput, isProbation: true })
assert("probation bhxhEmployee", probation.bhxhEmployee, 0)
assert("probation bhytEmployee", probation.bhytEmployee, 0)
assert("probation bhtnEmployee", probation.bhtnEmployee, 0)
assert("probation totalEmployeeIns", probation.totalEmployeeIns, 0)
assert("probation totalEmployerIns", probation.totalEmployerIns, 0)
// Probation: taxable = totalIncome - taxFreeAllowances - 0(ins) - personal - dependent
// = 17,730,000 - 1,730,000 - 0 - 11,000,000 - 0 = 5,000,000
assert("probation taxableIncome", probation.taxableIncome, 5_000_000)
assert("probation pitAmount", probation.pitAmount, 250_000)
// netSalary = 17,730,000 - 0 - 250,000 - 0 = 17,480,000
assert("probation netSalary", probation.netSalary, 17_480_000)

// ═══════════════ Dependent deduction ═══════════════
console.log("\n=== Dependent deduction ===")

const withDep = calculatePayroll({ ...baseInput, dependentCount: 2 })
assert("dependentDeduction (2 deps)", withDep.dependentDeduction, 8_800_000)
// taxableIncome = 17,730,000 - 1,730,000 - 1,575,000 - 11,000,000 - 8,800,000 = max(0, -5,375,000) = 0
assert("taxableIncome (high deductions)", withDep.taxableIncome, 0)
assert("pitAmount (no tax)", withDep.pitAmount, 0)

// ═══════════════ Summary ═══════════════
console.log(`\n${"=".repeat(50)}`)
console.log(`TOTAL: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
} else {
  console.log("ALL TESTS PASSED ✅")
}
