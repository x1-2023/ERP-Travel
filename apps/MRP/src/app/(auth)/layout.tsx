import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | VietERP MRP',
    default: 'Sign In | VietERP MRP',
  },
  description: 'Sign in to VietERP MRP manufacturing resource planning system - Đăng nhập vào hệ thống quản lý sản xuất VietERP MRP',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}
