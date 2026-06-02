"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { AUTO_FILL_OPTIONS } from "@/lib/config/template-autofill"

export interface TemplateField {
  key: string
  label: string
  type: string
  required: boolean
  defaultValue?: string
  options?: string[]
  autoFill?: string
  hint?: string
}

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Số" },
  { value: "DATE", label: "Ngày" },
  { value: "SELECT", label: "Chọn" },
  { value: "TEXTAREA", label: "Văn bản dài" },
  { value: "CHECKBOX", label: "Có/Không" },
]

interface FieldDefinerProps {
  fields: TemplateField[]
  onChange: (fields: TemplateField[]) => void
}

export function FieldDefiner({ fields, onChange }: FieldDefinerProps) {
  function updateField(index: number, key: keyof TemplateField, value: unknown) {
    const updated = [...fields]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(updated[index] as any)[key] = value
    onChange(updated)
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index))
  }

  function addField() {
    onChange([
      ...fields,
      { key: "", label: "", type: "TEXT", required: false },
    ])
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-2 px-2">Placeholder</th>
              <th className="text-left py-2 px-2">Label hiển thị</th>
              <th className="text-left py-2 px-2">Loại</th>
              <th className="text-left py-2 px-2">Auto-fill</th>
              <th className="text-center py-2 px-2">Bắt buộc</th>
              <th className="py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 px-2">
                  <Input
                    value={field.key}
                    onChange={(e) => updateField(i, "key", e.target.value)}
                    placeholder="ten_nhan_vien"
                    className="h-8 text-xs font-mono"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(i, "label", e.target.value)}
                    placeholder="Họ và tên"
                    className="h-8 text-xs"
                  />
                </td>
                <td className="py-2 px-2">
                  <Select value={field.type} onValueChange={(v) => updateField(i, "type", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-2 px-2">
                  <Select value={field.autoFill || "__none__"} onValueChange={(v) => updateField(i, "autoFill", v === "__none__" ? undefined : v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUTO_FILL_OPTIONS.map((o) => (
                        <SelectItem key={o.value || "__none__"} value={o.value || "__none__"}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(i, "required", e.target.checked)}
                  />
                </td>
                <td className="py-2 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(i)}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={addField}>
        + Thêm field
      </Button>
    </div>
  )
}
