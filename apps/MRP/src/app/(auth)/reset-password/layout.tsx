import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Create a new password for your VietERP MRP account - Tao mat khau moi cho tai khoan VietERP MRP',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
