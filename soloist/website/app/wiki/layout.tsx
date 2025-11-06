import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation - Soloist Wiki",
  description: "Complete documentation of all Convex functions and APIs for Soloist application",
};

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Soloist.</span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a href="/wiki" className="text-foreground/60 hover:text-foreground">
                Documentation
              </a>
              <a href="/wiki/user-guide" className="text-foreground/60 hover:text-foreground">
                User Guide
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}
