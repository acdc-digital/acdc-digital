// SOLOIST PAGE SIDEBAR
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/PageSidebar.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DateRangeSelector } from "./DateRangeSelector";
import DailyInsights from "./DailyInsights";
import KeyInsights from "./KeyInsights";

interface PageSidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function PageSidebar({ className, children }: PageSidebarProps) {
  return (
    <aside
      className={cn(
        "w-[25%] min-w-[320px] max-w-[450px] h-full flex-shrink-0 min-h-0",
        "border-r border-neutral-700",
        "bg-[#2b2b2b]",
        "flex flex-col gap-4 overflow-y-auto",
        className
      )}
    >
      {/* Date Range Selector */}
      <div className="p-4 pb-0 flex-shrink-0">
        <DateRangeSelector />
      </div>
      
      {/* Daily Insights */}
      <div className="flex-shrink-0 px-4">
        <DailyInsights />
      </div>
      
      {/* Key Insights - takes remaining space */}
      <KeyInsights />
      
      {/* Additional sidebar content */}
      {children}
    </aside>
  );
}

export default PageSidebar;
