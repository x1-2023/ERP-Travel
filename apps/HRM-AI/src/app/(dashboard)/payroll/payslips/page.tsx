// src/app/(dashboard)/payroll/payslips/page.tsx
// Payslips Page

import { Metadata } from "next"
import { PayslipsClient } from "./client"

export const metadata: Metadata = {
  title: "Phiếu lương | Lạc Việt HR",
  description: "Xem phiếu lương nhân viên",
}

export default function PayslipsPage() {
  return <PayslipsClient />
}
