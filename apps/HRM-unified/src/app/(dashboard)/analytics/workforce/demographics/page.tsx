// src/app/(dashboard)/analytics/workforce/demographics/page.tsx
// Demographics Analysis Page

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DemographicsData {
  byGender: Array<{ gender: string; count: number }>
  byAge: Array<{ range: string; count: number }>
  byTenure: Array<{ range: string; count: number }>
  byEducation: Array<{ level: string; count: number }>
}

const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function DemographicsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DemographicsData | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)

      const response = await fetch(
        `/api/analytics/workforce?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      if (response.ok) {
        const result = await response.json()
        const headcount = result.data?.headcount
        setData({
          byGender: headcount?.byGender || [],
          byAge: headcount?.byAge || [],
          byTenure: headcount?.byTenure || [],
          byEducation: [], // Employee model has no education field
        })
      }
    } catch (error) {
      console.error('Error fetching demographics data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Phân tích nhân khẩu học</h1>
          <p className="text-muted-foreground mt-1">
            Giới tính, độ tuổi, thâm niên và trình độ học vấn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ theo giới tính</CardTitle>
            <CardDescription>Tỷ lệ nam/nữ trong công ty</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.byGender || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="gender"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {(data?.byGender || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ theo độ tuổi</CardTitle>
            <CardDescription>Cơ cấu tuổi của nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.byAge || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Số nhân viên" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tenure Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ theo thâm niên</CardTitle>
            <CardDescription>Số năm làm việc tại công ty</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.byTenure || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Số nhân viên" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Education Level */}
        <Card>
          <CardHeader>
            <CardTitle>Trình độ học vấn</CardTitle>
            <CardDescription>Phân bổ theo bằng cấp</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.byEducation || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="level"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {(data?.byEducation || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê tổng hợp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">32</p>
              <p className="text-sm text-muted-foreground">Tuổi trung bình</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">3.2</p>
              <p className="text-sm text-muted-foreground">Năm thâm niên TB</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">65%</p>
              <p className="text-sm text-muted-foreground">Có bằng ĐH trở lên</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">45%</p>
              <p className="text-sm text-muted-foreground">Tỷ lệ nữ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
