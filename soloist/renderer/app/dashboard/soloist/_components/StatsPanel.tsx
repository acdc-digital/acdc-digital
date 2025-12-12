// SOLOIST STATS PANEL
// Secondary sidebar for displaying statistics and daily insights
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/soloist/_components/StatsPanel.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import DailyInsights from "./DailyInsights";
import KeyInsights from "./KeyInsights";
import ForecastMetrics from "./ForecastMetrics";

interface StatsPanelProps {
  className?: string;
}

export function StatsPanel({ className }: StatsPanelProps) {
  return (
    <aside
      className={cn(
        "w-[20%] min-w-[330px] h-full flex-shrink-0",
        "border-r border-neutral-200 dark:border-neutral-700",
        "bg-neutral-50 dark:bg-neutral-800/50",
        "overflow-y-auto flex flex-col",
        className
      )}
    >
      {/* Daily Insights at the top */}
      <DailyInsights />
      
      {/* Key Insights for forecast */}
      <KeyInsights />
      
      {/* Forecast Accuracy Metrics - Commented out for single column layout */}
      {/* <ForecastMetrics /> */}
    </aside>
  );
}

export default StatsPanel;
