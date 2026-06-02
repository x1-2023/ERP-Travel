"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Pencil, Trash2, MapPin } from "lucide-react"
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from "@/hooks/use-branches"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function BranchesPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<{ id: string; name: string; code: string; address: string | null; phone: string | null; isHeadquarters: boolean; isActive: boolean } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", code: "", address: "", phone: "", isHeadquarters: false, isActive: true })

  const { data: branches, isLoading } = useBranches()
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch()
  const deleteBranch = useDeleteBranch()

  const handleOpenCreate = () => {
    setEditingBranch(null)
    setFormData({ name: "", code: "", address: "", phone: "", isHeadquarters: false, isActive: true })
    setIsOpen(true)
  }

  const handleOpenEdit = (branch: { id: string; name: string; code: string; address: string | null; phone: string | null; isHeadquarters: boolean; isActive: boolean }) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || "",
      phone: branch.phone || "",
      isHeadquarters: branch.isHeadquarters,
      isActive: branch.isActive,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBranch) {
      await updateBranch.mutateAsync({ id: editingBranch.id, ...formData })
    } else {
      await createBranch.mutateAsync(formData)
    }
    setIsOpen(false)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteBranch.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Chi nhánh" description="Quản lý các chi nhánh, văn phòng">
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm chi nhánh
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !branches?.length ? (
        <EmptyState
          icon={MapPin}
          title="Chưa có chi nhánh"
          description="Tạo chi nhánh đầu tiên"
          action={
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm chi nhánh
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên chi nhánh</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Số nhân viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch: { id: string; code: string; name: string; address: string | null; phone: string | null; isHeadquarters: boolean; isActive: boolean; _count?: { employees: number } }) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-mono">{branch.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{branch.name}</span>
                      {branch.isHeadquarters && (
                        <Badge variant="secondary">Trụ sở chính</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {branch.address || "-"}
                  </TableCell>
                  <TableCell>{branch._count?.employees || 0}</TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? "success" : "secondary"}>
                      {branch.isActive ? "Hoạt động" : "Ngừng"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(branch)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(branch.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã chi nhánh</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                placeholder="VD: HQ, HN, DN"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên chi nhánh</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Trụ sở chính, Chi nhánh Hà Nội"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="028 1234 5678"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isHeadquarters"
                checked={formData.isHeadquarters}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, isHeadquarters: checked }))}
              />
              <Label htmlFor="isHeadquarters">Là trụ sở chính</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createBranch.isPending || updateBranch.isPending}
              >
                {editingBranch ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Xóa chi nhánh"
        description="Bạn có chắc chắn muốn xóa chi nhánh này?"
        confirmText="Xóa"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteBranch.isPending}
      />
    </div>
  )
}
