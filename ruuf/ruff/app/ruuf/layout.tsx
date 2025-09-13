import type { Metadata } from "next";
import Link from "next/link";
import { Rubik } from 'next/font/google';

const rubik = Rubik({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "RUUF - acdc.digital",
  description: "RUUF page by acdc.digital",
};

export default function RuufLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`min-h-screen bg-white ${rubik.className}`}>
      <div className="h-8 border-b border-gray-200">
        <div className="px-12">
          <div className="flex justify-between items-center py-1">
            <div className="text-lg font-semibold text-gray-900">
              RUUF
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </div>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 acdc.digital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
