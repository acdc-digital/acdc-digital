import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stdio",
  description: "stdio package - part of ACDC Digital workspace",
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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
