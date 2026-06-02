"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Download, UserSearch } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { TemplateField } from "./field-definer"

interface GenerateFormProps {
  templateId: string
  templateName: string
  fields: TemplateField[]
}

interface EmployeeOption {
  id: string
  employeeCode: string
  fullName: string
  department: { name: string } | null
}

export function GenerateForm({ templateId, templateName, fields }: GenerateFormProps) {
  const { toast } = useToast()
  const [employeeId, setEmployeeId] = useState("")
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [generating, setGenerating] = useState(false)

  // Fetch employee list for picker
  const hasEmployeeAutoFill = fields.some((f) => f.autoFill?.startsWith("employee."))
  const { data: empData } = useQuery<{ data: EmployeeOption[] }>({
    queryKey: ["employees-picker"],
    queryFn: async () => {
      const res = await fetch("/api/employees?limit=200")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    enabled: hasEmployeeAutoFill,
  })
  const employees = empData?.data || []

  // When employee selected, fetch auto-fill values
  useEffect(() => {
    if (!employeeId) return
    fetch(`/api/templates/${templateId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, fieldValues: {}, dryRun: true }),
    })
    // We don't actually do a dry-run API - instead auto-fill client-side
    // by fetching employee data
    fetch(`/api/employees/${employeeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.data) return
        const emp = data.data
        const autoFilled: Record<string, string> = {}
        for (const field of fields) {
          if (field.autoFill && field.autoFill.startsWith("employee.")) {
            const key = field.autoFill.replace("employee.", "")
            const map: Record<string, string> = {
              fullName: emp.fullName || "",
              employeeCode: emp.employeeCode || "",
              position: emp.position?.name || "",
              department: emp.department?.name || "",
              startDate: emp.startDate ? new Date(emp.startDate).toLocaleDateString("vi-VN") : "",
              nationalId: emp.nationalId || "",
              phone: emp.phone || "",
              bankAccount: emp.bankAccount || "",
              bankBranch: emp.bankBranch || "",
              taxCode: emp.taxCode || "",
              currentAddress: emp.currentAddress || "",
              permanentAddress: emp.permanentAddress || "",
              companyEmail: emp.companyEmail || "",
              personalEmail: emp.personalEmail || "",
              school: emp.school || "",
              major: emp.major || "",
              gender: emp.gender === "MALE" ? "Nam" : emp.gender === "FEMALE" ? "Nữ" : "Khác",
              dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString("vi-VN") : "",
              baseSalary: emp.contracts?.[0]?.baseSalary
                ? new Intl.NumberFormat("vi-VN").format(Math.round(Number(emp.contracts[0].baseSalary))) + "đ"
                : "",
            }
            if (map[key]) autoFilled[field.key] = map[key]
          }
          if (field.autoFill && field.autoFill.startsWith("company.")) {
            const companyMap: Record<string, string> = {
              "company.name": "CÔNG TY CỔ PHẦN REAL-TIME ROBOTICS VIỆT NAM",
              "company.taxCode": "0314718578",
              "company.representative": "LƯƠNG VIỆT QUỐC",
              "company.address": "Số 40/10 Khổng Tử, Phường Tăng Nhơn Phú, TP.HCM",
            }
            if (companyMap[field.autoFill]) autoFilled[field.key] = companyMap[field.autoFill]
          }
          if (field.autoFill && field.autoFill.startsWith("meta.")) {
            const metaMap: Record<string, string> = {
              "meta.today": new Date().toLocaleDateString("vi-VN"),
              "meta.month": String(new Date().getMonth() + 1),
              "meta.year": String(new Date().getFullYear()),
            }
            if (metaMap[field.autoFill]) autoFilled[field.key] = metaMap[field.autoFill]
          }
        }
        setValues((prev) => ({ ...prev, ...autoFilled }))
      })
      .catch(() => {})
  }, [employeeId, templateId, fields])

  // Auto-fill meta fields on mount
  useEffect(() => {
    const metaFilled: Record<string, string> = {}
    for (const field of fields) {
      if (field.autoFill?.startsWith("meta.") || field.autoFill?.startsWith("company.")) {
        const metaMap: Record<string, string> = {
          "meta.today": new Date().toLocaleDateString("vi-VN"),
          "meta.month": String(new Date().getMonth() + 1),
          "meta.year": String(new Date().getFullYear()),
          "company.name": "CÔNG TY CỔ PHẦN REAL-TIME ROBOTICS VIỆT NAM",
          "company.taxCode": "0314718578",
          "company.representative": "LƯƠNG VIỆT QUỐC",
          "company.address": "Số 40/10 Khổng Tử, Phường Tăng Nhơn Phú, TP.HCM",
        }
        if (field.autoFill && metaMap[field.autoFill]) {
          metaFilled[field.key] = metaMap[field.autoFill]
        }
      }
    }
    if (Object.keys(metaFilled).length > 0) {
      setValues((prev) => ({ ...metaFilled, ...prev }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleGenerate() {
    // Validate required
    const newErrors: Record<string, boolean> = {}
    for (const field of fields) {
      if (field.required && !values[field.key]) {
        newErrors[field.key] = true
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    setErrors({})
    try {
      const res = await fetch(`/api/templates/${templateId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employeeId || undefined, fieldValues: values }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const cd = res.headers.get("Content-Disposition") || ""
      const match = cd.match(/filename="?([^"]+)"?/)
      a.download = match ? decodeURIComponent(match[1]) : `${templateName}.docx`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)

      toast({ title: "Tạo hồ sơ thành công" })
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Không thể tạo file",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Thông tin cần điền</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasEmployeeAutoFill && (
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <UserSearch className="h-4 w-4" /> Nhân viên liên quan
            </label>
            <Select value={employeeId || undefined} onValueChange={setEmployeeId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn nhân viên..." /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.employeeCode} — {e.fullName} {e.department ? `(${e.department.name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="border-t pt-3 space-y-3">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.autoFill && (
                  <span className="text-xs text-slate-400 ml-2">(auto)</span>
                )}
              </label>
              {field.type === "TEXTAREA" ? (
                <Textarea
                  className={`mt-1 ${errors[field.key] ? "border-red-500" : ""}`}
                  rows={3}
                  value={values[field.key] || ""}
                  onChange={(e) => {
                    setValues({ ...values, [field.key]: e.target.value })
                    setErrors({ ...errors, [field.key]: false })
                  }}
                  placeholder={field.hint}
                />
              ) : field.type === "DATE" ? (
                <Input
                  type="text"
                  className={`mt-1 ${errors[field.key] ? "border-red-500" : ""}`}
                  value={values[field.key] || ""}
                  onChange={(e) => {
                    setValues({ ...values, [field.key]: e.target.value })
                    setErrors({ ...errors, [field.key]: false })
                  }}
                  placeholder="dd/MM/yyyy"
                />
              ) : field.type === "NUMBER" ? (
                <Input
                  type="text"
                  className={`mt-1 ${errors[field.key] ? "border-red-500" : ""}`}
                  value={values[field.key] || ""}
                  onChange={(e) => {
                    setValues({ ...values, [field.key]: e.target.value })
                    setErrors({ ...errors, [field.key]: false })
                  }}
                  placeholder="0"
                />
              ) : field.type === "CHECKBOX" ? (
                <div className="mt-1">
                  <Select value={values[field.key] || undefined} onValueChange={(v) => setValues({ ...values, [field.key]: v })}>
                    <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Có">Có</SelectItem>
                      <SelectItem value="Không">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : field.type === "SELECT" && field.options ? (
                <Select
                  value={values[field.key] || undefined}
                  onValueChange={(v) => setValues({ ...values, [field.key]: v })}
                >
                  <SelectTrigger className={`mt-1 ${errors[field.key] ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Chọn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  className={`mt-1 ${errors[field.key] ? "border-red-500" : ""}`}
                  value={values[field.key] || ""}
                  onChange={(e) => {
                    setValues({ ...values, [field.key]: e.target.value })
                    setErrors({ ...errors, [field.key]: false })
                  }}
                  placeholder={field.hint}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            style={{ backgroundColor: "#1E3A5F" }}
            onClick={handleGenerate}
            disabled={generating}
          >
            <Download className="h-4 w-4 mr-2" />
            {generating ? "Đang tạo..." : "Tải Xuống .docx"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
