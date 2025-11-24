import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./providers";

export const metadata: Metadata = {
  title: "Marketing",
  description: "Marketing pages and content for Soloist",
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
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
