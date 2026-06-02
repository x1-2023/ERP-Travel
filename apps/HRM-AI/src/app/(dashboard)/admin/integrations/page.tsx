'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const integrations = [
  { name: 'Email', description: 'Cấu hình SMTP và quản lý mẫu email', href: '/admin/integrations/email' },
  { name: 'API Keys', description: 'Quản lý API keys cho tích hợp bên ngoài', href: '/admin/integrations/api-keys' },
  { name: 'Webhooks', description: 'Cấu hình webhook events', href: '/admin/integrations/webhooks' },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tích hợp</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader><CardTitle className="text-lg">{item.name}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{item.description}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
