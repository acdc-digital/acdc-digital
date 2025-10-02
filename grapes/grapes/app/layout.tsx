import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grapes",
  description: "Grapes - ACDC Digital Convex Project",
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
