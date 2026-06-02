'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Loader2, Settings, Plus, Trash2, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DelegationForm } from '@/components/workflow'
import { useToast } from '@/hooks/use-toast'

interface Delegation {
  id: string
  startDate: string
  endDate: string
  reason?: string | null
  isActive: boolean
  delegateTo: {
    id: string
    name: string
    email: string
  }
}

interface User {
  id: string
  name: string
  email: string
}

export default function ESSSettingsPage() {
  const { toast } = useToast()
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [delegationsRes, usersRes] = await Promise.all([
        fetch('/api/workflow/delegations'),
        fetch('/api/users?role=approver'),
      ])

      if (delegationsRes.ok) {
        const data = await delegationsRes.json()
        setDelegations(data.data || [])
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.data || [])
      }
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateDelegation = async (data: {
    delegateToId: string
    startDate: Date
    endDate: Date
    reason?: string
  }) => {
    try {
      const response = await fetch('/api/workflow/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegateToId: data.delegateToId,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          reason: data.reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create delegation')
      }

      toast({
        title: 'Thành công',
        description: 'Đã tạo ủy quyền mới',
      })

      fetchData()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo ủy quyền',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleDeleteDelegation = async (id: string) => {
    try {
      const response = await fetch(`/api/workflow/delegations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete delegation')
      }

      toast({
        title: 'Thành công',
        description: 'Đã xóa ủy quyền',
      })

      fetchData()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xóa ủy quyền',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Cài đặt</h1>
          <p className="text-muted-foreground">
            Quản lý ủy quyền và cấu hình cá nhân
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <div>
                <CardTitle>Ủy quyền phê duyệt</CardTitle>
                <CardDescription>
                  Ủy quyền cho người khác phê duyệt thay khi bạn vắng mặt
                </CardDescription>
              </div>
            </div>
            <DelegationForm
              users={users}
              onSubmit={handleCreateDelegation}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo ủy quyền
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {delegations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có ủy quyền nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người được ủy quyền</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegations.map((delegation) => (
                  <TableRow key={delegation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{delegation.delegateTo.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {delegation.delegateTo.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(delegation.startDate), 'dd/MM/yyyy', { locale: vi })}
                      {' - '}
                      {format(new Date(delegation.endDate), 'dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>{delegation.reason || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={delegation.isActive ? 'default' : 'secondary'}>
                        {delegation.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa ủy quyền?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc muốn xóa ủy quyền này? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDelegation(delegation.id)}
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
