// src/app/(dashboard)/payroll/periods/page.tsx
// Payroll Periods Page

import { Metadata } from "next"
import { PayrollPeriodsClient } from "./client"

export const metadata: Metadata = {
  title: "Kỳ lương | Lạc Việt HR",
  description: "Quản lý kỳ lương",
}

export default function PayrollPeriodsPage() {
  return <PayrollPeriodsClient />
}
