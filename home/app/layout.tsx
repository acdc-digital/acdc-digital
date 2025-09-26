import type { Metadata } from "next";
import { Rubik } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeAwareLogo } from "@/components/theme-aware-logo";
import "./globals.css";

const rubik = Rubik({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Home - acdc.digital",
  description: "ACDC digital's Home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background text-foreground ${rubik.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
          <div className="h-9 border-b border-border">
            <div className="px-12 py-0.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 space-y-0">
                  <ThemeAwareLogo />
                  <div className="text-lg font-semibold text-foreground">
                    ACDC Digital
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-sm text-muted-foreground">
                © 2025 acdc.digital. All rights reserved.
              </p>
            </div>
          </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
