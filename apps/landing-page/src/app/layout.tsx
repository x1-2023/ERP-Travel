import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vierp.dev"),
  title: {
    default: "VietERP Unified Dashboard",
    template: "%s | VietERP",
  },
  description:
    "ERP back-office dashboard for TravelOps, AnVoyages, Accounting, HRM, CRM, ExcelAI, PM and runtime control.",
  keywords: [
    "ERP",
    "TravelOps",
    "AnVoyages",
    "Accounting",
    "HRM",
    "CRM",
    "ExcelAI",
    "project management",
    "travel company",
  ],
  authors: [{ name: "VietERP" }],
  creator: "VietERP",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-[#f6f7f9] font-sans antialiased">{children}</body>
    </html>
  );
}
