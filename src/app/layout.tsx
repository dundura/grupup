import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Grupup - Book 1-on-1 Soccer Training",
  description:
    "Book elite private soccer trainers for 1-on-1 sessions. Vetted, rated, and ready to help your player level up. Available in Cary, Raleigh, Charlotte, and across NC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
