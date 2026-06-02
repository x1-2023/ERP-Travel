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
import { ArrowLeft, Plus, Pencil, X, Search } from "lucide-react"
import { SortableTableHead } from "@/components/ui/sortable-table-head"
import { useTableSort } from "@/hooks/use-table-sort"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  createdAt: string
  employee: { id: string; fullName: string; employeeCode: string } | null
}

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "HR_MANAGER", label: "HR Manager" },
  { value: "HR_STAFF", label: "HR Staff" },
  { value: "DEPT_MANAGER", label: "Dept Manager" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "ACCOUNTANT", label: "Accountant" },
]

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  HR_MANAGER: "bg-purple-100 text-purple-700",
  HR_STAFF: "bg-blue-100 text-blue-700",
  DEPT_MANAGER: "bg-amber-100 text-amber-700",
  EMPLOYEE: "bg-green-100 text-green-700",
  ACCOUNTANT: "bg-cyan-100 text-cyan-700",
}

export default function AdminUsersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [roleFilter, setRoleFilter] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState({ email: "", role: "EMPLOYEE", tempPassword: "", employeeId: "" })
  const [editForm, setEditForm] = useState({ role: "", isActive: true, newPassword: "" })
  const [error, setError] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (roleFilter) params.set("role", roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setShowCreate(false)
      setForm({ email: "", role: "EMPLOYEE", tempPassword: "", employeeId: "" })
      setError("")
    },
    onError: (err: Error) => setError(err.message),
  })

  const updateMut = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {}
      if (editForm.role) payload.role = editForm.role
      payload.isActive = editForm.isActive
      if (editForm.newPassword) payload.newPassword = editForm.newPassword
      const res = await fetch(`/api/admin/users/${editUser!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setEditUser(null)
      setError("")
    },
    onError: (err: Error) => setError(err.message),
  })

  function startEdit(user: User) {
    setEditUser(user)
    setEditForm({ role: user.role, isActive: user.isActive, newPassword: "" })
    setError("")
  }

  const usersRaw: User[] = data?.data || []
  const { sortedData: users, sortColumn, sortOrder, onSort } = useTableSort(usersRaw)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quản Trị
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>Quản Lý Người Dùng</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm email, tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tất cả role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button style={{ backgroundColor: "#1E3A5F" }} onClick={() => { setShowCreate(true); setError("") }}>
          <Plus className="h-4 w-4 mr-1" />
          Tạo User
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Tạo Tài Khoản Mới</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreate(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mật khẩu tạm *</Label>
                <Input type="password" value={form.tempPassword} onChange={(e) => setForm({ ...form, tempPassword: e.target.value })} />
              </div>
              <div>
                <Label>Employee ID (nếu có)</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="Để trống nếu chưa liên kết" />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button style={{ backgroundColor: "#1E3A5F" }} disabled={createMut.isPending} onClick={() => createMut.mutate()}>
                {createMut.isPending ? "..." : "Tạo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editUser && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Chỉnh sửa: {editUser.email}</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditUser(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Role</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select value={editForm.isActive ? "true" : "false"} onValueChange={(v) => setEditForm({ ...editForm, isActive: v === "true" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reset mật khẩu</Label>
                <Input type="password" value={editForm.newPassword} onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })} placeholder="Để trống nếu không đổi" />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditUser(null)}>Hủy</Button>
              <Button style={{ backgroundColor: "#1E3A5F" }} disabled={updateMut.isPending} onClick={() => updateMut.mutate()}>
                {updateMut.isPending ? "..." : "Lưu"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Không có dữ liệu</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead column="email" label="Email" currentSort={sortColumn} currentOrder={sortOrder} onSort={onSort} />
                  <SortableTableHead column="name" label="Tên" currentSort={sortColumn} currentOrder={sortOrder} onSort={onSort} className="hidden sm:table-cell" />
                  <SortableTableHead column="role" label="Role" currentSort={sortColumn} currentOrder={sortOrder} onSort={onSort} />
                  <TableHead className="hidden md:table-cell">NV liên kết</TableHead>
                  <SortableTableHead column="isActive" label="TT" currentSort={sortColumn} currentOrder={sortOrder} onSort={onSort} />
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-sm">{user.email}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{user.name || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${ROLE_COLORS[user.role] || ""}`}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {user.employee ? `${user.employee.fullName} (${user.employee.employeeCode})` : "—"}
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Locked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(user)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
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
