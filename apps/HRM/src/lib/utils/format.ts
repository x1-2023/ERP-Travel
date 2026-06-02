import { formatVN } from "@/lib/utils/timezone"

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "—"
  return formatVN(d, "dd/MM/yyyy")
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "—"
  return formatVN(d, "dd/MM/yyyy HH:mm")
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "—"
  const n = Number(amount)
  if (isNaN(n)) return "—"
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ"
}

export function formatNumber(n: number | string | null | undefined): string {
  if (n === null || n === undefined) return "—"
  const num = Number(n)
  if (isNaN(num)) return "—"
  return new Intl.NumberFormat("vi-VN").format(Math.round(num))
}
