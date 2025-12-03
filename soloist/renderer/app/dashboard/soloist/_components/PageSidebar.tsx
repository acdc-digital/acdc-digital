// SOLOIST PAGE SIDEBAR
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/PageSidebar.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DateRangeSelector } from "./DateRangeSelector";
import { WeekGrid } from "./WeekGrid";

interface PageSidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function PageSidebar({ className, children }: PageSidebarProps) {
  return (
    <aside
      className={cn(
        "w-[20%] min-w-[330px] h-full flex-shrink-0",
        "border-r border-neutral-200 dark:border-neutral-700",
        "bg-neutral-50 dark:bg-neutral-800/50",
        "overflow-y-auto",
        className
      )}
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Date Range Selector */}
        <DateRangeSelector />
        
        {/* Week Grid - 7 day boxes in 2-2-2-1 layout */}
        <WeekGrid />
        
        {/* Additional sidebar content */}
        {children}
      </div>
    </aside>
  );
}

export default PageSidebar;
