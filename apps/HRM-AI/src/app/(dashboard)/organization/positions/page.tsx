"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Pencil, Trash2, Briefcase } from "lucide-react"
import { usePositions, useCreatePosition, useUpdatePosition, useDeletePosition } from "@/hooks/use-positions"
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
import { Textarea } from "@/components/ui/textarea"

export default function PositionsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingPos, setEditingPos] = useState<{ id: string; name: string; code: string; level: number; description: string | null; isActive: boolean } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", code: "", level: 1, description: "", isActive: true })

  const { data: positions, isLoading } = usePositions()
  const createPosition = useCreatePosition()
  const updatePosition = useUpdatePosition()
  const deletePosition = useDeletePosition()

  const handleOpenCreate = () => {
    setEditingPos(null)
    setFormData({ name: "", code: "", level: 1, description: "", isActive: true })
    setIsOpen(true)
  }

  const handleOpenEdit = (pos: { id: string; name: string; code: string; level: number; description: string | null; isActive: boolean }) => {
    setEditingPos(pos)
    setFormData({
      name: pos.name,
      code: pos.code,
      level: pos.level,
      description: pos.description || "",
      isActive: pos.isActive,
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPos) {
      await updatePosition.mutateAsync({ id: editingPos.id, ...formData })
    } else {
      await createPosition.mutateAsync(formData)
    }
    setIsOpen(false)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deletePosition.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Chức danh" description="Quản lý các chức danh trong công ty">
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm chức danh
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !positions?.length ? (
        <EmptyState
          icon={Briefcase}
          title="Chưa có chức danh"
          description="Tạo chức danh đầu tiên cho công ty"
          action={
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm chức danh
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên chức danh</TableHead>
                <TableHead>Cấp bậc</TableHead>
                <TableHead>Số nhân viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos: { id: string; code: string; name: string; level: number; description: string | null; isActive: boolean; _count?: { employees: number } }) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-mono">{pos.code}</TableCell>
                  <TableCell className="font-medium">{pos.name}</TableCell>
                  <TableCell>{pos.level}</TableCell>
                  <TableCell>{pos._count?.employees || 0}</TableCell>
                  <TableCell>
                    <Badge variant={pos.isActive ? "success" : "secondary"}>
                      {pos.isActive ? "Hoạt động" : "Ngừng"}
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
                        <DropdownMenuItem onClick={() => handleOpenEdit(pos)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(pos.id)}
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
              {editingPos ? "Chỉnh sửa chức danh" : "Thêm chức danh mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã chức danh</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                placeholder="VD: GD, TP, NV"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên chức danh</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="VD: Giám đốc, Trưởng phòng"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Cấp bậc (1-20)</Label>
              <Input
                id="level"
                type="number"
                min={1}
                max={20}
                value={formData.level}
                onChange={(e) => setFormData((p) => ({ ...p, level: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả về chức danh..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createPosition.isPending || updatePosition.isPending}
              >
                {editingPos ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Xóa chức danh"
        description="Bạn có chắc chắn muốn xóa chức danh này?"
        confirmText="Xóa"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deletePosition.isPending}
      />
    </div>
  )
}
