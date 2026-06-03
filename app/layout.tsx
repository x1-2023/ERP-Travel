import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pronunciation Coach",
  description: "English pronunciation practice with IPA, Vietnamese meaning, history, and microphone comparison.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
