// DEMO LANDING PAGE
// Simple redirect to dashboard for demo mode

'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoLandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to dashboard
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-zinc-500">Loading demo...</p>
      </div>
    </div>
  );
}