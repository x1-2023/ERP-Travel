'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  keywords: string[]
  isPublished: boolean
  viewCount: number
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

const defaultCategories = [
  'Nghỉ phép',
  'Chấm công',
  'Tăng ca',
  'Bảo hiểm',
  'Lương thưởng',
  'Quy định chung',
]

export default function KnowledgeAdminPage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterPublished, setFilterPublished] = useState<string>('')

  // Dialog states
  const [showEditor, setShowEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(
    null
  )
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    keywords: '',
    isPublished: false,
  })

  const { toast } = useToast()

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterCategory) params.append('category', filterCategory)
      if (filterPublished) params.append('isPublished', filterPublished)

      const response = await fetch(`/api/knowledge?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.data)
      }
    } catch (error) {
      console.error('Fetch articles error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/knowledge/categories')
      if (response.ok) {
        const data = await response.json()
        if (data.data.length > 0) {
          setCategories(Array.from(new Set([...defaultCategories, ...data.data])))
        }
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  useEffect(() => {
    fetchArticles()
    fetchCategories()
  }, [search, filterCategory, filterPublished])

  const openEditor = (article?: KnowledgeArticle) => {
    if (article) {
      setEditingArticle(article)
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        keywords: article.keywords.join(', '),
        isPublished: article.isPublished,
      })
    } else {
      setEditingArticle(null)
      setFormData({
        title: '',
        content: '',
        category: '',
        keywords: '',
        isPublished: false,
      })
    }
    setShowEditor(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        keywords: formData.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        isPublished: formData.isPublished,
      }

      const url = editingArticle
        ? `/api/knowledge/${editingArticle.id}`
        : '/api/knowledge'
      const method = editingArticle ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: editingArticle ? 'Đã cập nhật' : 'Đã tạo',
          description: 'Bài viết đã được lưu thành công',
        })
        setShowEditor(false)
        fetchArticles()
      }
    } catch (error) {
      console.error('Save article error:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu bài viết',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/knowledge/${deleteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Đã xóa',
          description: 'Bài viết đã được xóa',
        })
        fetchArticles()
      }
    } catch (error) {
      console.error('Delete article error:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bài viết',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })

      if (response.ok) {
        fetchArticles()
      }
    } catch (error) {
      console.error('Toggle publish error:', error)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Knowledge Base</h1>
          <p className="text-muted-foreground">
            Quản lý các bài viết FAQ cho AI Chatbot
          </p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm bài viết
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPublished} onValueChange={setFilterPublished}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đã xuất bản</SelectItem>
                <SelectItem value="false">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Danh sách bài viết
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có bài viết nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lượt xem</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {article.content.slice(0, 100)}...
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{article.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          article.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {article.isPublished ? 'Xuất bản' : 'Nháp'}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.viewCount}</TableCell>
                    <TableCell>
                      {format(new Date(article.updatedAt), 'dd/MM/yyyy', {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            togglePublish(article.id, article.isPublished)
                          }
                          title={
                            article.isPublished
                              ? 'Ẩn bài viết'
                              : 'Xuất bản bài viết'
                          }
                        >
                          {article.isPublished ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditor(article)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, category: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nội dung</Label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Nhập nội dung bài viết"
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Từ khóa (cách nhau bởi dấu phẩy)</Label>
              <Input
                value={formData.keywords}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, keywords: e.target.value }))
                }
                placeholder="nghỉ phép, annual leave, phép năm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublished: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="isPublished">Xuất bản ngay</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.title || !formData.content}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu bài viết'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
