import type { Metadata } from 'next';
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: 'Dashboard | VietERP MRP',
  description: 'VietERP MRP manufacturing dashboard overview - Tổng quan bảng điều khiển sản xuất VietERP MRP',
};

// Redirect to main dashboard
export default function DashboardRedirect() {
  redirect("/home");
}
