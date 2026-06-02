"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils/format"

interface PayrollMonth {
  month: number
  totalGross: number
  totalNet: number
  totalEmployerIns: number
  totalCost: number
  employeeCount: number
  status: string
}

function formatM(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  return new Intl.NumberFormat("vi-VN").format(n)
}

export function PayrollBarChart({ data }: { data: PayrollMonth[] }) {
  const chartData = data.map((d) => ({
    name: `T${d.month}`,
    "Thực lĩnh": d.totalNet,
    "BH công ty": d.totalEmployerIns,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatM} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
        <Bar dataKey="Thực lĩnh" fill="#1E3A5F" stackId="cost" radius={[0, 0, 0, 0]} />
        <Bar dataKey="BH công ty" fill="#60a5fa" stackId="cost" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TaxPITBarChart({ data }: { data: { month: number; totalPIT: number }[] }) {
  const chartData = data.map((d) => ({
    name: `T${d.month}`,
    "Thuế TNCN": d.totalPIT,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatM} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Bar dataKey="Thuế TNCN" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
