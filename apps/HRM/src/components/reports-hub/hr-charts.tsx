"use client"

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface HeadcountMonth {
  month: number
  active: number
  probation: number
  total: number
}

interface DeptDistribution {
  department: string
  count: number
  percentage: number
}

export function HeadcountLineChart({ data }: { data: HeadcountMonth[] }) {
  const chartData = data.map((d) => ({
    name: `T${d.month}`,
    "Chính thức": d.active,
    "Thử việc": d.probation,
    "Tổng": d.total,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Tổng" stroke="#1E3A5F" strokeWidth={2} />
        <Line type="monotone" dataKey="Chính thức" stroke="#10b981" strokeWidth={1.5} />
        <Line type="monotone" dataKey="Thử việc" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DepartmentBarChart({ data }: { data: DeptDistribution[] }) {
  const chartData = data.map((d) => ({
    name: d.department.length > 12 ? d.department.slice(0, 12) + "…" : d.department,
    "Số NV": d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="Số NV" fill="#1E3A5F" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
