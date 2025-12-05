// CANVAS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/page.tsx

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CanvasHeader } from "./_components/CanvasHeader";

// Dynamically import TldrawWrapper with SSR disabled
const TldrawWrapper = dynamic(
  () => import("./_components/TldrawWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-500/20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ),
  }
);

export default function CanvasPage() {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <CanvasHeader className="px-4 pt-4 pb-0 shrink-0" />
      
      {/* Canvas with left/right margins */}
      <div className="flex-1 px-4 pt-4 pb-4 min-h-0">
        <div className="h-full w-full rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-600">
          <TldrawWrapper />
        </div>
      </div>
    </div>
  );
}
