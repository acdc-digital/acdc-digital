import type { Metadata } from "next";
import { Geist, Geist_Mono, Parkinsans, Lato } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/providers/ConvexClientProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const specialGothic = localFont({
  src: "../public/fonts/Special_Gothic/SpecialGothic-VariableFont_wdth,wght.ttf",
  variable: "--font-special-gothic",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Soloist. | Take control of tomorrow, today.",
  description: "Track your mood patterns and get AI-powered insights to improve your emotional well-being. Simple, private, and effective mood tracking for everyone.",
  icons: {
    icon: [
      { url: "/acdc-soloisticon_v2.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: "/acdc-soloisticon_v2.svg",
    apple: { url: "/acdc-soloisticon_v2.svg", sizes: "180x180" },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${parkinsans.variable} ${lato.variable} ${specialGothic.variable} antialiased`}
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
