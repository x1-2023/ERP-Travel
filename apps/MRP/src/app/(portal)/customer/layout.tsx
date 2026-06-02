import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | VietERP MRP',
    default: 'Customer Portal | VietERP MRP',
  },
  description: 'Customer portal dashboard - Overview of orders, deliveries, invoices, and support - Cổng khách hàng VietERP MRP',
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
