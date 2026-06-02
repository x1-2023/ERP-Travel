import type { Metadata } from 'next';
import { PortalLayoutClient } from './portal-layout-client';

export const metadata: Metadata = {
  title: {
    template: '%s | VietERP MRP',
    default: 'Cổng khách hàng',
  },
  description: 'Cổng thông tin khách hàng và nhà cung cấp VietERP MRP',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
