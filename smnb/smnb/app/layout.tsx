// ROOT LAYOUT
// /Users/matthewsimon/Projects/SMNB/smnb/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville, Work_Sans, Playfair_Display, Crimson_Text, Inter } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from '@clerk/nextjs';
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TokenCountingProvider } from "@/components/providers/TokenCountingProvider";
import { WhistleblowerInit } from "@/components/WhistleblowerInit";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const newsreader = localFont({
  src: "../../../.fonts/Newsreader/Newsreader-VariableFont_opsz,wght.ttf",
  variable: "--font-newsreader",
  weight: "200 800",
});

// Newsletter fonts
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SMNB - Story Threading System",
  description: "Intelligent content curation with story threading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} ${workSans.variable} ${newsreader.variable} ${playfairDisplay.variable} ${crimsonText.variable} ${inter.variable} antialiased`}
      >
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <TokenCountingProvider>
                <WhistleblowerInit />
                {children}
              </TokenCountingProvider>
            </ConvexClientProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
