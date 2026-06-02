import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Command Center',
  description: 'Trung tâm điều khiển real-time - Executive Dashboard',
}

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
