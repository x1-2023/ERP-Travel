import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LIPHOCO ERP — Linh Phong Mechanical',
  description: 'Hệ thống quản lý sản xuất cơ khí LIPHOCO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
