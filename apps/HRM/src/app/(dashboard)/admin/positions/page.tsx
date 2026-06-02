"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Pencil, Trash2, X, Search } from "lucide-react"
import { SortableTableHead } from "@/components/ui/sortable-table-head"
import { useTableSort } from "@/hooks/use-table-sort"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter } from "next/navigation"

interface Position {
  id: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  department: { id: string; name: string } | null
  _count: { employees: number }
}

interface DeptOption {
  id: string
  name: string
  code: string
}

export default function AdminPositionsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [deptFilter, setDeptFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", code: "", departmentId: "", description: "" })
  const [error, setError] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-positions", debouncedSearch, deptFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (deptFilter) params.set("departmentId", deptFilter)
      const res = await fetch(`/api/admin/positions?${params}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const { data: deptData } = useQuery({
    queryKey: ["admin-departments-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/departments")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const saveMut = useMutation({
    mutationFn: async () => {
      const url = editId ? `/api/admin/positions/${editId}` : "/api/admin/positions"
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-positions"] })
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/positions/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-positions"] }),
    onError: (err: Error) => alert(err.message),
  })

  function resetForm() {
    setShowForm(false)
    setEditId(null)
    setForm({ name: "", code: "", departmentId: "", description: "" })
    setError("")
  }

  function startEdit(pos: Position) {
    setEditId(pos.id)
    setForm({
      name: pos.name,
      code: pos.code,
      departmentId: pos.department?.id || "",
      description: pos.description || "",
    })
    setShowForm(true)
    setError("")
  }

  const posRaw: Position[] = data?.data || []
  const { sortedData: positions, sortColumn, sortOrder, onSort } = useTableSort(posRaw)
  const departments: DeptOption[] = deptData?.data?.map((d: { id: string; name: string; code: string }) => ({
    id: d.id, name: d.name, code: d.code,
  })) || []

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quản Trị
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Chức Vụ</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm chức vụ..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Tất cả phòng ban" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button style={{ backgroundColor: "#1E3A5F" }} onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{editId ? "Cập Nhật Chức Vụ" : "Thêm Chức Vụ"}</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tên chức vụ *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Mã chức vụ *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={!!editId} />
              </div>
              <div>
                <Label>Phòng ban</Label>
                <Select value={form.departmentId || "none"} onValueChange={(v) => setForm({ ...form, departmentId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không thuộc phòng nào</SelectItem>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>Hủy</Button>
              <Button style={{ backgroundColor: "#1E3A5F" }} disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>
                {saveMut.isPending ? "..." : "Lưu"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
          ) : positions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Không có dữ liệu</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <SortableTableHead column="name" label="Tên" currentSort={sortColumn} currentOrder={sortOrder} onSort={onSort} />
                  <TableHead className="hidden sm:table-cell">Phòng ban</TableHead>
                  <TableHead className="text-center">NV</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">{pos.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{pos.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{pos.department?.name || "—"}</TableCell>
                    <TableCell className="text-center">{pos._count.employees}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(pos)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          disabled={pos._count.employees > 0}
                          onClick={() => {
                            if (confirm(`Xóa chức vụ ${pos.name}?`)) deleteMut.mutate(pos.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
