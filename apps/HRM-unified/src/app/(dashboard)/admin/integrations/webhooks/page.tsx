'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { WEBHOOK_EVENTS } from '@/types/webhook'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: string
  totalDeliveries: number
  successDeliveries: number
  failedDeliveries: number
  createdAt: string
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<string[]>([])

  const fetchWebhooks = () => {
    fetch('/api/admin/webhooks').then(r => r.json()).then(r => setWebhooks(r.data || []))
  }

  useEffect(() => { fetchWebhooks() }, [])

  const createWebhook = async () => {
    await fetch('/api/admin/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, events }),
    })
    setShowCreate(false)
    setName('')
    setUrl('')
    setEvents([])
    fetchWebhooks()
  }

  const testWebhook = async (id: string) => {
    const res = await fetch(`/api/admin/webhooks/${id}/test`, { method: 'POST' })
    const data = await res.json()
    alert(data.data?.success ? 'Test thành công!' : `Test thất bại: ${data.data?.error || 'Unknown'}`)
  }

  const deleteWebhook = async (id: string) => {
    if (!confirm('Xóa webhook này?')) return
    await fetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' })
    fetchWebhooks()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>Tạo Webhook</Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Tạo Webhook mới</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Tên webhook" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="URL (https://...)" value={url} onChange={e => setUrl(e.target.value)} />
            <div>
              <p className="text-sm font-medium mb-2">Events:</p>
              <div className="grid grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map(evt => (
                  <label key={evt} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={events.includes(evt)} onChange={e => {
                      setEvents(e.target.checked ? [...events, evt] : events.filter(ev => ev !== evt))
                    }} />
                    {evt}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={createWebhook} disabled={!name || !url || events.length === 0}>Tạo</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {webhooks.map(wh => (
          <Card key={wh.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{wh.name}</div>
                  <div className="text-sm text-muted-foreground">{wh.url}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(wh.events as string[]).map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Deliveries: {wh.successDeliveries}/{wh.totalDeliveries} thành công
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={wh.status === 'ACTIVE' ? 'default' : 'secondary'}>{wh.status}</Badge>
                  <Button variant="outline" size="sm" onClick={() => testWebhook(wh.id)}>Test</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteWebhook(wh.id)}>Xóa</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {webhooks.length === 0 && <p className="text-center text-muted-foreground py-4">Chưa có webhook nào</p>}
      </div>
    </div>
  )
}
