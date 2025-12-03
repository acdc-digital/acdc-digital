// CANVAS PAGE
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/page.tsx

"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import TldrawWrapper with SSR disabled
const TldrawWrapper = dynamic(
  () => import("./_components/TldrawWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-[#2b2b2b]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ),
  }
);

export default function CanvasPage() {
  return (
    <div className="h-full w-full">
      <TldrawWrapper />
    </div>
  );
}
