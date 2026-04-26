import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PwaInit } from "@/components/PwaInit";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Grupup - Group Sports Training Sessions",
  description:
    "The only platform built for group sports training. Find and book group sessions in soccer, basketball, and more with elite coaches near you.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Grupup",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0F3154",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <head>
          <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
          <meta name="mobile-web-app-capable" content="yes" />
        </head>
        <body className="font-sans antialiased">
          {children}
          <PwaInit />
        </body>
      </html>
    </ClerkProvider>
  );
}
