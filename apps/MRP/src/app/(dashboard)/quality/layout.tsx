import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | VietERP MRP',
    default: 'Quality Management | VietERP MRP',
  },
  description: 'Quality inspections, NCR, CAPA, and lot traceability management - Kiểm tra chất lượng, NCR, CAPA và truy xuất nguồn gốc',
};

export default function QualityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
