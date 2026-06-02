'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { API_PERMISSIONS } from '@/types/api'

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: string
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [newKey, setNewKey] = useState('')

  const fetchKeys = () => {
    fetch('/api/admin/api-keys').then(r => r.json()).then(r => setKeys(r.data || []))
  }

  useEffect(() => { fetchKeys() }, [])

  const createKey = async () => {
    const res = await fetch('/api/admin/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, permissions: selectedPerms }),
    })
    const data = await res.json()
    if (data.data?.key) {
      setNewKey(data.data.key)
      setShowCreate(false)
      setName('')
      setSelectedPerms([])
      fetchKeys()
    }
  }

  const revokeKey = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn vô hiệu hóa API key này?')) return
    await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' })
    fetchKeys()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>Tạo API Key</Button>
      </div>

      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="font-semibold mb-2">API Key mới (chỉ hiển thị 1 lần):</p>
            <code className="block p-3 bg-white rounded border text-sm break-all">{newKey}</code>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => { navigator.clipboard.writeText(newKey); setNewKey('') }}>
              Copy & Đóng
            </Button>
          </CardContent>
        </Card>
      )}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Tạo API Key mới</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Tên API Key" value={name} onChange={e => setName(e.target.value)} />
            <div>
              <p className="text-sm font-medium mb-2">Quyền:</p>
              <div className="grid grid-cols-2 gap-2">
                {API_PERMISSIONS.map(perm => (
                  <label key={perm} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedPerms.includes(perm)} onChange={e => {
                      setSelectedPerms(e.target.checked ? [...selectedPerms, perm] : selectedPerms.filter(p => p !== perm))
                    }} />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={createKey} disabled={!name || selectedPerms.length === 0}>Tạo</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Danh sách API Keys</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {keys.map(key => (
              <div key={key.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{key.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {key.keyPrefix}••••••• | Tạo: {new Date(key.createdAt).toLocaleDateString('vi-VN')}
                    {key.lastUsedAt && ` | Dùng: ${new Date(key.lastUsedAt).toLocaleDateString('vi-VN')}`}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {(key.permissions as string[]).map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.isActive ? 'default' : 'destructive'}>{key.isActive ? 'Active' : 'Revoked'}</Badge>
                  {key.isActive && <Button variant="destructive" size="sm" onClick={() => revokeKey(key.id)}>Vô hiệu</Button>}
                </div>
              </div>
            ))}
            {keys.length === 0 && <p className="text-center text-muted-foreground py-4">Chưa có API Key nào</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
