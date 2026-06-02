'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Send,
  Search,
  Users,
  UserPlus,
  X,
  Calendar,
  Loader2,
} from 'lucide-react'
import { FEEDBACK_TYPE } from '@/lib/performance/constants'

interface Employee {
  id: string
  fullName: string
  workEmail: string
  position?: { name: string }
  department?: { name: string }
}

interface SelectedProvider {
  id: string
  name: string
  email: string
  type: 'PEER' | 'MANAGER' | 'DIRECT_REPORT' | 'CROSS_FUNCTIONAL'
}

export default function RequestFeedbackPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [subjectId, setSubjectId] = useState('')
  const [subjectEmployee, setSubjectEmployee] = useState<Employee | null>(null)
  const [feedbackType, setFeedbackType] = useState<string>('PEER')
  const [dueDate, setDueDate] = useState('')
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([])

  // Employee search state
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Employee[]>([])

  // Load employees for selection
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await fetch('/api/employees?limit=100')
        if (res.ok) {
          const data = await res.json()
          setEmployees(data.data || data || [])
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false)
      }
    }
    loadEmployees()
  }, [])

  // Search employees
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    const term = searchTerm.toLowerCase()
    const results = employees.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(term) ||
        emp.workEmail.toLowerCase().includes(term)
    ).filter(
      (emp) => emp.id !== subjectId && !selectedProviders.some((p) => p.id === emp.id)
    ).slice(0, 10)

    setSearchResults(results)
  }, [searchTerm, employees, subjectId, selectedProviders])

  // Handle subject selection
  const handleSubjectSelect = (employeeId: string) => {
    setSubjectId(employeeId)
    const emp = employees.find((e) => e.id === employeeId)
    setSubjectEmployee(emp || null)
    // Clear providers when subject changes
    setSelectedProviders([])
  }

  // Add provider
  const addProvider = (employee: Employee) => {
    setSelectedProviders((prev) => [
      ...prev,
      {
        id: employee.id,
        name: employee.fullName,
        email: employee.workEmail,
        type: feedbackType as SelectedProvider['type'],
      },
    ])
    setSearchTerm('')
  }

  // Remove provider
  const removeProvider = (id: string) => {
    setSelectedProviders((prev) => prev.filter((p) => p.id !== id))
  }

  // Submit request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subjectId || selectedProviders.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/performance/feedback/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          feedbackType,
          dueDate: dueDate || undefined,
          providerIds: selectedProviders.map((p) => p.id),
        }),
      })

      if (res.ok) {
        router.push('/performance/feedback')
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center gap-4">
        <Link href="/performance/feedback">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-amber-400">Yêu cầu 360° Feedback</h1>
          <p className="text-sm text-zinc-500">Gửi yêu cầu feedback từ nhiều người</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Selection */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Nhân viên được đánh giá</CardTitle>
              <CardDescription className="text-zinc-500">
                Chọn nhân viên sẽ nhận feedback 360°
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={subjectId} onValueChange={handleSubjectSelect}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 max-h-[300px]">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <span>{emp.fullName}</span>
                        {emp.position && (
                          <span className="text-xs text-zinc-500">- {emp.position.name}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {subjectEmployee && (
                <div className="mt-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-200">{subjectEmployee.fullName}</p>
                      <p className="text-xs text-zinc-500">{subjectEmployee.workEmail}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Type */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Loại feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {Object.entries(FEEDBACK_TYPE).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label className="text-zinc-300">Hạn phản hồi</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Selection */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Người được yêu cầu feedback</CardTitle>
              <CardDescription className="text-zinc-500">
                Tìm và thêm người sẽ cung cấp feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 pl-10"
                  disabled={!subjectId}
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-zinc-700 rounded-lg max-h-[200px] overflow-y-auto">
                  {searchResults.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800 last:border-b-0"
                      onClick={() => addProvider(emp)}
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{emp.fullName}</p>
                        <p className="text-xs text-zinc-500">
                          {emp.position?.name || 'N/A'} - {emp.department?.name || 'N/A'}
                        </p>
                      </div>
                      <UserPlus className="h-4 w-4 text-amber-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Providers */}
              {selectedProviders.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Đã chọn ({selectedProviders.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProviders.map((provider) => (
                      <Badge
                        key={provider.id}
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-200 flex items-center gap-1 pr-1"
                      >
                        {provider.name}
                        <button
                          type="button"
                          onClick={() => removeProvider(provider.id)}
                          className="ml-1 p-0.5 rounded hover:bg-zinc-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 sticky top-6">
            <CardHeader>
              <CardTitle className="text-zinc-100 text-lg">Tóm tắt yêu cầu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Nhân viên:</span>
                  <span className="text-zinc-200">{subjectEmployee?.fullName || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Loại:</span>
                  <span className="text-zinc-200">
                    {FEEDBACK_TYPE[feedbackType as keyof typeof FEEDBACK_TYPE]?.label || feedbackType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Hạn:</span>
                  <span className="text-zinc-200">
                    {dueDate ? new Date(dueDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Số người:</span>
                  <span className="text-amber-400 font-medium">{selectedProviders.length}</span>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !subjectId || selectedProviders.length === 0}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Gửi yêu cầu ({selectedProviders.length})
                </Button>
              </div>

              {selectedProviders.length === 0 && subjectId && (
                <p className="text-xs text-zinc-500 text-center">
                  Thêm ít nhất 1 người để gửi yêu cầu
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
