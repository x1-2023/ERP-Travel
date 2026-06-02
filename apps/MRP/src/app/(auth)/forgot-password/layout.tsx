import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your VietERP MRP account password - Dat lai mat khau tai khoan VietERP MRP',
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
