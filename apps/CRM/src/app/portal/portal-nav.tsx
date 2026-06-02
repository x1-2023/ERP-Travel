'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/portal', label: 'Tổng quan' },
  { href: '/portal/orders', label: 'Đơn hàng' },
  { href: '/portal/quotes', label: 'Báo giá' },
  { href: '/portal/documents', label: 'Tài liệu' },
  { href: '/portal/tickets', label: 'Hỗ trợ' },
]

export function PortalNav() {
  const pathname = usePathname()

  // Don't show nav on login/verify pages
  if (pathname?.startsWith('/portal/login') || pathname?.startsWith('/portal/verify')) {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      <nav className="hidden sm:flex items-center gap-1 mr-3">
        {navLinks.map((link) => {
          const isActive = link.href === '/portal'
            ? pathname === '/portal'
            : pathname?.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isActive
                  ? 'text-emerald-600 bg-emerald-50 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
      <Link
        href="/portal/profile"
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          pathname === '/portal/profile'
            ? 'text-emerald-600 bg-emerald-50 font-medium'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        Tài khoản
      </Link>
    </div>
  )
}
