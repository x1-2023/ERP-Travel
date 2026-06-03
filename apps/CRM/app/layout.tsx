import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../src/app/globals.css'

export const metadata: Metadata = {
  title: 'VietERP TravelOps',
  description: 'Back-office dashboard for travel operations',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
