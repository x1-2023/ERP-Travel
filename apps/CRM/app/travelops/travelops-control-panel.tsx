'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Calculator,
  FileSpreadsheet,
  Plane,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { TravelDirectChannelControl } from '@vierp/dashboard/components'

const moduleGroups = [
  {
    label: 'Booking Channel',
    items: [
      ['AnVoyages storefront', 'Direct price and inventory apply path is mounted'],
      ['Seasonal pricing', 'Option/property rates plus rule payloads'],
      ['Inventory stop-sell', 'Daily total units and closed dates'],
    ],
  },
  {
    label: 'Back Office',
    items: [
      ['Accounting', 'Booking payments, supplier payable, profit snapshots'],
      ['HRM', 'Sales owner, operator, guide, driver assignment refs'],
      ['PM', 'Tour departure execution, incidents, internal task refs'],
    ],
  },
  {
    label: 'Automation',
    items: [
      ['ExcelAI', 'Import/export and reconciliation surface'],
      ['CRM', 'Lead/customer context and operator authorization'],
      ['Audit', 'Actor ref is attached to every direct apply command'],
    ],
  },
]

const statusItems = [
  { label: 'TravelOps API', value: '/api/travelops/anvoyages/direct-control', icon: ShieldCheck },
  { label: 'CRM Health', value: '/api/health', icon: BarChart3 },
  { label: 'AnVoyages Channel', value: 'Service token protected', icon: Plane },
]

export function TravelOpsControlPanel() {
  const [controlToken, setControlToken] = useState('')

  const requestHeaders = useMemo(() => {
    const trimmed = controlToken.trim()
    return trimmed ? { 'x-erp-control-token': trimmed } : undefined
  }, [controlToken])

  return (
    <main className="min-h-screen bg-[var(--crm-bg-page)] text-[var(--crm-text-primary)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[var(--crm-border-subtle)] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <BriefcaseBusiness size={14} />
              <span>Travel Back Office</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-[var(--crm-text-primary)]">
              VietERP TravelOps
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-[var(--crm-text-secondary)]">
              Điều hành giá phòng, tồn phòng, booking channel, kế toán tour, nhân sự vận hành và dữ liệu ExcelAI cho công ty du lịch.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
            {statusItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-lg border border-[var(--crm-border-subtle)] bg-white px-3 py-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--crm-text-muted)]">
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </div>
                  <div className="mt-1 truncate text-xs font-semibold text-[var(--crm-text-primary)]">{item.value}</div>
                </div>
              )
            })}
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-[var(--crm-border-subtle)] bg-white p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold">Direct AnVoyages Control</h2>
                  <p className="text-sm text-[var(--crm-text-secondary)]">
                    Dùng CRM session hoặc nhập control token để test trực tiếp trên host.
                  </p>
                </div>
                <label className="block min-w-0 sm:w-80">
                  <span className="text-xs font-medium text-[var(--crm-text-muted)]">Control token</span>
                  <input
                    type="password"
                    value={controlToken}
                    onChange={(event) => setControlToken(event.target.value)}
                    placeholder="x-erp-control-token"
                    className="mt-1 h-9 w-full rounded-md border border-[var(--crm-border)] px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
              <TravelDirectChannelControl
                tenantId="travel-company"
                channelCode="anvoyages"
                actorRef="erp-dashboard"
                requestHeaders={requestHeaders}
                className="border-[var(--crm-border-subtle)] shadow-none"
              />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <ModuleGroup
              title="Core Modules"
              icon={Building2}
              items={['Booking', 'Tour Operations', 'Supplier', 'Inventory', 'Documents']}
            />
            <ModuleGroup title="Finance" icon={Calculator} items={['Accounting', 'Payables', 'Receivables', 'Profit']} />
            <ModuleGroup title="People" icon={Users} items={['HRM', 'Guide roster', 'Sales owner', 'Operator']} />
            <ModuleGroup title="Data & AI" icon={FileSpreadsheet} items={['ExcelAI', 'Imports', 'Exports', 'Reports']} />
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {moduleGroups.map((group) => (
            <div key={group.label} className="rounded-lg border border-[var(--crm-border-subtle)] bg-white p-4">
              <h2 className="text-sm font-semibold text-[var(--crm-text-primary)]">{group.label}</h2>
              <div className="mt-3 space-y-3">
                {group.items.map(([label, value]) => (
                  <div key={label} className="border-t border-[var(--crm-border-subtle)] pt-3 first:border-t-0 first:pt-0">
                    <div className="text-sm font-medium text-[var(--crm-text-primary)]">{label}</div>
                    <div className="mt-0.5 text-xs leading-5 text-[var(--crm-text-secondary)]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}

function ModuleGroup({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: LucideIcon
  items: string[]
}) {
  return (
    <div className="rounded-lg border border-[var(--crm-border-subtle)] bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--crm-text-primary)]">
        <Icon size={16} />
        <span>{title}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-md border border-[var(--crm-border-subtle)] bg-[var(--crm-bg-subtle)] px-2 py-1 text-xs text-[var(--crm-text-secondary)]">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
