'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Shield, Eye, UserCheck } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslation } from '@/i18n'

// ── Mock team data ──────────────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    id: '1',
    name: 'Nguyễn Văn Admin',
    email: 'admin@rtr.vn',
    role: 'ADMIN',
    joinedAt: '2024-01-15',
    avatarInitial: 'N',
  },
  {
    id: '2',
    name: 'Trần Thị Manager',
    email: 'manager@rtr.vn',
    role: 'MANAGER',
    joinedAt: '2024-03-10',
    avatarInitial: 'T',
  },
  {
    id: '3',
    name: 'Lê Văn Sales',
    email: 'sales@rtr.vn',
    role: 'MEMBER',
    joinedAt: '2024-05-22',
    avatarInitial: 'L',
  },
  {
    id: '4',
    name: 'Phạm Thị Viewer',
    email: 'viewer@rtr.vn',
    role: 'VIEWER',
    joinedAt: '2024-08-01',
    avatarInitial: 'P',
  },
]

const ROLE_CONFIG: Record<string, { labelKey: string; color: string; icon: React.ElementType }> = {
  ADMIN: { labelKey: 'team.admin', color: '#EF4444', icon: Shield },
  MANAGER: { labelKey: 'team.manager', color: '#F59E0B', icon: UserCheck },
  MEMBER: { labelKey: 'team.member', color: '#3B82F6', icon: Users },
  VIEWER: { labelKey: 'team.viewer', color: '#6B7280', icon: Eye },
}

export default function TeamSettingsPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  return (
    <PageShell
      title={t('team.title')}
      description={t('team.subtitle')}
      actions={
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('common.back')}
        </Button>
      }
    >
      <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--crm-border)] hover:bg-transparent">
              <TableHead className="text-[var(--crm-text-secondary)]">Thành viên</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)]">{t('common.email')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)]">{t('team.role')}</TableHead>
              <TableHead className="text-[var(--crm-text-secondary)]">{t('team.joinDate')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TEAM_MEMBERS.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.MEMBER
              return (
                <TableRow key={member.id} className="border-[var(--crm-border)]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--crm-bg-hover)] flex items-center justify-center text-xs text-[var(--crm-text-secondary)] font-medium border border-[var(--crm-border)]">
                        {member.avatarInitial}
                      </div>
                      <span className="text-sm text-[var(--crm-text-primary)] font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--crm-text-secondary)] text-sm">{member.email}</TableCell>
                  <TableCell>
                    <Badge
                      className="border-0 text-[10px] px-1.5 py-0"
                      style={{ backgroundColor: `${roleConfig.color}20`, color: roleConfig.color }}
                    >
                      {t(roleConfig.labelKey)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--crm-text-muted)] text-sm">
                    {formatDate(member.joinedAt)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Role legend */}
      <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] p-3">
        <h3 className="text-sm font-medium text-[var(--crm-text-primary)] mb-3">{t('team.roleDescription')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(ROLE_CONFIG).map(([key, config]) => {
            const Icon = config.icon
            return (
              <div key={key} className="flex items-start gap-3 p-3 rounded-md bg-[var(--glass-bg)] border border-[var(--crm-border-subtle)]">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--crm-text-primary)]">{t(config.labelKey)}</p>
                  <p className="text-xs text-[var(--crm-text-muted)] mt-0.5">
                    {key === 'ADMIN' && 'Toàn quyền quản trị hệ thống'}
                    {key === 'MANAGER' && 'Quản lý thương vụ, báo cáo, phân công'}
                    {key === 'MEMBER' && 'Tạo và quản lý thương vụ, liên hệ, hoạt động'}
                    {key === 'VIEWER' && 'Chỉ xem thông tin, không chỉnh sửa'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </PageShell>
  )
}
