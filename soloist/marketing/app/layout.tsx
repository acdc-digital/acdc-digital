import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./providers";

export const metadata: Metadata = {
  title: "Marketing",
  description: "Marketing pages and content for Soloist",
  icons: {
    icon: [
      { url: "/soloicov2-marketing.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: "/soloicov2-marketing.svg",
    apple: { url: "/soloicov2-marketing.svg", sizes: "180x180" },
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
