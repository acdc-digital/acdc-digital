// SOLOIST INSIGHTS LAYOUT
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/layout.tsx

"use client";

import React from "react";

interface SoloistLayoutProps {
  children: React.ReactNode;
}

export default function SoloistLayout({ children }: SoloistLayoutProps) {
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-neutral-100 dark:bg-[#2b2b2b]">
      {children}
    </div>
  );
}
