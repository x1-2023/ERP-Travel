'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  HardHat,
  Warehouse,
  Users,
  FileText,
  ShoppingCart,
  Calculator,
  Settings,
  ChevronDown,
  Factory,
} from 'lucide-react';
import { useState } from 'react';

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: { label: string; href: string; icon: React.ElementType }[];
}

const navigation: NavGroup[] = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Master Data',
    icon: Package,
    items: [
      { label: 'Vật tư (Items)', href: '/items', icon: Package },
      { label: 'Nhóm vật tư', href: '/items/groups', icon: Layers },
      { label: 'Kho hàng', href: '/warehouses', icon: Warehouse },
    ],
  },
  {
    label: 'Sản xuất',
    icon: Factory,
    items: [
      { label: 'BOM', href: '/bom', icon: Layers },
      { label: 'Lệnh sản xuất', href: '/work-orders', icon: ClipboardList },
      { label: 'Phiếu công việc', href: '/job-cards', icon: HardHat },
    ],
  },
  {
    label: 'CRM & Sales',
    icon: Users,
    items: [
      { label: 'Khách hàng', href: '/customers', icon: Users },
      { label: 'Báo giá', href: '/quotations', icon: FileText },
      { label: 'Costing', href: '/costing', icon: Calculator },
    ],
  },
  {
    label: 'Mua hàng',
    icon: ShoppingCart,
    items: [
      { label: 'Yêu cầu MH', href: '/purchase-requests', icon: ShoppingCart },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(navigation.map((g) => [g.label, true]))
  );

  const toggle = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-steel-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-steel-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm">
          LP
        </div>
        <div>
          <div className="text-sm font-bold text-steel-900">LIPHOCO</div>
          <div className="text-[10px] text-steel-400">ERP Manufacturing</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((group) => (
          <div key={group.label}>
            <button
              onClick={() => toggle(group.label)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-wider text-steel-400 hover:text-steel-600"
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  openGroups[group.label] ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>

            {openGroups[group.label] && (
              <div className="mt-0.5 space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-medium'
                          : 'text-steel-600 hover:bg-steel-50 hover:text-steel-900'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-steel-200 px-4 py-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-steel-500 hover:bg-steel-50 hover:text-steel-700"
        >
          <Settings className="h-4 w-4" />
          Cài đặt
        </Link>
      </div>
    </aside>
  );
}
