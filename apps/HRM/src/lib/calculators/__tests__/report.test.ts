/**
 * TIP-009: Unit tests for report calculators
 * Run: npx tsx src/lib/calculators/__tests__/report.test.ts
 */

import {
  calculateBusinessNights,
  calculateOTRate,
  calculateOTHours,
  validateOTReport,
  calculateLeaveDays,
} from "../report"

let passed = 0
let failed = 0

function assert(name: string, actual: number | boolean, expected: number | boolean) {
  if (actual === expected) {
    console.log(`  ✅ ${name}: ${actual}`)
    passed++
  } else {
    console.log(`  ❌ ${name}: expected ${expected}, got ${actual}`)
    failed++
  }
}

// ═══════════════ Business Nights ═══════════════
console.log("\n=== Business Trip Nights ===")

assert("15→17 = 2 nights",
  calculateBusinessNights(new Date("2026-03-15"), new Date("2026-03-17")), 2)

assert("15→15 (same day) = 0 nights",
  calculateBusinessNights(new Date("2026-03-15"), new Date("2026-03-15")), 0)

assert("10→12 = 2 nights",
  calculateBusinessNights(new Date("2026-03-10"), new Date("2026-03-12")), 2)

assert("10→11 = 1 night",
  calculateBusinessNights(new Date("2026-03-10"), new Date("2026-03-11")), 1)

// ═══════════════ OT Rate ═══════════════
console.log("\n=== OT Rate Calculation ===")

// baseSalary=15,000,000, standardDays=26
// hourlyRate = 15,000,000 / 26 / 8 = 72,115.38...
// WEEKDAY 3h: 72,115.38 × 3 × 1.5 = 324,519.23 → round = 324,519
assert("OT WEEKDAY 3h", calculateOTRate(15_000_000, 26, 3, "WEEKDAY"), 324_519)

// WEEKEND 2h: 72,115.38 × 2 × 2.0 = 288,461.53 → round = 288_462
assert("OT WEEKEND 2h", calculateOTRate(15_000_000, 26, 2, "WEEKEND"), 288_462)

// HOLIDAY 4h: 72,115.38 × 4 × 3.0 = 865,384.61 → round = 865_385
assert("OT HOLIDAY 4h", calculateOTRate(15_000_000, 26, 4, "HOLIDAY"), 865_385)

// ═══════════════ OT Hours ═══════════════
console.log("\n=== OT Hours ===")

assert("18:00-21:00 = 3h", calculateOTHours("18:00", "21:00"), 3)
assert("18:00-20:30 = 2.5h", calculateOTHours("18:00", "20:30"), 2.5)
assert("18:00-18:00 = 0h", calculateOTHours("18:00", "18:00"), 0)

// ═══════════════ OT Validation ═══════════════
console.log("\n=== OT Validation ===")

const valid3h = validateOTReport({ startTime: "18:00", endTime: "21:00", otType: "WEEKDAY" })
assert("3h OT valid", valid3h.valid, true)

const invalid5h = validateOTReport({ startTime: "18:00", endTime: "23:00", otType: "WEEKDAY" })
assert("5h OT invalid", invalid5h.valid, false)
assert("5h OT error count", invalid5h.errors.length, 1)

const invalidReverse = validateOTReport({ startTime: "21:00", endTime: "18:00", otType: "WEEKDAY" })
assert("reversed time invalid", invalidReverse.valid, false)

// ═══════════════ Leave Days ═══════════════
console.log("\n=== Leave Days ===")

// Mon 2026-03-09 to Fri 2026-03-13 = 5 days (all weekdays)
assert("5 weekdays (no weekend exclude)",
  calculateLeaveDays(new Date("2026-03-09"), new Date("2026-03-13"), false), 5)

assert("5 weekdays (with weekend exclude)",
  calculateLeaveDays(new Date("2026-03-09"), new Date("2026-03-13"), true), 5)

// Mon 2026-03-09 to Sun 2026-03-15 = 7 calendar, 5 working
assert("7 calendar days, 5 working",
  calculateLeaveDays(new Date("2026-03-09"), new Date("2026-03-15"), true), 5)

assert("7 calendar days total",
  calculateLeaveDays(new Date("2026-03-09"), new Date("2026-03-15"), false), 7)

// Same day
assert("same day = 1",
  calculateLeaveDays(new Date("2026-03-10"), new Date("2026-03-10"), true), 1)

// ═══════════════ Summary ═══════════════
console.log(`\n${"=".repeat(50)}`)
console.log(`TOTAL: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
} else {
  console.log("ALL TESTS PASSED ✅")
}
