// DEMO LAYOUT
// Browser-only demo version - no authentication or database

"use client";

import { useEffect } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initializeDemoStores } from "@/stores/initDemoStores";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Remove metadata export (must be in Server Component, not Client Component)
// export const metadata: Metadata = {
//   title: "Soloist. Demo | Try it out - no signup required",
//   description: "Interactive demo of Soloist Pro - browser-based, no account needed",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize demo stores on mount
  useEffect(() => {
    initializeDemoStores();
  }, []);

  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}