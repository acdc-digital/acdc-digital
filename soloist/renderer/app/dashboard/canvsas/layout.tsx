// CANVAS LAYOUT
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/layout.tsx

"use client";

import React from "react";

interface CanvasLayoutProps {
  children: React.ReactNode;
}

export default function CanvasLayout({ children }: CanvasLayoutProps) {
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-neutral-100 dark:bg-[#2b2b2b]">
      {children}
    </div>
  );
}
