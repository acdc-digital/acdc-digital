import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Rubik, DM_Sans } from 'next/font/google';

const rubik = Rubik({ 
  subsets: ['latin'],
  variable: '--font-rubik'
});

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans'
});

export const metadata: Metadata = {
  title: "Solov2",
  description: "Soloist. [redesign] | Take control of tomorrow, today.",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rubik.variable} ${dmSans.variable}`}>
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
