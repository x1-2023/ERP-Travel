import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | VietERP MRP',
    default: 'MRP Planning | VietERP MRP',
  },
  description: 'Material requirements planning, production scheduling, and procurement planning - Hoạch định nhu cầu vật tư, lập kế hoạch sản xuất và mua hàng',
};

export default function MrpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
