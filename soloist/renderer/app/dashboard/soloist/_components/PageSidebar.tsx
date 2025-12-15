// SOLOIST PAGE SIDEBAR
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/PageSidebar.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DateRangeSelector } from "./DateRangeSelector";
import DailyInsights from "./DailyInsights";
import KeyInsights from "./KeyInsights";
import { AlertCircle, X } from "lucide-react";

interface PageSidebarProps {
  className?: string;
  children?: React.ReactNode;
  onGenerateForecast?: () => Promise<void>;
  error?: string | null;
  onDismissError?: () => void;
}

export function PageSidebar({ className, children, onGenerateForecast, error, onDismissError }: PageSidebarProps) {
  return (
    <aside
      className={cn(
        "w-[27%] min-w-[320px] max-w-[450px] h-full flex-shrink-0 min-h-0",
        "border-r border-neutral-700",
        "bg-[#2b2b2b]",
        "flex flex-col gap-4 overflow-y-auto",
        className
      )}
    >
      {/* Date Range Selector */}
      <div className="p-4 pb-0 flex-shrink-0">
        <DateRangeSelector onGenerateForecast={onGenerateForecast} error={error} />
      </div>
      
      {/* Daily Insights */}
      <div className="flex-shrink-0 px-4">
        <DailyInsights />
      </div>
      
      {/* Key Insights - takes remaining space */}
      <KeyInsights />
      
      {/* Error Display */}
      {error && (
        <div className="px-4 pb-4 mt-auto">
          <div className="flex items-start gap-2 p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg relative">
            {onDismissError && (
              <button
                onClick={onDismissError}
                className="absolute top-2 right-2 p-0.5 rounded hover:bg-rose-800/50 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-3.5 w-3.5 text-rose-400" />
              </button>
            )}
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 pr-4">
              <p className="text-xs font-medium text-rose-300">Generation Error</p>
              <p className="text-xs text-rose-400/80 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Additional sidebar content */}
      {children}
    </aside>
  );
}

export default PageSidebar;
